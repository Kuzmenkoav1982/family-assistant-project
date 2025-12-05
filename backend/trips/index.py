"""
Backend функция для работы с путешествиями.
Поддерживает: поездки, билеты, маршруты, wish list, дневник, фото.
"""

import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor


def convert_for_json(obj):
    """Конвертирует Decimal и datetime в JSON-совместимые типы"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_for_json(item) for item in obj]
    return obj


def get_db_connection():
    """Создаёт подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обрабатывает запросы для работы с путешествиями
    
    GET /?action=trips&status=all - получить все поездки
    GET /?action=trip&id=1 - получить детали поездки
    POST / body: {"action":"create_trip",...} - создать поездку
    POST / body: {"action":"update_trip",...} - обновить поездку
    
    GET /?action=bookings&trip_id=1 - получить брони поездки
    POST / body: {"action":"add_booking",...} - добавить бронь
    
    GET /?action=itinerary&trip_id=1 - получить маршрут
    POST / body: {"action":"add_day",...} - добавить день маршрута
    
    GET /?action=wishlist - получить wish list
    POST / body: {"action":"add_wishlist",...} - добавить в wish list
    POST / body: {"action":"wishlist_to_trip",...} - конвертировать в поездку
    
    GET /?action=diary&trip_id=1 - получить дневник
    POST / body: {"action":"add_diary",...} - добавить запись
    
    GET /?action=photos&trip_id=1 - получить фото
    POST / body: {"action":"add_photo",...} - добавить фото
    """
    
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    # CORS
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': '', 'isBase64Encoded': False}
    
    try:
        conn = get_db_connection()
        
        # Получить все поездки
        if method == 'GET' and action == 'trips':
            status = params.get('status', 'all')
            trips = get_trips(conn, status)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'trips': trips}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Получить детали поездки
        if method == 'GET' and action == 'trip':
            trip_id = int(params.get('id'))
            trip = get_trip_details(conn, trip_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'trip': trip}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Создать поездку
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            post_action = body.get('action', '')
            
            if post_action == 'create_trip':
                trip = create_trip(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'trip': trip}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if post_action == 'update_trip':
                trip = update_trip(conn, body)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'trip': trip}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Получить брони
        if method == 'GET' and action == 'bookings':
            trip_id = int(params.get('trip_id'))
            bookings = get_bookings(conn, trip_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'bookings': bookings}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Добавить бронь
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            if body.get('action') == 'add_booking':
                booking = add_booking(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'booking': booking}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Получить маршрут
        if method == 'GET' and action == 'itinerary':
            trip_id = int(params.get('trip_id'))
            itinerary = get_itinerary(conn, trip_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'itinerary': itinerary}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Добавить день маршрута
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            if body.get('action') == 'add_day':
                day = add_itinerary_day(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'day': day}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Получить wish list
        if method == 'GET' and action == 'wishlist':
            user_id = params.get('user_id')
            wishlist = get_wishlist(conn, user_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'wishlist': wishlist}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Добавить в wish list
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            if body.get('action') == 'add_wishlist':
                item = add_to_wishlist(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'item': item}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if body.get('action') == 'wishlist_to_trip':
                trip = wishlist_to_trip(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'trip': trip}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Получить дневник
        if method == 'GET' and action == 'diary':
            trip_id = int(params.get('trip_id'))
            diary = get_diary(conn, trip_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'diary': diary}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Добавить запись в дневник
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            if body.get('action') == 'add_diary':
                entry = add_diary_entry(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'entry': entry}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Получить фото
        if method == 'GET' and action == 'photos':
            trip_id = int(params.get('trip_id'))
            photos = get_photos(conn, trip_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'photos': photos}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Добавить фото
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            if body.get('action') == 'add_photo':
                photo = add_photo(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'photo': photo}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'conn' in locals():
            conn.close()


def get_trips(conn, status: str = 'all') -> List[Dict]:
    """Получить все поездки"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        if status == 'all':
            cur.execute("SELECT * FROM trips ORDER BY start_date DESC")
        else:
            cur.execute("SELECT * FROM trips WHERE status = %s ORDER BY start_date DESC", (status,))
        
        results = []
        for row in cur.fetchall():
            trip = convert_for_json(dict(row))
            results.append(trip)
        return results


