"""
Business: Синхронизация всех данных семьи (задачи, события, профили детей, тесты, блог, альбом, древо, чат)
Args: event с httpMethod, body, headers (X-Auth-Token)
Returns: JSON с данными семьи или ошибкой
"""

import json
import os
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = '"t_p5815085_family_assistant_pro"'

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, list):
        return "'" + json.dumps(value).replace("'", "''") + "'"
    if isinstance(value, dict):
        return "'" + json.dumps(value).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT s.user_id, fm.family_id, fm.id as member_id
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
            WHERE s.token = {escape_string(token)} 
            AND s.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        """
        cur.execute(query)
        result = cur.fetchone()
        
        if result:
            return {
                'user_id': result['user_id'],
                'family_id': result['family_id'],
                'member_id': result['member_id']
            }
        return None
    finally:
        cur.close()
        conn.close()

def get_family_data(family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        data = {}
        
        # Члены семьи
        cur.execute(f"""
            SELECT id, name, role, avatar, avatar_type, photo_url, 
                   points, level, workload, age, achievements, 
                   food_preferences, responsibilities, mood_status
            FROM {SCHEMA}.family_members 
            WHERE family_id = {escape_string(family_id)}
        """)
        data['members'] = [dict(row) for row in cur.fetchall()]
        
        # Задачи
        cur.execute(f"""
            SELECT id, title, assignee, completed, category, points, 
                   deadline, reminder_time, shopping_list, is_recurring,
                   recurring_pattern, next_occurrence
            FROM {SCHEMA}.tasks 
            WHERE family_id = {escape_string(family_id)}
            ORDER BY created_at DESC
        """)
        data['tasks'] = [dict(row) for row in cur.fetchall()]
        
        # Профили детей
        cur.execute(f"""
            SELECT cp.*, fm.name as child_name, fm.avatar, fm.age
            FROM {SCHEMA}.children_profiles cp
            JOIN {SCHEMA}.family_members fm ON cp.child_member_id = fm.id
            WHERE cp.family_id = {escape_string(family_id)}
        """)
        data['children_profiles'] = [dict(row) for row in cur.fetchall()]
        
        # Результаты тестов
        cur.execute(f"""
            SELECT tr.*, fm.name as child_name
            FROM {SCHEMA}.test_results tr
            JOIN {SCHEMA}.family_members fm ON tr.child_member_id = fm.id
            WHERE fm.family_id = {escape_string(family_id)}
            ORDER BY tr.date DESC
        """)
        data['test_results'] = [dict(row) for row in cur.fetchall()]
        
        # Календарные события
        cur.execute(f"""
            SELECT * FROM {SCHEMA}.calendar_events 
            WHERE family_id = {escape_string(family_id)}
            ORDER BY date DESC
            LIMIT 100
        """)
        data['calendar_events'] = [dict(row) for row in cur.fetchall()]
        
        # Семейные ценности
        cur.execute(f"""
            SELECT * FROM {SCHEMA}.family_values 
            WHERE family_id = {escape_string(family_id)}
        """)
        data['family_values'] = [dict(row) for row in cur.fetchall()]
        
        # Традиции
        cur.execute(f"""
            SELECT * FROM {SCHEMA}.traditions 
            WHERE family_id = {escape_string(family_id)}
        """)
        data['traditions'] = [dict(row) for row in cur.fetchall()]
        
        # Блог
        cur.execute(f"""
            SELECT bp.*, fm.name as author_name
            FROM {SCHEMA}.blog_posts bp
            LEFT JOIN {SCHEMA}.family_members fm ON bp.author_id = fm.id
            WHERE bp.family_id = {escape_string(family_id)}
            ORDER BY bp.created_at DESC
            LIMIT 50
        """)
        data['blog_posts'] = [dict(row) for row in cur.fetchall()]
        
        # Альбом
        cur.execute(f"""
            SELECT fa.*, fm.name as uploaded_by_name
            FROM {SCHEMA}.family_album fa
            LEFT JOIN {SCHEMA}.family_members fm ON fa.uploaded_by = fm.id
            WHERE fa.family_id = {escape_string(family_id)}
            ORDER BY fa.created_at DESC
            LIMIT 100
        """)
        data['family_album'] = [dict(row) for row in cur.fetchall()]
        
        # Генеалогическое древо
        cur.execute(f"""
            SELECT * FROM {SCHEMA}.family_tree 
            WHERE family_id = {escape_string(family_id)}
        """)
        data['family_tree'] = [dict(row) for row in cur.fetchall()]
        
        # Чат (последние 100 сообщений)
        cur.execute(f"""
            SELECT cm.*, fm.name as sender_name, fm.avatar as sender_avatar
            FROM {SCHEMA}.chat_messages cm
            LEFT JOIN {SCHEMA}.family_members fm ON cm.sender_id = fm.id
            WHERE cm.family_id = {escape_string(family_id)}
            ORDER BY cm.created_at DESC
            LIMIT 100
        """)
        data['chat_messages'] = [dict(row) for row in cur.fetchall()]
        
        # Потребности семьи
        try:
            cur.execute(f"""
                SELECT * FROM {SCHEMA}.family_needs 
                WHERE family_id = {escape_string(family_id)}
                ORDER BY created_at DESC
            """)
            data['family_needs'] = [dict(row) for row in cur.fetchall()]
        except:
            data['family_needs'] = []
        
        return data
    finally:
        cur.close()
        conn.close()

def save_test_result(family_id: str, child_member_id: int, test_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            INSERT INTO {SCHEMA}.test_results 
            (child_member_id, test_type, scores, total_score, max_score, time_spent, answers)
            VALUES (
                {escape_string(child_member_id)},
                {escape_string(test_data.get('testType'))},
                {escape_string(test_data.get('scores'))},
                {escape_string(test_data.get('totalScore'))},
                {escape_string(test_data.get('maxScore'))},
                {escape_string(test_data.get('timeSpent'))},
                {escape_string(test_data.get('answers'))}
            )
            RETURNING id
        """
        cur.execute(query)
        result = cur.fetchone()
        
        return {'success': True, 'id': result['id']}
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        cur.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        all_headers = event.get('headers', {})
        token = all_headers.get('X-Auth-Token', '') or all_headers.get('x-auth-token', '')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        user_data = verify_token(token)
        if not user_data:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Недействительный токен'}),
                'isBase64Encoded': False
            }
        
        family_id = user_data['family_id']
        
        if method == 'GET':
            data = get_family_data(family_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'data': data}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            raw_body = event.get('body') or '{}'
            body = json.loads(raw_body) if raw_body else {}
            
            action = body.get('action')
            
            if action == 'save_test_result':
                child_member_id = body.get('childMemberId')
                test_data = body.get('testData')
                
                if not child_member_id or not test_data:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Не указаны данные теста'}),
                        'isBase64Encoded': False
                    }
                
                result = save_test_result(family_id, child_member_id, test_data)
                
                if result.get('success'):
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 500,
                        'headers': headers,
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
            
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR: {str(e)}")
        print(f"TRACEBACK: {error_details}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': f'Ошибка сервера: {str(e)}',
                'traceback': traceback.format_exc()
            }),
            'isBase64Encoded': False
        }