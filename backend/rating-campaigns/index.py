import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Admin-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def _esc(s: Any) -> str:
    return str(s).replace("'", "''")


def _ok(body: Any) -> Dict[str, Any]:
    return {'statusCode': 200, 'headers': _cors_headers(), 'body': json.dumps(body, default=str, ensure_ascii=False)}


def _err(status: int, msg: str) -> Dict[str, Any]:
    return {'statusCode': status, 'headers': _cors_headers(), 'body': json.dumps({'error': msg})}


def _get_family_id(cur, user_id: str) -> Optional[str]:
    cur.execute(
        f"SELECT family_id::text AS fid FROM {SCHEMA}.family_members WHERE user_id::text = '{_esc(user_id)}' LIMIT 1"
    )
    r = cur.fetchone()
    return r['fid'] if r else None


def _get_active_campaign(cur):
    cur.execute(
        f"""SELECT * FROM {SCHEMA}.rating_campaigns
            WHERE status = 'active' AND starts_at <= CURRENT_TIMESTAMP AND ends_at >= CURRENT_TIMESTAMP
            ORDER BY starts_at DESC LIMIT 1"""
    )
    return cur.fetchone()


def _recalculate_leaderboard(cur, campaign: Dict[str, Any]) -> int:
    """Пересчитываем очки всех семей в активной кампании."""
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
        f"""SELECT family_id::text AS fid, members_count, overall_progress
            FROM {SCHEMA}.family_dashboard_snapshot"""
    )
    snapshots = cur.fetchall()

    rows: List[Dict[str, Any]] = []
    starts_s = _esc(starts)
    ends_s = _esc(ends)

    for snap in snapshots:
        fid = snap['fid']
        members = int(snap.get('members_count') or 0)
        progress = int(snap.get('overall_progress') or 0)
        disqualified = members < min_members or progress < min_progress

        # Активность: новые записи в основных таблицах за период
        activity = 0
        for table, weight in [
            ('tasks_v2', 1), ('calendar_events', 1), ('finance_transactions', 1),
            ('purchases', 1), ('trips', 2), ('family_goals', 2), ('votings', 2),
        ]:
            try:
                cur.execute(
                    f"""SELECT COUNT(*)::int AS c FROM {SCHEMA}.{table}
                        WHERE family_id::text = '{_esc(fid)}'
                          AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'"""
                )
                r = cur.fetchone()
                activity += (r['c'] or 0) * weight
            except Exception:
                pass

        # Вовлечённость: сколько разных user_id из семьи писали что-то за период
        try:
            cur.execute(
                f"""SELECT COUNT(DISTINCT t.user_id)::int AS c FROM (
                      SELECT user_id FROM {SCHEMA}.tasks_v2
                       WHERE family_id::text = '{_esc(fid)}' AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'
                      UNION ALL
                      SELECT user_id FROM {SCHEMA}.finance_transactions
                       WHERE family_id::text = '{_esc(fid)}' AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'
                      UNION ALL
                      SELECT user_id FROM {SCHEMA}.calendar_events
                       WHERE family_id::text = '{_esc(fid)}' AND created_at >= '{starts_s}' AND created_at <= '{ends_s}'
                    ) t"""
            )
            engagement = int(cur.fetchone()['c'] or 0)
        except Exception:
            engagement = 0

        # Рефералы: успешно активированные за период
        try:
            cur.execute(
                f"""SELECT COUNT(*)::int AS c FROM {SCHEMA}.referral_invites
                    WHERE inviter_family_id::text = '{_esc(fid)}'
                      AND status = 'activated'
                      AND activated_at >= '{starts_s}' AND activated_at <= '{ends_s}'"""
            )
            referrals = int(cur.fetchone()['c'] or 0)
        except Exception:
            referrals = 0

        progress_score = progress * w_progress
        activity_score = activity * w_activity
        engagement_score = engagement * 10 * w_engagement
        referral_score = referrals * 25 * w_referrals
        score = round(progress_score + activity_score + engagement_score + referral_score, 2)

        rows.append({
            'fid': fid, 'members': members, 'progress': progress,
            'progress_score': progress_score, 'activity_score': activity_score,
            'engagement_score': engagement_score, 'referral_score': referral_score,
            'score': score, 'disqualified': disqualified,
        })

    # Сортируем и проставляем места
    eligible = [r for r in rows if not r['disqualified']]
    eligible.sort(key=lambda x: x['score'], reverse=True)
    place_map = {r['fid']: i + 1 for i, r in enumerate(eligible)}

    for r in rows:
        place = place_map.get(r['fid'], 0)
        cur.execute(
            f"""INSERT INTO {SCHEMA}.rating_leaderboard
                (campaign_id, family_id, place, score, progress_score, activity_score,
                 engagement_score, referral_score, members_count, overall_progress,
                 is_disqualified, updated_at)
                VALUES ({cid}, '{_esc(r['fid'])}', {place}, {r['score']},
                        {r['progress_score']}, {r['activity_score']},
                        {r['engagement_score']}, {r['referral_score']},
                        {r['members']}, {r['progress']},
                        {str(r['disqualified']).lower()}, CURRENT_TIMESTAMP)
                ON CONFLICT (campaign_id, family_id) DO UPDATE
                SET place = EXCLUDED.place, score = EXCLUDED.score,
                    progress_score = EXCLUDED.progress_score,
                    activity_score = EXCLUDED.activity_score,
                    engagement_score = EXCLUDED.engagement_score,
                    referral_score = EXCLUDED.referral_score,
                    members_count = EXCLUDED.members_count,
                    overall_progress = EXCLUDED.overall_progress,
                    is_disqualified = EXCLUDED.is_disqualified,
                    updated_at = CURRENT_TIMESTAMP"""
        )

    return len(rows)


