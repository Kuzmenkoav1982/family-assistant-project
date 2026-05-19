"""
Business: Public read API для системного StatusBanner.

⚠️ v1 hardening (B3.6, вариант A): public endpoint ВСЕГДА отдаёт ТОЛЬКО
audience='all'. Аудитории 'authenticated' и 'admins' помечены как gated
и физически не покидают backend, пока в проекте не появится
верифицированная серверная auth-валидация (security mini-sprint).

Почему так: 'X-Auth-Token: <любое>' ≠ доказательство залогиненности.
Любой клиент мог бы подставить фейковый заголовок и получить
authenticated-баннеры. До нормальной проверки токена режем выдачу на
корню и фиксируем как известное ограничение v1.

Args: event с httpMethod GET (или OPTIONS для CORS preflight);
    headers игнорируются для целей фильтрации в v1.
    context: object с request_id.

Returns: {
    banners: StatusBanner[],   // только audience='all'
    server_time: ISO,
    viewer: 'public',
    audience_policy: 'all_only_v1'
}.
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List
import psycopg2
from psycopg2.extras import RealDictCursor


DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

# v1 hardening: public endpoint показывает ТОЛЬКО общедоступные баннеры.
# Не зависит от заголовков. Когда появится верифицированная серверная
# валидация токена (security mini-sprint), сюда вернётся viewer-aware
# фильтрация — для этого helper уже есть в git-истории (commit B3.5).
PUBLIC_AUDIENCE = 'all'
AUDIENCE_POLICY = 'all_only_v1'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, X-Auth-Token, X-Authorization, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    # Ответ не зависит от заголовков, поэтому можно spокойно кешировать
    # на CDN: одинаковый ответ для всех клиентов.
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
            'body': json.dumps({
                'banners': [],
                'server_time': now.isoformat(),
                'viewer': 'public',
                'audience_policy': AUDIENCE_POLICY,
            }),
        }

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # ВАЖНО (B3.6 audit guarantee): WHERE audience = 'all' жёстко зашит
        # как литерал. Запрос НЕ зависит от user input / заголовков.
        cur.execute(f"""
            SELECT id, type, title, message, cta_label, cta_href,
                   enabled, dismissible, starts_at, ends_at, audience,
                   route_scope, priority, created_by, updated_by,
                   created_at, updated_at, published_at, unpublished_at
            FROM {SCHEMA}.status_banners
            WHERE enabled = TRUE
              AND audience = '{PUBLIC_AUDIENCE}'
              AND (starts_at IS NULL OR starts_at <= now())
              AND (ends_at IS NULL OR ends_at > now())
            ORDER BY priority DESC, COALESCE(published_at, updated_at, created_at) DESC
            LIMIT 50
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        # Дополнительная defense-in-depth: даже если по какой-то причине
        # row проскочила через WHERE, отфильтруем на уровне Python.
        # Это парольная страховка от багов в SQL/драйвере.
        banners: List[Dict[str, Any]] = [
            _row_to_banner(r) for r in rows if r.get('audience') == PUBLIC_AUDIENCE
        ]

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(
                {
                    'banners': banners,
                    'server_time': now.isoformat(),
                    'viewer': 'public',
                    'audience_policy': AUDIENCE_POLICY,
                },
                ensure_ascii=False,
                default=str,
            ),
        }
    except Exception as e:
        # Не валим клиент при проблемах БД — возвращаем пустой список.
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(
                {
                    'banners': [],
                    'server_time': now.isoformat(),
                    'viewer': 'public',
                    'audience_policy': AUDIENCE_POLICY,
                    'error': 'db_unavailable',
                    'detail': str(e)[:200],
                },
                ensure_ascii=False,
            ),
        }