def get_trip_details(conn, trip_id: int) -> Dict:
    """Получить детали поездки"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM trips WHERE id = %s", (trip_id,))
        trip = convert_for_json(dict(cur.fetchone()))
        return trip


def create_trip(conn, data: Dict) -> Dict:
    """Создать новую поездку"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO trips (title, destination, country, start_date, end_date, 
                              status, budget, currency, description, participants, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data['title'], data['destination'], data.get('country'), 
             data['start_date'], data['end_date'], data.get('status', 'planning'),
             data.get('budget'), data.get('currency', 'RUB'), data.get('description'),
             json.dumps(data.get('participants', [])), data.get('created_by'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def update_trip(conn, data: Dict) -> Dict:
    """Обновить поездку"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            UPDATE trips SET 
                title = %s, destination = %s, country = %s,
                start_date = %s, end_date = %s, status = %s,
                budget = %s, spent = %s, currency = %s, description = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
            """,
            (data['title'], data['destination'], data.get('country'),
             data['start_date'], data['end_date'], data['status'],
             data.get('budget'), data.get('spent', 0), data.get('currency', 'RUB'),
             data.get('description'), data['id'])
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def get_bookings(conn, trip_id: int) -> List[Dict]:
    """Получить брони поездки"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM trip_bookings WHERE trip_id = %s ORDER BY date_from",
            (trip_id,)
        )
        return [convert_for_json(dict(row)) for row in cur.fetchall()]


def add_booking(conn, data: Dict) -> Dict:
    """Добавить бронь"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO trip_bookings (trip_id, booking_type, title, booking_number,
                                       provider, date_from, date_to, cost, currency, status, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data['trip_id'], data['booking_type'], data['title'], 
             data.get('booking_number'), data.get('provider'),
             data.get('date_from'), data.get('date_to'),
             data.get('cost'), data.get('currency', 'RUB'),
             data.get('status', 'pending'), data.get('notes'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def get_itinerary(conn, trip_id: int) -> List[Dict]:
    """Получить маршрут поездки"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM trip_itinerary WHERE trip_id = %s ORDER BY day_number",
            (trip_id,)
        )
        return [convert_for_json(dict(row)) for row in cur.fetchall()]


def add_itinerary_day(conn, data: Dict) -> Dict:
    """Добавить день в маршрут"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO trip_itinerary (trip_id, day_number, date, title, description, places, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data['trip_id'], data['day_number'], data['date'],
             data.get('title'), data.get('description'),
             json.dumps(data.get('places', [])), data.get('notes'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def get_wishlist(conn, user_id: Optional[str] = None) -> List[Dict]:
    """Получить wish list"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        if user_id:
            cur.execute(
                "SELECT * FROM trip_wishlist WHERE user_id = %s ORDER BY priority DESC, created_at DESC",
                (int(user_id),)
            )
        else:
            cur.execute("SELECT * FROM trip_wishlist ORDER BY priority DESC, created_at DESC")
        
        return [convert_for_json(dict(row)) for row in cur.fetchall()]


def add_to_wishlist(conn, data: Dict) -> Dict:
    """Добавить в wish list"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO trip_wishlist (destination, country, description, priority,
                                       estimated_budget, currency, best_season, 
                                       duration_days, tags, user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data['destination'], data.get('country'), data.get('description'),
             data.get('priority', 'medium'), data.get('estimated_budget'),
             data.get('currency', 'RUB'), data.get('best_season'),
             data.get('duration_days'), json.dumps(data.get('tags', [])),
             data.get('user_id'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def wishlist_to_trip(conn, data: Dict) -> Dict:
    """Конвертировать wish list в поездку"""
    wishlist_id = data['wishlist_id']
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Получаем wish list item
        cur.execute("SELECT * FROM trip_wishlist WHERE id = %s", (wishlist_id,))
        wish = dict(cur.fetchone())
        
        # Создаем поездку
        cur.execute(
            """
            INSERT INTO trips (title, destination, country, start_date, end_date,
                              status, budget, currency, description, created_by)
            VALUES (%s, %s, %s, %s, %s, 'planning', %s, %s, %s, %s)
            RETURNING *
            """,
            (f"Поездка в {wish['destination']}", wish['destination'], wish['country'],
             data['start_date'], data['end_date'], wish.get('estimated_budget'),
             wish['currency'], wish.get('description'), data.get('user_id'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def get_diary(conn, trip_id: int) -> List[Dict]:
    """Получить дневник поездки"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM trip_diary WHERE trip_id = %s ORDER BY date",
            (trip_id,)
        )
        return [convert_for_json(dict(row)) for row in cur.fetchall()]


def add_diary_entry(conn, data: Dict) -> Dict:
    """Добавить запись в дневник"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO trip_diary (trip_id, date, title, content, mood, location, weather, user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data['trip_id'], data['date'], data.get('title'), data['content'],
             data.get('mood'), data.get('location'), data.get('weather'), data.get('user_id'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))


def get_photos(conn, trip_id: int) -> List[Dict]:
    """Получить фото поездки"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM trip_photos WHERE trip_id = %s ORDER BY date_taken DESC",
            (trip_id,)
        )
        return [convert_for_json(dict(row)) for row in cur.fetchall()]


def add_photo(conn, data: Dict) -> Dict:
    """Добавить фото"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO trip_photos (trip_id, photo_url, title, description, location, date_taken, user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (data['trip_id'], data['photo_url'], data.get('title'),
             data.get('description'), data.get('location'), 
             data.get('date_taken'), data.get('user_id'))
        )
        conn.commit()
        return convert_for_json(dict(cur.fetchone()))
