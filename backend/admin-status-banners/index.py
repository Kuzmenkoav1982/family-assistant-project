"""
Business: Admin write API для StatusBanner. CRUD + enable/disable + publish/
unpublish. Требует X-Admin-Session-Token (проверка в admin_sessions). Серверная валидация
дублирует CHECK-констрейнты БД для понятных ошибок в админке.

Args: event с httpMethod GET|POST|PUT|DELETE|OPTIONS;
    queryStringParameters: action (list|get), id;
    body: JSON payload для create/update/enable/disable/publish/unpublish.
    context: object с request_id.

Returns: { banner|banners|ok } + http status. Ошибки validation → 400,
    нет токена → 401, не найдено → 404.
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

ALLOWED_TYPES = {'info', 'maintenance', 'warning', 'critical', 'update'}
ALLOWED_AUDIENCES = {'all', 'authenticated', 'admins'}
# Соответствует DEFAULT_DISMISSIBLE_BY_TYPE из src/lib/statusBanner/types.ts
DEFAULT_DISMISSIBLE = {
    'critical': False,
    'warning': True,
    'maintenance': True,
    'update': True,
    'info': True,
}

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Session-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
}


# ---------------------------- helpers ---------------------------------------

def _resp(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def _get_header(event: Dict[str, Any], name: str) -> str:
    """Case-insensitive header lookup."""
    headers = event.get('headers') or {}
    target = name.lower()
    for k, v in headers.items():
        if isinstance(k, str) and k.lower() == target and isinstance(v, str):
            return v
    return ''


def _admin_authorized(event: Dict[str, Any]) -> bool:
    """SEC-1.3: единственный путь — X-Admin-Session-Token, verified в БД."""
    token = _get_header(event, 'X-Admin-Session-Token')
    return bool(_verify_session_in_db(token))


def _verify_session_in_db(token: str) -> Optional[str]:
    """
    Верифицирует токен в БД.
    Возвращает admin_email (actor) если сессия валидна, иначе None.
    SEC-1.5: actor берётся только отсюда — X-Admin-Actor игнорируется.
    """
    if not token or not DATABASE_URL:
        return None
    try:
        import hashlib
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            f"SELECT admin_email FROM {SCHEMA}.admin_sessions "
            f"WHERE token_hash = %s AND revoked_at IS NULL AND expires_at > now() LIMIT 1",
            (token_hash,),
        )
        row = cur.fetchone()
        if row:
            cur.execute(
                f"UPDATE {SCHEMA}.admin_sessions SET last_used_at = now() WHERE token_hash = %s",
                (token_hash,),
            )
            conn.commit()
        cur.close()
        conn.close()
        return row[0] if row else None
    except Exception:
        return None


def _resolve_admin_actor(event: Dict[str, Any]) -> str:
    """
    SEC-1.5: actor для audit log берётся ТОЛЬКО из верифицированной сессии.
    X-Admin-Actor из запроса полностью игнорируется.
    """
    token = _get_header(event, 'X-Admin-Session-Token')
    email = _verify_session_in_db(token)
    return email or ''


def _row_to_banner(r: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': str(r['id']),
        'type': r['type'],
        'title': r['title'],
        'message': r['message'],
        'ctaLabel': r['cta_label'],
        'ctaHref': r['cta_href'],
        'enabled': bool(r['enabled']),
        'dismissible': bool(r['dismissible']),
        'startsAt': r['starts_at'].isoformat() if r['starts_at'] else None,
        'endsAt': r['ends_at'].isoformat() if r['ends_at'] else None,
        'audience': r['audience'],
        'routeScope': r['route_scope'] if isinstance(r['route_scope'], list) else [],
        'priority': int(r['priority']),
        'createdBy': r['created_by'],
        'updatedBy': r['updated_by'],
        'createdAt': r['created_at'].isoformat() if r['created_at'] else None,
        'updatedAt': r['updated_at'].isoformat() if r['updated_at'] else None,
        'publishedAt': r['published_at'].isoformat() if r['published_at'] else None,
        'unpublishedAt': r['unpublished_at'].isoformat() if r['unpublished_at'] else None,
    }


def _validate_payload(p: Dict[str, Any]) -> Optional[str]:
    """Возвращает строку с ошибкой или None если валидно."""
    if not isinstance(p, dict):
        return 'payload_not_object'
    t = p.get('type')
    if t not in ALLOWED_TYPES:
        return f'invalid_type: {t}'
    title = (p.get('title') or '').strip()
    message = (p.get('message') or '').strip()
    if not title:
        return 'empty_title'
    if not message:
        return 'empty_message'
    audience = p.get('audience', 'all')
    if audience not in ALLOWED_AUDIENCES:
        return f'invalid_audience: {audience}'

    # CTA pair
    cta_label = p.get('ctaLabel')
    cta_href = p.get('ctaHref')
    has_label = isinstance(cta_label, str) and cta_label.strip() != ''
    has_href = isinstance(cta_href, str) and cta_href.strip() != ''
    if has_label != has_href:
        return 'cta_pair_broken'

    # Dates
    starts = p.get('startsAt')
    ends = p.get('endsAt')
    starts_dt = _parse_iso(starts)
    ends_dt = _parse_iso(ends)
    if starts and not starts_dt:
        return 'invalid_startsAt'
    if ends and not ends_dt:
        return 'invalid_endsAt'
    if starts_dt and ends_dt and ends_dt <= starts_dt:
        return 'ends_before_starts'

    # route_scope = массив строк
    rs = p.get('routeScope', [])
    if not isinstance(rs, list):
        return 'route_scope_not_array'
    for prefix in rs:
        if not isinstance(prefix, str):
            return 'route_scope_item_not_string'

    # priority — int (опционально)
    pr = p.get('priority')
    if pr is not None and not isinstance(pr, int):
        return 'priority_not_int'

    return None


def _parse_iso(v: Any) -> Optional[datetime]:
    if not v:
        return None
    if isinstance(v, datetime):
        return v
    if not isinstance(v, str):
        return None
    try:
        # 'Z' для совместимости
        s = v.replace('Z', '+00:00')
        return datetime.fromisoformat(s)
    except Exception:
        return None


def _effective_dismissible(payload: Dict[str, Any]) -> bool:
    """Применяет правило по типу, если dismissible явно не задан."""
    d = payload.get('dismissible')
    if d is None:
        return DEFAULT_DISMISSIBLE.get(payload.get('type'), True)
    return bool(d)


def _escape(s: str) -> str:
    return s.replace("'", "''")


# ---------------------------- handlers --------------------------------------

def list_all() -> Dict[str, Any]:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT id, type, title, message, cta_label, cta_href,
               enabled, dismissible, starts_at, ends_at, audience,
               route_scope, priority, created_by, updated_by,
               created_at, updated_at, published_at, unpublished_at
        FROM {SCHEMA}.status_banners
        ORDER BY enabled DESC, priority DESC,
                 COALESCE(published_at, updated_at, created_at) DESC
        LIMIT 500
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {'banners': [_row_to_banner(r) for r in rows]}


def get_one(banner_id: str) -> Tuple[int, Dict[str, Any]]:
    safe = _escape(banner_id)
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.status_banners WHERE id = '{safe}'::uuid
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return 404, {'error': 'not_found'}
    return 200, {'banner': _row_to_banner(row)}


def create(payload: Dict[str, Any], actor: str) -> Tuple[int, Dict[str, Any]]:
    err = _validate_payload(payload)
    if err:
        return 400, {'error': 'validation', 'detail': err}
    dismissible = _effective_dismissible(payload)
    type_ = payload['type']
    title = payload['title'].strip()
    message = payload['message'].strip()
    cta_label = (payload.get('ctaLabel') or '').strip() or None
    cta_href = (payload.get('ctaHref') or '').strip() or None
    enabled = bool(payload.get('enabled', False))
    starts_at = payload.get('startsAt')
    ends_at = payload.get('endsAt')
    audience = payload.get('audience', 'all')
    route_scope = payload.get('routeScope') or []
    priority = int(payload.get('priority') or 0)

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.status_banners
            (type, title, message, cta_label, cta_href, enabled, dismissible,
             starts_at, ends_at, audience, route_scope, priority,
             created_by, updated_by, published_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s,
                CASE WHEN %s THEN now() ELSE NULL END)
        RETURNING *
    """, (
        type_, title, message, cta_label, cta_href, enabled, dismissible,
        starts_at, ends_at, audience, json.dumps(route_scope), priority,
        actor, actor, enabled,
    ))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return 201, {'banner': _row_to_banner(row)}


