"""
Search v2 — индексер.
Устанавливает pg_trgm/unaccent и заполняет таблицу search_index
из источников: блог, задачи, события, рецепты, покупки, воспоминания.

GET /?action=setup      — установка расширений + тrgm-индекс на title_norm/content_norm
GET /?action=index_all  — полная переиндексация всех публичных источников
GET /?action=index_all&token=<admin_token>  — + приватные (все семьи)
POST /                  — upsert одной записи {entity_type, entity_id, title, content, url, family_id, visibility}
"""

import json
import os
import re
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
ADMIN_TOKEN  = os.environ.get('ADMIN_TOKEN', '')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}


def resp(status, body):
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps(body, ensure_ascii=False, default=str)}


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def normalize(text):
    """ё→е, lower, чистка лишних пробелов"""
    if not text:
        return ''
    text = text.replace('ё', 'е').replace('Ё', 'Е')
    text = re.sub(r'\s+', ' ', text).strip()
    return text.lower()


def make_vector_sql(title_norm, content_norm):
    """SQL-выражение для search_vector"""
    t = title_norm.replace("'", "''")
    c = content_norm.replace("'", "''")
    return (
        f"setweight(to_tsvector('russian', '{t}'), 'A') || "
        f"setweight(to_tsvector('russian', '{c}'), 'B')"
    )


def upsert(cur, entity_type, entity_id, title, content, url,
           family_id=None, visibility='private'):
    tn = normalize(title)
    cn = normalize(content)
    fid_sql = f"'{family_id}'" if family_id else 'NULL'
    cur.execute(f"""
        INSERT INTO {SCHEMA}.search_index
          (entity_type, entity_id, title, content, url, family_id, visibility,
           title_norm, content_norm, search_vector, updated_at)
        VALUES (
          '{entity_type}', '{entity_id}',
          $${title}$$, $${content}$$, '{url}',
          {fid_sql}, '{visibility}',
          $${tn}$$, $${cn}$$,
          {make_vector_sql(tn, cn)},
          NOW()
        )
        ON CONFLICT (entity_type, entity_id) DO UPDATE SET
          title         = EXCLUDED.title,
          content       = EXCLUDED.content,
          url           = EXCLUDED.url,
          family_id     = EXCLUDED.family_id,
          visibility    = EXCLUDED.visibility,
          title_norm    = EXCLUDED.title_norm,
          content_norm  = EXCLUDED.content_norm,
          search_vector = EXCLUDED.search_vector,
          updated_at    = NOW()
    """)


def action_setup(conn, cur):
    """Устанавливает расширения и trigram-индексы"""
    cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    cur.execute("CREATE EXTENSION IF NOT EXISTS unaccent")
    cur.execute(f"""
        CREATE INDEX IF NOT EXISTS search_index_title_trgm_idx
        ON {SCHEMA}.search_index USING GIN (title_norm gin_trgm_ops)
    """)
    cur.execute(f"""
        CREATE INDEX IF NOT EXISTS search_index_content_trgm_idx
        ON {SCHEMA}.search_index USING GIN (content_norm gin_trgm_ops)
    """)
    return {'ok': True, 'message': 'Extensions and trgm indexes created'}


