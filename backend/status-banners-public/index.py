"""
Business: Public read API для системного StatusBanner.

SEC-1.5: Backend является единственным source of truth для viewer/audience.
Клиент НЕ назначает viewer — backend сам определяет его по валидным сессиям.

_resolve_viewer(event) → 'public' | 'authenticated' | 'admin'
  - valid admin session  → admin
  - valid user session   → authenticated
  - иначе (в т.ч. битые/истёкшие/revoked токены) → public

Audience rules:
  public        → ["all"]
  authenticated → ["all", "authenticated"]
  admin         → ["all", "authenticated", "admins"]

Spoofing protection:
  ?viewer=admin, ?actor=admin, body {viewer:"admin"},
  X-Admin-Token, isDemoMode — игнорируются. viewer берётся ТОЛЬКО из сессии.

Cache policy:
  viewer == public  → Cache-Control: public, max-age=30, must-revalidate
  viewer != public  → Cache-Control: private, no-store

Args: event с httpMethod GET (или OPTIONS для CORS preflight);
    headers: X-Auth-Token (user), X-Admin-Session-Token (admin).
    context: object с request_id.

Returns: {
    banners: StatusBanner[],
    server_time: ISO,
    viewer: 'public' | 'authenticated' | 'admin',
    audience_policy: 'server_resolved_v2'
}.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List
import psycopg2
from psycopg2.extras import RealDictCursor


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

AUDIENCE_POLICY = 'server_resolved_v2'

ALLOWED_AUDIENCES_BY_VIEWER: Dict[str, List[str]] = {
    'public':        ['all'],
    'authenticated': ['all', 'authenticated'],
    'admin':         ['all', 'authenticated', 'admins'],
}

# CORS без X-Admin-Token — он больше не нужен в browser-read flow
CORS_BASE = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Session-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}

CORS_PUBLIC = {
    **CORS_BASE,
    # SEC-1.5: endpoint audience-sensitive (единый URL, разные ответы по сессии).
    # private, no-store для всех — исключаем shared-cache leakage.
    'Cache-Control': 'private, no-store',
}

CORS_PRIVATE = {
    **CORS_BASE,
    'Cache-Control': 'private, no-store',
}


# ─── session helpers ─────────────────────────────────────────────────────────

def _sha256(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _get_header(event: Dict[str, Any], name: str) -> str:
    """Case-insensitive header lookup."""
    headers = event.get('headers') or {}
    target = name.lower()
    for k, v in headers.items():
        if isinstance(k, str) and k.lower() == target and isinstance(v, str):
            return v
    return ''


def _is_valid_admin_session(token: str) -> bool:
    """Верифицирует X-Admin-Session-Token в таблице admin_sessions."""
    if not token or not DATABASE_URL:
        return False
    try:
        token_hash = _sha256(token)
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            f"SELECT 1 FROM {SCHEMA}.admin_sessions "
            f"WHERE token_hash = %s AND revoked_at IS NULL AND expires_at > now() LIMIT 1",
            (token_hash,),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        return bool(row)
    except Exception:
        return False


def _is_valid_user_session(token: str) -> bool:
    """Верифицирует X-Auth-Token в таблице sessions."""
    if not token or not DATABASE_URL:
        return False
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            f"SELECT 1 FROM {SCHEMA}.sessions "
            f"WHERE token = %s AND expires_at > now() LIMIT 1",
            (token,),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        return bool(row)
    except Exception:
        return False


def _resolve_viewer(event: Dict[str, Any]) -> str:
    """
    SEC-1.5: единственный источник истины для viewer.
    Клиентские query/body/localStorage/legacy-headers игнорируются.

    Truth table:
      valid admin session  → 'admin'
      valid user session   → 'authenticated'
      иначе                → 'public'
    Expired/revoked/invalid токены не повышают viewer.
    """
    admin_token = _get_header(event, 'X-Admin-Session-Token')
    if admin_token and _is_valid_admin_session(admin_token):
        return 'admin'

    user_token = _get_header(event, 'X-Auth-Token')
    if user_token and _is_valid_user_session(user_token):
        return 'authenticated'

    return 'public'


# ─── db helpers ──────────────────────────────────────────────────────────────

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


def _fetch_banners(allowed_audiences: List[str]) -> List[Dict[str, Any]]:
    """
    Строит SQL-фильтр ТОЛЬКО из серверного allowed_audiences.
    Клиентский input не влияет на этот список.
    """
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    placeholders = ','.join(['%s'] * len(allowed_audiences))
    cur.execute(
        f"""
        SELECT id, type, title, message, cta_label, cta_href,
               enabled, dismissible, starts_at, ends_at, audience,
               route_scope, priority, created_by, updated_by,
               created_at, updated_at, published_at, unpublished_at
        FROM {SCHEMA}.status_banners
        WHERE enabled = TRUE
          AND audience IN ({placeholders})
          AND (starts_at IS NULL OR starts_at <= now())
          AND (ends_at IS NULL OR ends_at > now())
        ORDER BY priority DESC, COALESCE(published_at, updated_at, created_at) DESC
        LIMIT 50
        """,
        allowed_audiences,
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Defense-in-depth: дополнительная Python-фильтрация
    allowed_set = set(allowed_audiences)
    return [_row_to_banner(r) for r in rows if r.get('audience') in allowed_set]


# ─── handler ─────────────────────────────────────────────────────────────────

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_PUBLIC, 'body': ''}

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': CORS_PUBLIC,
            'body': json.dumps({'error': 'method_not_allowed'}),
        }

    now = datetime.now(timezone.utc)

    # SEC-1.5: viewer определяется СЕРВЕРОМ по валидным сессиям.
    # query params / body / localStorage / X-Admin-Token полностью игнорируются.
    viewer = _resolve_viewer(event)
    allowed_audiences = ALLOWED_AUDIENCES_BY_VIEWER[viewer]

    # Cache policy: audience-sensitive ответы не должны кешироваться shared-кешем
    cors_headers = CORS_PUBLIC if viewer == 'public' else CORS_PRIVATE

    if not DATABASE_URL:
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'banners': [],
                'server_time': now.isoformat(),
                'viewer': viewer,
                'audience_policy': AUDIENCE_POLICY,
            }),
        }

    try:
        banners = _fetch_banners(allowed_audiences)
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(
                {
                    'banners': banners,
                    'server_time': now.isoformat(),
                    'viewer': viewer,
                    'audience_policy': AUDIENCE_POLICY,
                },
                ensure_ascii=False,
                default=str,
            ),
        }
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(
                {
                    'banners': [],
                    'server_time': now.isoformat(),
                    'viewer': viewer,
                    'audience_policy': AUDIENCE_POLICY,
                    'error': 'db_unavailable',
                },
                ensure_ascii=False,
            ),
        }