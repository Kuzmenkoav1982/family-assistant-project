import json
import os
import boto3
import base64
from datetime import datetime
import uuid


def handler(event: dict, context) -> dict:
    """Загрузка файлов (фото, PDF) в S3 хранилище для всех разделов приложения."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    body_data = json.loads(event.get('body') or '{}')

    file_base64 = body_data.get('file_data') or body_data.get('file')
    file_name = body_data.get('file_name') or body_data.get('fileName', 'upload.jpg')
    content_type = body_data.get('content_type')
    folder = body_data.get('folder', 'general')

    if not file_base64:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No file provided'})
        }

    access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')

    if not access_key or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'S3 configuration missing'})
        }

    file_data = base64.b64decode(file_base64)

    file_ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'jpg'
    unique_name = f"{folder}/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex}.{file_ext}"

    if not content_type:
        content_type_map = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'gif': 'image/gif', 'webp': 'image/webp', 'pdf': 'application/pdf'
        }
        content_type = content_type_map.get(file_ext, 'application/octet-stream')

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

    s3.put_object(Bucket='files', Key=unique_name, Body=file_data, ContentType=content_type)

    file_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{unique_name}"

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'url': file_url, 'fileName': unique_name, 'size': len(file_data)})
    }