def action_index_all(cur):
    """Индексирует все источники"""
    indexed = {}

    # 1. Блог (публичный)
    try:
        cur.execute(f"""
            SELECT id, title, excerpt, content, slug
            FROM {SCHEMA}.public_blog_posts
            WHERE is_published = true
        """)
        rows = cur.fetchall()
        for row in rows:
            body = (row.get('excerpt') or '') + ' ' + (row.get('content') or '')
            upsert(cur, 'blog', str(row['id']),
                   row['title'], body, f"/blog/{row['slug']}",
                   family_id=None, visibility='public')
        indexed['blog'] = len(rows)
    except Exception as e:
        indexed['blog_error'] = str(e)

    # 2. Задачи (приватные — все семьи)
    try:
        cur.execute(f"""
            SELECT id, title, description, family_id
            FROM {SCHEMA}.tasks_v2
            WHERE family_id IS NOT NULL
        """)
        rows = cur.fetchall()
        for row in rows:
            upsert(cur, 'task', str(row['id']),
                   row['title'], row.get('description') or '',
                   f"/tasks?id={row['id']}",
                   family_id=str(row['family_id']), visibility='private')
        indexed['tasks'] = len(rows)
    except Exception as e:
        indexed['tasks_error'] = str(e)

    # 3. События
    try:
        cur.execute(f"""
            SELECT id, title, description, family_id,
                   to_char(event_date, 'DD.MM.YYYY') as date_str
            FROM {SCHEMA}.calendar_events
            WHERE family_id IS NOT NULL
        """)
        rows = cur.fetchall()
        for row in rows:
            body = (row.get('description') or '') + ' ' + (row.get('date_str') or '')
            upsert(cur, 'event', str(row['id']),
                   row['title'], body, f"/events/{row['id']}",
                   family_id=str(row['family_id']), visibility='private')
        indexed['events'] = len(rows)
    except Exception as e:
        indexed['events_error'] = str(e)

    # 4. Рецепты
    try:
        cur.execute(f"""
            SELECT id, name, description, family_id
            FROM {SCHEMA}.recipes
        """)
        rows = cur.fetchall()
        for row in rows:
            vis = 'private' if row.get('family_id') else 'public'
            upsert(cur, 'recipe', str(row['id']),
                   row['name'], row.get('description') or '',
                   f"/recipes?id={row['id']}",
                   family_id=str(row['family_id']) if row.get('family_id') else None,
                   visibility=vis)
        indexed['recipes'] = len(rows)
    except Exception as e:
        indexed['recipes_error'] = str(e)

    # 5. Покупки (только непокупленные)
    try:
        cur.execute(f"""
            SELECT id, name, category, family_id
            FROM {SCHEMA}.shopping_items_v2
            WHERE family_id IS NOT NULL AND purchased = false
        """)
        rows = cur.fetchall()
        for row in rows:
            upsert(cur, 'shopping', str(row['id']),
                   row['name'], row.get('category') or '',
                   '/shopping',
                   family_id=str(row['family_id']), visibility='private')
        indexed['shopping'] = len(rows)
    except Exception as e:
        indexed['shopping_error'] = str(e)

    # 6. Воспоминания
    try:
        cur.execute(f"""
            SELECT id, title, description, family_id
            FROM {SCHEMA}.memory_entries
            WHERE family_id IS NOT NULL
        """)
        rows = cur.fetchall()
        for row in rows:
            upsert(cur, 'memory', str(row['id']),
                   row['title'], row.get('description') or '',
                   '/memory',
                   family_id=str(row['family_id']), visibility='private')
        indexed['memory'] = len(rows)
    except Exception as e:
        indexed['memory_error'] = str(e)

    return indexed


def action_upsert_one(cur, body):
    """Upsert одной записи"""
    required = ['entity_type', 'entity_id', 'title', 'url']
    for f in required:
        if not body.get(f):
            return None, f'Missing field: {f}'
    upsert(cur,
           body['entity_type'], body['entity_id'],
           body.get('title', ''), body.get('content', ''),
           body['url'],
           family_id=body.get('family_id'),
           visibility=body.get('visibility', 'private'))
    return {'ok': True}, None


def handler(event: dict, context) -> dict:
    """Search v2 индексер — setup, index_all, upsert"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    token  = params.get('token', '') or (event.get('headers') or {}).get('X-Auth-Token', '')

    # Все действия требуют admin-токена
    if token != ADMIN_TOKEN or not ADMIN_TOKEN:
        return resp(403, {'error': 'Forbidden'})

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if action == 'setup':
        result = action_setup(conn, cur)
        cur.close(); conn.close()
        return resp(200, result)

    if action == 'index_all':
        result = action_index_all(cur)
        cur.close(); conn.close()
        return resp(200, {'indexed': result})

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        result, error = action_upsert_one(cur, body)
        cur.close(); conn.close()
        if error:
            return resp(400, {'error': error})
        return resp(200, result)

    cur.close(); conn.close()
    return resp(400, {'error': 'Unknown action. Use ?action=setup or ?action=index_all'})
