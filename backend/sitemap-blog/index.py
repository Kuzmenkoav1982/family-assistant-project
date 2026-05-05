"""
Sitemap для блога — динамически отдаёт XML со всеми постами и категориями.
Возвращает application/xml. Используется в sitemap-index как часть карты сайта.
"""

import os
from typing import Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
SITE = 'https://nasha-semiya.ru'


def db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def fmt_date(value) -> str:
    if not value:
        return datetime.now().strftime('%Y-%m-%d')
    if isinstance(value, datetime):
        return value.strftime('%Y-%m-%d')
    return str(value)[:10]


def build_url(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return (
        '  <url>\n'
        f'    <loc>{loc}</loc>\n'
        f'    <lastmod>{lastmod}</lastmod>\n'
        f'    <changefreq>{changefreq}</changefreq>\n'
        f'    <priority>{priority}</priority>\n'
        '  </url>'
    )


def generate_sitemap() -> str:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT slug, updated_at, published_at
        FROM {SCHEMA}.public_blog_posts
        WHERE status = 'published'
        ORDER BY published_at DESC
    """)
    posts = cur.fetchall()

    cur.execute(f"""
        SELECT c.slug, COALESCE(MAX(p.updated_at), NOW()) AS lastmod
        FROM {SCHEMA}.public_blog_categories c
        LEFT JOIN {SCHEMA}.public_blog_posts p
            ON p.category_id = c.id AND p.status = 'published'
        GROUP BY c.id, c.slug, c.sort_order
        ORDER BY c.sort_order
    """)
    cats = cur.fetchall()

    cur.execute(f"""
        SELECT t.slug, COALESCE(MAX(p.updated_at), NOW()) AS lastmod, COUNT(p.id) AS posts_count
        FROM {SCHEMA}.public_blog_tags t
        JOIN {SCHEMA}.public_blog_post_tags pt ON pt.tag_id = t.id
        JOIN {SCHEMA}.public_blog_posts p ON p.id = pt.post_id AND p.status = 'published'
        GROUP BY t.id, t.slug
        HAVING COUNT(p.id) > 0
    """)
    tags = cur.fetchall()

    cur.close()
    conn.close()

    today = datetime.now().strftime('%Y-%m-%d')
    urls: List[str] = []

    urls.append(build_url(f'{SITE}/blog', today, 'daily', '0.9'))

    for cat in cats:
        urls.append(build_url(
            f'{SITE}/blog/category/{cat["slug"]}',
            fmt_date(cat['lastmod']),
            'weekly',
            '0.8',
        ))

    for tag in tags:
        urls.append(build_url(
            f'{SITE}/blog/tag/{tag["slug"]}',
            fmt_date(tag['lastmod']),
            'weekly',
            '0.6',
        ))

    for p in posts:
        urls.append(build_url(
            f'{SITE}/blog/{p["slug"]}',
            fmt_date(p['updated_at'] or p['published_at']),
            'monthly',
            '0.7',
        ))

    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + '\n'.join(urls)
        + '\n</urlset>'
    )
    return body


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Динамический sitemap-blog.xml — все посты, категории и теги блога."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    try:
        xml = generate_sitemap()
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/xml; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300',
            },
            'body': xml,
            'isBase64Encoded': False,
        }
    except Exception as e:
        print(f"[ERROR] sitemap-blog: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            },
            'body': f'Error: {e}',
            'isBase64Encoded': False,
        }
