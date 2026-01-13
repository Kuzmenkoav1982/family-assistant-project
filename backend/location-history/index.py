import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для получения истории перемещений члена семьи за день'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Параметры запроса
    params = event.get('queryStringParameters', {})
    member_id = params.get('member_id')
    date_str = params.get('date')  # Формат: YYYY-MM-DD
    
    if not member_id or not date_str:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing member_id or date'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Создаем таблицу если не существует
            cur.execute("""
                CREATE TABLE IF NOT EXISTS family_tracker_locations (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    family_id INTEGER NOT NULL,
                    latitude DOUBLE PRECISION NOT NULL,
                    longitude DOUBLE PRECISION NOT NULL,
                    accuracy DOUBLE PRECISION,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Получаем историю за указанную дату
            cur.execute('''
                SELECT latitude as lat, longitude as lng, accuracy, created_at as timestamp
                FROM family_tracker_locations
                WHERE user_id = %s
                  AND DATE(created_at) = %s
                ORDER BY created_at ASC
            ''', (int(member_id), date_str))
            
            locations = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'member_id': member_id,
                    'date': date_str,
                    'locations': [
                        {
                            'lat': float(loc['lat']),
                            'lng': float(loc['lng']),
                            'accuracy': float(loc['accuracy']) if loc['accuracy'] else 0,
                            'timestamp': loc['timestamp'].isoformat() if loc['timestamp'] else None
                        }
                        for loc in locations
                    ],
                    'total_points': len(locations)
                }, default=str)
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        conn.close()