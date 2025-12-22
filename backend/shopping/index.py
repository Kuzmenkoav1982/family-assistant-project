"""
Business: CRUD операции для списка покупок семьи с реальным сохранением в БД
Args: event с httpMethod, body, headers с X-Auth-Token
Returns: JSON со списком покупок или результатом операции
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any) -> str:
    if value is None or value == '':
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def send_push_notification(family_id: str, title: str, message: str):
    """Отправка push-уведомлений всем подписчикам семьи"""
    try:
        vapid_key = os.environ.get('VAPID_PRIVATE_KEY')
        if not vapid_key:
            print(f"[WARN] VAPID key not configured, skipping notification")
            return
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = f"SELECT subscription_data FROM {SCHEMA}.push_subscriptions WHERE family_id::text = {escape_string(family_id)}"
        cur.execute(query)
        subscriptions = cur.fetchall()
        
        for sub_row in subscriptions:
            try:
                webpush(
                    subscription_info=sub_row['subscription_data'],
                    data=json.dumps({'title': title, 'body': message, 'icon': '/icon-192.png'}),
                    vapid_private_key=vapid_key,
                    vapid_claims={'sub': 'mailto:support@family-assistant.app'}
                )
            except WebPushException as e:
                print(f"[ERROR] Push failed: {e}")
            except Exception as e:
                print(f"[ERROR] Unexpected push error: {e}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Notification error: {e}")

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
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    cur.execute(query)
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member and member['family_id'] else None

def get_shopping_items(family_id: str, bought: Optional[bool] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    where_clause = f"WHERE family_id::text = {escape_string(family_id)}"
    if bought is not None:
        where_clause += f" AND bought = {escape_string(bought)}"
    
    query = f"""
        SELECT * FROM {SCHEMA}.shopping_items_v2
        {where_clause}
        ORDER BY bought ASC, priority DESC, created_at DESC
    """
    
    cur.execute(query)
    items = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(item) for item in items]

def create_shopping_item(family_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    item_id = str(uuid.uuid4())
    
    user_query = f"SELECT name FROM {SCHEMA}.family_members WHERE user_id::text = {escape_string(user_id)} LIMIT 1"
    cur.execute(user_query)
    user_data = cur.fetchone()
    user_name = user_data['name'] if user_data else 'Неизвестно'
    
    # For UUID fields, we need to cast the string to uuid
    insert_query = f"""
        INSERT INTO {SCHEMA}.shopping_items_v2 (
            id, family_id, name, category, quantity, priority, bought,
            added_by, added_by_name, notes
        ) VALUES (
            {escape_string(item_id)}::uuid,
            {escape_string(family_id)}::uuid,
            {escape_string(data.get('name', ''))},
            {escape_string(data.get('category', 'Продукты'))},
            {escape_string(data.get('quantity', ''))},
            {escape_string(data.get('priority', 'normal'))},
            FALSE,
            {escape_string(user_id)}::uuid,
            {escape_string(user_name)},
            {escape_string(data.get('notes', '') if data.get('notes') else '')}
        )
    """
    
    try:
        print(f"[DEBUG] Insert query: {insert_query}")
        cur.execute(insert_query)
        
        select_query = f"SELECT * FROM {SCHEMA}.shopping_items_v2 WHERE id = {escape_string(item_id)}::uuid"
        cur.execute(select_query)
        item = cur.fetchone()
        
        if data.get('priority') == 'urgent':
            send_push_notification(family_id, "🚨 Срочная покупка", f"Нужно срочно купить: {data.get('name', 'Товар')}")
        
        cur.close()
        conn.close()
        return dict(item) if item else {}
    except Exception as e:
        print(f"[create_shopping_item] Error: {e}")
        print(f"[DEBUG] Failed query: {insert_query}")
        cur.close()
        conn.close()
        raise

def update_shopping_item(item_id: str, family_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    check_query = f"SELECT id FROM {SCHEMA}.shopping_items_v2 WHERE id::text = {escape_string(item_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(check_query)
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {'error': 'Покупка не найдена'}
    
    fields = []
    
    if 'bought' in data and data['bought']:
        user_query = f"SELECT name FROM {SCHEMA}.family_members WHERE user_id::text = {escape_string(user_id)} LIMIT 1"
        cur.execute(user_query)
        user_data = cur.fetchone()
        user_name = user_data['name'] if user_data else 'Неизвестно'
        
        fields.append(f"bought = TRUE")
        fields.append(f"bought_by = {escape_string(user_id)}::uuid")
        fields.append(f"bought_by_name = {escape_string(user_name)}")
        fields.append(f"bought_at = CURRENT_TIMESTAMP")
    elif 'bought' in data and not data['bought']:
        fields.append(f"bought = FALSE")
        fields.append(f"bought_by = NULL")
        fields.append(f"bought_by_name = NULL")
        fields.append(f"bought_at = NULL")
    
    for field in ['name', 'category', 'quantity', 'priority', 'notes']:
        if field in data:
            fields.append(f"{field} = {escape_string(data[field])}")
    
    if not fields:
        cur.close()
        conn.close()
        return {'error': 'Нет данных для обновления'}
    
    fields.append("updated_at = CURRENT_TIMESTAMP")
    
    query = f"""
        UPDATE {SCHEMA}.shopping_items_v2 
        SET {', '.join(fields)}
        WHERE id::text = {escape_string(item_id)} AND family_id::text = {escape_string(family_id)}
        RETURNING *
    """
    
    cur.execute(query)
    item = cur.fetchone()
    
    if 'priority' in data and data['priority'] == 'urgent':
        item_name = item['name'] if item else 'Товар'
        send_push_notification(family_id, "🚨 Срочная покупка", f"Помечено срочным: {item_name}")
    
    cur.close()
    conn.close()
    
    return dict(item)

def delete_shopping_item(item_id: str, family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    check_query = f"SELECT id FROM {SCHEMA}.shopping_items_v2 WHERE id::text = {escape_string(item_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(check_query)
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {'error': 'Покупка не найдена'}
    
    delete_query = f"DELETE FROM {SCHEMA}.shopping_items_v2 WHERE id::text = {escape_string(item_id)} AND family_id::text = {escape_string(family_id)}"
    cur.execute(delete_query)
    cur.close()
    conn.close()
    
    return {'success': True}

def clear_bought_items(family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    delete_query = f"DELETE FROM {SCHEMA}.shopping_items_v2 WHERE family_id::text = {escape_string(family_id)} AND bought = TRUE"
    cur.execute(delete_query)
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
            bought_param = params.get('bought') if params else None
            bought = None if bought_param is None else bought_param.lower() == 'true'
            
            items = get_shopping_items(family_id, bought)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'items': items}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')
            
            if action == 'clear_bought':
                result = clear_bought_items(family_id)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            else:
                item = create_shopping_item(family_id, user_id, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'item': item}, default=str)
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID покупки'})
                }
            
            item = update_shopping_item(item_id, family_id, user_id, body)
            if 'error' in item:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps(item)
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'item': item}, default=str)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            item_id = params.get('id') if params else None
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID покупки'})
                }
            
            result = delete_shopping_item(item_id, family_id)
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