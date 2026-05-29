"""
Глобальный поиск по экосистеме Наша Семья.
- Публичный: блог (без авторизации)
- Приватный: задачи, события, рецепты, покупки, воспоминания
  family_id берётся ТОЛЬКО из серверной сессии по X-Auth-Token, не от клиента.
GET /?q=текст&limit=20
Returns: {results: [{type, id, title, snippet, url, icon, group}]}
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


def get_family_id_from_token(token: str):
    """Получает family_id из БД по токену сессии. Не доверяет клиенту."""
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT fm.family_id
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
        WHERE s.token = '{token.replace("'", "''")}'
          AND s.expires_at > CURRENT_TIMESTAMP
        LIMIT 1
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['family_id']) if row and row.get('family_id') else None


def snippet(text: str, q: str, length: int = 120) -> str:
    if not text:
        return ''
    text = text.replace('\n', ' ').strip()
    lower = text.lower()
    word = q.lower().split()[0] if q.split() else ''
    pos = lower.find(word) if word else -1
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
    """Глобальный поиск. Приватные данные — только по токену сессии."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    q = (params.get('q') or '').strip()
    limit = min(int(params.get('limit') or 20), 50)

    if not q or len(q) < 2:
        return resp(400, {'error': 'Запрос слишком короткий'})

    # P0: family_id берём только из сессии на сервере
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    family_id = get_family_id_from_token(token) if token else None

    like = f'%{escape_like(q)}%'
    results = []

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # 1. Блог — публичный, без авторизации
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

    # 2–6. Приватные разделы — только если токен валиден и семья найдена
    if family_id:

        # Задачи
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

        # События
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

        # Рецепты
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

        # Покупки
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

        # Воспоминания
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
                    'url': '/memory',
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
        'authenticated': bool(family_id),
        'results': results,
    })