def _get_leaderboard(cur, campaign_id: int, limit: int = 5):
    cur.execute(
        f"""SELECT lb.place, lb.family_id::text AS family_id, lb.score, lb.overall_progress,
                   lb.members_count, f.name AS family_name
            FROM {SCHEMA}.rating_leaderboard lb
            LEFT JOIN {SCHEMA}.families f ON f.id = lb.family_id
            WHERE lb.campaign_id = {campaign_id} AND lb.is_disqualified = FALSE AND lb.place > 0
            ORDER BY lb.place ASC LIMIT {int(limit)}"""
    )
    return cur.fetchall()


def _get_prizes(cur, campaign_id: int):
    cur.execute(
        f"""SELECT id, place_from, place_to, amount_rub, prize_type, description, badge_slug, position
            FROM {SCHEMA}.rating_prizes
            WHERE campaign_id = {campaign_id}
            ORDER BY position ASC, place_from ASC"""
    )
    return cur.fetchall()


def _prize_for_place(cur, campaign_id: int, place: int):
    cur.execute(
        f"""SELECT amount_rub, prize_type, description FROM {SCHEMA}.rating_prizes
            WHERE campaign_id = {campaign_id} AND place_from <= {place} AND place_to >= {place}
            ORDER BY position ASC LIMIT 1"""
    )
    return cur.fetchone()


def _payout_campaign(cur, campaign_id: int, paid_by: str) -> int:
    cur.execute(
        f"""SELECT lb.family_id::text AS family_id, lb.place, p.amount_rub, p.prize_type, p.description
            FROM {SCHEMA}.rating_leaderboard lb
            JOIN {SCHEMA}.rating_prizes p
              ON p.campaign_id = lb.campaign_id
             AND lb.place BETWEEN p.place_from AND p.place_to
            WHERE lb.campaign_id = {campaign_id} AND lb.is_disqualified = FALSE AND lb.place > 0"""
    )
    winners = cur.fetchall()
    paid = 0
    for w in winners:
        fid = w['family_id']
        amount = float(w['amount_rub'] or 0)
        # Ищем кошелёк
        cur.execute(f"SELECT id, balance_rub FROM {SCHEMA}.family_wallet WHERE family_id::text = '{_esc(fid)}' LIMIT 1")
        wallet = cur.fetchone()
        if not wallet:
            cur.execute(
                f"INSERT INTO {SCHEMA}.family_wallet (family_id, balance_rub) VALUES ('{_esc(fid)}', 0) RETURNING id, balance_rub"
            )
            wallet = cur.fetchone()
        wallet_id = wallet['id']

        if amount > 0 and w['prize_type'] == 'wallet':
            cur.execute(
                f"""INSERT INTO {SCHEMA}.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
                    VALUES ({wallet_id}, 'income', {amount}, 'rating_prize',
                            'Приз за {w['place']} место в рейтинге семей', '{_esc(paid_by)}')
                    RETURNING id"""
            )
            tx_id = cur.fetchone()['id']
            cur.execute(
                f"UPDATE {SCHEMA}.family_wallet SET balance_rub = COALESCE(balance_rub,0) + {amount}, updated_at = CURRENT_TIMESTAMP WHERE id = {wallet_id}"
            )
            cur.execute(
                f"""INSERT INTO {SCHEMA}.rating_payouts
                    (campaign_id, family_id, place, amount_rub, prize_type, status,
                     wallet_transaction_id, paid_at, paid_by)
                    VALUES ({campaign_id}, '{_esc(fid)}', {w['place']}, {amount}, 'wallet', 'paid',
                            {tx_id}, CURRENT_TIMESTAMP, '{_esc(paid_by)}')
                    ON CONFLICT (campaign_id, family_id, place) DO NOTHING"""
            )
            paid += 1

    cur.execute(f"UPDATE {SCHEMA}.rating_campaigns SET is_payout_done = TRUE, status = 'finished' WHERE id = {campaign_id}")
    return paid


