"""
Sitemap — динамически отдаёт XML.
?type=blog — все посты, категории, теги блога
?type=full (или без параметра) — общий sitemap: главная + лендинги + ссылка на блог
Возвращает application/xml.
"""

import os
from typing import Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
SITE = 'https://nasha-semiya.ru'

PUBLIC_PAGES = [
    ('/', 'daily', '1.0'),
    ('/welcome', 'weekly', '0.9'),
    ('/pricing', 'weekly', '0.9'),
    ('/what-is-family', 'monthly', '0.8'),
    ('/family-hub', 'weekly', '0.8'),
    ('/health-hub', 'weekly', '0.8'),
    ('/finance-hub', 'weekly', '0.8'),
    ('/leisure-hub', 'weekly', '0.8'),
    ('/education-hub', 'weekly', '0.8'),
    ('/blog', 'daily', '0.9'),
    ('/about', 'monthly', '0.6'),
    ('/contacts', 'monthly', '0.6'),
    ('/privacy', 'yearly', '0.3'),
    ('/terms', 'yearly', '0.3'),
]


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


def generate_full_sitemap() -> str:
    """Общий sitemap — главная, лендинги, посты блога одним списком."""
    today = datetime.now().strftime('%Y-%m-%d')
    urls: List[str] = []

    for path, freq, prio in PUBLIC_PAGES:
        urls.append(build_url(f'{SITE}{path}', today, freq, prio))

    try:
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
        cur.close()
        conn.close()

        for cat in cats:
            urls.append(build_url(
                f'{SITE}/blog/category/{cat["slug"]}',
                fmt_date(cat['lastmod']),
                'weekly',
                '0.8',
            ))

        for p in posts:
            urls.append(build_url(
                f'{SITE}/blog/{p["slug"]}',
                fmt_date(p['updated_at'] or p['published_at']),
                'monthly',
                '0.7',
            ))
    except Exception as e:
        print(f"[WARN] full sitemap blog part failed: {e}")

    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + '\n'.join(urls)
        + '\n</urlset>'
    )
    return body


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Динамический sitemap. ?type=blog — карта блога, иначе — общий sitemap всего сайта."""
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

    params = event.get('queryStringParameters', {}) or {}
    sitemap_type = params.get('type', 'blog')

    try:
        if sitemap_type == 'full':
            xml = generate_full_sitemap()
        else:
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
        print(f"[ERROR] sitemap: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            },
            'body': f'Error: {e}',
            'isBase64Encoded': False,
        }