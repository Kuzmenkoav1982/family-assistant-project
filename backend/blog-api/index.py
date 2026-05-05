"""
Blog API — публичный SEO-блог "Наша Семья".
GET /?action=list — лента постов (фильтры: category, tag, page, limit, q)
GET /?action=post&slug=... — один пост + +1 view + связанные
GET /?action=categories — список категорий
GET /?action=tags — популярные теги
GET /?action=sitemap — данные для sitemap.xml
GET /?action=feed — последние N постов для главной

Admin (требуют X-Admin-Token):
GET /?action=admin-list — все посты (включая drafts/archived) с full-data
GET /?action=admin-stats — общая аналитика блога
GET /?action=admin-post&id=N — один пост целиком для редактирования
POST /?action=admin-update — обновление поля поста
POST /?action=admin-toggle-status — публикация/скрытие/архив
POST /?action=admin-delete — удаление поста
"""

import json
import os
import hashlib
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
ADMIN_TOKEN_DEFAULT = 'admin_authenticated'

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=60',
}

ADMIN_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
}


def check_admin(event: Dict) -> bool:
    headers = event.get('headers', {}) or {}
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    expected = os.environ.get('ADMIN_TOKEN', ADMIN_TOKEN_DEFAULT)
    return token == expected


def admin_response(data: Any, status: int = 200) -> Dict:
    return {
        'statusCode': status,
        'headers': ADMIN_HEADERS,
        'body': json.dumps(data, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def esc_sql(v: Any) -> str:
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def respond(data: Any, status: int = 200) -> Dict:
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'body': json.dumps(data, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def list_posts(params: Dict) -> Dict:
    page = max(1, int(params.get('page', '1') or 1))
    limit = min(50, max(1, int(params.get('limit', '12') or 12)))
    offset = (page - 1) * limit
    category = (params.get('category') or '').strip()
    tag = (params.get('tag') or '').strip()
    q = (params.get('q') or '').strip()

    where = ["p.status = 'published'"]
    if category:
        cat_safe = category.replace("'", "''")
        where.append(f"c.slug = '{cat_safe}'")
    if tag:
        tag_safe = tag.replace("'", "''")
        where.append(f"""EXISTS (
            SELECT 1 FROM {SCHEMA}.public_blog_post_tags pt
            JOIN {SCHEMA}.public_blog_tags t ON t.id = pt.tag_id
            WHERE pt.post_id = p.id AND t.slug = '{tag_safe}'
        )""")
    if q:
        q_safe = q.replace("'", "''").replace('%', '')
        where.append(f"(p.title ILIKE '%{q_safe}%' OR p.excerpt ILIKE '%{q_safe}%')")

    where_sql = ' AND '.join(where)

    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT COUNT(*) AS total
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE {where_sql}
    """)
    total = cur.fetchone()['total']

    cur.execute(f"""
        SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image_url,
               p.reading_time_min, p.views_count, p.likes_count,
               p.published_at, p.author_name,
               c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE {where_sql}
        ORDER BY p.published_at DESC
        LIMIT {limit} OFFSET {offset}
    """)
    posts = [dict(r) for r in cur.fetchall()]

    if posts:
        ids = ','.join(str(p['id']) for p in posts)
        cur.execute(f"""
            SELECT pt.post_id, t.slug, t.name
            FROM {SCHEMA}.public_blog_post_tags pt
            JOIN {SCHEMA}.public_blog_tags t ON t.id = pt.tag_id
            WHERE pt.post_id IN ({ids})
        """)
        tags_by_post: Dict[int, List[Dict]] = {}
        for row in cur.fetchall():
            tags_by_post.setdefault(row['post_id'], []).append({
                'slug': row['slug'], 'name': row['name']
            })
        for p in posts:
            p['tags'] = tags_by_post.get(p['id'], [])

    cur.close()
    conn.close()

    return respond({
        'posts': posts,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit,
    })


def get_post(params: Dict, headers: Dict, source_ip: str) -> Dict:
    slug = (params.get('slug') or '').strip()
    if not slug:
        return respond({'error': 'slug required'}, 400)
    slug_safe = slug.replace("'", "''")

    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.slug = '{slug_safe}' AND p.status = 'published'
        LIMIT 1
    """)
    post = cur.fetchone()
    if not post:
        cur.close()
        conn.close()
        return respond({'error': 'not found'}, 404)
    post = dict(post)

    cur.execute(f"""
        SELECT t.slug, t.name FROM {SCHEMA}.public_blog_post_tags pt
        JOIN {SCHEMA}.public_blog_tags t ON t.id = pt.tag_id
        WHERE pt.post_id = {post['id']}
    """)
    post['tags'] = [dict(r) for r in cur.fetchall()]

    related_where = []
    if post.get('category_id'):
        related_where.append(f"p.category_id = {int(post['category_id'])}")
    related_filter = ' AND '.join(related_where) if related_where else '1=1'
    cur.execute(f"""
        SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image_url,
               p.reading_time_min, p.published_at,
               c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.status = 'published' AND p.id <> {post['id']} AND {related_filter}
        ORDER BY p.published_at DESC LIMIT 4
    """)
    post['related'] = [dict(r) for r in cur.fetchall()]

    ua = (headers.get('user-agent') or headers.get('User-Agent') or '')[:500]
    referrer = (headers.get('referer') or headers.get('Referer') or '')[:500]
    visitor_raw = f"{source_ip}|{ua}"
    visitor_hash = hashlib.sha256(visitor_raw.encode()).hexdigest()[:64]

    ua_safe = ua.replace("'", "''")
    ref_safe = referrer.replace("'", "''")
    cur.execute(f"""
        INSERT INTO {SCHEMA}.public_blog_post_views
        (post_id, visitor_hash, user_agent, referrer)
        VALUES ({post['id']}, '{visitor_hash}', '{ua_safe}', '{ref_safe}')
    """)
    cur.execute(f"""
        UPDATE {SCHEMA}.public_blog_posts
        SET views_count = views_count + 1
        WHERE id = {post['id']}
    """)
    conn.commit()

    cur.close()
    conn.close()
    return respond({'post': post})


def list_categories() -> Dict:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT c.id, c.slug, c.name, c.emoji, c.description, c.sort_order,
               COUNT(p.id) AS posts_count
        FROM {SCHEMA}.public_blog_categories c
        LEFT JOIN {SCHEMA}.public_blog_posts p
            ON p.category_id = c.id AND p.status = 'published'
        GROUP BY c.id
        ORDER BY c.sort_order
    """)
    cats = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return respond({'categories': cats})


def list_tags(params: Dict) -> Dict:
    limit = min(100, max(1, int(params.get('limit', '30') or 30)))
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT t.slug, t.name, COUNT(pt.post_id) AS posts_count
        FROM {SCHEMA}.public_blog_tags t
        JOIN {SCHEMA}.public_blog_post_tags pt ON pt.tag_id = t.id
        JOIN {SCHEMA}.public_blog_posts p ON p.id = pt.post_id AND p.status = 'published'
        GROUP BY t.id
        ORDER BY posts_count DESC
        LIMIT {limit}
    """)
    tags = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return respond({'tags': tags})


def feed(params: Dict) -> Dict:
    limit = min(20, max(1, int(params.get('limit', '6') or 6)))
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT p.slug, p.title, p.excerpt, p.cover_image_url,
               p.reading_time_min, p.published_at,
               c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.status = 'published'
        ORDER BY p.published_at DESC LIMIT {limit}
    """)
    posts = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return respond({'posts': posts})


def sitemap_data() -> Dict:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT slug, updated_at, published_at
        FROM {SCHEMA}.public_blog_posts
        WHERE status = 'published'
        ORDER BY published_at DESC
    """)
    posts = [dict(r) for r in cur.fetchall()]
    cur.execute(f"SELECT slug FROM {SCHEMA}.public_blog_categories ORDER BY sort_order")
    cats = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return respond({'posts': posts, 'categories': cats})


def admin_list(params: Dict) -> Dict:
    page = max(1, int(params.get('page', '1') or 1))
    limit = min(100, max(1, int(params.get('limit', '50') or 50)))
    offset = (page - 1) * limit
    status_filter = (params.get('status') or '').strip()
    q = (params.get('q') or '').strip()

    where: List[str] = ['1=1']
    if status_filter and status_filter != 'all':
        where.append(f"p.status = {esc_sql(status_filter)}")
    if q:
        q_safe = q.replace("'", "''").replace('%', '')
        where.append(f"(p.title ILIKE '%{q_safe}%' OR p.slug ILIKE '%{q_safe}%')")

    where_sql = ' AND '.join(where)
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT COUNT(*) AS total FROM {SCHEMA}.public_blog_posts p WHERE {where_sql}
    """)
    total = cur.fetchone()['total']

    cur.execute(f"""
        SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image_url, p.status,
               p.source, p.reading_time_min, p.views_count, p.likes_count,
               p.published_at, p.updated_at, p.author_name, p.seo_title, p.seo_description,
               c.id AS category_id, c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE {where_sql}
        ORDER BY p.published_at DESC
        LIMIT {limit} OFFSET {offset}
    """)
    posts = [dict(r) for r in cur.fetchall()]

    cur.close()
    conn.close()
    return admin_response({
        'posts': posts, 'total': total, 'page': page, 'limit': limit,
        'pages': (total + limit - 1) // limit if total else 0,
    })


def admin_stats() -> Dict:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT
          (SELECT COUNT(*) FROM {SCHEMA}.public_blog_posts WHERE status='published') AS published,
          (SELECT COUNT(*) FROM {SCHEMA}.public_blog_posts WHERE status='draft') AS drafts,
          (SELECT COUNT(*) FROM {SCHEMA}.public_blog_posts WHERE status='archived') AS archived,
          (SELECT COALESCE(SUM(views_count),0) FROM {SCHEMA}.public_blog_posts) AS total_views,
          (SELECT COUNT(*) FROM {SCHEMA}.public_blog_post_views) AS total_view_events,
          (SELECT COUNT(*) FROM {SCHEMA}.public_blog_post_views WHERE viewed_at > NOW() - INTERVAL '7 days') AS views_7d,
          (SELECT COUNT(*) FROM {SCHEMA}.public_blog_post_views WHERE viewed_at > NOW() - INTERVAL '24 hours') AS views_24h
    """)
    stats = dict(cur.fetchone())

    cur.execute(f"""
        SELECT p.id, p.slug, p.title, p.views_count
        FROM {SCHEMA}.public_blog_posts p
        WHERE p.status = 'published'
        ORDER BY p.views_count DESC LIMIT 5
    """)
    stats['top_posts'] = [dict(r) for r in cur.fetchall()]

    cur.execute(f"""
        SELECT c.name, c.emoji, COUNT(p.id) AS posts, COALESCE(SUM(p.views_count),0) AS views
        FROM {SCHEMA}.public_blog_categories c
        LEFT JOIN {SCHEMA}.public_blog_posts p ON p.category_id = c.id AND p.status='published'
        GROUP BY c.id, c.name, c.emoji, c.sort_order
        ORDER BY c.sort_order
    """)
    stats['by_category'] = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return admin_response(stats)


def admin_get_post(params: Dict) -> Dict:
    pid = params.get('id')
    if not pid:
        return admin_response({'error': 'id required'}, 400)
    try:
        pid_int = int(pid)
    except ValueError:
        return admin_response({'error': 'invalid id'}, 400)

    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.id = {pid_int} LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return admin_response({'error': 'not found'}, 404)
    post = dict(row)

    cur.execute(f"""
        SELECT t.id, t.slug, t.name FROM {SCHEMA}.public_blog_post_tags pt
        JOIN {SCHEMA}.public_blog_tags t ON t.id = pt.tag_id
        WHERE pt.post_id = {pid_int}
    """)
    post['tags'] = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return admin_response({'post': post})


ALLOWED_UPDATE_FIELDS = {
    'title', 'slug', 'excerpt', 'content', 'cover_image_url', 'category_id',
    'seo_title', 'seo_description', 'seo_keywords', 'status', 'author_name',
    'reading_time_min',
}


def admin_update(body: Dict) -> Dict:
    pid = body.get('id')
    if not pid:
        return admin_response({'error': 'id required'}, 400)
    try:
        pid_int = int(pid)
    except (ValueError, TypeError):
        return admin_response({'error': 'invalid id'}, 400)

    fields = body.get('fields') or {}
    if not isinstance(fields, dict) or not fields:
        return admin_response({'error': 'fields required'}, 400)

    sets: List[str] = []
    for key, value in fields.items():
        if key not in ALLOWED_UPDATE_FIELDS:
            continue
        sets.append(f"{key} = {esc_sql(value)}")

    if not sets:
        return admin_response({'error': 'no valid fields'}, 400)

    sets.append("updated_at = NOW()")
    sql = f"UPDATE {SCHEMA}.public_blog_posts SET {', '.join(sets)} WHERE id = {pid_int}"

    conn = db_conn()
    cur = conn.cursor()
    try:
        cur.execute(sql)
        conn.commit()
        success = cur.rowcount > 0
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return admin_response({'error': str(e)}, 500)
    cur.close()
    conn.close()
    return admin_response({'ok': success, 'id': pid_int})


