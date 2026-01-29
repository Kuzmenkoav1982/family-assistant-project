import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Телемедицина: онлайн-консультации с врачами, запись и управление сессиями
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
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
            profile_id = event.get('queryStringParameters', {}).get('profileId') if event.get('queryStringParameters') else None
            
            if profile_id:
                cursor.execute('''
                    SELECT ts.id, ts.profile_id, ts.doctor_id, ts.scheduled_at, ts.duration, ts.status, ts.created_at
                    FROM telemedicine_sessions ts
                    JOIN health_profiles hp ON ts.profile_id = hp.id
                    WHERE ts.profile_id = %s AND (hp.user_id = %s OR %s = ANY(hp.shared_with))
                    ORDER BY ts.scheduled_at DESC
                ''', (profile_id, user_id, user_id))
            else:
                cursor.execute('''
                    SELECT ts.id, ts.profile_id, ts.doctor_id, ts.scheduled_at, ts.duration, ts.status, ts.created_at
                    FROM telemedicine_sessions ts
                    JOIN health_profiles hp ON ts.profile_id = hp.id
                    WHERE hp.user_id = %s OR %s = ANY(hp.shared_with)
                    ORDER BY ts.scheduled_at DESC
                ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            sessions = []
            
            for row in rows:
                doctor_id = row[2]
                
                cursor.execute('SELECT name, specialization FROM doctors WHERE id = %s', (doctor_id,))
                doctor = cursor.fetchone()
                
                sessions.append({
                    'id': row[0],
                    'profileId': row[1],
                    'doctorId': row[2],
                    'doctorName': doctor[0] if doctor else 'Неизвестно',
                    'specialization': doctor[1] if doctor else 'Неизвестно',
                    'scheduledAt': row[3].isoformat() if row[3] else None,
                    'duration': row[4],
                    'status': row[5],
                    'createdAt': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(sessions, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO telemedicine_sessions 
                (id, profile_id, doctor_id, scheduled_at, duration, status, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['profileId'],
                body['doctorId'],
                body['scheduledAt'],
                body.get('duration', 30),
                body.get('status', 'scheduled')
            ))
            
            session_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': session_id, 'message': 'Session created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            session_id = body.get('id')
            
            if not session_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Session ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE telemedicine_sessions
                SET status = %s
                WHERE id = %s
            ''', (
                body['status'],
                session_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Session updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            session_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not session_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Session ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM telemedicine_sessions WHERE id = %s', (session_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Session deleted'}),
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
