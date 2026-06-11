import json
import os
import boto3
import base64
import psycopg2
from datetime import datetime
import uuid
from s3_limit_utils import check_and_track_storage

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id, X-Family-Id',
    'Access-Control-Max-Age': '86400',
}

def respond(status, body):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', **CORS}, 'body': json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """Загрузка файлов (фото, PDF) в S3. Проверяет лимит 10 МБ на файл и лимит объёма на семью."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return respond(405, {'error': 'Method not allowed'})

    body_data = json.loads(event.get('body') or '{}')

    file_base64 = body_data.get('file_data') or body_data.get('file')
    file_name   = body_data.get('file_name') or body_data.get('fileName', 'upload.jpg')
    content_type = body_data.get('content_type')
    folder = body_data.get('folder', 'general')

    if not file_base64:
        return respond(400, {'error': 'No file provided'})

    access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    secret_key  = os.environ.get('AWS_SECRET_ACCESS_KEY')
    if not access_key or not secret_key:
        return respond(500, {'error': 'S3 configuration missing'})

    # Декодировать файл
    file_data = base64.b64decode(file_base64)

    # Лимит размера одного файла
    if len(file_data) > MAX_FILE_SIZE_BYTES:
        return respond(413, {
            'error': f'Файл слишком большой. Максимум 10 МБ. Ваш файл: {len(file_data) / 1024 / 1024:.1f} МБ'
        })

    # Лимит объёма хранилища на семью (если передан X-Family-Id)
    family_id = (event.get('headers') or {}).get('X-Family-Id') or (event.get('headers') or {}).get('x-family-id')
    if family_id:
        schema = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')
        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            ok, err = check_and_track_storage(conn, schema, family_id, len(file_data))
            conn.close()
            if not ok:
                return err
        except Exception:
            pass  # Если БД недоступна — не блокируем загрузку

    # Определить расширение и content-type
    file_ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'jpg'
    unique_name = f"{folder}/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex}.{file_ext}"

    if not content_type:
        ct_map = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'gif': 'image/gif', 'webp': 'image/webp', 'pdf': 'application/pdf',
        }
        content_type = ct_map.get(file_ext, 'application/octet-stream')

    # Загрузить в S3
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )
    s3.put_object(Bucket='files', Key=unique_name, Body=file_data, ContentType=content_type)

    file_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{unique_name}"

    return respond(200, {
        'url': file_url,
        'fileName': unique_name,
        'size': len(file_data),
        'size_mb': round(len(file_data) / 1024 / 1024, 2),
    })
