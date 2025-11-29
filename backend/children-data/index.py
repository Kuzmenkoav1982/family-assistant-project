import json
import os
import psycopg2
import psycopg2.extras
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление данными детских профилей (здоровье, развитие, школа, подарки)
    Args: event - dict with httpMethod, body, queryStringParameters, headers
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    token = event.get('headers', {}).get('X-Auth-Token', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Требуется авторизация'})
        }
    
    if method == 'GET':
        child_id = event.get('queryStringParameters', {}).get('child_id')
        data_type = event.get('queryStringParameters', {}).get('type', 'all')
        
        if not child_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Не указан child_id'})
            }
        
        try:
            db_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(db_url)
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            schema = 't_p5815085_family_assistant_pro'
            child_data = {}
            
            if data_type in ['all', 'health']:
                cur.execute(f"SELECT * FROM {schema}.children_vaccinations WHERE member_id = %s ORDER BY date DESC", (child_id,))
                vaccinations = [dict(row) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_prescriptions WHERE member_id = %s ORDER BY date DESC", (child_id,))
                prescriptions = [dict(row) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_analyses WHERE member_id = %s ORDER BY date DESC", (child_id,))
                analyses = [dict(row) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_doctor_visits WHERE member_id = %s ORDER BY date DESC", (child_id,))
                doctor_visits = [dict(row) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_medications WHERE member_id = %s", (child_id,))
                medications = [dict(row) for row in cur.fetchall()]
                
                child_data['health'] = {
                    'vaccinations': vaccinations,
                    'prescriptions': prescriptions,
                    'analyses': analyses,
                    'doctorVisits': doctor_visits,
                    'medications': medications
                }
            
            if data_type in ['all', 'purchases']:
                cur.execute(f"""
                    SELECT pp.*, json_agg(
                        json_build_object(
                            'id', pi.id,
                            'name', pi.name,
                            'priority', pi.priority,
                            'estimated_cost', pi.estimated_cost,
                            'purchased', pi.purchased,
                            'notes', pi.notes
                        )
                    ) as items
                    FROM {schema}.children_purchase_plans pp
                    LEFT JOIN {schema}.children_purchase_items pi ON pp.id = pi.plan_id
                    WHERE pp.member_id = %s
                    GROUP BY pp.id
                    ORDER BY pp.created_at DESC
                """, (child_id,))
                child_data['purchases'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'gifts']:
                cur.execute(f"SELECT * FROM {schema}.children_gifts WHERE member_id = %s ORDER BY date", (child_id,))
                child_data['gifts'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'development']:
                cur.execute(f"""
                    SELECT cd.*, json_agg(
                        json_build_object(
                            'id', ca.id,
                            'type', ca.type,
                            'name', ca.name,
                            'schedule', ca.schedule,
                            'cost', ca.cost,
                            'status', ca.status
                        )
                    ) FILTER (WHERE ca.id IS NOT NULL) as activities,
                    json_agg(
                        json_build_object(
                            'id', ct.id,
                            'name', ct.name,
                            'date', ct.date,
                            'score', ct.score
                        )
                    ) FILTER (WHERE ct.id IS NOT NULL) as tests
                    FROM {schema}.children_development cd
                    LEFT JOIN {schema}.children_activities ca ON cd.id = ca.development_id
                    LEFT JOIN {schema}.children_tests ct ON cd.id = ct.development_id
                    WHERE cd.member_id = %s
                    GROUP BY cd.id
                """, (child_id,))
                child_data['development'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'school']:
                cur.execute(f"SELECT * FROM {schema}.children_school WHERE member_id = %s LIMIT 1", (child_id,))
                school_row = cur.fetchone()
                
                if school_row:
                    cur.execute(f"SELECT * FROM {schema}.children_grades WHERE member_id = %s ORDER BY date DESC LIMIT 50", (child_id,))
                    grades = [dict(row) for row in cur.fetchall()]
                    
                    school_data = dict(school_row)
                    school_data['grades'] = grades
                    child_data['school'] = school_data
                else:
                    child_data['school'] = {
                        'id': None,
                        'mesh_integration': False,
                        'current_grade': '',
                        'grades': []
                    }
            
            if data_type in ['all', 'dreams']:
                cur.execute(f"SELECT * FROM {schema}.children_dreams WHERE member_id = %s ORDER BY created_date DESC", (child_id,))
                child_data['dreams'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'diary']:
                cur.execute(f"SELECT * FROM {schema}.children_diary WHERE member_id = %s ORDER BY date DESC LIMIT 50", (child_id,))
                child_data['diary'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'piggyBank']:
                cur.execute(f"SELECT * FROM {schema}.children_piggybank WHERE member_id = %s LIMIT 1", (child_id,))
                piggy_row = cur.fetchone()
                
                if piggy_row:
                    cur.execute(f"SELECT * FROM {schema}.children_transactions WHERE piggybank_id = %s ORDER BY date DESC LIMIT 100", (piggy_row['id'],))
                    transactions = [dict(row) for row in cur.fetchall()]
                    
                    piggy_data = dict(piggy_row)
                    piggy_data['transactions'] = transactions
                    child_data['piggyBank'] = piggy_data
                else:
                    cur.execute(f"INSERT INTO {schema}.children_piggybank (member_id, balance) VALUES (%s, 0) RETURNING *", (child_id,))
                    conn.commit()
                    new_piggy = dict(cur.fetchone())
                    new_piggy['transactions'] = []
                    child_data['piggyBank'] = new_piggy
            
            cur.close()
            conn.close()
            
            if data_type != 'all':
                child_data = {data_type: child_data.get(data_type, {})}
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'data': child_data}, default=str)
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': f'Ошибка загрузки данных: {str(e)}'})
            }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        child_id = body.get('child_id')
        data_type = body.get('type')
        data = body.get('data')
        
        if not all([action, child_id, data_type]):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Неполные данные'})
            }
        
        try:
            db_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(db_url)
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            schema = 't_p5815085_family_assistant_pro'
            
            if action == 'add':
                if data_type == 'vaccination':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_vaccinations (member_id, family_id, date, vaccine, notes)
                        VALUES (%s, %s, %s, %s, %s) RETURNING id
                    """, (child_id, data.get('family_id', ''), data.get('date'), data.get('vaccine'), data.get('notes', '')))
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'doctor_visit':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_doctor_visits (member_id, family_id, date, doctor, specialty, status, notes)
                        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
                    """, (child_id, data.get('family_id', ''), data.get('date'), data.get('doctor'), data.get('specialty'), data.get('status', 'planned'), data.get('notes', '')))
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'gift':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_gifts (member_id, family_id, event, date, gift, given, notes)
                        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
                    """, (child_id, data.get('family_id', ''), data.get('event'), data.get('date'), data.get('gift'), data.get('given', False), data.get('notes', '')))
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'dream':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_dreams (member_id, family_id, title, description, created_date, achieved)
                        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
                    """, (child_id, data.get('family_id', ''), data.get('title'), data.get('description', ''), data.get('created_date', datetime.now().date()), data.get('achieved', False)))
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'medical_document':
                    if not db_url:
                        return {
                            'statusCode': 500,
                            'headers': headers,
                            'body': json.dumps({'success': False, 'error': 'DATABASE_URL не настроен'})
                        }
                    
                    insert_query = f'''
                        INSERT INTO {schema}.children_medical_documents 
                        (id, child_id, family_id, document_type, file_url, file_type, 
                         original_filename, file_size, related_id, related_type, 
                         title, description, uploaded_by, uploaded_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    '''
                    
                    values = (
                        data.get('id'),
                        child_id,
                        data.get('family_id', ''),
                        data.get('document_type'),
                        data.get('file_url'),
                        data.get('file_type'),
                        data.get('original_filename'),
                        data.get('file_size', 0),
                        data.get('related_id'),
                        data.get('related_type'),
                        data.get('title'),
                        data.get('description'),
                        data.get('uploaded_by', ''),
                        data.get('uploaded_at', datetime.now().isoformat())
                    )
                    
                    cur.execute(insert_query, values)
                    conn.commit()
                    result_id = data.get('id')
                
                else:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': f'Неизвестный тип данных: {data_type}'})
                    }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'message': f'{data_type} добавлено', 'id': result_id}, default=str)
                }
            
            elif action == 'update':
                item_id = body.get('item_id')
                if not item_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'Не указан item_id'})
                    }
                
                if data_type == 'vaccination':
                    cur.execute(f"""
                        UPDATE {schema}.children_vaccinations
                        SET date = %s, vaccine = %s, notes = %s
                        WHERE id = %s AND member_id = %s
                    """, (data.get('date'), data.get('vaccine'), data.get('notes', ''), item_id, child_id))
                    conn.commit()
                    
                elif data_type == 'gift':
                    cur.execute(f"""
                        UPDATE {schema}.children_gifts
                        SET event = %s, date = %s, gift = %s, given = %s, notes = %s
                        WHERE id = %s AND member_id = %s
                    """, (data.get('event'), data.get('date'), data.get('gift'), data.get('given', False), data.get('notes', ''), item_id, child_id))
                    conn.commit()
                    
                elif data_type == 'dream':
                    cur.execute(f"""
                        UPDATE {schema}.children_dreams
                        SET title = %s, description = %s, achieved = %s
                        WHERE id = %s AND member_id = %s
                    """, (data.get('title'), data.get('description', ''), data.get('achieved', False), item_id, child_id))
                    conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'message': f'{data_type} обновлено'})
                }
            
            elif action == 'delete':
                item_id = body.get('item_id')
                if not item_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'Не указан item_id'})
                    }
                
                table_mapping = {
                    'vaccination': 'children_vaccinations',
                    'doctor_visit': 'children_doctor_visits',
                    'gift': 'children_gifts',
                    'dream': 'children_dreams',
                    'prescription': 'children_prescriptions',
                    'analysis': 'children_analyses'
                }
                
                table = table_mapping.get(data_type)
                if not table:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': f'Неизвестный тип: {data_type}'})
                    }
                
                cur.execute(f"DELETE FROM {schema}.{table} WHERE id = %s AND member_id = %s", (item_id, child_id))
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'message': f'{data_type} удалено'})
                }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': f'Ошибка: {str(e)}'})
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'success': False, 'error': 'Метод не поддерживается'})
    }
