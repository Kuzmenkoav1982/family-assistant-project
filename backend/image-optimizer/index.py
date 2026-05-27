"""
Оптимизация изображений для LCP:
- Hero мобильный: 949x2000 JPEG 370КБ → WebP 357x752 (размер контейнера × 2x для Retina)
- Логотип: 768x768 JPG 145КБ → WebP 128x128 (63px × 2x для Retina)
Результат загружается в S3 с новыми ключами, URL возвращается в ответе.
"""
import os
import io
import json
import boto3
import requests
from PIL import Image


HERO_URL = "https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/a56446e2-ef59-4c50-aecf-9ed9fb67b67c.jpeg"
LOGO_URL = "https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG"

def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

def optimize_image(url: str, max_width: int, max_height: int, quality: int = 82) -> tuple[bytes, str]:
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    img = Image.open(io.BytesIO(resp.content)).convert("RGB")
    # Уменьшаем с сохранением пропорций
    img.thumbnail((max_width, max_height), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality, method=6)
    buf.seek(0)
    return buf.read(), f"{img.width}x{img.height}"

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    s3 = get_s3()
    project_id = os.environ['AWS_ACCESS_KEY_ID']
    results = {}

    # Hero: контейнер 357x709, 2x = 714x1418 — с запасом 800px по ширине
    hero_data, hero_size = optimize_image(HERO_URL, max_width=800, max_height=1800, quality=82)
    hero_key = "optimized/hero-mobile.webp"
    s3.put_object(Bucket='files', Key=hero_key, Body=hero_data, ContentType='image/webp',
                  CacheControl='public, max-age=31536000, immutable')
    results['hero'] = {
        'url': f"https://cdn.poehali.dev/projects/{project_id}/bucket/{hero_key}",
        'size_bytes': len(hero_data),
        'dimensions': hero_size,
    }

    # Логотип: контейнер 63x63, 2x = 126x126
    logo_data, logo_size = optimize_image(LOGO_URL, max_width=128, max_height=128, quality=85)
    logo_key = "optimized/logo-36.webp"
    s3.put_object(Bucket='files', Key=logo_key, Body=logo_data, ContentType='image/webp',
                  CacheControl='public, max-age=31536000, immutable')
    results['logo'] = {
        'url': f"https://cdn.poehali.dev/projects/{project_id}/bucket/{logo_key}",
        'size_bytes': len(logo_data),
        'dimensions': logo_size,
    }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'results': results}),
    }