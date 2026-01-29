import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление виш-листом подарков для именинника
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
                SELECT id, event_id, title, description, link, price, priority,
                       reserved_by, reserved_by_name, purchased, image_url, created_at
                FROM event_wishlist
                WHERE event_id = %s
                ORDER BY priority DESC, created_at ASC
            ''', (event_id,))
            
            rows = cursor.fetchall()
            items = []
            
            for row in rows:
                items.append({
                    'id': row[0],
                    'eventId': row[1],
                    'title': row[2],
                    'description': row[3],
                    'link': row[4],
                    'price': float(row[5]) if row[5] else None,
                    'priority': row[6],
                    'reservedBy': row[7],
                    'reservedByName': row[8],
                    'purchased': row[9] or False,
                    'imageUrl': row[10],
                    'createdAt': row[11].isoformat() if row[11] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(items, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO event_wishlist 
                (id, event_id, title, description, link, price, priority, image_url, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body.get('eventId'),
                body.get('title'),
                body.get('description'),
                body.get('link'),
                body.get('price'),
                body.get('priority', 'medium'),
                body.get('imageUrl')
            ))
            
            item_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': item_id, 'message': 'Wishlist item added'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Item ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE event_wishlist
                SET title = %s, description = %s, link = %s, price = %s, priority = %s,
                    reserved_by = %s, reserved_by_name = %s, purchased = %s, image_url = %s
                WHERE id = %s
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('link'),
                body.get('price'),
                body.get('priority'),
                body.get('reservedBy'),
                body.get('reservedByName'),
                body.get('purchased'),
                body.get('imageUrl'),
                item_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Wishlist item updated'}),
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
