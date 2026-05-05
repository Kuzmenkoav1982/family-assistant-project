"""
Pre-render для блога — отдаёт SEO-готовый HTML страниц для краулеров.
GET /?slug=post-slug — HTML страницы поста
GET /?type=list — HTML ленты блога
GET /?type=category&slug=psychology — HTML категории

Используется на стороне CDN/прокси: при User-Agent с ботом — отдаём этот HTML,
для обычных пользователей — обычный SPA.
"""

import os
import html as html_lib
from typing import Dict, Any, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
SITE = 'https://nasha-semiya.ru'
LOGO = 'https://cdn.poehali.dev/files/Логотип Наша Семья.JPG'


def db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def esc(s: Optional[str]) -> str:
    if s is None:
        return ''
    return html_lib.escape(str(s), quote=True)


def fmt_iso(value) -> str:
    if not value:
        return ''
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def md_to_html_basic(text: str) -> str:
    """Простая Markdown -> HTML конвертация для основных элементов."""
    if not text:
        return ''
    lines = text.split('\n')
    out: List[str] = []
    in_list = False
    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            if in_list:
                out.append('</ul>')
                in_list = False
            out.append('')
            continue
        if line.startswith('**') and line.endswith(':**'):
            if in_list:
                out.append('</ul>')
                in_list = False
            inner = line.strip('*').rstrip(':')
            out.append(f'<h3>{esc(inner)}</h3>')
            continue
        if line.startswith('- '):
            if not in_list:
                out.append('<ul>')
                in_list = True
            item = line[2:].strip()
            item = process_inline(item)
            out.append(f'<li>{item}</li>')
            continue
        if in_list:
            out.append('</ul>')
            in_list = False
        out.append(f'<p>{process_inline(line)}</p>')
    if in_list:
        out.append('</ul>')
    return '\n'.join(out)


def process_inline(text: str) -> str:
    text = esc(text)
    while '**' in text:
        idx1 = text.find('**')
        idx2 = text.find('**', idx1 + 2)
        if idx2 == -1:
            break
        text = text[:idx1] + '<strong>' + text[idx1 + 2:idx2] + '</strong>' + text[idx2 + 2:]
    while '*' in text:
        idx1 = text.find('*')
        idx2 = text.find('*', idx1 + 1)
        if idx2 == -1:
            break
        text = text[:idx1] + '<em>' + text[idx1 + 1:idx2] + '</em>' + text[idx2 + 1:]
    return text


def render_post_html(post: Dict, related: List[Dict], tags: List[Dict]) -> str:
    title = esc(post['seo_title'] or post['title'])
    description = esc(post['seo_description'] or post['excerpt'] or '')
    keywords = esc(post['seo_keywords'] or '')
    canonical = f"{SITE}/blog/{post['slug']}"
    og_image = post['cover_image_url'] or LOGO
    cat_name = esc(post.get('category_name') or '')
    cat_slug = post.get('category_slug') or ''
    published = fmt_iso(post['published_at'])
    updated = fmt_iso(post['updated_at'])

    schema_article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post['title'],
        'description': post['seo_description'] or post['excerpt'],
        'image': [post['cover_image_url']] if post['cover_image_url'] else None,
        'datePublished': published,
        'dateModified': updated,
        'author': {'@type': 'Organization', 'name': post['author_name'], 'url': SITE},
        'publisher': {
            '@type': 'Organization',
            'name': 'Наша Семья',
            'url': SITE,
            'logo': {'@type': 'ImageObject', 'url': LOGO},
        },
        'mainEntityOfPage': {'@type': 'WebPage', '@id': canonical},
        'inLanguage': 'ru',
        'articleSection': post.get('category_name'),
        'keywords': ', '.join([t['name'] for t in tags]) if tags else None,
    }
    import json as _json
    schema_json = _json.dumps(schema_article, ensure_ascii=False, default=str)

    breadcrumb_items = [
        {'@type': 'ListItem', 'position': 1, 'name': 'Главная', 'item': f'{SITE}/'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Блог', 'item': f'{SITE}/blog'},
    ]
    if cat_slug:
        breadcrumb_items.append({
            '@type': 'ListItem', 'position': 3,
            'name': post.get('category_name'),
            'item': f'{SITE}/blog/category/{cat_slug}',
        })
    breadcrumb_items.append({
        '@type': 'ListItem',
        'position': len(breadcrumb_items) + 1,
        'name': post['title'],
        'item': canonical,
    })
    breadcrumb_json = _json.dumps({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumb_items,
    }, ensure_ascii=False)

    content_html = md_to_html_basic(post['content'])

    related_html = ''
    if related:
        items = []
        for r in related:
            items.append(
                f'<li><a href="{SITE}/blog/{esc(r["slug"])}">{esc(r["title"])}</a></li>'
            )
        related_html = (
            '<section><h2>Похожие материалы</h2><ul>'
            + ''.join(items) + '</ul></section>'
        )

    tags_html = ''
    if tags:
        items = [f'<a href="{SITE}/blog/tag/{esc(t["slug"])}">#{esc(t["name"])}</a>' for t in tags]
        tags_html = '<p><strong>Темы:</strong> ' + ' '.join(items) + '</p>'

    breadcrumb_html = (
        f'<nav><a href="{SITE}/">Главная</a> &raquo; '
        f'<a href="{SITE}/blog">Блог</a>'
    )
    if cat_slug:
        breadcrumb_html += (
            f' &raquo; <a href="{SITE}/blog/category/{esc(cat_slug)}">{cat_name}</a>'
        )
    breadcrumb_html += f' &raquo; {esc(post["title"])}</nav>'

    cover_html = ''
    if post.get('cover_image_url'):
        cover_html = f'<img src="{esc(post["cover_image_url"])}" alt="{esc(post["title"])}" />'

    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content="{description}" />
<meta name="keywords" content="{keywords}" />
<link rel="canonical" href="{canonical}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Наша Семья" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:image" content="{esc(og_image)}" />
<meta property="og:locale" content="ru_RU" />
<meta property="article:published_time" content="{esc(published)}" />
<meta property="article:modified_time" content="{esc(updated)}" />
<meta property="article:section" content="{cat_name}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{esc(og_image)}" />
<script type="application/ld+json">{schema_json}</script>
<script type="application/ld+json">{breadcrumb_json}</script>
</head>
<body>
{breadcrumb_html}
<article>
<header>
<h1>{esc(post['title'])}</h1>
<p><em>{esc(post['excerpt'] or '')}</em></p>
<p><time datetime="{esc(published)}">{esc(published[:10])}</time> · {esc(post['author_name'])} · {int(post['reading_time_min'] or 3)} мин</p>
{cover_html}
</header>
{content_html}
{tags_html}
</article>
{related_html}
<footer>
<p><a href="{SITE}/register">Создать Семейный ID бесплатно</a> · <a href="https://max.ru/id231805288780_biz">Канал в МАХ</a></p>
<p><a href="{SITE}/blog">Все материалы блога</a></p>
</footer>
</body>
</html>'''


def render_list_html(posts: List[Dict], category: Optional[Dict] = None) -> str:
    if category:
        title_text = f"{category['name']} — Блог Наша Семья"
        h1 = f"{category.get('emoji', '')} {category['name']}"
        canonical = f"{SITE}/blog/category/{category['slug']}"
        description = category.get('description') or 'Материалы блога Наша Семья'
    else:
        title_text = 'Блог о семье — Наша Семья'
        h1 = 'Блог Наша Семья'
        canonical = f'{SITE}/blog'
        description = 'Экспертный блог о семейной жизни: психология, дети, отношения, здоровье, финансы.'

    items_html = []
    for p in posts:
        item_url = f"{SITE}/blog/{esc(p['slug'])}"
        items_html.append(
            f'<article>'
            f'<h2><a href="{item_url}">{esc(p["title"])}</a></h2>'
            f'<p>{esc(p.get("excerpt") or "")}</p>'
            f'<p><small>{esc(str(p["published_at"])[:10])} · {int(p["reading_time_min"] or 3)} мин</small></p>'
            f'</article>'
        )

    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{esc(title_text)}</title>
<meta name="description" content="{esc(description)}" />
<link rel="canonical" href="{canonical}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Наша Семья" />
<meta property="og:title" content="{esc(title_text)}" />
<meta property="og:description" content="{esc(description)}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:image" content="{LOGO}" />
<meta property="og:locale" content="ru_RU" />
</head>
<body>
<nav><a href="{SITE}/">Главная</a> &raquo; <a href="{SITE}/blog">Блог</a></nav>
<h1>{esc(h1)}</h1>
<p>{esc(description)}</p>
{''.join(items_html)}
<footer>
<p><a href="{SITE}/register">Создать Семейный ID бесплатно</a></p>
</footer>
</body>
</html>'''


def get_post(slug: str) -> Optional[Dict]:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    safe = slug.replace("'", "''")
    cur.execute(f"""
        SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.emoji AS category_emoji
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.slug = '{safe}' AND p.status = 'published' LIMIT 1
    """)
    post = cur.fetchone()
    if not post:
        cur.close()
        conn.close()
        return None
    post = dict(post)

    cur.execute(f"""
        SELECT t.slug, t.name FROM {SCHEMA}.public_blog_post_tags pt
        JOIN {SCHEMA}.public_blog_tags t ON t.id = pt.tag_id
        WHERE pt.post_id = {post['id']}
    """)
    post['_tags'] = [dict(r) for r in cur.fetchall()]

    related = []
    if post.get('category_id'):
        cur.execute(f"""
            SELECT slug, title, excerpt, reading_time_min, published_at
            FROM {SCHEMA}.public_blog_posts
            WHERE status = 'published' AND id <> {post['id']}
              AND category_id = {int(post['category_id'])}
            ORDER BY published_at DESC LIMIT 4
        """)
        related = [dict(r) for r in cur.fetchall()]
    post['_related'] = related

    cur.close()
    conn.close()
    return post


def get_list(category_slug: Optional[str] = None) -> Dict:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    where = ["p.status = 'published'"]
    cat_info = None
    if category_slug:
        safe = category_slug.replace("'", "''")
        cur.execute(f"""
            SELECT id, slug, name, emoji, description
            FROM {SCHEMA}.public_blog_categories WHERE slug = '{safe}' LIMIT 1
        """)
        cat_info = cur.fetchone()
        if cat_info:
            cat_info = dict(cat_info)
            where.append(f"p.category_id = {cat_info['id']}")

    cur.execute(f"""
        SELECT slug, title, excerpt, reading_time_min, published_at
        FROM {SCHEMA}.public_blog_posts p
        WHERE {' AND '.join(where)}
        ORDER BY p.published_at DESC LIMIT 50
    """)
    posts = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return {'posts': posts, 'category': cat_info}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Pre-render для краулеров — отдаёт SEO-готовый HTML страниц блога."""
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
    page_type = params.get('type', '')
    slug = params.get('slug', '')

    headers = {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=600',
        'X-Robots-Tag': 'index, follow',
    }

    try:
        if page_type == 'list' or (not page_type and not slug):
            data = get_list()
            html = render_list_html(data['posts'])
            return {'statusCode': 200, 'headers': headers, 'body': html, 'isBase64Encoded': False}

        if page_type == 'category' and slug:
            data = get_list(slug)
            if not data['category']:
                return {'statusCode': 404, 'headers': headers, 'body': '<h1>404</h1>', 'isBase64Encoded': False}
            html = render_list_html(data['posts'], data['category'])
            return {'statusCode': 200, 'headers': headers, 'body': html, 'isBase64Encoded': False}

        if slug:
            post = get_post(slug)
            if not post:
                return {'statusCode': 404, 'headers': headers, 'body': '<h1>404</h1>', 'isBase64Encoded': False}
            html = render_post_html(post, post.get('_related', []), post.get('_tags', []))
            return {'statusCode': 200, 'headers': headers, 'body': html, 'isBase64Encoded': False}

        return {'statusCode': 400, 'headers': headers, 'body': '<h1>400 Bad Request</h1>', 'isBase64Encoded': False}
    except Exception as e:
        print(f"[ERROR] blog-prerender: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
            'body': f'Error: {e}',
            'isBase64Encoded': False,
        }
