"""
Search v2 — индексер.
Права: X-Admin-Session-Token (та же сессия, что и в AdminPanel).
ADMIN_TOKEN никогда не передаётся с клиента — проверка только server-side.

GET /?action=setup      — pg_trgm + unaccent + trgm-индексы
GET /?action=index_all  — полная переиндексация всех источников
GET /?action=stats      — количество записей по entity_type
POST /                  — upsert одной записи (внутренний вызов из других функций)
                         { entity_type, entity_id, title, content, url, family_id, visibility }
                         Аутентификация: X-Internal-Token (INTERNAL_CRON_TOKEN)
"""

import hashlib
import json
import os
import re
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL   = os.environ.get('DATABASE_URL', '')
INTERNAL_TOKEN = os.environ.get('INTERNAL_CRON_TOKEN', '')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Session-Token, X-Internal-Token',
    'Content-Type': 'application/json',
}


def resp(status, body):
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps(body, ensure_ascii=False, default=str)}


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


# ── Проверка прав ──────────────────────────────────────────────────────────

def _hash_token(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def is_admin(event):
    """Проверяет X-Admin-Session-Token через таблицу admin_sessions."""
    headers = event.get('headers') or {}
    token = ''
    for k, v in headers.items():
        if isinstance(k, str) and k.lower() == 'x-admin-session-token':
            token = v or ''
            break
    if not token:
        return False
    token_hash = _hash_token(token)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id FROM {SCHEMA}.admin_sessions "
        f"WHERE token_hash = %s AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1",
        (token_hash,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row is not None


def is_internal(event):
    """Проверяет X-Internal-Token для server-to-server upsert."""
    if not INTERNAL_TOKEN:
        return False
    headers = event.get('headers') or {}
    for k, v in headers.items():
        if isinstance(k, str) and k.lower() == 'x-internal-token':
            return v == INTERNAL_TOKEN
    return False


# ── Нормализация текста ────────────────────────────────────────────────────

def normalize(text):
    if not text:
        return ''
    text = text.replace('ё', 'е').replace('Ё', 'Е')
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text.lower()


def make_tsv(tn, cn):
    t = tn.replace("'", "''")
    c = cn.replace("'", "''")
    return (
        f"setweight(to_tsvector('russian', '{t}'), 'A') || "
        f"setweight(to_tsvector('russian', '{c}'), 'B')"
    )


# ── Upsert в индекс ────────────────────────────────────────────────────────

def upsert(cur, entity_type, entity_id, title, content, url,
           family_id=None, visibility='private'):
    tn = normalize(title)
    cn = normalize(content)
    fid = f"'{str(family_id)}'" if family_id else 'NULL'
    title_s   = title.replace("'", "''") if title else ''
    content_s = content.replace("'", "''") if content else ''
    url_s     = url.replace("'", "''") if url else ''
    cur.execute(f"""
        INSERT INTO {SCHEMA}.search_index
          (entity_type, entity_id, title, content, url, family_id, visibility,
           title_norm, content_norm, search_vector, updated_at)
        VALUES (
          '{entity_type}', '{entity_id}',
          '{title_s}', '{content_s}', '{url_s}',
          {fid}, '{visibility}',
          '{tn}', '{cn}',
          {make_tsv(tn, cn)},
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


# ── Actions ────────────────────────────────────────────────────────────────

def action_setup(cur):
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
    return {'ok': True, 'extensions': ['pg_trgm', 'unaccent'], 'indexes': 2}


def action_stats(cur):
    cur.execute(f"""
        SELECT entity_type, COUNT(*) as cnt, visibility
        FROM {SCHEMA}.search_index
        GROUP BY entity_type, visibility
        ORDER BY entity_type
    """)
    rows = cur.fetchall()
    total = sum(r['cnt'] for r in rows)
    return {'total': total, 'by_type': [dict(r) for r in rows]}


def action_index_all(cur):
    indexed = {}

    # 1. Блог — публичный
    try:
        cur.execute(f"""
            SELECT id, title, excerpt, content, slug
            FROM {SCHEMA}.public_blog_posts WHERE is_published = true
        """)
        rows = cur.fetchall()
        for row in rows:
            body = (row.get('excerpt') or '') + ' ' + (row.get('content') or '')
            upsert(cur, 'blog', str(row['id']), row['title'], body,
                   f"/blog/{row['slug']}", family_id=None, visibility='public')
        indexed['blog'] = len(rows)
    except Exception as e:
        indexed['blog_error'] = str(e)

    # 2. Задачи
    try:
        cur.execute(f"""
            SELECT id, title, description, family_id FROM {SCHEMA}.tasks_v2
            WHERE family_id IS NOT NULL
        """)
        rows = cur.fetchall()
        for row in rows:
            upsert(cur, 'task', str(row['id']), row['title'],
                   row.get('description') or '', f"/tasks?id={row['id']}",
                   family_id=str(row['family_id']), visibility='private')
        indexed['tasks'] = len(rows)
    except Exception as e:
        indexed['tasks_error'] = str(e)

    # 3. События
    try:
        cur.execute(f"""
            SELECT id, title, description, family_id,
                   to_char(event_date, 'DD.MM.YYYY') as date_str
            FROM {SCHEMA}.calendar_events WHERE family_id IS NOT NULL
        """)
        rows = cur.fetchall()
        for row in rows:
            body = (row.get('description') or '') + ' ' + (row.get('date_str') or '')
            upsert(cur, 'event', str(row['id']), row['title'], body,
                   f"/events/{row['id']}", family_id=str(row['family_id']), visibility='private')
        indexed['events'] = len(rows)
    except Exception as e:
        indexed['events_error'] = str(e)

    # 4. Рецепты
    try:
        cur.execute(f"SELECT id, name, description, family_id FROM {SCHEMA}.recipes")
        rows = cur.fetchall()
        for row in rows:
            vis = 'private' if row.get('family_id') else 'public'
            upsert(cur, 'recipe', str(row['id']), row['name'],
                   row.get('description') or '', f"/recipes?id={row['id']}",
                   family_id=str(row['family_id']) if row.get('family_id') else None,
                   visibility=vis)
        indexed['recipes'] = len(rows)
    except Exception as e:
        indexed['recipes_error'] = str(e)

    # 5. Покупки
    try:
        cur.execute(f"""
            SELECT id, name, category, family_id FROM {SCHEMA}.shopping_items_v2
            WHERE family_id IS NOT NULL AND purchased = false
        """)
        rows = cur.fetchall()
        for row in rows:
            upsert(cur, 'shopping', str(row['id']), row['name'],
                   row.get('category') or '', '/shopping',
                   family_id=str(row['family_id']), visibility='private')
        indexed['shopping'] = len(rows)
    except Exception as e:
        indexed['shopping_error'] = str(e)

    # 6. Воспоминания
    try:
        cur.execute(f"""
            SELECT id, title, description, family_id FROM {SCHEMA}.memory_entries
            WHERE family_id IS NOT NULL
        """)
        rows = cur.fetchall()
        for row in rows:
            upsert(cur, 'memory', str(row['id']), row['title'],
                   row.get('description') or '', '/memory',
                   family_id=str(row['family_id']), visibility='private')
        indexed['memory'] = len(rows)
    except Exception as e:
        indexed['memory_error'] = str(e)

    return indexed


# ── Handler ────────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Search v2 индексер. Права: X-Admin-Session-Token (GET) или X-Internal-Token (POST)."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    # POST — внутренний upsert из других функций (server-to-server)
    if method == 'POST':
        if not is_internal(event):
            return resp(403, {'error': 'Forbidden: requires X-Internal-Token'})
        body = json.loads(event.get('body') or '{}')
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        required = ['entity_type', 'entity_id', 'title', 'url']
        for f in required:
            if not body.get(f):
                cur.close(); conn.close()
                return resp(400, {'error': f'Missing field: {f}'})
        upsert(cur, body['entity_type'], body['entity_id'],
               body.get('title', ''), body.get('content', ''),
               body['url'],
               family_id=body.get('family_id'),
               visibility=body.get('visibility', 'private'))
        cur.close(); conn.close()
        return resp(200, {'ok': True})

    # GET — только авторизованный администратор
    if not is_admin(event):
        return resp(403, {'error': 'Forbidden: requires admin session'})

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if action == 'setup':
        result = action_setup(cur)
        cur.close(); conn.close()
        return resp(200, result)

    if action == 'stats':
        result = action_stats(cur)
        cur.close(); conn.close()
        return resp(200, result)

    if action == 'index_all':
        result = action_index_all(cur)
        cur.close(); conn.close()
        return resp(200, {'indexed': result})

    cur.close(); conn.close()
    return resp(400, {'error': 'Unknown action. Use ?action=setup|index_all|stats'})
