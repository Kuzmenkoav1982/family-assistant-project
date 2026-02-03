import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    База врачей: контакты, специализации, рейтинги, избранные врачи
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, authorization, Authorization'
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
            cursor.execute('''
                SELECT id, name, specialization, clinic, phone, rating, is_favorite, created_at
                FROM doctors
                WHERE user_id = %s
                ORDER BY is_favorite DESC, name
            ''', (user_id,))
            
            rows = cursor.fetchall()
            doctors = []
            
            for row in rows:
                doctors.append({
                    'id': row[0],
                    'name': row[1],
                    'specialization': row[2],
                    'clinic': row[3],
                    'phone': row[4],
                    'rating': float(row[5]) if row[5] else None,
                    'isFavorite': row[6],
                    'createdAt': row[7].isoformat() if row[7] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(doctors, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO doctors (id, user_id, name, specialization, clinic, phone, rating, is_favorite, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                user_id,
                body['name'],
                body['specialization'],
                body['clinic'],
                body['phone'],
                body.get('rating'),
                body.get('isFavorite', False)
            ))
            
            doctor_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': doctor_id, 'message': 'Doctor created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            doctor_id = body.get('id')
            
            if not doctor_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Doctor ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE doctors
                SET name = %s, specialization = %s, clinic = %s, phone = %s, rating = %s, is_favorite = %s
                WHERE id = %s AND user_id = %s
            ''', (
                body['name'],
                body['specialization'],
                body['clinic'],
                body['phone'],
                body.get('rating'),
                body.get('isFavorite', False),
                doctor_id,
                user_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Doctor updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            doctor_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not doctor_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Doctor ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM doctors WHERE id = %s AND user_id = %s', (doctor_id, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Doctor deleted'}),
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