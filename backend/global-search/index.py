"""
Global Search v2 — PostgreSQL FTS + pg_trgm + ранжирование.
Ищет по таблице search_index (заполняется search-indexer).
Fallback на прямые ILIKE-запросы если search_index пуст.

GET /?q=текст&limit=20
Headers: X-Auth-Token (опционально, для приватного поиска)
Returns: {results, total, authenticated, engine}
"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}

ICON_MAP = {
    'blog':     'BookOpen',
    'task':     'CheckSquare',
    'event':    'Calendar',
    'recipe':   'ChefHat',
    'shopping': 'ShoppingCart',
    'memory':   'Images',
}

GROUP_MAP = {
    'blog':     'Блог',
    'task':     'Задачи',
    'event':    'События',
    'recipe':   'Рецепты',
    'shopping': 'Покупки',
    'memory':   'Воспоминания',
}


def resp(status, body):
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps(body, ensure_ascii=False, default=str)}


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def get_family_id_from_token(token):
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
    cur.close(); conn.close()
    return str(row['family_id']) if row and row.get('family_id') else None


def normalize(q):
    return q.replace('ё', 'е').replace('Ё', 'Е').lower().strip()


def escape_like(q):
    return q.replace("'", "''").replace('%', '\\%').replace('_', '\\_')


def snippet(text, length=120):
    if not text:
        return ''
    text = text.replace('\n', ' ').strip()
    return text[:length] + ('…' if len(text) > length else '')


def search_v2(cur, q, family_id, limit):
    """FTS + trigram поиск по search_index с ранжированием"""
    qn = normalize(q)
    qe = qn.replace("'", "''")
    like = f'%{escape_like(qn)}%'
    fid_filter = f"AND (family_id = '{family_id}' OR visibility = 'public')" if family_id else "AND visibility = 'public'"

    # Формируем tsquery — пробуем plainto_tsquery, при пустом результате — trgm
    cur.execute(f"""
        SELECT
          entity_type, entity_id, title, content, url, visibility, family_id,
          -- score: FTS-ранг (A=title важнее) + тrigram по title + boost за точное вхождение
          (
            ts_rank_cd(search_vector, plainto_tsquery('russian', '{qe}'), 32) * 4.0
            + similarity(title_norm, '{qe}') * 2.0
            + CASE WHEN title_norm LIKE '{escape_like(qn)}%' THEN 1.0 ELSE 0.0 END
          ) AS score
        FROM {SCHEMA}.search_index
        WHERE (
          -- FTS поиск
          search_vector @@ plainto_tsquery('russian', '{qe}')
          -- Trigram по title (опечатки, частичные совпадения)
          OR title_norm % '{qe}'
          -- ILIKE подстрока — fallback
          OR title_norm LIKE '{like}'
          OR content_norm LIKE '{like}'
        )
        {fid_filter}
        ORDER BY score DESC, updated_at DESC
        LIMIT {limit}
    """)
    return cur.fetchall()


def search_fallback(cur, q, family_id, limit):
    """Прямые ILIKE-запросы если search_index пуст"""
    qn = normalize(q)
    like = f'%{escape_like(qn)}%'
    results = []

    # Блог
    cur.execute(f"""
        SELECT id, title, excerpt, slug FROM {SCHEMA}.public_blog_posts
        WHERE is_published = true
          AND (lower(replace(title,'ё','е')) LIKE %s OR lower(replace(excerpt,'ё','е')) LIKE %s
               OR lower(replace(content,'ё','е')) LIKE %s)
        ORDER BY published_at DESC LIMIT %s
    """, (like, like, like, limit))
    for row in cur.fetchall():
        results.append(dict(entity_type='blog', entity_id=str(row['id']),
                            title=row['title'], content=row.get('excerpt') or '',
                            url=f"/blog/{row['slug']}"))

    if family_id:
        cur.execute(f"""
            SELECT id, title, description FROM {SCHEMA}.tasks_v2
            WHERE family_id = %s
              AND (lower(replace(title,'ё','е')) LIKE %s OR lower(replace(coalesce(description,''),'ё','е')) LIKE %s)
            LIMIT %s
        """, (family_id, like, like, limit))
        for row in cur.fetchall():
            results.append(dict(entity_type='task', entity_id=str(row['id']),
                                title=row['title'], content=row.get('description') or '',
                                url=f"/tasks?id={row['id']}"))

        cur.execute(f"""
            SELECT id, title, description FROM {SCHEMA}.calendar_events
            WHERE family_id = %s
              AND (lower(replace(title,'ё','е')) LIKE %s OR lower(replace(coalesce(description,''),'ё','е')) LIKE %s)
            LIMIT %s
        """, (family_id, like, like, limit))
        for row in cur.fetchall():
            results.append(dict(entity_type='event', entity_id=str(row['id']),
                                title=row['title'], content=row.get('description') or '',
                                url=f"/events/{row['id']}"))

        cur.execute(f"""
            SELECT id, name, description FROM {SCHEMA}.recipes
            WHERE (family_id = %s OR family_id IS NULL)
              AND (lower(replace(name,'ё','е')) LIKE %s OR lower(replace(coalesce(description,''),'ё','е')) LIKE %s)
            LIMIT %s
        """, (family_id, like, like, limit))
        for row in cur.fetchall():
            results.append(dict(entity_type='recipe', entity_id=str(row['id']),
                                title=row['name'], content=row.get('description') or '',
                                url=f"/recipes?id={row['id']}"))

    return results


def format_result(row, entity_type=None):
    et = entity_type or row.get('entity_type', '')
    return {
        'type':    et,
        'id':      str(row.get('entity_id', row.get('id', ''))),
        'title':   row.get('title', ''),
        'snippet': snippet(row.get('content') or ''),
        'url':     row.get('url', ''),
        'icon':    ICON_MAP.get(et, 'Search'),
        'group':   GROUP_MAP.get(et, et),
    }


def handler(event: dict, context) -> dict:
    """Global Search v2: FTS + trigram + ранжирование"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    q = (params.get('q') or '').strip()
    limit = min(int(params.get('limit') or 20), 50)

    if not q or len(q) < 2:
        return resp(400, {'error': 'Запрос слишком короткий'})

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    family_id = get_family_id_from_token(token) if token else None

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Проверяем — есть ли что-то в search_index
    cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.search_index LIMIT 1")
    index_count = (cur.fetchone() or {}).get('cnt', 0)

    results = []
    engine = 'fts'

    if index_count > 0:
        # v2: FTS + trgm
        rows = search_v2(cur, q, family_id, limit)
        results = [format_result(r) for r in rows]
    else:
        # fallback: прямые запросы
        engine = 'ilike'
        rows = search_fallback(cur, q, family_id, limit)
        results = [format_result(r) for r in rows]

    cur.close()
    conn.close()

    return resp(200, {
        'q':             q,
        'total':         len(results),
        'authenticated': bool(family_id),
        'engine':        engine,
        'results':       results,
    })
