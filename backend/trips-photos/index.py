"""API для загрузки фото из поездок в S3"""
import json
import os
import base64
from datetime import datetime
from typing import Optional, Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3
from botocore.exceptions import ClientError

SCHEMA = os.environ.get('POSTGRES_SCHEMA', 't_p5815085_family_assistant_pro')

def get_db_connection():
    """Создаёт подключение к БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3_client():
    """Создаёт S3 клиент"""
    return boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

def verify_token(token: str) -> Optional[str]:
    """Проверяет токен и возвращает user_id"""
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    safe_token = token.replace("'", "''")
    
    cur.execute(f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = '{safe_token}' AND expires_at > CURRENT_TIMESTAMP
    """)
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def check_subscription(user_id: int) -> bool:
    """Проверяет наличие активной подписки у семьи пользователя"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT s.plan_type 
        FROM {SCHEMA}.subscriptions s
        JOIN {SCHEMA}.family_members fm ON fm.family_id = s.family_id
        WHERE fm.user_id = {user_id}
        AND s.status = 'active'
        AND s.end_date > CURRENT_TIMESTAMP
        AND s.plan_type = 'full'
        LIMIT 1
    """)
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return result is not None

def upload_photo(trip_id: int, user_id: int, photo_data: Dict[str, Any]) -> Dict[str, Any]:
    """Загружает фото в S3 и сохраняет в БД"""
    
    # Проверяем подписку
    if not check_subscription(user_id):
        return {
            'success': False,
            'error': 'subscription_required',
            'message': 'Для загрузки фото требуется подписка "Полный пакет"'
        }
    
    # Декодируем base64
    try:
        image_base64 = photo_data.get('image_base64', '')
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
    except Exception as e:
        return {
            'success': False,
            'error': f'Ошибка декодирования изображения: {str(e)}'
        }
    
    # Определяем тип файла
    content_type = photo_data.get('content_type', 'image/jpeg')
    extension = content_type.split('/')[-1] if '/' in content_type else 'jpg'
    
    # Генерируем уникальное имя файла
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"trips/trip_{trip_id}/{timestamp}_{user_id}.{extension}"
    
    # Загружаем в S3
    try:
        s3 = get_s3_client()
        s3.put_object(
            Bucket='files',
            Key=filename,
            Body=image_data,
            ContentType=content_type
        )
        
        # Формируем CDN URL
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
        
    except ClientError as e:
        return {
            'success': False,
            'error': f'Ошибка загрузки в S3: {str(e)}'
        }
    
    # Сохраняем в БД
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    title = photo_data.get('title', '').replace("'", "''") if photo_data.get('title') else None
    description = photo_data.get('description', '').replace("'", "''") if photo_data.get('description') else None
    location = photo_data.get('location', '').replace("'", "''") if photo_data.get('location') else None
    date_taken = photo_data.get('date_taken', datetime.now().date().isoformat())
    
    title_sql = f"'{title}'" if title else 'NULL'
    description_sql = f"'{description}'" if description else 'NULL'
    location_sql = f"'{location}'" if location else 'NULL'
    
    cur.execute(f"""
        INSERT INTO {SCHEMA}.trip_photos
        (trip_id, photo_url, title, description, location, date_taken, user_id)
        VALUES ({trip_id}, '{cdn_url}', {title_sql}, {description_sql}, 
                {location_sql}, '{date_taken}', {user_id})
        RETURNING id
    """)
    
    photo_id = cur.fetchone()['id']
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'photo_id': photo_id,
        'photo_url': cdn_url
    }

def get_trip_photos(trip_id: int) -> list:
    """Получает список фото поездки"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT 
            id, trip_id, photo_url, title, description, 
            location, date_taken, user_id, created_at
        FROM {SCHEMA}.trip_photos
        WHERE trip_id = {trip_id}
        ORDER BY date_taken DESC, created_at DESC
    """)
    
    photos = cur.fetchall()
    cur.close()
    conn.close()
    
    result = []
    for photo in photos:
        result.append({
            'id': photo['id'],
            'trip_id': photo['trip_id'],
            'photo_url': photo['photo_url'],
            'title': photo['title'],
            'description': photo['description'],
            'location': photo['location'],
            'date_taken': photo['date_taken'].isoformat() if photo['date_taken'] else None,
            'user_id': photo['user_id'],
            'created_at': photo['created_at'].isoformat()
        })
    
    return result

def update_photo(photo_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновляет информацию о фото"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    updates = []
    
    if 'title' in data:
        updates.append(f"title = '{data['title'].replace(\"'\", \"''\")}'")
    if 'description' in data:
        updates.append(f"description = '{data['description'].replace(\"'\", \"''\")}'")
    if 'location' in data:
        updates.append(f"location = '{data['location'].replace(\"'\", \"''\")}'")
    if 'date_taken' in data:
        updates.append(f"date_taken = '{data['date_taken']}'")
    
    if not updates:
        return {'success': False, 'error': 'No fields to update'}
    
    update_sql = ', '.join(updates)
    
    cur.execute(f"""
        UPDATE {SCHEMA}.trip_photos
        SET {update_sql}
        WHERE id = {photo_id}
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True}

def handler(event: dict, context) -> dict:
    """Обрабатывает запросы к API фото поездок"""
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
    }
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    try:
        # Аутентификация
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        path_params = event.get('pathParams', {})
        
        # GET /trips/{trip_id}/photos - получить фото поездки
        if method == 'GET' and 'trip_id' in path_params:
            trip_id = int(path_params['trip_id'])
            photos = get_trip_photos(trip_id)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'photos': photos})
            }
        
        # POST /trips/{trip_id}/photos - загрузить фото
        if method == 'POST' and 'trip_id' in path_params:
            trip_id = int(path_params['trip_id'])
            body = json.loads(event.get('body', '{}'))
            result = upload_photo(trip_id, int(user_id), body)
            
            status_code = 201 if result.get('success') else 403
            
            return {
                'statusCode': status_code,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }
        
        # PUT /photos/{photo_id} - обновить информацию о фото
        if method == 'PUT' and 'photo_id' in path_params:
            photo_id = int(path_params['photo_id'])
            body = json.loads(event.get('body', '{}'))
            result = update_photo(photo_id, body)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 404,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Endpoint not found'})
        }
        
    except Exception as e:
        print(f'[ERROR] {str(e)}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }