import json
import os
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from encryption_helper import encrypt_medical_fields, decrypt_medical_fields
from _portfolio_enqueue import enqueue_portfolio_rebuild, trigger_fast_path

# Version: 2025-01-17-03 - Transactional outbox via portfolio_rebuild_queue
VERSION = "2025-01-17-03"

SCHEMA = 't_p5815085_family_assistant_pro'


def _get_actor_user_id(child_id: str, cur) -> Optional[str]:
    """Находит users.id актора по member_id ребёнка — нужен для X-User-Id в portfolio API."""
    try:
        child_id_esc = escape_sql_string(child_id)
        # Ищем владельца (full account) той же семьи
        cur.execute(f"""
            SELECT fm2.user_id
            FROM {SCHEMA}.family_members fm1
            JOIN {SCHEMA}.family_members fm2 ON fm2.family_id = fm1.family_id
            WHERE fm1.id = {child_id_esc}
              AND fm2.user_id IS NOT NULL
            LIMIT 1
        """)
        row = cur.fetchone()
        return str(row['user_id']) if row and row.get('user_id') else None
    except Exception:
        return None


# Типы данных, которые влияют на портфолио
_PORTFOLIO_TYPES = frozenset({'grade', 'dream', 'medication', 'vaccination', 'doctor_visit', 'mood'})