def update(banner_id: str, payload: Dict[str, Any], actor: str) -> Tuple[int, Dict[str, Any]]:
    err = _validate_payload(payload)
    if err:
        return 400, {'error': 'validation', 'detail': err}
    dismissible = _effective_dismissible(payload)

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.status_banners
        SET type = %s,
            title = %s,
            message = %s,
            cta_label = %s,
            cta_href = %s,
            enabled = %s,
            dismissible = %s,
            starts_at = %s,
            ends_at = %s,
            audience = %s,
            route_scope = %s::jsonb,
            priority = %s,
            updated_by = %s,
            updated_at = now(),
            published_at = CASE
                WHEN %s AND published_at IS NULL THEN now()
                ELSE published_at
            END,
            unpublished_at = CASE
                WHEN NOT %s AND published_at IS NOT NULL AND unpublished_at IS NULL THEN now()
                ELSE unpublished_at
            END
        WHERE id = %s::uuid
        RETURNING *
    """, (
        payload['type'], payload['title'].strip(), payload['message'].strip(),
        (payload.get('ctaLabel') or '').strip() or None,
        (payload.get('ctaHref') or '').strip() or None,
        bool(payload.get('enabled', False)), dismissible,
        payload.get('startsAt'), payload.get('endsAt'),
        payload.get('audience', 'all'),
        json.dumps(payload.get('routeScope') or []),
        int(payload.get('priority') or 0),
        actor,
        bool(payload.get('enabled', False)),
        bool(payload.get('enabled', False)),
        banner_id,
    ))
    row = cur.fetchone()
    if not row:
        conn.rollback()
        cur.close()
        conn.close()
        return 404, {'error': 'not_found'}
    conn.commit()
    cur.close()
    conn.close()
    return 200, {'banner': _row_to_banner(row)}


def set_enabled(banner_id: str, enabled: bool, actor: str) -> Tuple[int, Dict[str, Any]]:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.status_banners
        SET enabled = %s,
            updated_by = %s,
            updated_at = now(),
            published_at = CASE
                WHEN %s AND published_at IS NULL THEN now()
                ELSE published_at
            END,
            unpublished_at = CASE
                WHEN NOT %s AND published_at IS NOT NULL THEN now()
                ELSE unpublished_at
            END
        WHERE id = %s::uuid
        RETURNING *
    """, (enabled, actor, enabled, enabled, banner_id))
    row = cur.fetchone()
    if not row:
        conn.rollback()
        cur.close()
        conn.close()
        return 404, {'error': 'not_found'}
    conn.commit()
    cur.close()
    conn.close()
    return 200, {'banner': _row_to_banner(row)}


