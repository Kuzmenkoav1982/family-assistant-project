"""
Business: Admin authentication API. Заменяет hardcoded creds во фронте на
полноценную серверную проверку. Bcrypt-хеш пароля хранится в secret
ADMIN_PASSWORD_HASH, plaintext НЕ покидает сервер. Сессии — short-lived
session token (12 часов), хранится хеш токена, plain-token уходит клиенту.

Endpoints (через action query param или httpMethod):
  POST /?action=login    { email, password } → { token, expires_at } | 401
  POST /?action=verify   header X-Admin-Session-Token → { valid: bool }
  POST /?action=logout   header X-Admin-Session-Token → { ok: true }
  GET  /?action=health   → { ok: true } (для тестов)

Cooldown: 5 неудачных попыток на email или IP за 10 минут → 429.
Generic error: 401 без раскрытия (валиден email или нет).

Args: event с httpMethod / queryStringParameters / headers / body / requestContext.
    context: object с request_id.

Returns: { token, expires_at } | { valid } | { ok } | { error } + http status.
"""

import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'
ADMIN_EMAIL = (os.environ.get('ADMIN_EMAIL') or '').strip().lower()
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH') or ''

SESSION_TTL_HOURS = 12
COOLDOWN_WINDOW_MINUTES = 10
COOLDOWN_MAX_FAILS = 5

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Session-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
}


def _resp(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def _conn():
    return psycopg2.connect(DATABASE_URL)


def _hash_token(token: str) -> str:
    """Серверный хеш для хранения. Сам токен у клиента, в БД только хеш."""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _client_ip(event: Dict[str, Any]) -> Optional[str]:
    ctx = event.get('requestContext') or {}
    ident = ctx.get('identity') or {}
    ip = ident.get('sourceIp')
    if isinstance(ip, str) and ip:
        return ip[:64]
    return None


def _read_header(event: Dict[str, Any], name: str) -> Optional[str]:
    headers = event.get('headers') or {}
    target = name.lower()
    for k, v in headers.items():
        if isinstance(k, str) and k.lower() == target and isinstance(v, str):
            return v
    return None


def _is_in_cooldown(email: str, ip: Optional[str]) -> bool:
    if not DATABASE_URL:
        return False
    conn = _conn()
    cur = conn.cursor()
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=COOLDOWN_WINDOW_MINUTES)
    # По email
    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.admin_login_attempts "
        f"WHERE email = %s AND success = FALSE AND attempted_at > %s",
        (email, cutoff),
    )
    fails_email = int(cur.fetchone()[0])
    fails_ip = 0
    if ip:
        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.admin_login_attempts "
            f"WHERE ip = %s AND success = FALSE AND attempted_at > %s",
            (ip, cutoff),
        )
        fails_ip = int(cur.fetchone()[0])
    cur.close()
    conn.close()
    return fails_email >= COOLDOWN_MAX_FAILS or fails_ip >= COOLDOWN_MAX_FAILS


def _log_attempt(email: str, ip: Optional[str], success: bool) -> None:
    if not DATABASE_URL:
        return
    try:
        conn = _conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.admin_login_attempts (email, ip, success) VALUES (%s, %s, %s)",
            (email, ip, success),
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception:
        pass  # лог не блокирует основной flow


def _verify_password(password: str) -> bool:
    """Сравнение pwd с bcrypt-хешем из секрета. Constant-time через bcrypt."""
    if not ADMIN_PASSWORD_HASH:
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), ADMIN_PASSWORD_HASH.encode('utf-8'))
    except Exception:
        return False


# ---------------------------- handlers --------------------------------------