def _list_campaigns(cur):
    cur.execute(
        f"""SELECT * FROM {SCHEMA}.rating_campaigns ORDER BY starts_at DESC LIMIT 50"""
    )
    return cur.fetchall()


def _create_campaign(cur, body: Dict[str, Any], created_by: str):
    slug = _esc(body.get('slug', ''))
    title = _esc(body.get('title', ''))
    description = _esc(body.get('description', ''))
    banner = _esc(body.get('banner_text', ''))
    period = _esc(body.get('period_type', 'monthly'))
    starts = _esc(body.get('starts_at', ''))
    ends = _esc(body.get('ends_at', ''))
    status = _esc(body.get('status', 'draft'))
    wp = float(body.get('weight_progress', 1.0))
    wa = float(body.get('weight_activity', 0.5))
    we = float(body.get('weight_engagement', 0.3))
    wr = float(body.get('weight_referrals', 0.2))
    mm = int(body.get('min_members', 2))
    mp = int(body.get('min_progress', 0))
    cur.execute(
        f"""INSERT INTO {SCHEMA}.rating_campaigns
            (slug, title, description, banner_text, period_type, starts_at, ends_at, status,
             weight_progress, weight_activity, weight_engagement, weight_referrals,
             min_members, min_progress, created_by)
            VALUES ('{slug}','{title}','{description}','{banner}','{period}','{starts}','{ends}','{status}',
                    {wp}, {wa}, {we}, {wr}, {mm}, {mp}, '{_esc(created_by)}') RETURNING id"""
    )
    return cur.fetchone()['id']


def _update_campaign(cur, cid: int, body: Dict[str, Any]):
    fields = []
    for k in ('title', 'description', 'banner_text', 'period_type', 'starts_at', 'ends_at', 'status', 'slug'):
        if k in body:
            fields.append(f"{k} = '{_esc(body[k])}'")
    for k in ('weight_progress', 'weight_activity', 'weight_engagement', 'weight_referrals'):
        if k in body:
            fields.append(f"{k} = {float(body[k])}")
    for k in ('min_members', 'min_progress'):
        if k in body:
            fields.append(f"{k} = {int(body[k])}")
    if not fields:
        return
    fields.append("updated_at = CURRENT_TIMESTAMP")
    cur.execute(f"UPDATE {SCHEMA}.rating_campaigns SET {', '.join(fields)} WHERE id = {int(cid)}")


