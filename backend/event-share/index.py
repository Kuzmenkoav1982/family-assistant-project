import json
import os
import psycopg2
import secrets
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''
    Управление публичными ссылками для праздников: создание токенов и получение данных по токену
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'POST':
            user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User ID required'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            event_id = body.get('eventId')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT family_id FROM family_members WHERE id = %s', (user_id,))
            family_row = cursor.fetchone()
            if not family_row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Family not found'}),
                    'isBase64Encoded': False
                }
            
            family_id = family_row[0]
            
            cursor.execute('SELECT family_id FROM family_events WHERE id = %s', (event_id,))
            event_row = cursor.fetchone()
            if not event_row or event_row[0] != family_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT share_token FROM family_events WHERE id = %s AND share_token IS NOT NULL', (event_id,))
            existing = cursor.fetchone()
            
            if existing:
                token = existing[0]
            else:
                token = secrets.token_urlsafe(16)
                cursor.execute('UPDATE family_events SET share_token = %s WHERE id = %s', (token, event_id))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'token': token, 'url': f'https://nasha-semiya.ru/shared/event/{token}'}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            token = event.get('queryStringParameters', {}).get('token') if event.get('queryStringParameters') else None
            
            if not token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Token required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT id, title, event_type, event_date, event_time, description, 
                       location, budget, guests_count, status
                FROM family_events
                WHERE share_token = %s
            ''', (token,))
            
            row = cursor.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event not found'}),
                    'isBase64Encoded': False
                }
            
            event_data = {
                'id': row[0],
                'title': row[1],
                'eventType': row[2],
                'eventDate': row[3].isoformat() if row[3] else None,
                'eventTime': str(row[4]) if row[4] else None,
                'description': row[5],
                'location': row[6],
                'budget': float(row[7]) if row[7] else None,
                'guestsCount': row[8] or 0,
                'status': row[9]
            }
            
            cursor.execute('''
                SELECT id, title, description, link, price, priority, reserved_by_name, purchased
                FROM event_wishlist
                WHERE event_id = %s
                ORDER BY priority DESC, created_at ASC
            ''', (event_data['id'],))
            
            wishlist = []
            for w in cursor.fetchall():
                wishlist.append({
                    'id': w[0],
                    'title': w[1],
                    'description': w[2],
                    'link': w[3],
                    'price': float(w[4]) if w[4] else None,
                    'priority': w[5],
                    'reservedByName': w[6],
                    'purchased': w[7]
                })
            
            event_data['wishlist'] = wishlist
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(event_data, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        print(f'[ERROR] {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
