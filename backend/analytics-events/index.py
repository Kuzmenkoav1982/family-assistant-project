"""
Business: Приём продуктовых аналитических событий с фронта.
Только enum/ID/числа в props (whitelist). Никакого свободного текста.
Args: event с httpMethod, body{event_name, props?, page?, session_id?, member_id?}, X-Auth-Token (опционально)
Returns: {"ok": true} или {"error": "..."}
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

ALLOWED_EVENTS = {
    'portfolio_widget_open',
    'portfolio_list_open',
    'portfolio_profile_open',
    'portfolio_sources_open',
    'portfolio_insights_open',
    'portfolio_ai_click',
    'portfolio_ai_success',
    'portfolio_plan_create',
    'portfolio_plan_update',
    'portfolio_plan_complete',
    'portfolio_history_open',
    'portfolio_pdf_export',
    'portfolio_share_to_chat',
    'portfolio_family_overview_open',
    'portfolio_badge_open',
    'portfolio_onboarding_complete',
    'portfolio_empty_state_cta_click',
    'portfolio_templates_open',
    'portfolio_template_apply',
}

ALLOWED_PROP_KEYS = {
    'sphere', 'severity', 'count', 'has_ai', 'completeness_bucket',
    'confidence_bucket', 'source', 'success', 'duration_ms', 'badge_key',
    'is_owner', 'plan_status', 'age_band', 'template_id',
}


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def esc(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, dict):
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"


def sanitize_props(raw: Any) -> Dict[str, Any]:
    """Пускаем только whitelist-ключи и примитивы; обрезаем строки до 64 символов."""
    if not isinstance(raw, dict):
        return {}
    out: Dict[str, Any] = {}
    for k, v in raw.items():
        if k not in ALLOWED_PROP_KEYS:
            continue
        if isinstance(v, bool):
            out[k] = v
        elif isinstance(v, (int, float)):
            out[k] = v
        elif isinstance(v, str):
            out[k] = v[:64]
    return out


def get_user_from_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        token_safe = str(token).replace("'", "''")
        cur.execute(f"""
            SELECT s.user_id, fm.id AS member_id, fm.family_id
            FROM {SCHEMA}.sessions s
            LEFT JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
            WHERE s.token = '{token_safe}' AND s.expires_at > NOW()
            LIMIT 1
        """)
        row = cur.fetchone()
        if not row:
            return None
        return {
            'user_id': str(row['user_id']) if row.get('user_id') else None,
            'member_id': str(row['member_id']) if row.get('member_id') else None,
            'family_id': str(row['family_id']) if row.get('family_id') else None,
        }
    finally:
        cur.close()
        conn.close()


def insert_event(
    event_name: str,
    user_id: Optional[str],
    family_id: Optional[str],
    member_id: Optional[str],
    session_id: Optional[str],
    page: Optional[str],
    props: Dict[str, Any],
    user_agent: Optional[str],
) -> None:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute(f"""
            INSERT INTO {SCHEMA}.analytics_events
                (event_name, user_id, family_id, member_id, session_id, page, props, user_agent)
            VALUES (
                {esc(event_name)},
                {('NULL' if not user_id else esc(user_id) + '::uuid')},
                {esc(family_id)},
                {('NULL' if not member_id else esc(member_id) + '::uuid')},
                {esc(session_id)},
                {esc(page)},
                {esc(props)}::jsonb,
                {esc(user_agent)}
            )
        """)
    finally:
        cur.close()
        conn.close()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Принимает продуктовое событие и пишет в analytics_events."""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'method not allowed'}),
        }

    try:
        body_str = event.get('body') or '{}'
        body = json.loads(body_str) if body_str else {}
    except Exception:
        body = {}

    event_name = (body.get('event_name') or '').strip()
    if not event_name or event_name not in ALLOWED_EVENTS:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'unknown event_name', 'code': 'invalid_event'}),
        }

    headers_in = event.get('headers') or {}
    auth_token = headers_in.get('X-Auth-Token') or headers_in.get('x-auth-token')
    user_agent = (headers_in.get('User-Agent') or headers_in.get('user-agent') or '')[:255] or None

    ctx = get_user_from_token(auth_token) or {}
    user_id = ctx.get('user_id')
    family_id = body.get('family_id') or ctx.get('family_id')
    member_id = body.get('member_id') or None

    page = (body.get('page') or '')[:128] or None
    session_id = (body.get('session_id') or '')[:64] or None
    props = sanitize_props(body.get('props'))

    try:
        insert_event(event_name, user_id, family_id, member_id, session_id, page, props, user_agent)
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)[:200]}),
        }

    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps({'ok': True}),
    }