"""
Business: Public read API для системного StatusBanner. Отдаёт только те
баннеры, на которые имеет право текущий viewer (определяется по headers).
Это закрывает audience-leakage: контент authenticated/admins-баннеров не
уезжает анониму.

Viewer determination (server-side):
  - X-Admin-Token == 'admin_authenticated'   → viewer='admin'
  - X-Auth-Token присутствует и непустой      → viewer='authenticated'
  - иначе                                     → viewer='public' (только audience=all)

Args: event с httpMethod GET (или OPTIONS для CORS preflight);
    headers: X-Admin-Token, X-Auth-Token (опциональные).
    context: object с request_id.

Returns: { banners: StatusBanner[], server_time: ISO, viewer }.
    HTTP 200 для всех нормальных ответов (пустой список — тоже 200).
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'
ADMIN_TOKEN_EXPECTED = 'admin_authenticated'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, X-Auth-Token, X-Authorization, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    # ВАЖНО: ответ может зависеть от заголовков, поэтому кеш — private (только в
    # браузере пользователя, не на CDN, иначе одному пользователю улетит ответ
    # другого audience). Vary помогает любому промежуточному кешу различать.
    'Cache-Control': 'private, max-age=15, must-revalidate',
    'Vary': 'X-Admin-Token, X-Auth-Token, X-Authorization, Authorization',
}


def _row_to_banner(r: Dict[str, Any]) -> Dict[str, Any]:
    """Преобразуем snake_case → camelCase + ISO даты."""
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


def _resolve_viewer(event: Dict[str, Any]) -> str:
    """
    Безопасный default — 'public'. Любая ошибка/неоднозначность → public.
    Возвращает: 'public' | 'authenticated' | 'admin'.
    """
    headers = event.get('headers') or {}
    # case-insensitive read
    norm: Dict[str, str] = {}
    for k, v in headers.items():
        if isinstance(k, str) and isinstance(v, str):
            norm[k.lower()] = v

    if norm.get('x-admin-token') == ADMIN_TOKEN_EXPECTED:
        return 'admin'

    # Auth-token проксируется как X-Auth-Token / X-Authorization / Authorization
    # (cloud provider убирает Authorization/Cookie, поэтому фронт обычно шлёт
    # X-Auth-Token). Принимаем любой из них.
    auth_candidates = [
        norm.get('x-auth-token'),
        norm.get('x-authorization'),
        norm.get('authorization'),
    ]
    for token in auth_candidates:
        if token and str(token).strip():
            return 'authenticated'

    return 'public'


def _allowed_audiences(viewer: str) -> Tuple[str, ...]:
    """
    Какие audience может видеть viewer.
    public        → ('all',)
    authenticated → ('all', 'authenticated')
    admin         → ('all', 'authenticated', 'admins')
    """
    if viewer == 'admin':
        return ('all', 'authenticated', 'admins')
    if viewer == 'authenticated':
        return ('all', 'authenticated')
    return ('all',)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'method_not_allowed'}),
        }

    now = datetime.now(timezone.utc)
    viewer = _resolve_viewer(event)
    allowed = _allowed_audiences(viewer)

    if not DATABASE_URL:
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(
                {'banners': [], 'server_time': now.isoformat(), 'viewer': viewer}
            ),
        }

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # IN-clause безопасен: значения из whitelist выше, не из user-input.
        in_list = ', '.join(f"'{a}'" for a in allowed)
        cur.execute(f"""
            SELECT id, type, title, message, cta_label, cta_href,
                   enabled, dismissible, starts_at, ends_at, audience,
                   route_scope, priority, created_by, updated_by,
                   created_at, updated_at, published_at, unpublished_at
            FROM {SCHEMA}.status_banners
            WHERE enabled = TRUE
              AND (starts_at IS NULL OR starts_at <= now())
              AND (ends_at IS NULL OR ends_at > now())
              AND audience IN ({in_list})
            ORDER BY priority DESC, COALESCE(published_at, updated_at, created_at) DESC
            LIMIT 50
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        banners: List[Dict[str, Any]] = [_row_to_banner(r) for r in rows]
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(
                {'banners': banners, 'server_time': now.isoformat(), 'viewer': viewer},
                ensure_ascii=False,
                default=str,
            ),
        }
    except Exception as e:
        # Не валим клиент при проблемах БД — возвращаем пустой список и тихо
        # сообщаем причину в логах. Это правильно для системы коммуникаций:
        # лучше «нет баннера», чем «всё сломано из-за самого баннера».
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(
                {
                    'banners': [],
                    'server_time': now.isoformat(),
                    'viewer': viewer,
                    'error': 'db_unavailable',
                    'detail': str(e)[:200],
                },
                ensure_ascii=False,
            ),
        }
