import json
import os
import psycopg2
from datetime import datetime, date, time

def handler(event: dict, context) -> dict:
    '''
    Управление приёмами лекарств (отметка факта приёма, история)
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization, X-Authorization'
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
            med_id = event.get('queryStringParameters', {}).get('medicationId') if event.get('queryStringParameters') else None
            
            if not med_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Medication ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT id, medication_id, reminder_id, scheduled_time, scheduled_date, 
                       actual_time, status, notes, created_at
                FROM medication_intakes
                WHERE medication_id = %s
                ORDER BY scheduled_date DESC, scheduled_time DESC
                LIMIT 100
            ''', (med_id,))
            
            rows = cursor.fetchall()
            intakes = []
            
            for row in rows:
                intakes.append({
                    'id': row[0],
                    'medicationId': row[1],
                    'reminderId': row[2],
                    'scheduledTime': str(row[3]),
                    'scheduledDate': row[4].isoformat() if row[4] else None,
                    'actualTime': row[5].isoformat() if row[5] else None,
                    'status': row[6],
                    'notes': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(intakes, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO medication_intakes 
                (id, medication_id, reminder_id, scheduled_time, scheduled_date, actual_time, status, notes, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['medicationId'],
                body.get('reminderId'),
                body['scheduledTime'],
                body.get('scheduledDate', date.today().isoformat()),
                body.get('actualTime', datetime.now().isoformat()) if body.get('status') == 'taken' else None,
                body.get('status', 'pending'),
                body.get('notes')
            ))
            
            intake_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': intake_id, 'message': 'Intake recorded'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            intake_id = body.get('id')
            
            if not intake_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Intake ID required'}),
                    'isBase64Encoded': False
                }
            
            actual_time = datetime.now().isoformat() if body.get('status') == 'taken' else None
            
            cursor.execute('''
                UPDATE medication_intakes
                SET status = %s, actual_time = %s, notes = %s
                WHERE id = %s
            ''', (
                body.get('status', 'pending'),
                actual_time,
                body.get('notes'),
                intake_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Intake updated'}),
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
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
