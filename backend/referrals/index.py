"""
Business: Реферальная программа — выдача реф-кодов семьям, отслеживание регистраций по коду, начисление бонусов в кошелёк (за регистрацию, за активацию приглашённой семьи, приветственный бонус новичку), антифрод.
Args: event с httpMethod, queryStringParameters (action), headers (X-User-Id, X-Admin-Token), body для POST
Returns: my_code (мой код + статистика), settings, результаты track_signup/check_activation/admin_invites
"""
import json
import os
import random
import string
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _cors() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Admin-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def _esc(s: Any) -> str:
    return str(s).replace("'", "''")


def _ok(b: Any) -> Dict[str, Any]:
    return {'statusCode': 200, 'headers': _cors(), 'body': json.dumps(b, default=str, ensure_ascii=False)}


def _err(s: int, m: str) -> Dict[str, Any]:
    return {'statusCode': s, 'headers': _cors(), 'body': json.dumps({'error': m})}


def _gen_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(random.choices(alphabet, k=length))


def _get_settings(cur) -> Dict[str, Any]:
    cur.execute(f"SELECT * FROM {SCHEMA}.referral_program_settings WHERE id = 1")
    s = cur.fetchone()
    if not s:
        cur.execute(f"INSERT INTO {SCHEMA}.referral_program_settings (id) VALUES (1) RETURNING *")
        s = cur.fetchone()
    return s


def _get_family_id(cur, user_id: str) -> Optional[str]:
    cur.execute(f"SELECT family_id::text AS fid FROM {SCHEMA}.family_members WHERE user_id::text = '{_esc(user_id)}' LIMIT 1")
    r = cur.fetchone()
    return r['fid'] if r else None


def _ensure_code(cur, family_id: str, user_id: str) -> Dict[str, Any]:
    cur.execute(f"SELECT * FROM {SCHEMA}.referral_codes WHERE family_id::text = '{_esc(family_id)}' LIMIT 1")
    r = cur.fetchone()
    if r:
        return r
    for _ in range(10):
        code = _gen_code(8)
        cur.execute(f"SELECT 1 FROM {SCHEMA}.referral_codes WHERE code = '{code}' LIMIT 1")
        if not cur.fetchone():
            break
    cur.execute(
        f"""INSERT INTO {SCHEMA}.referral_codes (family_id, code, created_by)
            VALUES ('{_esc(family_id)}', '{code}', '{_esc(user_id)}') RETURNING *"""
    )
    return cur.fetchone()


def _get_my_invites(cur, family_id: str):
    cur.execute(
        f"""SELECT id, invitee_family_id::text AS invitee_family_id, status,
                   signup_reward_paid, signup_reward_amount,
                   active_reward_paid, active_reward_amount,
                   signed_up_at, activated_at, created_at
            FROM {SCHEMA}.referral_invites
            WHERE inviter_family_id::text = '{_esc(family_id)}'
            ORDER BY created_at DESC LIMIT 100"""
    )
    return cur.fetchall()


def _credit_wallet(cur, family_id: str, amount: float, reason: str, description: str) -> Optional[int]:
    if amount <= 0:
        return None
    cur.execute(f"SELECT id FROM {SCHEMA}.family_wallet WHERE family_id::text = '{_esc(family_id)}' LIMIT 1")
    w = cur.fetchone()
    if not w:
        cur.execute(
            f"INSERT INTO {SCHEMA}.family_wallet (family_id, balance_rub) VALUES ('{_esc(family_id)}', 0) RETURNING id"
        )
        w = cur.fetchone()
    wid = w['id']
    cur.execute(
        f"""INSERT INTO {SCHEMA}.wallet_transactions (wallet_id, type, amount_rub, reason, description)
            VALUES ({wid}, 'income', {float(amount)}, '{_esc(reason)}', '{_esc(description)}') RETURNING id"""
    )
    tx_id = cur.fetchone()['id']
    cur.execute(
        f"UPDATE {SCHEMA}.family_wallet SET balance_rub = COALESCE(balance_rub, 0) + {float(amount)}, updated_at = CURRENT_TIMESTAMP WHERE id = {wid}"
    )
    return tx_id


