"""
API для управления местами внутри поездок (Wish List мест в поездке)
Обработка запросов для добавления/удаления/обновления мест в поездке
"""
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('POSTGRES_SCHEMA', 't_p5815085_family_assistant_pro')

def get_db_connection():
    """Создаёт подключение к БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

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

def get_trip_places(trip_id: int, status_filter: Optional[str] = None) -> list:
    """Получает список мест для поездки"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    status_condition = f"AND status = '{status_filter}'" if status_filter else ""
    
    cur.execute(f"""
        SELECT 
            id, trip_id, place_name, place_type, address, description,
            latitude, longitude, rating, estimated_cost, currency,
            priority, status, visited_date, notes, ai_recommended,
            ai_description, image_url, added_by, created_at
        FROM {SCHEMA}.trip_places
        WHERE trip_id = {trip_id} {status_condition}
        ORDER BY 
            CASE priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
            END,
            created_at DESC
    """)
    
    places = cur.fetchall()
    cur.close()
    conn.close()
    
    result = []
    for place in places:
        result.append({
            'id': place['id'],
            'trip_id': place['trip_id'],
            'place_name': place['place_name'],
            'place_type': place['place_type'],
            'address': place['address'],
            'description': place['description'],
            'latitude': float(place['latitude']) if place['latitude'] else None,
            'longitude': float(place['longitude']) if place['longitude'] else None,
            'rating': float(place['rating']) if place['rating'] else None,
            'estimated_cost': float(place['estimated_cost']) if place['estimated_cost'] else None,
            'currency': place['currency'],
            'priority': place['priority'],
            'status': place['status'],
            'visited_date': place['visited_date'].isoformat() if place['visited_date'] else None,
            'notes': place['notes'],
            'ai_recommended': place['ai_recommended'],
            'ai_description': place['ai_description'],
            'image_url': place['image_url'],
            'added_by': place['added_by'],
            'created_at': place['created_at'].isoformat()
        })
    
    return result

def add_place(trip_id: int, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Добавляет новое место в поездку"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    place_name = data.get('place_name', '').replace("'", "''")
    place_type = data.get('place_type', 'attraction').replace("'", "''")
    address = data.get('address', '').replace("'", "''") if data.get('address') else None
    description = data.get('description', '').replace("'", "''") if data.get('description') else None
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    rating = data.get('rating')
    estimated_cost = data.get('estimated_cost')
    currency = data.get('currency', 'RUB').replace("'", "''")
    priority = data.get('priority', 'medium').replace("'", "''")
    notes = data.get('notes', '').replace("'", "''") if data.get('notes') else None
    ai_recommended = data.get('ai_recommended', False)
    ai_description = data.get('ai_description', '').replace("'", "''") if data.get('ai_description') else None
    image_url = data.get('image_url', '').replace("'", "''") if data.get('image_url') else None
    
    address_sql = f"'{address}'" if address else 'NULL'
    description_sql = f"'{description}'" if description else 'NULL'
    latitude_sql = str(latitude) if latitude else 'NULL'
    longitude_sql = str(longitude) if longitude else 'NULL'
    rating_sql = str(rating) if rating else 'NULL'
    cost_sql = str(estimated_cost) if estimated_cost else 'NULL'
    notes_sql = f"'{notes}'" if notes else 'NULL'
    ai_desc_sql = f"'{ai_description}'" if ai_description else 'NULL'
    image_sql = f"'{image_url}'" if image_url else 'NULL'
    
    cur.execute(f"""
        INSERT INTO {SCHEMA}.trip_places
        (trip_id, place_name, place_type, address, description, latitude, longitude,
         rating, estimated_cost, currency, priority, notes, ai_recommended, 
         ai_description, image_url, added_by)
        VALUES ({trip_id}, '{place_name}', '{place_type}', {address_sql}, {description_sql},
                {latitude_sql}, {longitude_sql}, {rating_sql}, {cost_sql}, '{currency}',
                '{priority}', {notes_sql}, {ai_recommended}, {ai_desc_sql}, {image_sql}, {user_id})
        RETURNING id
    """)
    
    place_id = cur.fetchone()['id']
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True, 'place_id': place_id}

def update_place_status(place_id: int, status: str, visited_date: Optional[str] = None) -> Dict[str, Any]:
    """Обновляет статус посещения места"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    safe_status = status.replace("'", "''")
    date_sql = f"'{visited_date}'" if visited_date else 'NULL'
    
    cur.execute(f"""
        UPDATE {SCHEMA}.trip_places
        SET status = '{safe_status}', 
            visited_date = {date_sql},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = {place_id}
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True}

def update_place(place_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновляет информацию о месте"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    updates = []
    
    if 'place_name' in data:
        updates.append(f"place_name = '{data['place_name'].replace(\"'\", \"''\")}'")
    if 'description' in data:
        updates.append(f"description = '{data['description'].replace(\"'\", \"''\")}'")
    if 'address' in data:
        updates.append(f"address = '{data['address'].replace(\"'\", \"''\")}'")
    if 'priority' in data:
        updates.append(f"priority = '{data['priority'].replace(\"'\", \"''\")}'")
    if 'notes' in data:
        updates.append(f"notes = '{data['notes'].replace(\"'\", \"''\")}'")
    if 'rating' in data:
        updates.append(f"rating = {data['rating']}")
    if 'estimated_cost' in data:
        updates.append(f"estimated_cost = {data['estimated_cost']}")
    
    if not updates:
        return {'success': False, 'error': 'No fields to update'}
    
    updates.append("updated_at = CURRENT_TIMESTAMP")
    update_sql = ', '.join(updates)
    
    cur.execute(f"""
        UPDATE {SCHEMA}.trip_places
        SET {update_sql}
        WHERE id = {place_id}
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True}

def delete_place(place_id: int) -> Dict[str, Any]:
    """Удаляет место из списка"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(f"""
        UPDATE {SCHEMA}.trip_places
        SET status = 'skipped', updated_at = CURRENT_TIMESTAMP
        WHERE id = {place_id}
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True}

def handler(event: dict, context) -> dict:
    """Обрабатывает запросы к API мест в поездках"""
    
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
        query_params = event.get('queryStringParameters', {})
        
        # GET /trips/{trip_id}/places - получить список мест
        if method == 'GET' and 'trip_id' in path_params:
            trip_id = int(path_params['trip_id'])
            status_filter = query_params.get('status')
            places = get_trip_places(trip_id, status_filter)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'places': places})
            }
        
        # POST /trips/{trip_id}/places - добавить место
        if method == 'POST' and 'trip_id' in path_params:
            trip_id = int(path_params['trip_id'])
            body = json.loads(event.get('body', '{}'))
            result = add_place(trip_id, int(user_id), body)
            
            return {
                'statusCode': 201,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }
        
        # PUT /places/{place_id}/status - обновить статус посещения
        if method == 'PUT' and 'place_id' in path_params and 'status' in query_params:
            place_id = int(path_params['place_id'])
            status = query_params['status']
            visited_date = query_params.get('visited_date')
            result = update_place_status(place_id, status, visited_date)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }
        
        # PUT /places/{place_id} - обновить информацию о месте
        if method == 'PUT' and 'place_id' in path_params:
            place_id = int(path_params['place_id'])
            body = json.loads(event.get('body', '{}'))
            result = update_place(place_id, body)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }
        
        # DELETE /places/{place_id} - удалить место (soft delete)
        if method == 'DELETE' and 'place_id' in path_params:
            place_id = int(path_params['place_id'])
            result = delete_place(place_id)
            
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