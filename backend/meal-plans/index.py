"""
Business: Управление семейным меню на неделю
Args: event с httpMethod, body, queryStringParameters, headers с X-Auth-Token
Returns: JSON с меню семьи или результатом операции
"""

import json
import os
from typing import Dict, Any, List, Optional
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

def get_meal_plans(family_id: str) -> List[Dict[str, Any]]:
    """Получить все блюда меню семьи"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT 
            id::text, family_id::text, day, meal_type, dish_name, 
            description, emoji, added_by::text, added_by_name, 
            created_at, updated_at
        FROM {SCHEMA}.family_meal_plans
        WHERE family_id = {escape_string(family_id)}
        ORDER BY 
            CASE day
                WHEN 'monday' THEN 1
                WHEN 'tuesday' THEN 2
                WHEN 'wednesday' THEN 3
                WHEN 'thursday' THEN 4
                WHEN 'friday' THEN 5
                WHEN 'saturday' THEN 6
                WHEN 'sunday' THEN 7
            END,
            CASE meal_type
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
                WHEN 'snack' THEN 4
            END
    """
    cur.execute(query)
    meals = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    
    return meals

def add_meal_plan(family_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Добавить блюдо в меню"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            INSERT INTO {SCHEMA}.family_meal_plans
            (family_id, day, meal_type, dish_name, description, emoji, added_by, added_by_name)
            VALUES (
                {escape_string(family_id)},
                {escape_string(data.get('day'))},
                {escape_string(data.get('mealType'))},
                {escape_string(data.get('dishName'))},
                {escape_string(data.get('description'))},
                {escape_string(data.get('emoji'))},
                {escape_string(data.get('addedBy'))},
                {escape_string(data.get('addedByName'))}
            )
            RETURNING id::text, family_id::text, day, meal_type, dish_name, 
                      description, emoji, added_by::text, added_by_name, created_at, updated_at
        """
        cur.execute(query)
        meal = dict(cur.fetchone())
        cur.close()
        conn.close()
        
        return {'success': True, 'meal': meal}
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def update_meal_plan(meal_id: str, family_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить блюдо в меню"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        fields = []
        if 'dishName' in data:
            fields.append(f"dish_name = {escape_string(data['dishName'])}")
        if 'description' in data:
            fields.append(f"description = {escape_string(data['description'])}")
        if 'emoji' in data:
            fields.append(f"emoji = {escape_string(data['emoji'])}")
        if 'day' in data:
            fields.append(f"day = {escape_string(data['day'])}")
        if 'mealType' in data:
            fields.append(f"meal_type = {escape_string(data['mealType'])}")
        
        if not fields:
            cur.close()
            conn.close()
            return {'error': 'Нет данных для обновления'}
        
        fields.append("updated_at = CURRENT_TIMESTAMP")
        
        query = f"""
            UPDATE {SCHEMA}.family_meal_plans 
            SET {', '.join(fields)}
            WHERE id = {escape_string(meal_id)} AND family_id = {escape_string(family_id)}
            RETURNING id::text, family_id::text, day, meal_type, dish_name, 
                      description, emoji, added_by::text, added_by_name, created_at, updated_at
        """
        
        cur.execute(query)
        meal = cur.fetchone()
        cur.close()
        conn.close()
        
        if not meal:
            return {'error': 'Блюдо не найдено'}
        
        return {'success': True, 'meal': dict(meal)}
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def bulk_add_meal_plans(family_id: str, meals: List[Dict[str, Any]], added_by: str, added_by_name: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    added = 0
    
    try:
        for m in meals:
            query = f"""
                INSERT INTO {SCHEMA}.family_meal_plans
                (family_id, day, meal_type, dish_name, description, emoji, added_by, added_by_name)
                VALUES (
                    {escape_string(family_id)},
                    {escape_string(m.get('day'))},
                    {escape_string(m.get('mealType'))},
                    {escape_string(m.get('dishName'))},
                    {escape_string(m.get('description'))},
                    {escape_string(m.get('emoji'))},
                    {escape_string(added_by)},
                    {escape_string(added_by_name)}
                )
            """
            cur.execute(query)
            added += 1
        
        cur.close()
        conn.close()
        return {'success': True, 'added': added}
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}


def clear_meal_plans(family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = f"DELETE FROM {SCHEMA}.family_meal_plans WHERE family_id = {escape_string(family_id)}"
        cur.execute(query)
        cur.close()
        conn.close()
        return {'success': True}
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}


def get_user_name(user_id: str) -> str:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT name FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    cur.execute(query)
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    return row['name'] if row and row.get('name') else 'ИИ-Диетолог'


def delete_meal_plan(meal_id: str, family_id: str) -> Dict[str, Any]:
    """Удалить блюдо из меню"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = f"""
            DELETE FROM {SCHEMA}.family_meal_plans 
            WHERE id = {escape_string(meal_id)} AND family_id = {escape_string(family_id)}
        """
        cur.execute(query)
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

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
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        token = event.get('headers', {}).get('X-Auth-Token', '') or event.get('headers', {}).get('x-auth-token', '')
        
        user_id = verify_token(token)
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        family_id = get_user_family_id(user_id)
        if not family_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Пользователь не состоит в семье'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            meals = get_meal_plans(family_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'meals': meals}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'add')
            
            if action == 'add':
                result = add_meal_plan(family_id, body)
                status_code = 201 if 'success' in result else 400
            elif action == 'update':
                meal_id = body.get('id')
                if not meal_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуется ID блюда'}),
                        'isBase64Encoded': False
                    }
                result = update_meal_plan(meal_id, family_id, body)
                status_code = 200 if 'success' in result else 400
            elif action == 'delete':
                meal_id = body.get('id')
                if not meal_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуется ID блюда'}),
                        'isBase64Encoded': False
                    }
                result = delete_meal_plan(meal_id, family_id)
                status_code = 200 if 'success' in result else 400
            elif action == 'bulk_add':
                meals_list = body.get('meals', [])
                if not meals_list:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Список блюд пуст'}),
                        'isBase64Encoded': False
                    }
                user_name = get_user_name(user_id)
                if body.get('clearExisting'):
                    clear_meal_plans(family_id)
                result = bulk_add_meal_plans(family_id, meals_list, user_id, user_name)
                status_code = 201 if 'success' in result else 400
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неизвестное действие'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': status_code,
                'headers': headers,
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
            'isBase64Encoded': False
        }