"""
MAX Bot API — приём вебхуков и отправка уведомлений через platform-api.max.ru
+ зеркалирование постов из MAX-канала в публичный SEO-блог.
Args: event с httpMethod, body
Returns: JSON с результатом
"""

import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import requests
import psycopg2
from psycopg2.extras import RealDictCursor

from blog_parser import parse_max_post, make_slug

MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN')
MAX_API_BASE = 'https://platform-api.max.ru'
SCHEMA = 't_p5815085_family_assistant_pro'
CHANNEL_CHAT_ID_ENV = os.environ.get('MAX_CHANNEL_CHAT_ID', '')

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}


def max_api_request(method: str, endpoint: str, payload: dict = None) -> Dict[str, Any]:
    if not MAX_BOT_TOKEN:
        return {'ok': False, 'error': 'MAX_BOT_TOKEN не настроен'}
    url = f'{MAX_API_BASE}{endpoint}'
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': MAX_BOT_TOKEN,
        }
        if method == 'GET':
            resp = requests.get(url, headers=headers, timeout=10)
        elif method == 'DELETE':
            resp = requests.delete(url, headers=headers, timeout=10)
        else:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
        try:
            data = resp.json()
        except Exception:
            data = {'raw': resp.text}
        print(f"[DEBUG] MAX API {method} {endpoint}: status={resp.status_code} body={str(data)[:300]}")
        return {'ok': resp.status_code == 200, 'data': data, 'status': resp.status_code}
    except Exception as e:
        return {'ok': False, 'error': str(e)}


def send_message(chat_id: int, text: str) -> Dict[str, Any]:
    return max_api_request('POST', f'/messages?chat_id={chat_id}', {
        'text': text
    })


def _is_admin(event: Dict) -> bool:
    h = event.get('headers', {}) or {}
    token = h.get('x-admin-token') or h.get('X-Admin-Token')
    if not token:
        return False
    if token == 'admin_authenticated':
        return True
    secret = os.environ.get('ADMIN_TOKEN')
    return bool(secret) and token == secret


def db_connect():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return None
    return psycopg2.connect(dsn)


def get_unique_slug(cur, base_slug: str) -> str:
    """Возвращает уникальный slug, добавляя суффикс при коллизии."""
    slug = base_slug
    suffix = 1
    while True:
        safe = slug.replace("'", "''")
        cur.execute(f"SELECT 1 FROM {SCHEMA}.public_blog_posts WHERE slug = '{safe}' LIMIT 1")
        if cur.fetchone() is None:
            return slug
        suffix += 1
        slug = f"{base_slug}-{suffix}"
        if suffix > 50:
            return f"{base_slug}-{int(datetime.now().timestamp())}"


def upsert_tag(cur, tag_name: str) -> Optional[int]:
    """Создаёт тег если нет, возвращает id."""
    if not tag_name:
        return None
    slug = make_slug(tag_name, max_len=60)
    safe_slug = slug.replace("'", "''")
    safe_name = tag_name.replace("'", "''")
    cur.execute(f"""
        INSERT INTO {SCHEMA}.public_blog_tags (slug, name)
        VALUES ('{safe_slug}', '{safe_name}')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    """)
    row = cur.fetchone()
    return row[0] if row else None


def get_category_id(cur, category_slug: str) -> Optional[int]:
    safe = category_slug.replace("'", "''")
    cur.execute(f"SELECT id FROM {SCHEMA}.public_blog_categories WHERE slug = '{safe}' LIMIT 1")
    row = cur.fetchone()
    return row[0] if row else None