def _set_prizes(cur, campaign_id: int, prizes: List[Dict[str, Any]]):
    cur.execute(f"UPDATE {SCHEMA}.rating_prizes SET amount_rub = 0 WHERE campaign_id = {int(campaign_id)} AND id < 0")
    # Re-insert: проще пересоздать
    cur.execute(f"SELECT id FROM {SCHEMA}.rating_prizes WHERE campaign_id = {int(campaign_id)}")
    existing_ids = [r['id'] for r in cur.fetchall()]
    incoming_ids = [int(p['id']) for p in prizes if p.get('id')]
    for old_id in existing_ids:
        if old_id not in incoming_ids:
            cur.execute(f"UPDATE {SCHEMA}.rating_prizes SET amount_rub = 0, place_from = 999, place_to = 999 WHERE id = {old_id}")

    for i, p in enumerate(prizes):
        if p.get('id'):
            cur.execute(
                f"""UPDATE {SCHEMA}.rating_prizes SET
                    place_from = {int(p['place_from'])}, place_to = {int(p['place_to'])},
                    amount_rub = {float(p['amount_rub'])}, prize_type = '{_esc(p.get('prize_type', 'wallet'))}',
                    description = '{_esc(p.get('description', ''))}', position = {i}
                    WHERE id = {int(p['id'])}"""
            )
        else:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.rating_prizes
                    (campaign_id, place_from, place_to, amount_rub, prize_type, description, position)
                    VALUES ({int(campaign_id)}, {int(p['place_from'])}, {int(p['place_to'])},
                            {float(p['amount_rub'])}, '{_esc(p.get('prize_type', 'wallet'))}',
                            '{_esc(p.get('description', ''))}', {i})"""
            )


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Управление рейтинговыми акциями: лидерборд, призы, начисления, админ-операции."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': _cors_headers(), 'body': ''}

    headers = event.get('headers') or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id') or ''
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token') or ''
    is_admin = bool(admin_token) and admin_token == os.environ.get('ADMIN_TOKEN', '')

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'overview')
    body_raw = event.get('body') or ''
    body: Dict[str, Any] = {}
    if body_raw:
        try:
            body = json.loads(body_raw)
        except Exception:
            body = {}

    try:
        with _conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if method == 'GET' and action == 'overview':
                    campaign = _get_active_campaign(cur)
                    if not campaign:
                        return _ok({'campaign': None, 'leaderboard': [], 'my_place': None, 'prizes': []})
                    prizes = _get_prizes(cur, campaign['id'])
                    top = _get_leaderboard(cur, campaign['id'], int(qs.get('limit', 5)))
                    my_place = None
                    my_score = None
                    total_families = 0
                    cur.execute(
                        f"SELECT COUNT(*)::int AS c FROM {SCHEMA}.rating_leaderboard WHERE campaign_id = {campaign['id']} AND is_disqualified = FALSE AND place > 0"
                    )
                    total_families = int(cur.fetchone()['c'] or 0)
                    if user_id:
                        fid = _get_family_id(cur, user_id)
                        if fid:
                            cur.execute(
                                f"""SELECT place, score, overall_progress, is_disqualified
                                    FROM {SCHEMA}.rating_leaderboard
                                    WHERE campaign_id = {campaign['id']} AND family_id::text = '{_esc(fid)}'"""
                            )
                            mine = cur.fetchone()
                            if mine:
                                my_place = mine['place']
                                my_score = float(mine['score'] or 0)
                    now = datetime.utcnow()
                    ends = campaign['ends_at']
                    seconds_left = max(0, int((ends - now).total_seconds()))
                    days_left = seconds_left // 86400
                    return _ok({
                        'campaign': {
                            'id': campaign['id'], 'slug': campaign['slug'], 'title': campaign['title'],
                            'description': campaign['description'], 'banner_text': campaign['banner_text'],
                            'starts_at': campaign['starts_at'], 'ends_at': campaign['ends_at'],
                            'status': campaign['status'], 'days_left': days_left, 'seconds_left': seconds_left,
                        },
                        'leaderboard': top,
                        'prizes': prizes,
                        'my_place': my_place,
                        'my_score': my_score,
                        'total_families': total_families,
                    })

                if method == 'GET' and action == 'leaderboard':
                    cid = int(qs.get('campaign_id', 0))
                    if not cid:
                        c = _get_active_campaign(cur)
                        cid = c['id'] if c else 0
                    if not cid:
                        return _ok({'leaderboard': []})
                    return _ok({'leaderboard': _get_leaderboard(cur, cid, int(qs.get('limit', 100)))})

                if method == 'POST' and action == 'recalculate':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    campaign = _get_active_campaign(cur)
                    if not campaign:
                        return _err(404, 'no_active_campaign')
                    cnt = _recalculate_leaderboard(cur, campaign)
                    conn.commit()
                    return _ok({'recalculated': cnt})

                if method == 'POST' and action == 'payout':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    cid = int(body.get('campaign_id') or 0)
                    if not cid:
                        return _err(400, 'campaign_id_required')
                    paid = _payout_campaign(cur, cid, user_id or '')
                    conn.commit()
                    return _ok({'paid': paid})

                if method == 'GET' and action == 'campaigns':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    return _ok({'campaigns': _list_campaigns(cur)})

                if method == 'POST' and action == 'campaign_create':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    new_id = _create_campaign(cur, body, user_id or '')
                    conn.commit()
                    return _ok({'id': new_id})

                if method == 'POST' and action == 'campaign_update':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    cid = int(body.get('id') or 0)
                    if not cid:
                        return _err(400, 'id_required')
                    _update_campaign(cur, cid, body)
                    if 'prizes' in body and isinstance(body['prizes'], list):
                        _set_prizes(cur, cid, body['prizes'])
                    conn.commit()
                    return _ok({'updated': True})

                if method == 'POST' and action == 'disqualify':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    cid = int(body.get('campaign_id') or 0)
                    fid = _esc(body.get('family_id') or '')
                    reason = _esc(body.get('reason') or 'manual')
                    cur.execute(
                        f"""UPDATE {SCHEMA}.rating_leaderboard
                            SET is_disqualified = TRUE, disqualified_reason = '{reason}', place = 0
                            WHERE campaign_id = {cid} AND family_id::text = '{fid}'"""
                    )
                    conn.commit()
                    return _ok({'disqualified': True})

                return _err(400, 'unknown_action')
    except Exception as e:
        return _err(500, f'internal: {str(e)[:200]}')
