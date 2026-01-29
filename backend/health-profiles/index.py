import json
import os
import psycopg2
from datetime import datetime
from encryption_utils import encrypt_list, decrypt_list

def handler(event: dict, context) -> dict:
    '''
    Управление медицинскими профилями: получение, создание и обновление профилей здоровья членов семьи
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            cursor.execute('''
                SELECT id, user_id, blood_type, rh_factor, allergies, chronic_diseases, 
                       privacy, shared_with, created_at, updated_at
                FROM health_profiles
                WHERE user_id = %s OR %s = ANY(shared_with)
            ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            profiles = []
            
            for row in rows:
                profile_id = row[0]
                
                cursor.execute('''
                    SELECT id, name, relation, phone, is_primary
                    FROM emergency_contacts
                    WHERE profile_id = %s
                ''', (profile_id,))
                
                contacts = []
                for c in cursor.fetchall():
                    contacts.append({
                        'id': c[0],
                        'name': c[1],
                        'relation': c[2],
                        'phone': c[3],
                        'isPrimary': c[4]
                    })
                
                profiles.append({
                    'id': row[0],
                    'userId': row[1],
                    'userName': 'Член семьи',
                    'userAge': 0,
                    'bloodType': row[2],
                    'rhFactor': row[3],
                    'allergies': decrypt_list(row[4]) if row[4] else [],
                    'chronicDiseases': decrypt_list(row[5]) if row[5] else [],
                    'emergencyContacts': contacts,
                    'privacy': row[6],
                    'sharedWith': row[7] or [],
                    'createdAt': row[8].isoformat() if row[8] else None,
                    'updatedAt': row[9].isoformat() if row[9] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(profiles, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            profile_user_id = body.get('userId', user_id)
            
            cursor.execute('''
                INSERT INTO health_profiles 
                (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            ''', (
                profile_user_id,
                body.get('bloodType'),
                body.get('rhFactor'),
                encrypt_list(body.get('allergies', [])),
                encrypt_list(body.get('chronicDiseases', [])),
                body.get('privacy', 'private'),
                body.get('sharedWith', [])
            ))
            
            profile_id = cursor.fetchone()[0]
            
            for contact in body.get('emergencyContacts', []):
                cursor.execute('''
                    INSERT INTO emergency_contacts (id, profile_id, name, relation, phone, is_primary)
                    VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s)
                ''', (
                    profile_id,
                    contact['name'],
                    contact['relation'],
                    contact['phone'],
                    contact.get('isPrimary', False)
                ))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': profile_id, 'message': 'Profile created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            profile_id = body.get('id')
            
            if not profile_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Profile ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE health_profiles
                SET blood_type = %s, rh_factor = %s, allergies = %s, 
                    chronic_diseases = %s, privacy = %s, shared_with = %s, updated_at = NOW()
                WHERE id = %s AND (user_id = %s OR %s = ANY(shared_with))
            ''', (
                body.get('bloodType'),
                body.get('rhFactor'),
                encrypt_list(body.get('allergies', [])),
                encrypt_list(body.get('chronicDiseases', [])),
                body.get('privacy'),
                body.get('sharedWith', []),
                profile_id,
                user_id,
                user_id
            ))
            
            if 'emergencyContacts' in body:
                cursor.execute('DELETE FROM emergency_contacts WHERE profile_id = %s', (profile_id,))
                
                for contact in body['emergencyContacts']:
                    cursor.execute('''
                        INSERT INTO emergency_contacts (id, profile_id, name, relation, phone, is_primary)
                        VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s)
                    ''', (
                        profile_id,
                        contact['name'],
                        contact['relation'],
                        contact['phone'],
                        contact.get('isPrimary', False)
                    ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Profile updated'}),
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