import json
import os
import psycopg2
from datetime import datetime
import math

def handler(event: dict, context) -> dict:
    """
    API для семейного маячка - прием и отдача координат членов семьи
    
    GET - получить координаты всех членов семьи
    POST - отправить свои координаты
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Получение токена авторизации
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    # Проверка авторизации
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    # Подключение к БД
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Получить user_id по токену из таблицы sessions
        cur.execute(
            "SELECT user_id FROM t_p5815085_family_assistant_pro.sessions WHERE token = %s AND expires_at > NOW()",
            (auth_token,)
        )
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Недействительный токен'}),
                'isBase64Encoded': False
            }
        
        user_id = result[0]
        
        # Получить family_id пользователя
        cur.execute(
            "SELECT family_id FROM t_p5815085_family_assistant_pro.family_members WHERE user_id = %s LIMIT 1",
            (user_id,)
        )
        family_result = cur.fetchone()
        
        if not family_result:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Семья не найдена'}),
                'isBase64Encoded': False
            }
        
        family_id = family_result[0]
        
        if method == 'POST':
            # Сохранение координат
            body = json.loads(event.get('body', '{}'))
            lat = body.get('lat')
            lng = body.get('lng')
            accuracy = body.get('accuracy', 0)
            
            if not lat or not lng:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Отсутствуют координаты'}),
                    'isBase64Encoded': False
                }
            
            # Таблица уже создана через миграцию
            
            # Вставка новой локации
            cur.execute(
                """
                INSERT INTO t_p5815085_family_assistant_pro.family_location_tracking 
                (user_id, family_id, latitude, longitude, accuracy, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                """,
                (user_id, family_id, lat, lng, accuracy)
            )
            
            # Проверка выхода из геозон
            check_geofence_violations(cur, user_id, lat, lng)
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'message': 'Координаты сохранены'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            # Получение последних координат всех членов семьи
            cur.execute("""
                SELECT DISTINCT ON (user_id)
                    user_id,
                    latitude,
                    longitude,
                    accuracy,
                    created_at
                FROM t_p5815085_family_assistant_pro.family_location_tracking
                WHERE family_id = %s
                ORDER BY user_id, created_at DESC
            """, (family_id,))
            
            locations = []
            for row in cur.fetchall():
                locations.append({
                    'memberId': str(row[0]),
                    'lat': float(row[1]),
                    'lng': float(row[2]),
                    'accuracy': float(row[3]) if row[3] else 0,
                    'timestamp': row[4].isoformat() if row[4] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'locations': locations
                }),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

def check_geofence_violations(cur, user_id: int, lat: float, lng: float):
    '''Проверка нахождения внутри/вне геозон и создание событий'''
    
    # Получаем все геозоны
    cur.execute('SELECT id, name, center_lat, center_lng, radius FROM geofences')
    geofences = cur.fetchall()
    
    for geofence in geofences:
        zone_id, name, center_lat, center_lng, radius = geofence
        
        # Вычисляем расстояние (формула гаверсинуса)
        distance = haversine_distance(lat, lng, float(center_lat), float(center_lng))
        
        # Проверяем предыдущее состояние
        cur.execute('''
            SELECT event_type FROM geofence_events
            WHERE member_id = %s AND geofence_id = %s
            ORDER BY timestamp DESC LIMIT 1
        ''', (str(user_id), zone_id))
        
        last_event = cur.fetchone()
        last_state = last_event[0] if last_event else None
        
        # Определяем текущее состояние
        is_inside = distance <= radius
        
        # Логика событий: фиксируем только смену состояния
        if is_inside and last_state != 'enter':
            # Вошел в зону
            cur.execute('''
                INSERT INTO geofence_events (member_id, geofence_id, event_type, lat, lng)
                VALUES (%s, %s, 'enter', %s, %s)
            ''', (str(user_id), zone_id, lat, lng))
            
        elif not is_inside and last_state == 'enter':
            # Вышел из зоны - создаем событие для уведомления!
            cur.execute('''
                INSERT INTO geofence_events (member_id, geofence_id, event_type, lat, lng)
                VALUES (%s, %s, 'exit', %s, %s)
            ''', (str(user_id), zone_id, lat, lng))

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    '''Расстояние между двумя точками на Земле (в метрах)'''
    R = 6371000  # Радиус Земли в метрах
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c