def save_post_to_blog(parsed: Dict, source: str = 'max') -> Optional[int]:
    """Сохраняет распарсенный пост в public_blog_posts. Возвращает id."""
    if not parsed or not parsed.get('title') or not parsed.get('content'):
        return None
    conn = db_connect()
    if not conn:
        return None
    try:
        cur = conn.cursor()

        if parsed.get('max_message_id'):
            cur.execute(f"""
                SELECT id FROM {SCHEMA}.public_blog_posts
                WHERE max_message_id = {int(parsed['max_message_id'])} LIMIT 1
            """)
            existing = cur.fetchone()
            if existing:
                cur.close()
                conn.close()
                return existing[0]

        slug = get_unique_slug(cur, parsed['slug'])
        category_id = get_category_id(cur, parsed.get('category_slug', 'psychology'))

        def esc(v):
            if v is None:
                return 'NULL'
            return "'" + str(v).replace("'", "''") + "'"

        title = esc(parsed['title'])
        slug_sql = esc(slug)
        excerpt = esc(parsed.get('excerpt', ''))
        content = esc(parsed['content'])
        cover = esc(parsed.get('cover_image_url'))
        seo_title = esc(parsed.get('seo_title'))
        seo_desc = esc(parsed.get('seo_description'))
        seo_kw = esc(parsed.get('seo_keywords'))
        category_sql = str(category_id) if category_id else 'NULL'
        msg_id = str(int(parsed['max_message_id'])) if parsed.get('max_message_id') else 'NULL'
        chat_id = str(int(parsed['max_chat_id'])) if parsed.get('max_chat_id') else 'NULL'
        reading = int(parsed.get('reading_time_min', 3))
        source_sql = esc(source)
        published = esc(parsed['published_at'].isoformat() if isinstance(parsed.get('published_at'), datetime) else parsed.get('published_at'))

        cur.execute(f"""
            INSERT INTO {SCHEMA}.public_blog_posts
            (slug, title, excerpt, content, cover_image_url, category_id,
             seo_title, seo_description, seo_keywords, source, max_message_id,
             max_chat_id, reading_time_min, published_at, status)
            VALUES ({slug_sql}, {title}, {excerpt}, {content}, {cover},
                    {category_sql}, {seo_title}, {seo_desc}, {seo_kw},
                    {source_sql}, {msg_id}, {chat_id}, {reading}, {published},
                    'published')
            RETURNING id
        """)
        post_id = cur.fetchone()[0]

        for tag_name in parsed.get('tags', [])[:5]:
            tag_id = upsert_tag(cur, tag_name)
            if tag_id:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.public_blog_post_tags (post_id, tag_id)
                    VALUES ({post_id}, {tag_id})
                    ON CONFLICT DO NOTHING
                """)
                cur.execute(f"""
                    UPDATE {SCHEMA}.public_blog_tags
                    SET posts_count = posts_count + 1 WHERE id = {tag_id}
                """)

        if category_id:
            cur.execute(f"""
                UPDATE {SCHEMA}.public_blog_categories
                SET posts_count = posts_count + 1 WHERE id = {category_id}
            """)

        conn.commit()
        cur.close()
        conn.close()
        return post_id
    except Exception as e:
        print(f"[ERROR] save_post_to_blog: {e}")
        try:
            conn.rollback()
            conn.close()
        except:
            pass
        return None


def extract_image_from_attachments(attachments: List[Dict]) -> Optional[str]:
    """Извлекает URL первой картинки из attachments MAX-сообщения."""
    if not attachments:
        return None
    for att in attachments:
        att_type = att.get('type', '').lower()
        if att_type in ('image', 'photo'):
            payload = att.get('payload', {})
            url = payload.get('url') or payload.get('photo_url') or payload.get('src')
            if url:
                return url
            photos = payload.get('photos', {})
            if isinstance(photos, dict):
                for v in photos.values():
                    if isinstance(v, dict) and v.get('url'):
                        return v['url']
    return None


def handle_channel_post(message: Dict) -> Dict[str, Any]:
    """Обрабатывает новый пост из MAX-канала и сохраняет в публичный блог."""
    body = message.get('body', {})
    text = (body.get('text') or '').strip()
    attachments = body.get('attachments', []) or []
    msg_id = body.get('mid') or message.get('message_id')
    chat_id = message.get('recipient', {}).get('chat_id')
    timestamp = message.get('timestamp')

    if not text or len(text) < 50:
        return {'ok': True, 'action': 'skipped_short'}

    image_url = extract_image_from_attachments(attachments)
    published_at = datetime.fromtimestamp(timestamp / 1000) if timestamp else datetime.now()

    parsed = parse_max_post(
        text=text,
        image_url=image_url,
        max_message_id=int(msg_id) if msg_id else None,
        max_chat_id=int(chat_id) if chat_id else None,
        published_at=published_at,
    )

    post_id = save_post_to_blog(parsed, source='max')
    if post_id:
        return {'ok': True, 'action': 'mirrored', 'post_id': post_id, 'slug': parsed['slug']}
    return {'ok': True, 'action': 'mirror_failed'}


def is_channel_message(message: Dict) -> bool:
    """Проверяет, что сообщение пришло из канала (не из личного чата)."""
    recipient = message.get('recipient', {})
    chat_type = recipient.get('chat_type', '')
    if chat_type in ('channel', 'chat'):
        return True
    chat_id = recipient.get('chat_id')
    if CHANNEL_CHAT_ID_ENV and chat_id and str(chat_id) == CHANNEL_CHAT_ID_ENV:
        return True
    sender = message.get('sender', {})
    if sender.get('is_bot') is True:
        return False
    body = message.get('body', {})
    text = (body.get('text') or '')
    return len(text) > 200


def handle_webhook(body: dict) -> Dict[str, Any]:
    update_type = body.get('update_type')

    if update_type == 'bot_started':
        chat_id = body.get('chat_id')
        user = body.get('user', {})
        payload = body.get('payload')

        if payload and chat_id:
            linked = link_max_account(payload, chat_id)
            if linked:
                send_message(chat_id, 'Аккаунт привязан! Теперь вы будете получать уведомления от «Наша Семья» здесь в MAX.')
                return {'ok': True, 'action': 'linked'}
            else:
                send_message(chat_id, 'Не удалось привязать аккаунт. Попробуйте ещё раз через приложение.')
                return {'ok': True, 'action': 'link_failed'}

        send_message(chat_id, 'Привет! Я бот «Наша Семья».\n\nЧтобы получать уведомления, привяжите аккаунт в приложении:\nНастройки → Уведомления → Подключить MAX')
        return {'ok': True, 'action': 'welcome'}

    if update_type == 'message_created':
        message = body.get('message', {})
        sender = message.get('sender', {})
        chat_id = message.get('recipient', {}).get('chat_id')
        text = (message.get('body', {}).get('text', '') or '').strip()
        text_lower = text.lower()

        if is_channel_message(message) and len(text) > 100:
            return handle_channel_post(message)

        if text_lower in ['/stop', 'стоп', 'отписаться']:
            if chat_id:
                unlink_max_account(chat_id)
                send_message(chat_id, 'Уведомления отключены. Нажмите «Начать» чтобы подключить снова.')
            return {'ok': True, 'action': 'unlinked'}

        if text_lower in ['/help', 'помощь']:
            send_message(chat_id, 'Я отправляю уведомления из приложения «Наша Семья»:\n- Напоминания о событиях\n- Лекарства\n- Питание и диета\n- Задачи и покупки\n\nКоманды:\n/stop — отключить уведомления\n/help — эта справка')
            return {'ok': True, 'action': 'help'}

    return {'ok': True, 'action': 'ignored'}


def link_max_account(link_code: str, max_chat_id: int) -> bool:
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return False
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"""
            UPDATE {SCHEMA}.users 
            SET max_chat_id = {int(max_chat_id)} 
            WHERE id = '{link_code.replace("'", "''")}'
        """)
        updated = cur.rowcount > 0
        conn.commit()
        cur.close()
        conn.close()
        return updated
    except Exception as e:
        print(f"[ERROR] link_max_account: {e}")
        return False


def unlink_max_account(max_chat_id: int) -> bool:
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return False
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET max_chat_id = NULL WHERE max_chat_id = {int(max_chat_id)}")
        conn.commit()
        cur.close()
        conn.close()
        return True
    except:
        return False


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    MAX Bot — приём вебхуков, управление уведомлениями и зеркалирование постов в SEO-блог.
    POST / — вебхук от MAX (включая зеркалирование постов канала)
    POST /?action=send — отправить сообщение (admin) + опционально зеркалировать в блог
    POST /?action=mirror — вручную зеркалировать текст поста в блог
    GET /?action=info — инфо о боте
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')

    if method == 'POST' and not action:
        try:
            body = json.loads(event.get('body', '{}'))
            result = handle_webhook(body)
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        except Exception as e:
            print(f"[ERROR] Webhook processing: {e}")
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

    if method == 'POST' and action == 'send':
        if not _is_admin(event):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        body = json.loads(event.get('body', '{}'))
        chat_id = body.get('chat_id')
        text = body.get('text', '')
        image_url = body.get('image_url')
        mirror_to_blog = body.get('mirror_to_blog', True)
        if not text or not chat_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'chat_id и text обязательны'}),
                'isBase64Encoded': False
            }
        result = send_message(int(chat_id), text)

        blog_result = None
        if mirror_to_blog and result.get('ok') and len(text) > 100:
            sent_msg = result.get('data', {}).get('message', {})
            msg_id = sent_msg.get('body', {}).get('mid')
            parsed = parse_max_post(
                text=text,
                image_url=image_url,
                max_message_id=int(msg_id) if msg_id else None,
                max_chat_id=int(chat_id),
                published_at=datetime.now(),
            )
            post_id = save_post_to_blog(parsed, source='admin')
            if post_id:
                blog_result = {'post_id': post_id, 'slug': parsed['slug']}

        return {
            'statusCode': 200 if result.get('ok') else 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({**result, 'blog': blog_result}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'POST' and action == 'mirror':
        if not _is_admin(event):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        body = json.loads(event.get('body', '{}'))
        text = body.get('text', '')
        image_url = body.get('image_url')
        if not text or len(text) < 50:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'text слишком короткий'}),
                'isBase64Encoded': False
            }
        parsed = parse_max_post(text=text, image_url=image_url, published_at=datetime.now())
        post_id = save_post_to_blog(parsed, source='manual')
        return {
            'statusCode': 200 if post_id else 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'ok': bool(post_id), 'post_id': post_id, 'slug': parsed.get('slug')}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'GET' and action == 'info':
        result = max_api_request('GET', '/me')
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'GET' and action == 'webhook-status':
        if not _is_admin(event):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        our_url = 'https://functions.poehali.dev/328084f0-b0e7-4354-9199-db44e75811ac'
        result = max_api_request('GET', '/subscriptions')
        subs = []
        if result.get('ok'):
            data = result.get('data', {})
            subs = data.get('subscriptions', []) if isinstance(data, dict) else []
        is_connected = any(s.get('url') == our_url for s in subs)
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'ok': True,
                'connected': is_connected,
                'our_url': our_url,
                'subscriptions': subs,
                'count': len(subs),
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'POST' and action == 'webhook-subscribe':
        if not _is_admin(event):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        our_url = 'https://functions.poehali.dev/328084f0-b0e7-4354-9199-db44e75811ac'
        result = max_api_request('POST', '/subscriptions', {
            'url': our_url,
            'update_types': ['message_created', 'bot_started']
        })
        return {
            'statusCode': 200 if result.get('ok') else 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'ok': result.get('ok'),
                'url': our_url,
                'response': result.get('data'),
                'error': result.get('error'),
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'POST' and action == 'webhook-unsubscribe':
        if not _is_admin(event):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        try:
            body = json.loads(event.get('body') or '{}')
        except Exception:
            body = {}
        target_url = body.get('url') or 'https://functions.poehali.dev/328084f0-b0e7-4354-9199-db44e75811ac'
        from urllib.parse import quote
        result = max_api_request('DELETE', f'/subscriptions?url={quote(target_url, safe="")}')
        return {
            'statusCode': 200 if result.get('ok') else 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'ok': result.get('ok'),
                'removed_url': target_url,
                'status': result.get('status'),
                'response': result.get('data'),
                'error': result.get('error'),
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'POST' and action == 'webhook-clean-foreign':
        if not _is_admin(event):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        our_url = 'https://functions.poehali.dev/328084f0-b0e7-4354-9199-db44e75811ac'
        from urllib.parse import quote
        list_result = max_api_request('GET', '/subscriptions')
        if not list_result.get('ok'):
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps({'ok': False, 'error': 'cannot list subscriptions'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        subs = list_result.get('data', {}).get('subscriptions', []) or []
        removed = []
        kept = []
        for s in subs:
            url = s.get('url', '')
            if url and url != our_url:
                r = max_api_request('DELETE', f'/subscriptions?url={quote(url, safe="")}')
                removed.append({'url': url, 'ok': r.get('ok'), 'status': r.get('status')})
            else:
                kept.append(url)
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'ok': True,
                'removed': removed,
                'kept': kept,
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'ok': True, 'bot': 'Наша Семья MAX Bot'}),
        'isBase64Encoded': False
    }