"""
API для управления настройками семьи (название, логотип)
"""

import json
import os
import base64
import hashlib
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT s.user_id, fm.family_id, fm.id as member_id
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
            WHERE s.token = {escape_string(token)} 
            AND s.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        """
        cur.execute(query)
        result = cur.fetchone()
        
        if result:
            return {
                'user_id': result['user_id'],
                'family_id': result['family_id'],
                'member_id': result['member_id']
            }
        return None
    finally:
        cur.close()
        conn.close()

def upload_logo_to_s3(image_base64: str, family_id: str) -> str:
    """Загружает логотип в S3 и возвращает CDN URL"""
    try:
        # Декодируем base64
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        
        # Определяем тип файла
        content_type = 'image/jpeg'
        extension = 'jpg'
        if image_data.startswith(b'\x89PNG'):
            content_type = 'image/png'
            extension = 'png'
        
        # Генерируем уникальное имя файла
        file_hash = hashlib.md5(image_data).hexdigest()
        file_key = f'family-logos/{family_id}/{file_hash}.{extension}'
        
        # Загружаем в S3
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        s3.put_object(
            Bucket='files',
            Key=file_key,
            Body=image_data,
            ContentType=content_type
        )
        
        # Формируем CDN URL
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        return cdn_url
    
    except Exception as e:
        print(f"[upload_logo_to_s3] Error: {e}")
        raise Exception(f"Ошибка загрузки изображения: {str(e)}")

def update_family_settings(family_id: str, name: Optional[str] = None, logo_base64: Optional[str] = None) -> Dict[str, Any]:
    """Обновляет настройки семьи"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        logo_url = None
        if logo_base64:
            logo_url = upload_logo_to_s3(logo_base64, family_id)
        
        updates = []
        if name is not None:
            updates.append(f"name = {escape_string(name)}")
        if logo_url is not None:
            updates.append(f"logo_url = {escape_string(logo_url)}")
        
        if not updates:
            return {'success': False, 'error': 'Нет данных для обновления'}
        
        query = f"""
            UPDATE {SCHEMA}.families
            SET {', '.join(updates)}, updated_at = NOW()
            WHERE id = '{family_id}'::uuid
            RETURNING id, name, logo_url
        """
        cur.execute(query)
        result = cur.fetchone()
        
        if result:
            return {
                'success': True,
                'family': {
                    'id': str(result['id']),
                    'name': result['name'],
                    'logo_url': result['logo_url']
                }
            }
        return {'success': False, 'error': 'Семья не найдена'}
    
    except Exception as e:
        print(f"[update_family_settings] Error: {e}")
        return {'success': False, 'error': str(e)}
    finally:
        cur.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """API для обновления настроек семьи"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        all_headers = event.get('headers', {})
        token = all_headers.get('X-Auth-Token', '') or all_headers.get('x-auth-token', '')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        user_data = verify_token(token)
        
        if not user_data:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Недействительный токен'}),
                'isBase64Encoded': False
            }
        
        family_id = str(user_data['family_id'])
        
        if method == 'PUT':
            raw_body = event.get('body') or '{}'
            body = json.loads(raw_body) if raw_body else {}
            
            name = body.get('name')
            logo_base64 = body.get('logoBase64')
            
            if not name and not logo_base64:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Нет данных для обновления'}),
                    'isBase64Encoded': False
                }
            
            result = update_family_settings(family_id, name, logo_base64)
            
            if result.get('success'):
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        print(f"[handler] Error: {e}")
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': f'Ошибка сервера: {str(e)}'
            }),
            'isBase64Encoded': False
        }
