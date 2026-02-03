import json
import os
import psycopg2
from encryption_utils import encrypt_data, decrypt_data

def handler(event: dict, context) -> dict:
    '''
    Управление лекарствами и напоминаниями о приеме
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
            profile_id = event.get('queryStringParameters', {}).get('profileId') if event.get('queryStringParameters') else None
            
            if profile_id:
                cursor.execute('''
                    SELECT m.id, m.profile_id, m.name, m.dosage, m.frequency, 
                           m.start_date, m.end_date, m.active, m.created_at
                    FROM medications m
                    JOIN health_profiles hp ON m.profile_id = hp.id
                    WHERE m.profile_id = %s AND (hp.user_id = %s OR %s = ANY(hp.shared_with))
                    ORDER BY m.active DESC, m.start_date DESC
                ''', (profile_id, user_id, user_id))
            else:
                cursor.execute('''
                    SELECT m.id, m.profile_id, m.name, m.dosage, m.frequency, 
                           m.start_date, m.end_date, m.active, m.created_at
                    FROM medications m
                    JOIN health_profiles hp ON m.profile_id = hp.id
                    WHERE hp.user_id = %s OR %s = ANY(hp.shared_with)
                    ORDER BY m.active DESC, m.start_date DESC
                ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            medications = []
            
            for row in rows:
                med_id = row[0]
                
                cursor.execute('''
                    SELECT id, time, enabled
                    FROM medication_reminders
                    WHERE medication_id = %s
                    ORDER BY time
                ''', (med_id,))
                
                reminders = []
                for rem in cursor.fetchall():
                    reminders.append({
                        'id': rem[0],
                        'time': str(rem[1]),
                        'enabled': rem[2]
                    })
                
                medications.append({
                    'id': row[0],
                    'profileId': row[1],
                    'name': decrypt_data(row[2]) if row[2] else '',
                    'dosage': row[3],
                    'frequency': row[4],
                    'startDate': row[5].isoformat() if row[5] else None,
                    'endDate': row[6].isoformat() if row[6] else None,
                    'active': row[7],
                    'reminders': reminders,
                    'createdAt': row[8].isoformat() if row[8] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(medications, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO medications (id, profile_id, name, dosage, frequency, start_date, end_date, active, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['profileId'],
                encrypt_data(body['name']),
                body.get('dosage', ''),
                body.get('frequency', ''),
                body.get('startDate'),
                body.get('endDate'),
                body.get('active', True)
            ))
            
            med_id = cursor.fetchone()[0]
            
            times = body.get('times', [])
            reminders = body.get('reminders', [])
            
            if times:
                for time in times:
                    cursor.execute('''
                        INSERT INTO medication_reminders (id, medication_id, time, enabled)
                        VALUES (gen_random_uuid()::text, %s, %s, %s)
                    ''', (
                        med_id,
                        time,
                        True
                    ))
            elif reminders:
                for rem in reminders:
                    cursor.execute('''
                        INSERT INTO medication_reminders (id, medication_id, time, enabled)
                        VALUES (gen_random_uuid()::text, %s, %s, %s)
                    ''', (
                        med_id,
                        rem['time'],
                        rem.get('enabled', True)
                    ))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': med_id, 'message': 'Medication created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            med_id = body.get('id')
            
            if not med_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Medication ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE medications
                SET name = %s, dosage = %s, frequency = %s, end_date = %s, active = %s
                WHERE id = %s
            ''', (
                encrypt_data(body['name']),
                body['dosage'],
                body['frequency'],
                body.get('endDate'),
                body.get('active', True),
                med_id
            ))
            
            if 'reminders' in body:
                cursor.execute('DELETE FROM medication_reminders WHERE medication_id = %s', (med_id,))
                
                for rem in body['reminders']:
                    cursor.execute('''
                        INSERT INTO medication_reminders (id, medication_id, time, enabled)
                        VALUES (gen_random_uuid()::text, %s, %s, %s)
                    ''', (
                        med_id,
                        rem['time'],
                        rem.get('enabled', True)
                    ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Medication updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            med_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not med_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Medication ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM medication_reminders WHERE medication_id = %s', (med_id,))
            cursor.execute('DELETE FROM medications WHERE id = %s', (med_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Medication deleted'}),
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