def _track_signup(cur, code: str, invitee_user_id: str, invitee_family_id: Optional[str], source: str, ip: str) -> Dict[str, Any]:
    cur.execute(f"SELECT * FROM {SCHEMA}.referral_codes WHERE code = '{_esc(code)}' AND is_active = TRUE LIMIT 1")
    rc = cur.fetchone()
    if not rc:
        return {'tracked': False, 'reason': 'code_not_found'}
    inviter_family_id = str(rc['family_id'])
    settings = _get_settings(cur)

    # Дубль?
    cur.execute(
        f"""SELECT id FROM {SCHEMA}.referral_invites
            WHERE inviter_family_id::text = '{_esc(inviter_family_id)}'
              AND (invitee_user_id::text = '{_esc(invitee_user_id)}' OR invitee_family_id::text = '{_esc(invitee_family_id or "")}')
            LIMIT 1"""
    )
    if cur.fetchone():
        return {'tracked': False, 'reason': 'already_tracked'}

    signup_amount = float(settings['reward_inviter_on_signup'] or 0)
    welcome_amount = float(settings['reward_invitee_welcome'] or 0)
    invitee_fid = f"'{_esc(invitee_family_id)}'" if invitee_family_id else 'NULL'

    cur.execute(
        f"""INSERT INTO {SCHEMA}.referral_invites
            (inviter_family_id, invitee_family_id, invitee_user_id, code,
             status, signup_reward_amount, welcome_reward_amount,
             signed_up_at, source, ip_address)
            VALUES ('{_esc(inviter_family_id)}', {invitee_fid}, '{_esc(invitee_user_id)}', '{_esc(code)}',
                    'signed_up', {signup_amount}, {welcome_amount},
                    CURRENT_TIMESTAMP, '{_esc(source)}', '{_esc(ip)}')
            RETURNING id"""
    )
    invite_id = cur.fetchone()['id']

    # Обновим счётчики кода
    cur.execute(f"UPDATE {SCHEMA}.referral_codes SET uses_count = uses_count + 1 WHERE id = {rc['id']}")

    # Сразу платим bonus за регистрацию
    if signup_amount > 0:
        tx = _credit_wallet(cur, inviter_family_id, signup_amount, 'referral_signup', f'Бонус за приглашение семьи (код {code})')
        cur.execute(
            f"UPDATE {SCHEMA}.referral_invites SET signup_reward_paid = TRUE WHERE id = {invite_id}"
        )

    # Welcome для новой семьи
    if welcome_amount > 0 and invitee_family_id:
        _credit_wallet(cur, invitee_family_id, welcome_amount, 'referral_welcome', 'Приветственный бонус новой семье')
        cur.execute(
            f"UPDATE {SCHEMA}.referral_invites SET welcome_reward_paid = TRUE WHERE id = {invite_id}"
        )

    return {'tracked': True, 'invite_id': invite_id}


