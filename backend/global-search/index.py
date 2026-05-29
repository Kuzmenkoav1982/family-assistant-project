"""
Глобальный полнотекстовый поиск по экосистеме Наша Семья.
Ищет по блогу (публично), задачам, событиям, рецептам, покупкам (приватно — по family_id).
GET /?q=текст&family_id=...&limit=20
Returns: {results: [{type, id, title, snippet, url, icon}]}
"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}


def resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def snippet(text: str, q: str, length: int = 120) -> str:
    if not text:
        return ''
    text = text.replace('\n', ' ').strip()
    lower = text.lower()
    pos = lower.find(q.lower().split()[0] if q else '')
    if pos == -1:
        return text[:length] + ('…' if len(text) > length else '')
    start = max(0, pos - 30)
    end = min(len(text), start + length)
    result = text[start:end]
    if start > 0:
        result = '…' + result
    if end < len(text):
        result += '…'
    return result


def escape_like(q: str) -> str:
    return q.replace("'", "''").replace('%', '\\%').replace('_', '\\_')


def handler(event: dict, context) -> dict:
    """Глобальный поиск по контенту экосистемы"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    q = (params.get('q') or '').strip()
    family_id = (params.get('family_id') or '').strip()
    limit = min(int(params.get('limit') or 20), 50)

    if not q or len(q) < 2:
        return resp(400, {'error': 'Запрос слишком короткий'})

    like = f'%{escape_like(q)}%'
    results = []

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # 1. Блог — публичный, без фильтра по family
    try:
        cur.execute(f"""
            SELECT id, title, excerpt, slug
            FROM {SCHEMA}.public_blog_posts
            WHERE is_published = true
              AND (title ILIKE %s OR excerpt ILIKE %s OR content ILIKE %s)
            ORDER BY published_at DESC
            LIMIT %s
        """, (like, like, like, limit))
        for row in cur.fetchall():
            results.append({
                'type': 'blog',
                'id': str(row['id']),
                'title': row['title'],
                'snippet': snippet(row.get('excerpt') or '', q),
                'url': f"/blog/{row['slug']}",
                'icon': 'BookOpen',
                'group': 'Блог',
            })
    except Exception as e:
        print(f'[WARN] blog search: {e}')

    # Приватные разделы — только если передан family_id
    if family_id:

        # 2. Задачи
        try:
            cur.execute(f"""
                SELECT id, title, description, completed
                FROM {SCHEMA}.tasks_v2
                WHERE family_id = %s
                  AND (title ILIKE %s OR description ILIKE %s)
                ORDER BY created_at DESC
                LIMIT %s
            """, (family_id, like, like, limit))
            for row in cur.fetchall():
                results.append({
                    'type': 'task',
                    'id': str(row['id']),
                    'title': row['title'],
                    'snippet': snippet(row.get('description') or '', q),
                    'url': f"/tasks?id={row['id']}",
                    'icon': 'CheckSquare',
                    'group': 'Задачи',
                    'completed': row.get('completed', False),
                })
        except Exception as e:
            print(f'[WARN] tasks search: {e}')

        # 3. События календаря
        try:
            cur.execute(f"""
                SELECT id, title, description, event_date
                FROM {SCHEMA}.calendar_events
                WHERE family_id = %s
                  AND (title ILIKE %s OR description ILIKE %s)
                ORDER BY event_date DESC
                LIMIT %s
            """, (family_id, like, like, limit))
            for row in cur.fetchall():
                date_str = str(row['event_date'])[:10] if row.get('event_date') else ''
                results.append({
                    'type': 'event',
                    'id': str(row['id']),
                    'title': row['title'],
                    'snippet': date_str,
                    'url': f"/events/{row['id']}",
                    'icon': 'Calendar',
                    'group': 'События',
                })
        except Exception as e:
            print(f'[WARN] events search: {e}')

        # 4. Рецепты
        try:
            cur.execute(f"""
                SELECT id, name, description
                FROM {SCHEMA}.recipes
                WHERE (family_id = %s OR family_id IS NULL)
                  AND (name ILIKE %s OR description ILIKE %s)
                ORDER BY created_at DESC
                LIMIT %s
            """, (family_id, like, like, limit))
            for row in cur.fetchall():
                results.append({
                    'type': 'recipe',
                    'id': str(row['id']),
                    'title': row['name'],
                    'snippet': snippet(row.get('description') or '', q),
                    'url': f"/recipes?id={row['id']}",
                    'icon': 'ChefHat',
                    'group': 'Рецепты',
                })
        except Exception as e:
            print(f'[WARN] recipes search: {e}')

        # 5. Список покупок
        try:
            cur.execute(f"""
                SELECT id, name, category
                FROM {SCHEMA}.shopping_items_v2
                WHERE family_id = %s
                  AND name ILIKE %s
                  AND purchased = false
                ORDER BY created_at DESC
                LIMIT %s
            """, (family_id, like, limit))
            for row in cur.fetchall():
                results.append({
                    'type': 'shopping',
                    'id': str(row['id']),
                    'title': row['name'],
                    'snippet': row.get('category') or 'Покупка',
                    'url': '/shopping',
                    'icon': 'ShoppingCart',
                    'group': 'Покупки',
                })
        except Exception as e:
            print(f'[WARN] shopping search: {e}')

        # 6. Воспоминания
        try:
            cur.execute(f"""
                SELECT id, title, description
                FROM {SCHEMA}.memory_entries
                WHERE family_id = %s
                  AND (title ILIKE %s OR description ILIKE %s)
                ORDER BY created_at DESC
                LIMIT %s
            """, (family_id, like, like, limit))
            for row in cur.fetchall():
                results.append({
                    'type': 'memory',
                    'id': str(row['id']),
                    'title': row['title'],
                    'snippet': snippet(row.get('description') or '', q),
                    'url': f"/memory",
                    'icon': 'Images',
                    'group': 'Воспоминания',
                })
        except Exception as e:
            print(f'[WARN] memory search: {e}')

    cur.close()
    conn.close()

    return resp(200, {
        'q': q,
        'total': len(results),
        'results': results,
    })
