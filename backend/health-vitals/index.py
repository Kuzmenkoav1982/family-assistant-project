import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Дневник показателей здоровья: вес, рост, давление, пульс, температура, глюкоза
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
            profile_id = event.get('queryStringParameters', {}).get('profileId') if event.get('queryStringParameters') else None
            
            if profile_id:
                cursor.execute('''
                    SELECT vr.id, vr.profile_id, vr.type, vr.value, vr.unit, vr.date, vr.time, vr.created_at
                    FROM vital_records vr
                    JOIN health_profiles hp ON vr.profile_id = hp.id
                    WHERE vr.profile_id = %s AND (hp.user_id = %s OR %s = ANY(hp.shared_with))
                    ORDER BY vr.date DESC, vr.time DESC
                    LIMIT 100
                ''', (profile_id, user_id, user_id))
            else:
                cursor.execute('''
                    SELECT vr.id, vr.profile_id, vr.type, vr.value, vr.unit, vr.date, vr.time, vr.created_at
                    FROM vital_records vr
                    JOIN health_profiles hp ON vr.profile_id = hp.id
                    WHERE hp.user_id = %s OR %s = ANY(hp.shared_with)
                    ORDER BY vr.date DESC, vr.time DESC
                    LIMIT 100
                ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            vitals = []
            
            for row in rows:
                vitals.append({
                    'id': row[0],
                    'profileId': row[1],
                    'type': row[2],
                    'value': float(row[3]),
                    'unit': row[4],
                    'date': row[5].isoformat() if row[5] else None,
                    'time': str(row[6]) if row[6] else None,
                    'createdAt': row[7].isoformat() if row[7] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(vitals, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO vital_records (id, profile_id, type, value, unit, date, time, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['profileId'],
                body['type'],
                body['value'],
                body['unit'],
                body['date'],
                body.get('time', '00:00')
            ))
            
            vital_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': vital_id, 'message': 'Vital record created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            vital_id = body.get('id')
            
            if not vital_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Vital record ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE vital_records
                SET type = %s, value = %s, unit = %s, date = %s, time = %s
                WHERE id = %s
            ''', (
                body.get('type'),
                body.get('value'),
                body.get('unit'),
                body.get('date'),
                body.get('time', '00:00'),
                vital_id
            ))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Vital record updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            vital_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not vital_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Vital record ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM vital_records WHERE id = %s', (vital_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Vital record deleted'}),
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