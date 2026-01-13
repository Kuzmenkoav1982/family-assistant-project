import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional

def handler(event: dict, context) -> dict:
    '''API для управления геозонами (безопасные зоны: дом, школа)'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
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
        if method == 'GET':
            return get_geofences(conn)
        elif method == 'POST':
            return create_geofence(conn, event)
        elif method == 'DELETE':
            return delete_geofence(conn, event)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        conn.close()

def get_geofences(conn) -> dict:
    '''Получение списка всех геозон'''
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, name, center_lat, center_lng, radius, color, created_at
            FROM geofences
            ORDER BY created_at DESC
        ''')
        geofences = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'geofences': [dict(g) for g in geofences]
            }, default=str)
        }

def create_geofence(conn, event: dict) -> dict:
    '''Создание новой геозоны'''
    try:
        data = json.loads(event.get('body', '{}'))
        name = data.get('name')
        center_lat = data.get('center_lat')
        center_lng = data.get('center_lng')
        radius = data.get('radius', 500)
        color = data.get('color', '#9333EA')
        
        if not all([name, center_lat, center_lng]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                INSERT INTO geofences (name, center_lat, center_lng, radius, color)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, center_lat, center_lng, radius, color, created_at
            ''', (name, center_lat, center_lng, radius, color))
            
            new_zone = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_zone), default=str)
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def delete_geofence(conn, event: dict) -> dict:
    '''Удаление геозоны'''
    try:
        zone_id = event.get('queryStringParameters', {}).get('id')
        if not zone_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing zone id'})
            }
        
        with conn.cursor() as cur:
            cur.execute('DELETE FROM geofences WHERE id = %s', (zone_id,))
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