def delete_one(banner_id: str) -> Tuple[int, Dict[str, Any]]:
    safe = _escape(banner_id)
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.status_banners WHERE id = '{safe}'::uuid")
    affected = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()
    if affected == 0:
        return 404, {'error': 'not_found'}
    return 200, {'ok': True, 'deleted': banner_id}


# ---------------------------- entry point -----------------------------------

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    # SEC-1.5: actor берётся из сессии, X-Admin-Actor из запроса игнорируется
    actor = _resolve_admin_actor(event)
    if not actor:
        return _resp(401, {'error': 'unauthorized'})

    if not DATABASE_URL:
        return _resp(500, {'error': 'database_not_configured'})

    params = event.get('queryStringParameters') or {}
    action = (params.get('action') or '').lower()
    banner_id = params.get('id') or ''

    try:
        # ─── GET ───
        if method == 'GET':
            if action == 'get' and banner_id:
                status, body = get_one(banner_id)
                return _resp(status, body)
            return _resp(200, list_all())

        # ─── Read JSON body for write ops ───
        body_raw = event.get('body') or '{}'
        try:
            payload = json.loads(body_raw) if isinstance(body_raw, str) else (body_raw or {})
        except Exception:
            return _resp(400, {'error': 'invalid_json'})

        # ─── POST create ───
        if method == 'POST':
            if action == 'enable':
                if not banner_id:
                    return _resp(400, {'error': 'id_required'})
                status, body = set_enabled(banner_id, True, actor)
                return _resp(status, body)
            if action == 'disable':
                if not banner_id:
                    return _resp(400, {'error': 'id_required'})
                status, body = set_enabled(banner_id, False, actor)
                return _resp(status, body)
            # default POST = create
            status, body = create(payload, actor)
            return _resp(status, body)

        # ─── PUT update ───
        if method == 'PUT':
            if not banner_id:
                return _resp(400, {'error': 'id_required'})
            status, body = update(banner_id, payload, actor)
            return _resp(status, body)

        # ─── DELETE ───
        if method == 'DELETE':
            if not banner_id:
                return _resp(400, {'error': 'id_required'})
            status, body = delete_one(banner_id)
            return _resp(status, body)

        return _resp(405, {'error': 'method_not_allowed'})

    except psycopg2.errors.CheckViolation as e:
        return _resp(400, {'error': 'db_check_violation', 'detail': str(e)[:300]})
    except Exception as e:
        return _resp(500, {'error': 'internal', 'detail': str(e)[:300]})