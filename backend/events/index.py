import json
import os
import psycopg2
from datetime import datetime, date

def handler(event: dict, context) -> dict:
    '''
    Управление праздниками семьи: создание, получение, обновление и удаление праздников
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
        cursor.execute('SELECT family_id FROM family_members WHERE id = %s', (user_id,))
        family_row = cursor.fetchone()
        if not family_row:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Family not found'}),
                'isBase64Encoded': False
            }
        
        family_id = family_row[0]
        
        if method == 'GET':
            event_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if event_id:
                cursor.execute('''
                    SELECT id, family_id, title, event_type, event_date, event_time, member_id,
                           description, location, budget, spent, guests_count, status, created_by,
                           created_at, updated_at, theme, catering_type, catering_details,
                           invitation_image_url, invitation_text
                    FROM family_events
                    WHERE id = %s AND family_id = %s
                ''', (event_id, family_id))
                
                row = cursor.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Event not found'}),
                        'isBase64Encoded': False
                    }
                
                result = {
                    'id': row[0],
                    'familyId': row[1],
                    'title': row[2],
                    'eventType': row[3],
                    'eventDate': row[4].isoformat() if row[4] else None,
                    'eventTime': str(row[5]) if row[5] else None,
                    'memberId': row[6],
                    'description': row[7],
                    'location': row[8],
                    'budget': float(row[9]) if row[9] else None,
                    'spent': float(row[10]) if row[10] else 0,
                    'guestsCount': row[11] or 0,
                    'status': row[12],
                    'createdBy': row[13],
                    'createdAt': row[14].isoformat() if row[14] else None,
                    'updatedAt': row[15].isoformat() if row[15] else None,
                    'theme': row[16],
                    'cateringType': row[17],
                    'cateringDetails': row[18],
                    'invitationImageUrl': row[19],
                    'invitationText': row[20]
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute('''
                    SELECT id, family_id, title, event_type, event_date, event_time, member_id,
                           description, location, budget, spent, guests_count, status, created_by,
                           created_at, updated_at, theme, catering_type, catering_details,
                           invitation_image_url, invitation_text
                    FROM family_events
                    WHERE family_id = %s
                    ORDER BY event_date ASC
                ''', (family_id,))
                
                rows = cursor.fetchall()
                events = []
                
                for row in rows:
                    events.append({
                        'id': row[0],
                        'familyId': row[1],
                        'title': row[2],
                        'eventType': row[3],
                        'eventDate': row[4].isoformat() if row[4] else None,
                        'eventTime': str(row[5]) if row[5] else None,
                        'memberId': row[6],
                        'description': row[7],
                        'location': row[8],
                        'budget': float(row[9]) if row[9] else None,
                        'spent': float(row[10]) if row[10] else 0,
                        'guestsCount': row[11] or 0,
                        'status': row[12],
                        'createdBy': row[13],
                        'createdAt': row[14].isoformat() if row[14] else None,
                        'updatedAt': row[15].isoformat() if row[15] else None,
                        'theme': row[16],
                        'cateringType': row[17],
                        'cateringDetails': row[18],
                        'invitationImageUrl': row[19],
                        'invitationText': row[20]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(events, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO family_events 
                (id, family_id, title, event_type, event_date, event_time, member_id, description, 
                 location, budget, status, created_by, created_at, updated_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            ''', (
                family_id,
                body.get('title'),
                body.get('eventType', 'custom'),
                body.get('eventDate'),
                body.get('eventTime'),
                body.get('memberId'),
                body.get('description'),
                body.get('location'),
                body.get('budget'),
                body.get('status', 'planning'),
                user_id
            ))
            
            event_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': event_id, 'message': 'Event created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            event_id = body.get('id')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE family_events
                SET title = %s, event_type = %s, event_date = %s, event_time = %s,
                    member_id = %s, description = %s, location = %s, budget = %s,
                    guests_count = %s, status = %s, theme = %s, catering_type = %s,
                    catering_details = %s, invitation_image_url = %s, invitation_text = %s,
                    updated_at = NOW()
                WHERE id = %s AND family_id = %s
            ''', (
                body.get('title'),
                body.get('eventType'),
                body.get('eventDate'),
                body.get('eventTime'),
                body.get('memberId'),
                body.get('description'),
                body.get('location'),
                body.get('budget'),
                body.get('guestsCount'),
                body.get('status'),
                body.get('theme'),
                body.get('cateringType'),
                body.get('cateringDetails'),
                body.get('invitationImageUrl'),
                body.get('invitationText'),
                event_id,
                family_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Event updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            event_id = query_params.get('id') if query_params else None
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE family_events SET status = %s WHERE id = %s AND family_id = %s', 
                         ('cancelled', event_id, family_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Event cancelled'}),
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