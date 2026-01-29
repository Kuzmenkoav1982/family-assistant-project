import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление задачами по организации праздника
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
                SELECT id, event_id, title, description, assigned_to, deadline, priority, status,
                       created_at, updated_at
                FROM event_tasks
                WHERE event_id = %s
                ORDER BY deadline ASC NULLS LAST, priority DESC
            ''', (event_id,))
            
            rows = cursor.fetchall()
            tasks = []
            
            for row in rows:
                tasks.append({
                    'id': row[0],
                    'eventId': row[1],
                    'title': row[2],
                    'description': row[3],
                    'assignedTo': row[4],
                    'deadline': row[5].isoformat() if row[5] else None,
                    'priority': row[6],
                    'status': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None,
                    'updatedAt': row[9].isoformat() if row[9] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(tasks, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO event_tasks 
                (id, event_id, title, description, assigned_to, deadline, priority, status, created_at, updated_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            ''', (
                body.get('eventId'),
                body.get('title'),
                body.get('description'),
                body.get('assignedTo'),
                body.get('deadline'),
                body.get('priority', 'medium'),
                body.get('status', 'pending')
            ))
            
            task_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': task_id, 'message': 'Task created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Task ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE event_tasks
                SET title = %s, description = %s, assigned_to = %s, deadline = %s,
                    priority = %s, status = %s, updated_at = NOW()
                WHERE id = %s
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('assignedTo'),
                body.get('deadline'),
                body.get('priority'),
                body.get('status'),
                task_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Task updated'}),
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
