"""
Генератор обложек для блога через YandexART.
POST /?action=generate — сгенерировать обложку для одного поста по id
POST /?action=generate-all — сгенерировать обложки для всех постов без cover_image_url

Требует X-Admin-Token. Сохраняет картинки в S3, обновляет cover_image_url у поста.
"""

import json
import os
import time
import base64
from typing import Dict, Any, Optional, List
import boto3
import requests
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
ADMIN_TOKEN_DEFAULT = 'admin_authenticated'

YANDEX_API_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync'
YANDEX_OPERATION_URL = 'https://llm.api.cloud.yandex.net/operations/'

CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
}


def respond(data: Any, status: int = 200) -> Dict:
    return {
        'statusCode': status,
        'headers': CORS,
        'body': json.dumps(data, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def check_admin(event: Dict) -> bool:
    h = event.get('headers', {}) or {}
    token = h.get('x-admin-token') or h.get('X-Admin-Token')
    if not token:
        return False
    if token == ADMIN_TOKEN_DEFAULT:
        return True
    secret = os.environ.get('ADMIN_TOKEN')
    return bool(secret) and token == secret


def db_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


CATEGORY_STYLES = {
    'psychology': 'мягкий тёплый акварельный стиль, нежные пастельные тона, фиолетовый и сиреневый',
    'children': 'детская книжная иллюстрация, акварель, светлые радостные тона, голубой и жёлтый',
    'relationships': 'романтическая акварельная иллюстрация, розовые и пастельные тона',
    'health': 'свежая природная иллюстрация, акварель, зелёные оттенки, ягоды и фрукты',
    'finance': 'современная минималистичная иллюстрация, золотые и янтарные оттенки',
    'leisure': 'тёплая семейная сцена, акварель, яркие закатные тона',
    'education': 'книжная иллюстрация, синие и фиолетовые тона, мягкий свет',
    'safety': 'спокойная защитная иллюстрация, тёплый оранжевый свет',
}


def build_prompt(title: str, category_slug: Optional[str]) -> str:
    style = CATEGORY_STYLES.get(category_slug or '', 'мягкая акварельная иллюстрация в тёплых семейных тонах')
    return (
        f"Иллюстрация к статье: «{title}». "
        f"{style}. Семейная атмосфера, без текста и надписей, без людей крупным планом. "
        f"Композиция как обложка для блога. Высокое качество, профессиональная иллюстрация."
    )


def call_yandex_art(prompt: str) -> Optional[bytes]:
    """Запускает YandexART, дожидается результата (макс ~60 сек)."""
    api_key = os.environ.get('YANDEX_ART_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    if not api_key or not folder_id:
        print('[ERROR] YandexART keys not configured')
        return None

    headers = {
        'Authorization': f'Api-Key {api_key}',
        'Content-Type': 'application/json',
        'x-folder-id': folder_id,
    }
    payload = {
        'modelUri': f'art://{folder_id}/yandex-art/latest',
        'generationOptions': {
            'mimeType': 'image/jpeg',
            'aspectRatio': {'widthRatio': '16', 'heightRatio': '9'},
        },
        'messages': [{'weight': '1', 'text': prompt[:500]}],
    }
    try:
        resp = requests.post(YANDEX_API_URL, headers=headers, json=payload, timeout=15)
        if resp.status_code != 200:
            print(f'[ERROR] YandexART start: {resp.status_code} {resp.text[:200]}')
            return None
        op_id = resp.json().get('id')
        if not op_id:
            return None

        for attempt in range(20):
            time.sleep(3)
            poll = requests.get(f'{YANDEX_OPERATION_URL}{op_id}', headers=headers, timeout=10)
            if poll.status_code != 200:
                continue
            data = poll.json()
            if data.get('done'):
                resp_data = data.get('response', {})
                image_b64 = resp_data.get('image')
                if image_b64:
                    return base64.b64decode(image_b64)
                return None
        print('[WARN] YandexART timeout')
        return None
    except Exception as e:
        print(f'[ERROR] YandexART: {e}')
        return None


def upload_to_s3(image_bytes: bytes, post_id: int) -> Optional[str]:
    try:
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        key = f'blog-covers/post-{post_id}-{int(time.time())}.jpg'
        s3.put_object(
            Bucket='files',
            Key=key,
            Body=image_bytes,
            ContentType='image/jpeg',
        )
        cdn = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        return cdn
    except Exception as e:
        print(f'[ERROR] S3 upload: {e}')
        return None


def get_post(post_id: int) -> Optional[Dict]:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT p.id, p.title, p.cover_image_url, c.slug AS category_slug
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.id = {int(post_id)} LIMIT 1
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


def update_cover(post_id: int, url: str) -> bool:
    conn = db_conn()
    cur = conn.cursor()
    safe_url = url.replace("'", "''")
    cur.execute(f"""
        UPDATE {SCHEMA}.public_blog_posts
        SET cover_image_url = '{safe_url}', updated_at = NOW()
        WHERE id = {int(post_id)}
    """)
    success = cur.rowcount > 0
    conn.commit()
    cur.close()
    conn.close()
    return success


def get_posts_without_cover(limit: int = 50) -> List[Dict]:
    conn = db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT p.id, p.title, c.slug AS category_slug
        FROM {SCHEMA}.public_blog_posts p
        LEFT JOIN {SCHEMA}.public_blog_categories c ON c.id = p.category_id
        WHERE p.status = 'published' AND (p.cover_image_url IS NULL OR p.cover_image_url = '')
        ORDER BY p.published_at DESC LIMIT {int(limit)}
    """)
    posts = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return posts


def generate_for_post(post_id: int) -> Dict:
    post = get_post(post_id)
    if not post:
        return {'ok': False, 'error': 'post not found', 'post_id': post_id}

    prompt = build_prompt(post['title'], post.get('category_slug'))
    image_bytes = call_yandex_art(prompt)
    if not image_bytes:
        return {'ok': False, 'error': 'image generation failed', 'post_id': post_id}

    cdn_url = upload_to_s3(image_bytes, post_id)
    if not cdn_url:
        return {'ok': False, 'error': 's3 upload failed', 'post_id': post_id}

    update_cover(post_id, cdn_url)
    return {'ok': True, 'post_id': post_id, 'url': cdn_url, 'title': post['title']}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Генератор обложек для постов блога через YandexART."""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    if not check_admin(event):
        return respond({'error': 'unauthorized'}, 401)

    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', 'generate')

    if method == 'GET':
        try:
            if action == 'pending':
                posts = get_posts_without_cover(100)
                return respond({'posts': posts, 'count': len(posts)})
            return respond({'error': 'unknown GET action'}, 400)
        except Exception as e:
            print(f'[ERROR] blog-cover-generator GET: {e}')
            return respond({'error': str(e)}, 500)

    if method != 'POST':
        return respond({'error': 'method not allowed'}, 405)

    try:
        body = json.loads(event.get('body', '{}'))
    except Exception:
        body = {}

    try:
        if action == 'generate':
            post_id = body.get('post_id')
            if not post_id:
                return respond({'error': 'post_id required'}, 400)
            result = generate_for_post(int(post_id))
            return respond(result, 200 if result.get('ok') else 500)

        if action == 'generate-all':
            limit = min(10, max(1, int(body.get('limit', 5))))
            posts = get_posts_without_cover(limit)
            results = []
            for p in posts:
                results.append(generate_for_post(p['id']))
            ok_count = sum(1 for r in results if r.get('ok'))
            return respond({
                'ok': True,
                'total': len(posts),
                'success': ok_count,
                'failed': len(posts) - ok_count,
                'results': results,
            })

        return respond({'error': 'unknown action'}, 400)
    except Exception as e:
        print(f'[ERROR] blog-cover-generator: {e}')
        return respond({'error': str(e)}, 500)