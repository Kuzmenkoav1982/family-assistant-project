"""
Business: Cron-задача для системы рейтингов и реферальной программы. Раз в час пересчитывает лидерборд всех активных кампаний и проверяет активацию приглашённых семей. Также автоматически закрывает кампании, у которых прошёл срок (status=finished, кроме ручной выплаты).
Args: event с httpMethod (GET/POST), headers (X-Cron-Token для защиты от внешних вызовов)
Returns: JSON с количеством обработанных кампаний, обновлённых семей в лидерборде, проверенных активаций
"""
import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def _ok(b: Any) -> Dict[str, Any]:
    return {'statusCode': 200, 'headers': _cors(), 'body': json.dumps(b, default=str, ensure_ascii=False)}


def _err(s: int, m: str) -> Dict[str, Any]:
    return {'statusCode': s, 'headers': _cors(), 'body': json.dumps({'error': m})}


def _esc(s: Any) -> str:
    return str(s).replace("'", "''")


def _recalculate_campaign(cur, campaign: Dict[str, Any]) -> int:
    """Пересчитывает leaderboard для одной кампании. Возвращает количество обработанных семей."""
    cid = campaign['id']
    starts = campaign['starts_at']
    ends = campaign['ends_at']
    w_progress = float(campaign.get('weight_progress') or 1.0)
    w_activity = float(campaign.get('weight_activity') or 0.5)
    w_engagement = float(campaign.get('weight_engagement') or 0.3)
    w_referrals = float(campaign.get('weight_referrals') or 0.2)
    min_members = int(campaign.get('min_members') or 0)
    min_progress = int(campaign.get('min_progress') or 0)

    cur.execute(
        f"""SELECT family_id::text AS fid, COALESCE(members_count, 0) AS members_count,
                   COALESCE(overall_progress, 0) AS overall_progress
            FROM {SCHEMA}.family_dashboard_snapshot"""
    )
    snapshots = cur.fetchall()

    starts_s = _esc(starts)
    ends_s = _esc(ends)
    rows: List[Dict[str, Any]] = []

    for snap in snapshots:
        fid = snap['fid']
        members = int(snap.get('members_count') or 0)
        progress = int(snap.get('overall_progress') or 0)
        if members < min_members or progress < min_progress:
            continue

        # Активность за период: новые записи в основных таблицах
        activity_score = 0.0
        for tbl in ['tasks_v2', 'finance_transactions', 'calendar_events', 'family_goals',
                    'trips', 'leisure_activities', 'purchases']:
            try:
                cur.execute(
                    f"""SELECT COUNT(*)::int AS c FROM {SCHEMA}.{tbl}
                        WHERE family_id::text = '{_esc(fid)}'
                          AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'"""
                )
                r = cur.fetchone()
                if r:
                    activity_score += float(r.get('c') or 0)
            except Exception:
                pass

        # Engagement: разные авторы
        engagement_score = 0.0
        try:
            cur.execute(
                f"""SELECT COUNT(DISTINCT user_id)::int AS c FROM {SCHEMA}.tasks_v2
                    WHERE family_id::text = '{_esc(fid)}'
                      AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'"""
            )
            r = cur.fetchone()
            if r:
                engagement_score = float(r.get('c') or 0)
        except Exception:
            pass

        # Рефералы за период
        referral_score = 0.0
        try:
            cur.execute(
                f"""SELECT COUNT(*)::int AS c FROM {SCHEMA}.referral_invites
                    WHERE inviter_family_id::text = '{_esc(fid)}'
                      AND status IN ('activated','signed_up')
                      AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'
                      AND fraud_flag = false"""
            )
            r = cur.fetchone()
            if r:
                referral_score = float(r.get('c') or 0)
        except Exception:
            pass

        score = (
            progress * w_progress
            + activity_score * w_activity
            + engagement_score * 10 * w_engagement
            + referral_score * 25 * w_referrals
        )

        rows.append({
            'fid': fid,
            'members': members,
            'progress': progress,
            'progress_score': progress * w_progress,
            'activity_score': activity_score * w_activity,
            'engagement_score': engagement_score * 10 * w_engagement,
            'referral_score': referral_score * 25 * w_referrals,
            'score': score,
        })

    rows.sort(key=lambda r: -r['score'])

    # Удаляем старый снимок и пишем заново
    cur.execute(f"DELETE FROM {SCHEMA}.rating_leaderboard WHERE campaign_id = {cid}")

    for place, r in enumerate(rows, start=1):
        cur.execute(
            f"""INSERT INTO {SCHEMA}.rating_leaderboard
                (campaign_id, family_id, place, score, progress_score, activity_score,
                 engagement_score, referral_score, members_count, overall_progress, updated_at)
                VALUES ({cid}, '{_esc(r['fid'])}', {place}, {round(r['score'], 2)},
                        {round(r['progress_score'], 2)}, {round(r['activity_score'], 2)},
                        {round(r['engagement_score'], 2)}, {round(r['referral_score'], 2)},
                        {r['members']}, {r['progress']}, CURRENT_TIMESTAMP)"""
        )

    # История очков (раз в час — мало)
    for r in rows:
        cur.execute(
            f"""INSERT INTO {SCHEMA}.rating_score_history
                (campaign_id, family_id, score, overall_progress, recorded_at)
                VALUES ({cid}, '{_esc(r['fid'])}', {round(r['score'], 2)}, {r['progress']}, CURRENT_TIMESTAMP)"""
        )

    return len(rows)


