import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление списком гостей праздника
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            event_id = event.get('queryStringParameters', {}).get('eventId') if event.get('queryStringParameters') else None
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT id, event_id, name, phone, email, status, adults_count, children_count,
                       dietary_restrictions, notes, created_at
                FROM event_guests
                WHERE event_id = %s
                ORDER BY created_at ASC
            ''', (event_id,))
            
            rows = cursor.fetchall()
            guests = []
            
            for row in rows:
                guests.append({
                    'id': row[0],
                    'eventId': row[1],
                    'name': row[2],
                    'phone': row[3],
                    'email': row[4],
                    'status': row[5],
                    'adultsCount': row[6] or 1,
                    'childrenCount': row[7] or 0,
                    'dietaryRestrictions': row[8],
                    'notes': row[9],
                    'createdAt': row[10].isoformat() if row[10] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(guests, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO event_guests 
                (id, event_id, name, phone, email, status, adults_count, children_count,
                 dietary_restrictions, notes, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body.get('eventId'),
                body.get('name'),
                body.get('phone'),
                body.get('email'),
                body.get('status', 'invited'),
                body.get('adultsCount', 1),
                body.get('childrenCount', 0),
                body.get('dietaryRestrictions'),
                body.get('notes')
            ))
            
            guest_id = cursor.fetchone()[0]
            
            cursor.execute('''
                UPDATE family_events 
                SET guests_count = (
                    SELECT COALESCE(SUM(adults_count + children_count), 0)
                    FROM event_guests 
                    WHERE event_id = %s AND status IN ('confirmed', 'invited', 'maybe')
                )
                WHERE id = %s
            ''', (body.get('eventId'), body.get('eventId')))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': guest_id, 'message': 'Guest added'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            guest_id = body.get('id')
            
            if not guest_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Guest ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE event_guests
                SET name = %s, phone = %s, email = %s, status = %s,
                    adults_count = %s, children_count = %s, dietary_restrictions = %s, notes = %s
                WHERE id = %s
                RETURNING event_id
            ''', (
                body.get('name'),
                body.get('phone'),
                body.get('email'),
                body.get('status'),
                body.get('adultsCount'),
                body.get('childrenCount'),
                body.get('dietaryRestrictions'),
                body.get('notes'),
                guest_id
            ))
            
            event_id_row = cursor.fetchone()
            if event_id_row:
                cursor.execute('''
                    UPDATE family_events 
                    SET guests_count = (
                        SELECT COALESCE(SUM(adults_count + children_count), 0)
                        FROM event_guests 
                        WHERE event_id = %s AND status IN ('confirmed', 'invited', 'maybe')
                    )
                    WHERE id = %s
                ''', (event_id_row[0], event_id_row[0]))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Guest updated'}),
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
