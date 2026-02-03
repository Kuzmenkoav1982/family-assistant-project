import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление прививками: график вакцинации для членов семьи
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
            path = event.get('path', '')
            
            if '/schedule' in path:
                cursor.execute('''
                    SELECT id, name, age_months, description, is_mandatory
                    FROM vaccination_schedule
                    ORDER BY age_months ASC
                ''')
                
                rows = cursor.fetchall()
                schedule = []
                
                for row in rows:
                    schedule.append({
                        'id': row[0],
                        'name': row[1],
                        'ageMonths': row[2],
                        'description': row[3],
                        'isMandatory': row[4]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(schedule, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            profile_id = event.get('queryStringParameters', {}).get('profileId') if event.get('queryStringParameters') else None
            
            if profile_id:
                cursor.execute('''
                    SELECT v.id, v.profile_id, v.name, v.date, v.next_date, v.clinic, v.batch_number, v.created_at
                    FROM vaccinations v
                    JOIN health_profiles hp ON v.profile_id = hp.id
                    WHERE v.profile_id = %s AND (hp.user_id = %s OR %s = ANY(hp.shared_with))
                    ORDER BY v.date DESC
                ''', (profile_id, user_id, user_id))
            else:
                cursor.execute('''
                    SELECT v.id, v.profile_id, v.name, v.date, v.next_date, v.clinic, v.batch_number, v.created_at
                    FROM vaccinations v
                    JOIN health_profiles hp ON v.profile_id = hp.id
                    WHERE hp.user_id = %s OR %s = ANY(hp.shared_with)
                    ORDER BY v.date DESC
                ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            vaccinations = []
            
            for row in rows:
                vaccinations.append({
                    'id': row[0],
                    'profileId': row[1],
                    'name': row[2],
                    'date': row[3].isoformat() if row[3] else None,
                    'nextDate': row[4].isoformat() if row[4] else None,
                    'clinic': row[5],
                    'batchNumber': row[6],
                    'attachments': [],
                    'createdAt': row[7].isoformat() if row[7] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(vaccinations, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO vaccinations (id, profile_id, name, date, next_date, clinic, batch_number, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['profileId'],
                body['name'],
                body['date'],
                body.get('nextDate'),
                body['clinic'],
                body.get('batchNumber')
            ))
            
            vacc_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': vacc_id, 'message': 'Vaccination created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            vacc_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not vacc_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Vaccination ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM vaccinations WHERE id = %s', (vacc_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Vaccination deleted'}),
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