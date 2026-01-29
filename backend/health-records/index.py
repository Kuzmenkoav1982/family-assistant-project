import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление медицинскими записями: визиты к врачам, анализы, симптомы, рецепты
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
                    SELECT hr.id, hr.profile_id, hr.type, hr.date, hr.title, hr.description,
                           hr.doctor, hr.clinic, hr.diagnosis, hr.recommendations,
                           hr.ai_analysis_status, hr.ai_extracted_text, hr.ai_interpretation, hr.ai_warnings,
                           hr.created_at
                    FROM health_records hr
                    JOIN health_profiles hp ON hr.profile_id = hp.id
                    WHERE hr.profile_id = %s AND (hp.user_id = %s OR %s = ANY(hp.shared_with))
                    ORDER BY hr.date DESC
                ''', (profile_id, user_id, user_id))
            else:
                cursor.execute('''
                    SELECT hr.id, hr.profile_id, hr.type, hr.date, hr.title, hr.description,
                           hr.doctor, hr.clinic, hr.diagnosis, hr.recommendations,
                           hr.ai_analysis_status, hr.ai_extracted_text, hr.ai_interpretation, hr.ai_warnings,
                           hr.created_at
                    FROM health_records hr
                    JOIN health_profiles hp ON hr.profile_id = hp.id
                    WHERE hp.user_id = %s OR %s = ANY(hp.shared_with)
                    ORDER BY hr.date DESC
                ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            records = []
            
            for row in rows:
                record_id = row[0]
                
                cursor.execute('''
                    SELECT id, file_name, file_url, file_type, uploaded_at
                    FROM health_attachments
                    WHERE record_id = %s
                ''', (record_id,))
                
                attachments = []
                for att in cursor.fetchall():
                    attachments.append({
                        'id': att[0],
                        'fileName': att[1],
                        'fileUrl': att[2],
                        'fileType': att[3],
                        'uploadedAt': att[4].isoformat() if att[4] else None
                    })
                
                ai_analysis = None
                if row[10]:
                    ai_analysis = {
                        'status': row[10],
                        'extractedText': row[11],
                        'interpretation': row[12],
                        'warnings': row[13] or []
                    }
                
                records.append({
                    'id': row[0],
                    'profileId': row[1],
                    'type': row[2],
                    'date': row[3].isoformat() if row[3] else None,
                    'title': row[4],
                    'description': row[5],
                    'doctor': row[6],
                    'clinic': row[7],
                    'diagnosis': row[8],
                    'recommendations': row[9],
                    'attachments': attachments,
                    'aiAnalysis': ai_analysis,
                    'createdAt': row[14].isoformat() if row[14] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(records, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO health_records 
                (id, profile_id, type, date, title, description, doctor, clinic, diagnosis, recommendations, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            ''', (
                body['profileId'],
                body['type'],
                body['date'],
                body['title'],
                body.get('description'),
                body.get('doctor'),
                body.get('clinic'),
                body.get('diagnosis'),
                body.get('recommendations')
            ))
            
            record_id = cursor.fetchone()[0]
            
            for att in body.get('attachments', []):
                cursor.execute('''
                    INSERT INTO health_attachments (id, record_id, file_name, file_url, file_type, uploaded_at)
                    VALUES (gen_random_uuid()::text, %s, %s, %s, %s, NOW())
                ''', (
                    record_id,
                    att['fileName'],
                    att['fileUrl'],
                    att['fileType']
                ))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': record_id, 'message': 'Record created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            record_id = body.get('id')
            
            if not record_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Record ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE health_records
                SET title = %s, description = %s, doctor = %s, clinic = %s, 
                    diagnosis = %s, recommendations = %s
                WHERE id = %s
            ''', (
                body['title'],
                body.get('description'),
                body.get('doctor'),
                body.get('clinic'),
                body.get('diagnosis'),
                body.get('recommendations'),
                record_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Record updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            record_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
            
            if not record_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Record ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM health_attachments WHERE record_id = %s', (record_id,))
            cursor.execute('DELETE FROM health_records WHERE id = %s', (record_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Record deleted'}),
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
