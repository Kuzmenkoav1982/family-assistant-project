import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Страховые полисы: ОМС, ДМС, страхование путешествий, напоминания об окончании
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
                    SELECT ip.id, ip.profile_id, ip.type, ip.policy_number, ip.provider, 
                           ip.start_date, ip.end_date, ip.status, ip.created_at
                    FROM insurance_policies ip
                    JOIN health_profiles hp ON ip.profile_id = hp.id
                    WHERE ip.profile_id = %s AND (hp.user_id = %s OR %s = ANY(hp.shared_with))
                    ORDER BY ip.status, ip.end_date
                ''', (profile_id, user_id, user_id))
            else:
                cursor.execute('''
                    SELECT ip.id, ip.profile_id, ip.type, ip.policy_number, ip.provider, 
                           ip.start_date, ip.end_date, ip.status, ip.created_at
                    FROM insurance_policies ip
                    JOIN health_profiles hp ON ip.profile_id = hp.id
                    WHERE hp.user_id = %s OR %s = ANY(hp.shared_with)
                    ORDER BY ip.status, ip.end_date
                ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            policies = []
            
            for row in rows:
                policies.append({
                    'id': row[0],
                    'profileId': row[1],
                    'type': row[2],
                    'policyNumber': row[3],
                    'provider': row[4],
                    'startDate': row[5].isoformat() if row[5] else None,
                    'endDate': row[6].isoformat() if row[6] else None,
                    'status': row[7],
                    'coverage': [],
                    'attachments': [],
                    'createdAt': row[8].isoformat() if row[8] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(policies, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO insurance_policies 
                (id, profile_id, type, policy_number, provider, start_date, end_date, status, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['profileId'],
                body['type'],
                body['policyNumber'],
                body['provider'],
                body['startDate'],
                body['endDate'],
                body.get('status', 'active')
            ))
            
            policy_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': policy_id, 'message': 'Insurance policy created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            policy_id = body.get('id')
            
            if not policy_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Policy ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE insurance_policies
                SET policy_number = %s, provider = %s, end_date = %s, status = %s
                WHERE id = %s
            ''', (
                body['policyNumber'],
                body['provider'],
                body['endDate'],
                body.get('status', 'active'),
                policy_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Insurance policy updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            policy_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not policy_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Policy ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM insurance_policies WHERE id = %s', (policy_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Insurance policy deleted'}),
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