def escape_sql_string(value: Any) -> str:
    '''Экранирование значений для Simple Query Protocol'''
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    if isinstance(value, datetime):
        return "'" + value.isoformat() + "'"
    return "'" + str(value).replace("'", "''") + "'"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление данными детских профилей (здоровье, развитие, школа, подарки)
    Args: event - dict with httpMethod, body, queryStringParameters, headers
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    print(f"[VERSION] {VERSION} | Request ID: {context.request_id}")
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
            child_id_safe = escape_sql_string(child_id)
            
            if data_type in ['all', 'health']:
                cur.execute(f"SELECT * FROM {schema}.children_vaccinations WHERE member_id = {child_id_safe} ORDER BY date DESC")
                vaccinations = [decrypt_medical_fields(dict(row)) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_prescriptions WHERE member_id = {child_id_safe} ORDER BY date DESC")
                prescriptions = [decrypt_medical_fields(dict(row)) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_analyses WHERE member_id = {child_id_safe} ORDER BY date DESC")
                analyses = [decrypt_medical_fields(dict(row)) for row in cur.fetchall()]
                
                cur.execute(f"SELECT * FROM {schema}.children_doctor_visits WHERE member_id = {child_id_safe} ORDER BY date DESC")
                doctor_visits = [decrypt_medical_fields(dict(row)) for row in cur.fetchall()]
                
                print(f"[DEBUG] Loading medications for child {child_id}")
                cur.execute(f"SELECT * FROM {schema}.children_medications WHERE member_id = {child_id_safe}")
                medications = [dict(row) for row in cur.fetchall()]
                print(f"[DEBUG] Found {len(medications)} medications")
                
                for med in medications:
                    med_id_safe = escape_sql_string(med['id'])
                    cur.execute(f"SELECT * FROM {schema}.children_medication_schedule WHERE medication_id = {med_id_safe}")
                    med['schedule'] = [dict(row) for row in cur.fetchall()]
                    
                    cur.execute(f"SELECT * FROM {schema}.children_medication_intake WHERE medication_id = {med_id_safe} ORDER BY scheduled_date, scheduled_time")
                    med['intakes'] = [dict(row) for row in cur.fetchall()]
                    
                    print(f"[DEBUG MED] '{med['name']}': schedule={len(med['schedule'])}, intakes={len(med['intakes'])}")
                print(f"[DEBUG] Medications loaded successfully")
                
                cur.execute(f"SELECT * FROM {schema}.children_medical_documents WHERE child_id = {child_id_safe} ORDER BY uploaded_at DESC")
                documents = [dict(row) for row in cur.fetchall()]
                
                child_data['health'] = {
                    'vaccinations': vaccinations,
                    'prescriptions': prescriptions,
                    'analyses': analyses,
                    'doctorVisits': doctor_visits,
                    'medications': medications,
                    'documents': documents
                }
            
            if data_type in ['all', 'purchases']:
                cur.execute(f"SELECT * FROM {schema}.children_purchase_plans WHERE member_id = {child_id_safe} ORDER BY created_at DESC")
                purchase_plans = [dict(row) for row in cur.fetchall()]
                
                for plan in purchase_plans:
                    plan_id_safe = escape_sql_string(plan['id'])
                    cur.execute(f"SELECT * FROM {schema}.children_purchase_items WHERE plan_id = {plan_id_safe}")
                    plan['items'] = [dict(row) for row in cur.fetchall()]
                
                child_data['purchases'] = purchase_plans
            
            if data_type in ['all', 'gifts']:
                cur.execute(f"SELECT * FROM {schema}.children_gifts WHERE member_id = {child_id_safe} ORDER BY date DESC")
                child_data['gifts'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'development']:
                cur.execute(f"SELECT * FROM {schema}.children_development WHERE member_id = {child_id_safe}")
                development_rows = [dict(row) for row in cur.fetchall()]
                
                for dev in development_rows:
                    dev_id_safe = escape_sql_string(dev['id'])
                    cur.execute(f"SELECT * FROM {schema}.children_activities WHERE development_id = {dev_id_safe}")
                    dev['activities'] = [dict(row) for row in cur.fetchall()]
                    
                    cur.execute(f"SELECT * FROM {schema}.children_tests WHERE development_id = {dev_id_safe}")
                    dev['tests'] = [dict(row) for row in cur.fetchall()]
                
                child_data['development'] = development_rows
            
            if data_type in ['all', 'school']:
                cur.execute(f"SELECT * FROM {schema}.children_school WHERE member_id = {child_id_safe} LIMIT 1")
                school_row = cur.fetchone()
                
                if school_row:
                    school_id_safe = escape_sql_string(school_row['id'])
                    cur.execute(f"SELECT * FROM {schema}.children_grades WHERE school_id = {school_id_safe} ORDER BY date DESC LIMIT 50")
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
                cur.execute(f"SELECT * FROM {schema}.children_dreams WHERE member_id = {child_id_safe} ORDER BY created_date DESC")
                child_data['dreams'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'diary']:
                cur.execute(f"SELECT * FROM {schema}.children_diary WHERE member_id = {child_id_safe} ORDER BY date DESC LIMIT 50")
                child_data['diary'] = [dict(row) for row in cur.fetchall()]
            
            if data_type in ['all', 'piggyBank']:
                cur.execute(f"SELECT * FROM {schema}.children_piggybank WHERE member_id = {child_id_safe} LIMIT 1")
                piggy_row = cur.fetchone()
                
                if piggy_row:
                    piggy_id_safe = escape_sql_string(piggy_row['id'])
                    cur.execute(f"SELECT * FROM {schema}.children_transactions WHERE piggybank_id = {piggy_id_safe} ORDER BY date DESC LIMIT 100")
                    transactions = [dict(row) for row in cur.fetchall()]
                    
                    piggy_data = dict(piggy_row)
                    piggy_data['transactions'] = transactions
                    child_data['piggyBank'] = piggy_data
                else:
                    child_data['piggyBank'] = {
                        'id': None,
                        'balance': 0,
                        'transactions': []
                    }
            
            if data_type in ['all', 'mood']:
                try:
                    cur.execute(
                        f"SELECT id, member_id, mood, note, entry_date, created_at "
                        f"FROM {schema}.children_mood_entries "
                        f"WHERE member_id::text = {child_id_safe} "
                        f"ORDER BY entry_date DESC LIMIT 200"
                    )
                    child_data['mood'] = [dict(row) for row in cur.fetchall()]
                except Exception as mood_err:
                    print(f"[MOOD LOAD] error: {mood_err}")
                    conn.rollback()
                    child_data['mood'] = []
            
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
        # Failpoint: X-Debug-Force-Refresh-Fail: 1 — dirty выставляется, HTTP aggregate пропускается
        _force_refresh_fail = event.get('headers', {}).get('X-Debug-Force-Refresh-Fail', '') == '1'
        
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
            
            child_id_safe = escape_sql_string(child_id)
            
            if action == 'add':
                if data_type == 'vaccination':
                    encrypted_data = encrypt_medical_fields(data)
                    cur.execute(f"""
                        INSERT INTO {schema}.children_vaccinations (member_id, family_id, date, vaccine, notes)
                        VALUES ({child_id_safe}, {escape_sql_string(data.get('family_id', ''))}, 
                                {escape_sql_string(encrypted_data.get('date'))}, {escape_sql_string(encrypted_data.get('vaccine'))}, 
                                {escape_sql_string(encrypted_data.get('notes', ''))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'doctor_visit':
                    encrypted_data = encrypt_medical_fields(data)
                    cur.execute(f"""
                        INSERT INTO {schema}.children_doctor_visits (member_id, family_id, date, doctor, specialty, status, notes)
                        VALUES ({child_id_safe}, {escape_sql_string(data.get('family_id', ''))}, 
                                {escape_sql_string(encrypted_data.get('date'))}, {escape_sql_string(encrypted_data.get('doctor'))}, 
                                {escape_sql_string(encrypted_data.get('specialty'))}, {escape_sql_string(encrypted_data.get('status', 'planned'))}, 
                                {escape_sql_string(encrypted_data.get('notes', ''))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'gift':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_gifts (member_id, family_id, event, date, gift, given, notes)
                        VALUES ({child_id_safe}, {escape_sql_string(data.get('family_id', ''))}, 
                                {escape_sql_string(data.get('event'))}, {escape_sql_string(data.get('date'))}, 
                                {escape_sql_string(data.get('gift'))}, {escape_sql_string(data.get('given', False))}, 
                                {escape_sql_string(data.get('notes', ''))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'dream':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_dreams (member_id, family_id, title, description, created_date, achieved)
                        VALUES ({child_id_safe}, {escape_sql_string(data.get('family_id', ''))}, 
                                {escape_sql_string(data.get('title'))}, {escape_sql_string(data.get('description', ''))}, 
                                {escape_sql_string(data.get('created_date', datetime.now().date()))}, 
                                {escape_sql_string(data.get('achieved', False))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()

                elif data_type == 'mood':
                    try:
                        entry_date = data.get('entry_date') or data.get('date') or datetime.now().isoformat()
                        cur.execute(f"""
                            INSERT INTO {schema}.children_mood_entries (member_id, mood, note, entry_date)
                            VALUES ({child_id_safe}::uuid, {escape_sql_string(data.get('mood', ''))}, 
                                    {escape_sql_string(data.get('note', ''))}, {escape_sql_string(entry_date)})
                            RETURNING id, member_id, mood, note, entry_date, created_at
                        """)
                        result_row = cur.fetchone()
                        result_id = result_row['id']
                        conn.commit()
                        return {
                            'statusCode': 200,
                            'headers': headers,
                            'body': json.dumps({'success': True, 'entry': dict(result_row)}, default=str)
                        }
                    except Exception as mood_err:
                        print(f"[MOOD ADD] error: {mood_err}")
                        conn.rollback()
                        return {
                            'statusCode': 400,
                            'headers': headers,
                            'body': json.dumps({'success': False, 'error': f'Неверный child_id (должен быть UUID): {str(mood_err)}'})
                        }
                    
                elif data_type == 'medical_document':
                    try:
                        if not db_url:
                            return {
                                'statusCode': 500,
                                'headers': headers,
                                'body': json.dumps({'success': False, 'error': 'DATABASE_URL не настроен'})
                            }
                        
                        print(f"[DOC SAVE] Saving document: id={data.get('id')}, child_id={child_id}, type={data.get('document_type')}")
                        print(f"[DOC SAVE] family_id={data.get('family_id')}, file_url={data.get('file_url')[:50]}...")
                        
                        cur.execute(f'''
                            INSERT INTO {schema}.children_medical_documents 
                            (id, child_id, family_id, document_type, file_url, file_type, 
                             original_filename, file_size, related_id, related_type, 
                             title, description, uploaded_by, uploaded_at)
                            VALUES ({escape_sql_string(data.get('id'))}, {child_id_safe}, 
                                    {escape_sql_string(data.get('family_id', ''))}, 
                                    {escape_sql_string(data.get('document_type'))}, 
                                    {escape_sql_string(data.get('file_url'))}, 
                                    {escape_sql_string(data.get('file_type'))}, 
                                    {escape_sql_string(data.get('original_filename'))}, 
                                    {escape_sql_string(data.get('file_size', 0))}, 
                                    {escape_sql_string(data.get('related_id'))}, 
                                    {escape_sql_string(data.get('related_type'))}, 
                                    {escape_sql_string(data.get('title'))}, 
                                    {escape_sql_string(data.get('description'))}, 
                                    {escape_sql_string(data.get('uploaded_by', ''))}, 
                                    {escape_sql_string(data.get('uploaded_at', datetime.now().isoformat()))})
                        ''')
                        conn.commit()
                        result_id = data.get('id')
                        print(f"[DOC SAVE] Successfully saved document {result_id}")
                        
                    except Exception as doc_error:
                        print(f"[DOC SAVE ERROR] Failed to save document: {str(doc_error)}")
                        conn.rollback()
                        return {
                            'statusCode': 500,
                            'headers': headers,
                            'body': json.dumps({'success': False, 'error': f'Ошибка сохранения документа: {str(doc_error)}'})
                        }
                    
                elif data_type == 'medication':
                    try:
                        print(f"[MED ADD] Starting medication add: {data.get('name')}")
                        
                        # Проверка обязательных полей до шифрования
                        med_name = (data.get('name') or '').strip()
                        if not med_name:
                            return {
                                'statusCode': 400,
                                'headers': headers,
                                'body': json.dumps({'success': False, 'error': 'Укажите название лекарства'})
                            }
                        
                        family_id_val = data.get('family_id') or ''
                        if not family_id_val:
                            return {
                                'statusCode': 400,
                                'headers': headers,
                                'body': json.dumps({'success': False, 'error': 'Не указан family_id'})
                            }
                        
                        med_start = data.get('start_date') or datetime.now().date().isoformat()
                        med_end = data.get('end_date') or None
                        med_frequency = (data.get('frequency') or '1 раз в день').strip()
                        med_dosage = (data.get('dosage') or '1 таблетка').strip()
                        med_instructions = data.get('instructions') or ''
                        
                        # Формируем данные для шифрования
                        encrypt_input = {
                            'name': med_name,
                            'start_date': med_start,
                            'end_date': med_end,
                            'frequency': med_frequency,
                            'dosage': med_dosage,
                            'instructions': med_instructions,
                        }
                        encrypted_data = encrypt_medical_fields(encrypt_input)
                        
                        cur.execute(f"""
                            INSERT INTO {schema}.children_medications (member_id, family_id, name, start_date, end_date, frequency, dosage, instructions)
                            VALUES ({child_id_safe}, {escape_sql_string(family_id_val)}, 
                                    {escape_sql_string(encrypted_data.get('name') or med_name)}, 
                                    {escape_sql_string(encrypted_data.get('start_date') or med_start)}, 
                                    {escape_sql_string(encrypted_data.get('end_date'))}, 
                                    {escape_sql_string(encrypted_data.get('frequency') or med_frequency)}, 
                                    {escape_sql_string(encrypted_data.get('dosage') or med_dosage)}, 
                                    {escape_sql_string(encrypted_data.get('instructions') or med_instructions)}) 
                            RETURNING id
                        """)
                        result_id = cur.fetchone()['id']
                        print(f"[MED ADD] Created medication ID: {result_id}")
                        
                        times = data.get('times', [])
                        print(f"[MED ADD] Times to schedule: {times}")
                        
                        if not times:
                            print("[MED ADD ERROR] No times provided!")
                            conn.commit()
                            return {
                                'statusCode': 400,
                                'headers': headers,
                                'body': json.dumps({'success': False, 'error': 'Необходимо указать время приёма'})
                            }
                        
                        start = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
                        end = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
                        print(f"[MED ADD] Date range: {start} to {end}")
                        
                        schedule_count = 0
                        intake_count = 0
                        
                        for time_str in times:
                            print(f"[MED ADD] Creating schedule for time: {time_str}")
                            cur.execute(f"""
                                INSERT INTO {schema}.children_medication_schedule (medication_id, time_of_day)
                                VALUES ({escape_sql_string(result_id)}, {escape_sql_string(time_str)})
                                RETURNING id
                            """)
                            schedule_id = cur.fetchone()['id']
                            schedule_count += 1
                            print(f"[MED ADD] Created schedule ID: {schedule_id}")
                            
                            current = start
                            while current <= end:
                                cur.execute(f"""
                                    INSERT INTO {schema}.children_medication_intake 
                                    (medication_id, schedule_id, scheduled_date, scheduled_time, taken)
                                    VALUES ({escape_sql_string(result_id)}, {escape_sql_string(schedule_id)}, 
                                            {escape_sql_string(str(current))}, {escape_sql_string(time_str)}, FALSE)
                                """)
                                intake_count += 1
                                current += timedelta(days=1)
                        
                        print(f"[MED ADD] Created {schedule_count} schedules, {intake_count} intakes")
                        conn.commit()
                        print(f"[MED ADD] Successfully committed medication {result_id}")
                        
                    except Exception as med_error:
                        print(f"[MED ADD ERROR] Failed to add medication: {str(med_error)}")
                        conn.rollback()
                        return {
                            'statusCode': 500,
                            'headers': headers,
                            'body': json.dumps({'success': False, 'error': f'Ошибка добавления лекарства: {str(med_error)}'})
                        }
                    
                elif data_type == 'grade':
                    # Grades хранятся через school_id, не member_id.
                    # Ищем запись школы; если нет — создаём с дефолтными данными.
                    cur.execute(f"""
                        SELECT id FROM {schema}.children_school
                        WHERE member_id = {child_id_safe} LIMIT 1
                    """)
                    school_row = cur.fetchone()
                    if school_row:
                        school_id = school_row['id']
                    else:
                        family_id_val = escape_sql_string(data.get('family_id', ''))
                        cur.execute(f"""
                            INSERT INTO {schema}.children_school (member_id, family_id)
                            VALUES ({child_id_safe}, {family_id_val})
                            RETURNING id
                        """)
                        school_id = cur.fetchone()['id']
                    cur.execute(f"""
                        INSERT INTO {schema}.children_grades (school_id, subject, grade, date, notes)
                        VALUES ({escape_sql_string(school_id)},
                                {escape_sql_string(data.get('subject'))}, 
                                {escape_sql_string(data.get('grade'))},
                                {escape_sql_string(data.get('date'))}, 
                                {escape_sql_string(data.get('notes', ''))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'diary':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_diary (member_id, family_id, date, entry)
                        VALUES ({child_id_safe}, {escape_sql_string(data.get('family_id', ''))}, 
                                {escape_sql_string(data.get('date'))}, {escape_sql_string(data.get('entry'))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'transaction':
                    piggybank_id = data.get('piggybank_id')
                    cur.execute(f"""
                        INSERT INTO {schema}.children_transactions 
                        (piggybank_id, amount, type, description, date)
                        VALUES ({escape_sql_string(piggybank_id)}, {escape_sql_string(data.get('amount'))}, 
                                {escape_sql_string(data.get('type'))}, {escape_sql_string(data.get('description', ''))}, 
                                {escape_sql_string(data.get('date', datetime.now().date()))}) 
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    
                    cur.execute(f"""
                        UPDATE {schema}.children_piggybank 
                        SET balance = balance + {escape_sql_string(data.get('amount'))}
                        WHERE id = {escape_sql_string(piggybank_id)}
                    """)
                    conn.commit()
                    
                elif data_type == 'development_area':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_development 
                        (member_id, family_id, area, current_level, target_level)
                        VALUES ({child_id_safe}, {escape_sql_string(data.get('family_id', ''))},
                                {escape_sql_string(data.get('area'))}, {escape_sql_string(data.get('current_level', 0))},
                                {escape_sql_string(data.get('target_level', 100))})
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'activity':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_activities 
                        (development_id, type, name, schedule, cost, status)
                        VALUES ({escape_sql_string(data.get('development_id'))}, {escape_sql_string(data.get('type'))},
                                {escape_sql_string(data.get('name'))}, {escape_sql_string(data.get('schedule', ''))},
                                {escape_sql_string(data.get('cost', 0))}, {escape_sql_string(data.get('status', 'active'))})
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'test':
                    cur.execute(f"""
                        INSERT INTO {schema}.children_tests 
                        (development_id, test_name, date, result, notes)
                        VALUES ({escape_sql_string(data.get('development_id'))}, {escape_sql_string(data.get('test_name'))},
                                {escape_sql_string(data.get('date'))}, {escape_sql_string(data.get('result', ''))},
                                {escape_sql_string(data.get('notes', ''))})
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                elif data_type == 'purchase_item':
                    family_id = data.get('family_id', '')
                    season = data.get('season', 'winter')
                    category = data.get('category', 'Одежда')
                    
                    cur.execute(f"""
                        SELECT id FROM {schema}.children_purchase_plans 
                        WHERE member_id = {child_id_safe} AND season = {escape_sql_string(season)}
                        LIMIT 1
                    """)
                    plan = cur.fetchone()
                    
                    if plan:
                        plan_id = plan['id']
                    else:
                        cur.execute(f"""
                            INSERT INTO {schema}.children_purchase_plans 
                            (member_id, family_id, season, category)
                            VALUES ({child_id_safe}, {escape_sql_string(family_id)}, 
                                    {escape_sql_string(season)}, {escape_sql_string(category)})
                            RETURNING id
                        """)
                        plan_id = cur.fetchone()['id']
                    
                    cur.execute(f"""
                        INSERT INTO {schema}.children_purchase_items 
                        (plan_id, name, priority, estimated_cost, purchased)
                        VALUES ({escape_sql_string(plan_id)}, {escape_sql_string(data.get('name'))},
                                {escape_sql_string(data.get('priority', 'medium'))}, 
                                {escape_sql_string(data.get('estimated_cost'))},
                                FALSE)
                        RETURNING id
                    """)
                    result_id = cur.fetchone()['id']
                    conn.commit()
                    
                else:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': f'Неизвестный тип данных: {data_type}'})
                    }
                
                # Enqueue (autocommit conn) + fast-path после source commit
                _add_actor_uid = None
                if data_type in _PORTFOLIO_TYPES:
                    try:
                        _add_actor_uid = _get_actor_user_id(child_id, cur)
                        _eq_conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
                        _eq_conn.autocommit = True
                        _eq_cur = _eq_conn.cursor()
                        try:
                            enqueue_portfolio_rebuild(
                                cur=_eq_cur,
                                member_ids=[child_id],
                                requested_by_user_id=_add_actor_uid,
                                reason=f'children-data:{data_type}:add',
                            )
                        finally:
                            _eq_cur.close()
                            _eq_conn.close()
                    except Exception as _pe:
                        print(f'[PORTFOLIO_ENQUEUE] error: {_pe}')

                cur.close()
                conn.close()

                if data_type in _PORTFOLIO_TYPES and _add_actor_uid:
                    try:
                        trigger_fast_path(
                            [child_id], _add_actor_uid,
                            reason=f'children-data:{data_type}:add',
                            force_fail=_force_refresh_fail,
                        )
                    except Exception as _pe:
                        print(f'[PORTFOLIO_FAST_PATH] error: {_pe}')

                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'id': result_id})
                }
                
            elif action == 'update':
                record_id = body.get('item_id')
                if not record_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'Не указан item_id'})
                    }
                
                record_id_safe = escape_sql_string(record_id)
                
                if data_type == 'vaccination':
                    cur.execute(f"""
                        UPDATE {schema}.children_vaccinations 
                        SET date = {escape_sql_string(data.get('date'))}, 
                            vaccine = {escape_sql_string(data.get('vaccine'))}, 
                            notes = {escape_sql_string(data.get('notes', ''))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'doctor_visit':
                    cur.execute(f"""
                        UPDATE {schema}.children_doctor_visits 
                        SET date = {escape_sql_string(data.get('date'))}, 
                            doctor = {escape_sql_string(data.get('doctor'))}, 
                            specialty = {escape_sql_string(data.get('specialty'))},
                            status = {escape_sql_string(data.get('status'))},
                            notes = {escape_sql_string(data.get('notes', ''))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'gift':
                    cur.execute(f"""
                        UPDATE {schema}.children_gifts 
                        SET event = {escape_sql_string(data.get('event'))}, 
                            date = {escape_sql_string(data.get('date'))}, 
                            gift = {escape_sql_string(data.get('gift'))},
                            given = {escape_sql_string(data.get('given'))},
                            notes = {escape_sql_string(data.get('notes', ''))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'dream':
                    cur.execute(f"""
                        UPDATE {schema}.children_dreams 
                        SET title = {escape_sql_string(data.get('title'))}, 
                            description = {escape_sql_string(data.get('description', ''))},
                            achieved = {escape_sql_string(data.get('achieved', False))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'grade':
                    cur.execute(f"""
                        UPDATE {schema}.children_grades 
                        SET subject = {escape_sql_string(data.get('subject'))}, 
                            grade = {escape_sql_string(data.get('grade'))},
                            date = {escape_sql_string(data.get('date'))},
                            notes = {escape_sql_string(data.get('notes', ''))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'diary':
                    cur.execute(f"""
                        UPDATE {schema}.children_diary 
                        SET date = {escape_sql_string(data.get('date'))}, 
                            entry = {escape_sql_string(data.get('entry'))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'medication':
                    print(f"[MED UPDATE] Updating medication {record_id_safe}")
                    cur.execute(f"""
                        UPDATE {schema}.children_medications 
                        SET name = {escape_sql_string(data.get('name'))}, 
                            start_date = {escape_sql_string(data.get('start_date'))},
                            end_date = {escape_sql_string(data.get('end_date'))},
                            frequency = {escape_sql_string(data.get('frequency', ''))},
                            dosage = {escape_sql_string(data.get('dosage', ''))},
                            instructions = {escape_sql_string(data.get('instructions', ''))}
                        WHERE id = {record_id_safe}
                    """)
                    
                    cur.execute(f"DELETE FROM {schema}.children_medication_schedule WHERE medication_id = {record_id_safe}")
                    cur.execute(f"DELETE FROM {schema}.children_medication_intake WHERE medication_id = {record_id_safe}")
                    print(f"[MED UPDATE] Deleted old schedule and intakes")
                    
                    times = data.get('times', [])
                    start = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
                    end = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
                    
                    for time_str in times:
                        cur.execute(f"""
                            INSERT INTO {schema}.children_medication_schedule (medication_id, time_of_day)
                            VALUES ({record_id_safe}, {escape_sql_string(time_str)})
                            RETURNING id
                        """)
                        schedule_id = cur.fetchone()['id']
                        
                        current = start
                        while current <= end:
                            cur.execute(f"""
                                INSERT INTO {schema}.children_medication_intake 
                                (medication_id, schedule_id, scheduled_date, scheduled_time, taken)
                                VALUES ({record_id_safe}, {escape_sql_string(schedule_id)}, 
                                        {escape_sql_string(str(current))}, {escape_sql_string(time_str)}, FALSE)
                            """)
                            current += timedelta(days=1)
                    
                    print(f"[MED UPDATE] Recreated schedule with {len(times)} times")
                    
                elif data_type == 'development_area':
                    cur.execute(f"""
                        UPDATE {schema}.children_development 
                        SET area = {escape_sql_string(data.get('area'))}, 
                            current_level = {escape_sql_string(data.get('current_level'))},
                            target_level = {escape_sql_string(data.get('target_level'))}
                        WHERE id = {record_id_safe}
                    """)
                    
                elif data_type == 'purchase_item':
                    update_fields = []
                    if 'purchased' in data:
                        purchased = data.get('purchased')
                        update_fields.append(f"purchased = {escape_sql_string(purchased)}")
                        if purchased:
                            update_fields.append(f"purchase_date = CURRENT_DATE")
                        else:
                            update_fields.append(f"purchase_date = NULL")
                    
                    if 'name' in data:
                        update_fields.append(f"name = {escape_sql_string(data.get('name'))}")
                    if 'priority' in data:
                        update_fields.append(f"priority = {escape_sql_string(data.get('priority'))}")
                    if 'estimated_cost' in data:
                        update_fields.append(f"estimated_cost = {escape_sql_string(data.get('estimated_cost'))}")
                    
                    if update_fields:
                        cur.execute(f"""
                            UPDATE {schema}.children_purchase_items 
                            SET {', '.join(update_fields)}
                            WHERE id = {record_id_safe}
                        """)
                    
                else:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': f'Неизвестный тип данных: {data_type}'})
                    }
                
                conn.commit()

                _upd_actor_uid = None
                if data_type in _PORTFOLIO_TYPES:
                    try:
                        _upd_actor_uid = _get_actor_user_id(child_id, cur)
                        _eq_conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
                        _eq_conn.autocommit = True
                        _eq_cur = _eq_conn.cursor()
                        try:
                            enqueue_portfolio_rebuild(
                                cur=_eq_cur,
                                member_ids=[child_id],
                                requested_by_user_id=_upd_actor_uid,
                                reason=f'children-data:{data_type}:update',
                            )
                        finally:
                            _eq_cur.close()
                            _eq_conn.close()
                    except Exception as _pe:
                        print(f'[PORTFOLIO_ENQUEUE] error: {_pe}')

                cur.close()
                conn.close()

                if data_type in _PORTFOLIO_TYPES and _upd_actor_uid:
                    try:
                        trigger_fast_path(
                            [child_id], _upd_actor_uid,
                            reason=f'children-data:{data_type}:update',
                            force_fail=_force_refresh_fail,
                        )
                    except Exception as _pe:
                        print(f'[PORTFOLIO_FAST_PATH] error: {_pe}')

                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True})
                }
                
            elif action == 'delete':
                record_id = body.get('item_id')
                if not record_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'Не указан item_id'})
                    }
                
                record_id_safe = escape_sql_string(record_id)
                
                table_map = {
                    'vaccination': 'children_vaccinations',
                    'doctor_visit': 'children_doctor_visits',
                    'gift': 'children_gifts',
                    'dream': 'children_dreams',
                    'grade': 'children_grades',
                    'diary': 'children_diary',
                    'medication': 'children_medications',
                    'development_area': 'children_development',
                    'activity': 'children_activities',
                    'test': 'children_tests',
                    'mood': 'children_mood_entries'
                }
                
                if data_type not in table_map:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': f'Неизвестный тип данных: {data_type}'})
                    }
                
                cur.execute(f"DELETE FROM {schema}.{table_map[data_type]} WHERE id = {record_id_safe}")
                conn.commit()

                _del_actor_uid = None
                if data_type in _PORTFOLIO_TYPES:
                    try:
                        _del_actor_uid = _get_actor_user_id(child_id, cur)
                        _eq_conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
                        _eq_conn.autocommit = True
                        _eq_cur = _eq_conn.cursor()
                        try:
                            enqueue_portfolio_rebuild(
                                cur=_eq_cur,
                                member_ids=[child_id],
                                requested_by_user_id=_del_actor_uid,
                                reason=f'children-data:{data_type}:delete',
                            )
                        finally:
                            _eq_cur.close()
                            _eq_conn.close()
                    except Exception as _pe:
                        print(f'[PORTFOLIO_ENQUEUE] error: {_pe}')

                cur.close()
                conn.close()

                if data_type in _PORTFOLIO_TYPES and _del_actor_uid:
                    try:
                        trigger_fast_path(
                            [child_id], _del_actor_uid,
                            reason=f'children-data:{data_type}:delete',
                            force_fail=_force_refresh_fail,
                        )
                    except Exception as _pe:
                        print(f'[PORTFOLIO_FAST_PATH] error: {_pe}')

                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'mark_intake':
                intake_id = data.get('intake_id')
                taken = data.get('taken', True)
                
                if not intake_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'Не указан intake_id'})
                    }
                
                intake_id_safe = escape_sql_string(intake_id)
                taken_safe = escape_sql_string(taken)
                
                if taken:
                    cur.execute(f"""
                        UPDATE {schema}.children_medication_intake 
                        SET taken = TRUE, taken_at = CURRENT_TIMESTAMP
                        WHERE id = {intake_id_safe}
                    """)
                else:
                    cur.execute(f"""
                        UPDATE {schema}.children_medication_intake 
                        SET taken = FALSE, taken_at = NULL
                        WHERE id = {intake_id_safe}
                    """)
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'rebuild_medication_schedule':
                print(f"[REBUILD] Starting schedule rebuild for child {child_id}")
                
                cur.execute(f"SELECT * FROM {schema}.children_medications WHERE member_id = {child_id_safe}")
                medications = [dict(row) for row in cur.fetchall()]
                print(f"[REBUILD] Found {len(medications)} medications to rebuild")
                
                rebuilt_count = 0
                for med in medications:
                    med_id = med['id']
                    med_id_safe = escape_sql_string(med_id)
                    
                    cur.execute(f"SELECT COUNT(*) as cnt FROM {schema}.children_medication_schedule WHERE medication_id = {med_id_safe}")
                    schedule_count = cur.fetchone()['cnt']
                    
                    if schedule_count > 0:
                        print(f"[REBUILD] Medication {med['name']} (ID: {med_id}) already has schedule, skipping")
                        continue
                    
                    print(f"[REBUILD] Rebuilding schedule for {med['name']} (ID: {med_id})")
                    
                    default_time = '09:00'
                    start = datetime.strptime(str(med['start_date']), '%Y-%m-%d').date() if isinstance(med['start_date'], str) else med['start_date']
                    print(f"[REBUILD] Executing INSERT for med_id={med_id}, time={default_time}, date={start}")
                    
                    try:
                        cur.execute(f"""
                            INSERT INTO {schema}.children_medication_schedule (medication_id, date, time, time_of_day)
                            VALUES ({med_id_safe}, {escape_sql_string(str(start))}, {escape_sql_string(default_time)}, {escape_sql_string(default_time)})
                        """)
                        print(f"[REBUILD] INSERT executed, now committing...")
                        conn.commit()
                        print(f"[REBUILD] Commit completed, now querying for schedule_id")
                        
                        cur.execute(f"SELECT id FROM {schema}.children_medication_schedule WHERE medication_id = {med_id_safe} AND date = {escape_sql_string(str(start))} ORDER BY id DESC LIMIT 1")
                        result = cur.fetchone()
                        print(f"[REBUILD] SELECT result: {result}")
                        
                        if not result:
                            print(f"[REBUILD ERROR] Failed to find created schedule for med_id={med_id}")
                            continue
                        
                        schedule_id = result['id']
                        print(f"[REBUILD] Created schedule_id: {schedule_id}")
                    except Exception as rebuild_error:
                        print(f"[REBUILD ERROR] Exception during rebuild: {str(rebuild_error)}")
                        conn.rollback()
                        continue
                    
                    end = datetime.strptime(str(med['end_date']), '%Y-%m-%d').date() if isinstance(med['end_date'], str) else med['end_date']
                    current = start
                    print(f"[REBUILD] Date range: {start} to {end}")
                    
                    intake_count = 0
                    while current <= end:
                        cur.execute(f"""
                            INSERT INTO {schema}.children_medication_intake 
                            (medication_id, schedule_id, scheduled_date, scheduled_time, taken)
                            VALUES ({med_id_safe}, {schedule_id}, 
                                    {escape_sql_string(str(current))}, {escape_sql_string(default_time)}, FALSE)
                        """)
                        intake_count += 1
                        current += timedelta(days=1)
                    
                    print(f"[REBUILD] Created schedule and {intake_count} intakes for {med['name']}")
                    rebuilt_count += 1
                
                conn.commit()
                print(f"[REBUILD] Successfully rebuilt {rebuilt_count} medications")
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'rebuilt': rebuilt_count})
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': f'Неизвестное действие: {action}'})
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