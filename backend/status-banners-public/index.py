"""
Business: Public read API для системного StatusBanner (info/maintenance/
warning/critical/update). Возвращает массив включённых баннеров с базовой
фильтрацией по серверному времени; финальную селекцию (priority/route/
audience/dismissed) делает клиент через resolveActiveBanner().

Args: event с httpMethod GET (или OPTIONS для CORS preflight),
    queryStringParameters игнорируются. context: object с request_id.

Returns: { banners: StatusBanner[], server_time: ISO-string }.
    HTTP 200 для всех нормальных ответов (пустой список — тоже 200).
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List
import psycopg2
from psycopg2.extras import RealDictCursor


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    # Public кэш на 30 секунд — баннеры не критичны к мгновенному обновлению,
    # но и зависать надолго не должны. Клиент дополнительно сам поллит каждые
    # 60 секунд (см. useBannerSource в B3+).
    'Cache-Control': 'public, max-age=30, must-revalidate',
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

    if not DATABASE_URL:
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'banners': [], 'server_time': now.isoformat()}),
        }

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Серверная фильтрация по enabled/окну. Тонкая селекция (audience/route
        # /priority/dismissed) — на клиенте через resolveActiveBanner.
        cur.execute(f"""
            SELECT id, type, title, message, cta_label, cta_href,
                   enabled, dismissible, starts_at, ends_at, audience,
                   route_scope, priority, created_by, updated_by,
                   created_at, updated_at, published_at, unpublished_at
            FROM {SCHEMA}.status_banners
            WHERE enabled = TRUE
              AND (starts_at IS NULL OR starts_at <= now())
              AND (ends_at IS NULL OR ends_at > now())
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
                {'banners': banners, 'server_time': now.isoformat()},
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
                    'error': 'db_unavailable',
                    'detail': str(e)[:200],
                },
                ensure_ascii=False,
            ),
        }
