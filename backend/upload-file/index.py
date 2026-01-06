import json
import os
import boto3
from typing import Dict, Any
import base64
from datetime import datetime
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Загрузка файлов в S3 хранилище
    Args: event с httpMethod, body с base64 данными файла
          context с request_id
    Returns: HTTP ответ с URL файла
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    file_base64 = body_data.get('file')
    file_name = body_data.get('fileName', 'upload.jpg')
    folder = body_data.get('folder', 'general')
    
    if not file_base64:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'No file provided'}),
            'isBase64Encoded': False
        }
    
    access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    
    if not all([access_key, secret_key]):
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'S3 configuration missing'}),
            'isBase64Encoded': False
        }
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )
    
    file_data = base64.b64decode(file_base64)
    
    file_ext = file_name.split('.')[-1] if '.' in file_name else 'jpg'
    unique_name = f"{folder}/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex}.{file_ext}"
    
    content_type_map = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf'
    }
    content_type = content_type_map.get(file_ext.lower(), 'application/octet-stream')
    
    try:
        s3_client.put_object(
            Bucket='files',
            Key=unique_name,
            Body=file_data,
            ContentType=content_type
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'S3 upload failed: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    file_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{unique_name}"
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'url': file_url,
            'fileName': unique_name,
            'size': len(file_data)
        }),
        'isBase64Encoded': False
    }