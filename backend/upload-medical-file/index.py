import json
import os
import boto3
from typing import Dict, Any
import base64
from datetime import datetime
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload medical documents (prescriptions, analyses, vaccination certificates) to Object Storage
    Args: event with httpMethod, body containing base64 file + metadata
          context with request_id
    Returns: HTTP response with file URL and document ID
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
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    file_base64 = body_data.get('file')
    filename = body_data.get('filename', 'document.jpg')
    file_type = body_data.get('fileType', 'image/jpeg')
    document_type = body_data.get('documentType')
    child_id = body_data.get('childId')
    related_id = body_data.get('relatedId')
    related_type = body_data.get('relatedType')
    
    if not all([file_base64, filename, document_type, child_id]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Недостаточно данных. Требуются: file, filename, documentType, childId'}),
            'isBase64Encoded': False
        }
    
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if file_type not in allowed_types:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, PDF'}),
            'isBase64Encoded': False
        }
    
    allowed_doc_types = ['prescription', 'analysis', 'doctor_visit', 'vaccination', 'other']
    if document_type not in allowed_doc_types:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неподдерживаемый тип документа'}),
            'isBase64Encoded': False
        }
    
    access_key = os.environ.get('YANDEX_S3_ACCESS_KEY')
    secret_key = os.environ.get('YANDEX_S3_SECRET_KEY')
    bucket_name = os.environ.get('YANDEX_S3_BUCKET_NAME')
    
    if not all([access_key, secret_key, bucket_name]):
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'S3 configuration missing'}),
            'isBase64Encoded': False
        }
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='ru-central1'
    )
    
    if file_base64.startswith('data:'):
        file_base64 = file_base64.split(',')[1]
    
    file_data = base64.b64decode(file_base64)
    
    file_ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    timestamp = int(datetime.now().timestamp() * 1000)
    random_str = uuid.uuid4().hex[:8]
    unique_filename = f"medical/{child_id}/{document_type}/{timestamp}_{random_str}.{file_ext}"
    
    s3_client.put_object(
        Bucket=bucket_name,
        Key=unique_filename,
        Body=file_data,
        ContentType=file_type,
        ACL='public-read'
    )
    
    file_url = f"https://storage.yandexcloud.net/{bucket_name}/{unique_filename}"
    document_id = f"doc_{timestamp}_{random_str}"
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'url': file_url,
            'documentId': document_id,
            'filename': unique_filename,
            'uploadedAt': datetime.now().isoformat(),
            'metadata': {
                'childId': child_id,
                'documentType': document_type,
                'relatedId': related_id,
                'relatedType': related_type,
                'fileType': file_type,
                'originalFilename': filename
            }
        }),
        'isBase64Encoded': False
    }