def _check_activation(cur):
    """Проверяем все приглашения старше N дней и начисляем active-бонус, если семья активна."""
    settings = _get_settings(cur)
    window_days = int(settings['active_window_days'] or 7)
    min_members = int(settings['active_min_members'] or 3)
    min_progress = int(settings['active_min_progress'] or 30)
    active_amount = float(settings['reward_inviter_on_active'] or 0)

    cur.execute(
        f"""SELECT id, inviter_family_id::text AS inviter, invitee_family_id::text AS invitee, signed_up_at
            FROM {SCHEMA}.referral_invites
            WHERE status = 'signed_up' AND active_reward_paid = FALSE
              AND signed_up_at IS NOT NULL
              AND signed_up_at <= CURRENT_TIMESTAMP - INTERVAL '{int(window_days)} days'
              AND fraud_flag = FALSE"""
    )
    pending = cur.fetchall()
    activated = 0

    for p in pending:
        if not p['invitee']:
            continue
        cur.execute(
            f"""SELECT members_count, overall_progress
                FROM {SCHEMA}.family_dashboard_snapshot
                WHERE family_id::text = '{_esc(p['invitee'])}' LIMIT 1"""
        )
        snap = cur.fetchone()
        if not snap:
            continue
        if int(snap['members_count'] or 0) < min_members:
            continue
        if int(snap['overall_progress'] or 0) < min_progress:
            continue

        # Платим
        if active_amount > 0:
            _credit_wallet(cur, p['inviter'], active_amount, 'referral_activated', 'Бонус: приглашённая семья активна 7+ дней')
        cur.execute(
            f"""UPDATE {SCHEMA}.referral_invites
                SET status = 'activated', active_reward_paid = TRUE,
                    active_reward_amount = {active_amount},
                    activated_at = CURRENT_TIMESTAMP
                WHERE id = {p['id']}"""
        )
        cur.execute(
            f"UPDATE {SCHEMA}.referral_codes SET successful_count = successful_count + 1 WHERE family_id::text = '{_esc(p['inviter'])}'"
        )
        activated += 1
    return activated


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Реферальная программа: коды, отслеживание, начисления."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': _cors(), 'body': ''}

    headers = event.get('headers') or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id') or ''
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token') or ''
    is_admin = bool(admin_token) and admin_token == os.environ.get('ADMIN_TOKEN', '')

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'my_code')
    body_raw = event.get('body') or ''
    body: Dict[str, Any] = {}
    if body_raw:
        try:
            body = json.loads(body_raw)
        except Exception:
            body = {}

    ip = (event.get('requestContext') or {}).get('identity', {}).get('sourceIp', '')

    try:
        with _conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if method == 'GET' and action == 'settings':
                    s = _get_settings(cur)
                    return _ok({'settings': s})

                if method == 'GET' and action == 'my_code':
                    if not user_id:
                        return _err(401, 'auth_required')
                    fid = _get_family_id(cur, user_id)
                    if not fid:
                        return _err(404, 'family_not_found')
                    code = _ensure_code(cur, fid, user_id)
                    invites = _get_my_invites(cur, fid)
                    settings = _get_settings(cur)
                    total_earned = sum(
                        float(i.get('signup_reward_amount') or 0) * (1 if i.get('signup_reward_paid') else 0) +
                        float(i.get('active_reward_amount') or 0) * (1 if i.get('active_reward_paid') else 0)
                        for i in invites
                    )
                    conn.commit()
                    return _ok({
                        'code': code['code'],
                        'is_active': code['is_active'],
                        'uses_count': code['uses_count'],
                        'successful_count': code['successful_count'],
                        'invites': invites,
                        'total_earned': total_earned,
                        'settings': {
                            'reward_inviter_on_signup': float(settings['reward_inviter_on_signup']),
                            'reward_inviter_on_active': float(settings['reward_inviter_on_active']),
                            'reward_invitee_welcome': float(settings['reward_invitee_welcome']),
                            'active_window_days': settings['active_window_days'],
                            'active_min_members': settings['active_min_members'],
                            'active_min_progress': settings['active_min_progress'],
                        },
                    })

                if method == 'POST' and action == 'track_signup':
                    code = body.get('code', '')
                    invitee_user = body.get('user_id', '') or user_id
                    invitee_family = body.get('family_id', '')
                    source = body.get('source', 'link')
                    if not code or not invitee_user:
                        return _err(400, 'code_and_user_required')
                    res = _track_signup(cur, code, invitee_user, invitee_family or None, source, ip)
                    conn.commit()
                    return _ok(res)

                if method == 'POST' and action == 'check_activation':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    n = _check_activation(cur)
                    conn.commit()
                    return _ok({'activated': n})

                if method == 'POST' and action == 'update_settings':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    fields = []
                    for k in ('reward_inviter_on_signup', 'reward_inviter_on_active', 'reward_invitee_welcome', 'rating_bonus_percent'):
                        if k in body:
                            fields.append(f"{k} = {float(body[k])}")
                    for k in ('active_min_members', 'active_min_progress', 'active_window_days', 'max_rewards_per_inviter'):
                        if k in body:
                            fields.append(f"{k} = {int(body[k])}")
                    if 'is_enabled' in body:
                        fields.append(f"is_enabled = {str(bool(body['is_enabled'])).lower()}")
                    if not fields:
                        return _err(400, 'no_fields')
                    fields.append("updated_at = CURRENT_TIMESTAMP")
                    cur.execute(f"UPDATE {SCHEMA}.referral_program_settings SET {', '.join(fields)} WHERE id = 1")
                    conn.commit()
                    return _ok({'updated': True})

                if method == 'GET' and action == 'admin_invites':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    cur.execute(
                        f"""SELECT id, inviter_family_id::text AS inviter, invitee_family_id::text AS invitee,
                                   code, status, signup_reward_amount, active_reward_amount,
                                   signup_reward_paid, active_reward_paid, fraud_flag,
                                   signed_up_at, activated_at, created_at
                            FROM {SCHEMA}.referral_invites
                            ORDER BY created_at DESC LIMIT 200"""
                    )
                    return _ok({'invites': cur.fetchall()})

                if method == 'POST' and action == 'mark_fraud':
                    if not is_admin:
                        return _err(403, 'admin_only')
                    iid = int(body.get('id') or 0)
                    reason = _esc(body.get('reason') or 'manual')
                    if not iid:
                        return _err(400, 'id_required')
                    cur.execute(
                        f"""UPDATE {SCHEMA}.referral_invites
                            SET fraud_flag = TRUE, fraud_reason = '{reason}', status = 'fraud'
                            WHERE id = {iid}"""
                    )
                    conn.commit()
                    return _ok({'marked': True})

                return _err(400, 'unknown_action')
    except Exception as e:
        return _err(500, f'internal: {str(e)[:200]}')