def admin_toggle_status(body: Dict) -> Dict:
    pid = body.get('id')
    new_status = body.get('status')
    if not pid or new_status not in ('published', 'draft', 'archived'):
        return admin_response({'error': 'id and valid status required'}, 400)
    try:
        pid_int = int(pid)
    except (ValueError, TypeError):
        return admin_response({'error': 'invalid id'}, 400)

    conn = db_conn()
    cur = conn.cursor()
    cur.execute(f"""
        UPDATE {SCHEMA}.public_blog_posts
        SET status = {esc_sql(new_status)}, updated_at = NOW()
        WHERE id = {pid_int}
    """)
    success = cur.rowcount > 0
    conn.commit()

    cur.execute(f"""
        UPDATE {SCHEMA}.public_blog_categories c
        SET posts_count = (SELECT COUNT(*) FROM {SCHEMA}.public_blog_posts p
                           WHERE p.category_id = c.id AND p.status='published')
    """)
    conn.commit()
    cur.close()
    conn.close()
    return admin_response({'ok': success, 'id': pid_int, 'status': new_status})


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Публичный API SEO-блога «Наша Семья» — лента, посты, категории, теги, sitemap.
    Admin endpoints требуют заголовок X-Admin-Token.
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', 'list')
    headers = event.get('headers', {}) or {}
    source_ip = (event.get('requestContext', {}).get('identity', {}) or {}).get('sourceIp', '')

    try:
        if action == 'list':
            return list_posts(params)
        if action == 'post':
            return get_post(params, headers, source_ip)
        if action == 'categories':
            return list_categories()
        if action == 'tags':
            return list_tags(params)
        if action == 'feed':
            return feed(params)
        if action == 'sitemap':
            return sitemap_data()

        if action.startswith('admin-'):
            if not check_admin(event):
                return admin_response({'error': 'unauthorized'}, 401)

            if action == 'admin-list':
                return admin_list(params)
            if action == 'admin-stats':
                return admin_stats()
            if action == 'admin-post':
                return admin_get_post(params)

            if method != 'POST':
                return admin_response({'error': 'method not allowed'}, 405)

            body = json.loads(event.get('body', '{}'))
            if action == 'admin-update':
                return admin_update(body)
            if action == 'admin-toggle-status':
                return admin_toggle_status(body)

            return admin_response({'error': 'unknown admin action'}, 400)

        return respond({'error': 'unknown action'}, 400)
    except Exception as e:
        print(f"[ERROR] blog-api: {e}")
        return respond({'error': str(e)}, 500)