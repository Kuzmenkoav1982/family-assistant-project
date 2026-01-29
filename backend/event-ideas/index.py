import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление идеями и вдохновением для праздника
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
                SELECT id, event_id, category, title, description, link, image_url,
                       votes, created_by, created_at
                FROM event_ideas
                WHERE event_id = %s
                ORDER BY votes DESC, created_at DESC
            ''', (event_id,))
            
            rows = cursor.fetchall()
            ideas = []
            
            for row in rows:
                ideas.append({
                    'id': row[0],
                    'eventId': row[1],
                    'category': row[2],
                    'title': row[3],
                    'description': row[4],
                    'link': row[5],
                    'imageUrl': row[6],
                    'votes': row[7] or 0,
                    'createdBy': row[8],
                    'createdAt': row[9].isoformat() if row[9] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(ideas, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO event_ideas 
                (id, event_id, category, title, description, link, image_url, created_by, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body.get('eventId'),
                body.get('category', 'theme'),
                body.get('title'),
                body.get('description'),
                body.get('link'),
                body.get('imageUrl'),
                user_id
            ))
            
            idea_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': idea_id, 'message': 'Idea added'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            idea_id = body.get('id')
            
            if not idea_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Idea ID required'}),
                    'isBase64Encoded': False
                }
            
            if 'vote' in body:
                cursor.execute('''
                    UPDATE event_ideas
                    SET votes = votes + %s
                    WHERE id = %s
                ''', (1 if body['vote'] else -1, idea_id))
            else:
                cursor.execute('''
                    UPDATE event_ideas
                    SET category = %s, title = %s, description = %s, link = %s, image_url = %s
                    WHERE id = %s
                ''', (
                    body.get('category'),
                    body.get('title'),
                    body.get('description'),
                    body.get('link'),
                    body.get('imageUrl'),
                    idea_id
                ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Idea updated'}),
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
