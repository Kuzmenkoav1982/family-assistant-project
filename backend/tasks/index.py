"""
Business: CRUD операции для задач семьи (tasks_v2 без FK constraints)
Args: event с httpMethod, body (title, assignee_id, points, etc), headers с X-Auth-Token
Returns: JSON со списком задач или результатом операции
"""

import json
import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = '"t_p5815085_family_assistant_pro"'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any, is_uuid: bool = False) -> str:
    if value is None or value == '':
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    
    escaped = "'" + str(value).replace("'", "''") + "'"
    if is_uuid:
        return f"{escaped}::uuid"
    return escaped

def verify_token(token: str) -> Optional[str]:
    if not token or token == '':
        return None
        
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
        WHERE user_id = {escape_string(user_id, is_uuid=True)} LIMIT 1
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
        FROM {SCHEMA}.tasks_v2 t
        LEFT JOIN {SCHEMA}.family_members fm ON t.assignee_id::text = fm.id::text
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
    
    task_id = f"'{str(uuid.uuid4())}'"
    
    insert_query = f"""
        INSERT INTO {SCHEMA}.tasks_v2 (
            id, family_id, title, description, assignee_id, completed, 
            points, priority, category, deadline
        ) VALUES (
            {task_id}::uuid,
            {escape_string(family_id)}::uuid,
            {escape_string(data.get('title'))},
            {escape_string(data.get('description') or '')},
            {escape_string(data.get('assignee_id'))}::uuid,
            {escape_string(data.get('completed', False))},
            {escape_string(data.get('points', 10))},
            {escape_string(data.get('priority', 'medium'))},
            {escape_string(data.get('category') or 'Дом')},
            {escape_string(data.get('deadline'))}
        )
    """
    
    print(f"[create_task] Insert query: {insert_query}")
    
    try:
        cur.execute(insert_query)
        print(f"[create_task] Task inserted, fetching...")
        
        select_query = f"SELECT * FROM {SCHEMA}.tasks_v2 WHERE id = {task_id}::uuid"
        cur.execute(select_query)
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
    
    # Получаем текущую задачу
    check_query = f"SELECT id, assignee_id, completed, points FROM {SCHEMA}.tasks_v2 WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(check_query)
    old_task = cur.fetchone()
    if not old_task:
        cur.close()
        conn.close()
        return {'error': 'Задача не найдена'}
    
    fields = []
    
    for field in ['title', 'description', 'assignee_id', 'completed', 'points', 
                  'priority', 'category', 'deadline']:
        if field in data:
            if field == 'assignee_id':
                fields.append(f"{field} = {escape_string(data[field])}::uuid")
            else:
                fields.append(f"{field} = {escape_string(data[field])}")
    
    if not fields:
        cur.close()
        conn.close()
        return {'error': 'Нет данных для обновления'}
    
    fields.append("updated_at = CURRENT_TIMESTAMP")
    
    query = f"""
        UPDATE {SCHEMA}.tasks_v2 
        SET {', '.join(fields)}
        WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}
        RETURNING *
    """
    
    cur.execute(query)
    task = cur.fetchone()
    
    # Если задача помечена как выполненная и у неё есть исполнитель и баллы - начислить баллы
    if data.get('completed') == True and not old_task['completed']:
        assignee_id = task['assignee_id'] or old_task['assignee_id']
        points = task['points'] or old_task['points'] or 0
        
        if assignee_id and points > 0:
            update_points_query = f"""
                UPDATE {SCHEMA}.family_members 
                SET points = points + {points}
                WHERE id::text = {escape_string(str(assignee_id))}
            """
            cur.execute(update_points_query)
    
    cur.close()
    conn.close()
    
    return dict(task)

def delete_task(task_id: str, family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    check_query = f"SELECT id FROM {SCHEMA}.tasks_v2 WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(check_query)
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {'error': 'Задача не найдена'}
    
    # НАСТОЯЩЕЕ удаление из базы данных
    delete_query = f"DELETE FROM {SCHEMA}.tasks_v2 WHERE id::text = {escape_string(task_id)} AND family_id::text = {escape_string(family_id)}"
    print(f"[delete_task] Executing DELETE query for task_id: {task_id}")
    cur.execute(delete_query)
    print(f"[delete_task] Task deleted successfully")
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