def _check_referral_activations(cur) -> int:
    """Проверяет, не активировались ли приглашённые семьи (3+ члена + 30%+ за 7 дней). Начисляет бонусы."""
    cur.execute(f"SELECT * FROM {SCHEMA}.referral_program_settings WHERE id = 1")
    s = cur.fetchone()
    if not s or not s.get('is_enabled'):
        return 0
    min_members = int(s.get('active_min_members') or 3)
    min_progress = int(s.get('active_min_progress') or 30)
    window_days = int(s.get('active_window_days') or 7)
    reward_active = float(s.get('reward_inviter_on_active') or 0)

    cur.execute(
        f"""SELECT i.* FROM {SCHEMA}.referral_invites i
            WHERE i.status = 'signed_up'
              AND i.fraud_flag = false
              AND i.invitee_family_id IS NOT NULL
              AND i.signed_up_at IS NOT NULL
              AND i.signed_up_at >= CURRENT_TIMESTAMP - INTERVAL '{window_days} days'
              AND i.active_reward_paid = false"""
    )
    pending = cur.fetchall()
    activated = 0

    for inv in pending:
        invitee_fid = inv['invitee_family_id']
        inviter_fid = inv['inviter_family_id']
        cur.execute(
            f"""SELECT COALESCE(members_count, 0) AS m, COALESCE(overall_progress, 0) AS p
                FROM {SCHEMA}.family_dashboard_snapshot
                WHERE family_id::text = '{_esc(invitee_fid)}' LIMIT 1"""
        )
        snap = cur.fetchone()
        if not snap:
            continue
        m = int(snap.get('m') or 0)
        p = int(snap.get('p') or 0)
        if m < min_members or p < min_progress:
            continue

        # Активирована — начисляем бонус приглашающей семье
        cur.execute(
            f"""SELECT id FROM {SCHEMA}.family_wallet WHERE family_id::text = '{_esc(inviter_fid)}' LIMIT 1"""
        )
        wallet = cur.fetchone()
        if wallet:
            wallet_id = wallet['id']
            cur.execute(
                f"""UPDATE {SCHEMA}.family_wallet
                    SET balance_rub = COALESCE(balance_rub, 0) + {reward_active},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = {wallet_id}"""
            )
            cur.execute(
                f"""INSERT INTO {SCHEMA}.wallet_transactions
                    (wallet_id, type, amount_rub, reason, description)
                    VALUES ({wallet_id}, 'topup', {reward_active}, 'referral_active',
                            'Бонус за активацию приглашённой семьи')"""
            )

        cur.execute(
            f"""UPDATE {SCHEMA}.referral_invites
                SET status = 'activated', activated_at = CURRENT_TIMESTAMP,
                    active_reward_paid = true, active_reward_amount = {reward_active},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = {inv['id']}"""
        )
        cur.execute(
            f"""UPDATE {SCHEMA}.referral_codes
                SET successful_count = COALESCE(successful_count, 0) + 1
                WHERE family_id::text = '{_esc(inviter_fid)}'"""
        )
        activated += 1

    return activated


def _auto_finish_campaigns(cur) -> int:
    """Завершает кампании, у которых ends_at в прошлом."""
    cur.execute(
        f"""UPDATE {SCHEMA}.rating_campaigns
            SET status = 'finished', updated_at = CURRENT_TIMESTAMP
            WHERE status = 'active' AND ends_at < CURRENT_TIMESTAMP"""
    )
    return cur.rowcount or 0


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': _cors(), 'body': ''}

    headers = event.get('headers') or {}
    cron_token_required = os.environ.get('CRON_TOKEN', '')
    cron_token = headers.get('X-Cron-Token') or headers.get('x-cron-token') or ''
    if cron_token_required and cron_token != cron_token_required:
        return _err(403, 'forbidden')

    result = {
        'auto_finished': 0,
        'campaigns_recalculated': 0,
        'families_updated': 0,
        'referrals_activated': 0,
    }
    try:
        with _conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                result['auto_finished'] = _auto_finish_campaigns(cur)
                cur.execute(
                    f"""SELECT * FROM {SCHEMA}.rating_campaigns
                        WHERE status = 'active'
                          AND starts_at <= CURRENT_TIMESTAMP
                          AND ends_at >= CURRENT_TIMESTAMP"""
                )
                active_campaigns = cur.fetchall()
                total_families = 0
                for camp in active_campaigns:
                    total_families += _recalculate_campaign(cur, dict(camp))
                result['campaigns_recalculated'] = len(active_campaigns)
                result['families_updated'] = total_families
                result['referrals_activated'] = _check_referral_activations(cur)
                conn.commit()
    except Exception as e:
        return _err(500, f'cron error: {str(e)[:200]}')

    return _ok(result)