def do_login(event: Dict[str, Any]) -> Dict[str, Any]:
    if not ADMIN_EMAIL or not ADMIN_PASSWORD_HASH:
        return _resp(500, {'error': 'admin_not_configured'})

    body_raw = event.get('body') or '{}'
    try:
        payload = json.loads(body_raw) if isinstance(body_raw, str) else (body_raw or {})
    except Exception:
        return _resp(400, {'error': 'invalid_json'})

    email = str(payload.get('email') or '').strip().lower()
    password = str(payload.get('password') or '')
    ip = _client_ip(event)

    if not email or not password:
        return _resp(400, {'error': 'email_and_password_required'})

    # Cooldown — до сравнения пароля, чтобы не пускать brute force.
    if _is_in_cooldown(email, ip):
        return _resp(429, {'error': 'too_many_attempts', 'cooldown_minutes': COOLDOWN_WINDOW_MINUTES})

    # Generic error: одинаковый ответ для неверного email и неверного пароля.
    ok_email = (email == ADMIN_EMAIL)
    ok_password = _verify_password(password) if ok_email else False
    success = bool(ok_email and ok_password)

    _log_attempt(email, ip, success)

    if not success:
        return _resp(401, {'error': 'invalid_credentials'})

    # Issue session
    token = secrets.token_urlsafe(48)
    token_hash = _hash_token(token)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=SESSION_TTL_HOURS)
    ua = (_read_header(event, 'User-Agent') or '')[:200]

    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.admin_sessions "
        f"(token_hash, admin_email, created_at, expires_at, last_used_at, ip, user_agent) "
        f"VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (token_hash, email, now, expires_at, now, ip, ua),
    )
    conn.commit()
    cur.close()
    conn.close()

    return _resp(200, {
        'token': token,
        'expires_at': expires_at.isoformat(),
        'admin_email': email,
    })


def _read_session(token: str) -> Optional[Dict[str, Any]]:
    if not token or not DATABASE_URL:
        return None
    token_hash = _hash_token(token)
    conn = _conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"SELECT id, admin_email, expires_at, revoked_at "
        f"FROM {SCHEMA}.admin_sessions "
        f"WHERE token_hash = %s",
        (token_hash,),
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return None

    now = datetime.now(timezone.utc)
    if row['revoked_at'] is not None:
        cur.close()
        conn.close()
        return None
    if row['expires_at'] is None or row['expires_at'] <= now:
        cur.close()
        conn.close()
        return None

    # Touch last_used_at (не блокирующее)
    try:
        cur.execute(
            f"UPDATE {SCHEMA}.admin_sessions SET last_used_at = now() WHERE id = %s",
            (row['id'],),
        )
        conn.commit()
    except Exception:
        pass

    cur.close()
    conn.close()
    return {
        'admin_email': row['admin_email'],
        'expires_at': row['expires_at'].isoformat(),
    }


def do_verify(event: Dict[str, Any]) -> Dict[str, Any]:
    token = _read_header(event, 'X-Admin-Session-Token') or ''
    session = _read_session(token)
    if session is None:
        return _resp(401, {'valid': False, 'error': 'invalid_session'})
    return _resp(200, {'valid': True, **session})


def do_logout(event: Dict[str, Any]) -> Dict[str, Any]:
    token = _read_header(event, 'X-Admin-Session-Token') or ''
    if not token or not DATABASE_URL:
        return _resp(200, {'ok': True})
    token_hash = _hash_token(token)
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE {SCHEMA}.admin_sessions SET revoked_at = now() "
        f"WHERE token_hash = %s AND revoked_at IS NULL",
        (token_hash,),
    )
    conn.commit()
    cur.close()
    conn.close()
    return _resp(200, {'ok': True})


# ---------------------------- entry point -----------------------------------

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = (params.get('action') or '').lower()

    if action == 'health' and method == 'GET':
        return _resp(200, {'ok': True, 'admin_configured': bool(ADMIN_EMAIL and ADMIN_PASSWORD_HASH)})

    if method == 'POST':
        if action == 'login':
            return do_login(event)
        if action == 'verify':
            return do_verify(event)
        if action == 'logout':
            return do_logout(event)
        return _resp(400, {'error': 'unknown_action'})

    return _resp(405, {'error': 'method_not_allowed'})


# Public helper для других admin-функций.
def verify_admin_session(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Read X-Admin-Session-Token из headers, проверяет в БД.
    Возвращает {admin_email, expires_at} или None.
    Используется другими admin-backend-функциями (см. SEC-1.3 follow-up).
    """
    headers = event.get('headers') or {}
    token = None
    for k, v in headers.items():
        if isinstance(k, str) and k.lower() == 'x-admin-session-token' and isinstance(v, str):
            token = v
            break
    if not token:
        return None
    return _read_session(token)