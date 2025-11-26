"""
Business: CRUD операции для задач семьи с поддержкой повторяющихся задач
Args: event с httpMethod, body (title, assignee_id, points, etc), headers с X-Auth-Token
Returns: JSON со списком задач или результатом операции
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = {escape_string(token)} AND expires_at > CURRENT_TIMESTAMP
    """
    cur.execute(query)
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    cur.execute(query)
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member and member['family_id'] else None

def get_tasks(family_id: str, completed: Optional[bool] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    where_clause = f"WHERE t.family_id::text = {escape_string(family_id)}"
    if completed is not None:
        where_clause += f" AND t.completed = {escape_string(completed)}"
    
    query = f"""
        SELECT t.*, fm.name as assignee_name
        FROM {SCHEMA}.tasks t
        LEFT JOIN {SCHEMA}.family_members fm ON t.assignee_id = fm.id
        {where_clause}
        ORDER BY t.created_at DESC
    """
    
    cur.execute(query)
    tasks = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(task) for task in tasks]

def create_task(family_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        INSERT INTO {SCHEMA}.tasks (
            family_id, title, description, assignee_id, completed, 
            points, priority, category, deadline, reminder_time, is_recurring,
            recurring_frequency, recurring_interval, recurring_days_of_week,
            recurring_end_date, next_occurrence, cooking_day
        ) VALUES (
            {escape_string(family_id)},
            {escape_string(data.get('title'))},
            {escape_string(data.get('description'))},
            {escape_string(data.get('assignee_id'))},
            {escape_string(data.get('completed', False))},
            {escape_string(data.get('points', 10))},
            {escape_string(data.get('priority', 'medium'))},
            {escape_string(data.get('category'))},
            {escape_string(data.get('deadline'))},
            {escape_string(data.get('reminder_time'))},
            {escape_string(data.get('is_recurring', False))},
            {escape_string(data.get('recurring_frequency'))},
            {escape_string(data.get('recurring_interval'))},
            {escape_string(data.get('recurring_days_of_week'))},
            {escape_string(data.get('recurring_end_date'))},
            {escape_string(data.get('next_occurrence'))},
            {escape_string(data.get('cooking_day'))}
        )
        RETURNING *
    """
    
    print(f"[create_task] Executing query: {query[:200]}...")
    
    try:
        cur.execute(query)
        task = cur.fetchone()
        print(f"[create_task] Task created successfully: {task}")
        cur.close()
        conn.close()
        return dict(task) if task else {}
    except Exception as e:
        print(f"[create_task] Error: {e}")
        cur.close()
        conn.close()
        raise

def update_task(task_id: str, family_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    check_query = f"SELECT id FROM {SCHEMA}.tasks WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(check_query)
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {'error': 'Задача не найдена'}
    
    fields = []
    
    for field in ['title', 'description', 'assignee_id', 'completed', 'points', 
                  'priority', 'category', 'deadline', 'reminder_time', 'is_recurring',
                  'recurring_frequency', 'recurring_interval', 'recurring_days_of_week',
                  'recurring_end_date', 'next_occurrence', 'cooking_day']:
        if field in data:
            fields.append(f"{field} = {escape_string(data[field])}")
    
    if not fields:
        cur.close()
        conn.close()
        return {'error': 'Нет данных для обновления'}
    
    fields.append("updated_at = CURRENT_TIMESTAMP")
    
    query = f"""
        UPDATE {SCHEMA}.tasks 
        SET {', '.join(fields)}
        WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}
        RETURNING *
    """
    
    cur.execute(query)
    task = cur.fetchone()
    cur.close()
    conn.close()
    
    return dict(task)

def delete_task(task_id: str, family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    check_query = f"SELECT id FROM {SCHEMA}.tasks WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(check_query)
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {'error': 'Задача не найдена'}
    
    update_query = f"UPDATE {SCHEMA}.tasks SET completed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(update_query)
    cur.close()
    conn.close()
    
    return {'success': True}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
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
    
    try:
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        family_id = get_user_family_id(user_id)
        if not family_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Пользователь не привязан к семье'})
            }
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            completed_param = params.get('completed')
            completed = None if completed_param is None else completed_param.lower() == 'true'
            
            tasks = get_tasks(family_id, completed)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'tasks': tasks}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            print(f"[POST] Creating task with data: {body}")
            print(f"[POST] Family ID: {family_id}")
            task = create_task(family_id, body)
            print(f"[POST] Task created: {task}")
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'task': task}, default=str)
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID задачи'})
                }
            
            task = update_task(task_id, family_id, body)
            if 'error' in task:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps(task)
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'task': task}, default=str)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            task_id = params.get('id')
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID задачи'})
                }
            
            result = delete_task(task_id, family_id)
            if 'error' in result:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        print(f"[ERROR] Exception occurred: {error_details}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'type': type(e).__name__})
        }