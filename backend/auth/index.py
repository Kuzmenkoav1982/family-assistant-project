"""
Business: Регистрация и авторизация пользователей только через телефон
Args: event с httpMethod, body (phone, password)
Returns: JSON с токеном сессии или ошибкой
"""

import json
import os
import hashlib
import secrets
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def validate_phone(phone: str) -> bool:
    cleaned = re.sub(r'[^\d+]', '', phone)
    return len(cleaned) >= 10 and len(cleaned) <= 15

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def register_user(phone: str, password: str, family_name: Optional[str] = None) -> Dict[str, Any]:
    if not phone:
        return {'error': 'Телефон обязателен'}
    
    if not validate_phone(phone):
        return {'error': 'Некорректный номер телефона'}
    
    if len(password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        password_hash = hash_password(password)
        
        check_query = f"SELECT id FROM {SCHEMA}.users WHERE phone = {escape_string(phone)}"
        cur.execute(check_query)
        if cur.fetchone():
            cur.close()
            conn.close()
            return {'error': 'Телефон уже зарегистрирован'}
        
        insert_user = f"""
            INSERT INTO {SCHEMA}.users (email, phone, password_hash, is_verified) 
            VALUES (NULL, {escape_string(phone)}, {escape_string(password_hash)}, TRUE) 
            RETURNING id, email, phone, created_at
        """
        cur.execute(insert_user)
        user = cur.fetchone()
        
        default_family_name = family_name or f"Семья {phone}"
        insert_family = f"""
            INSERT INTO {SCHEMA}.families (name) 
            VALUES ({escape_string(default_family_name)}) 
            RETURNING id, name
        """
        cur.execute(insert_family)
        family = cur.fetchone()
        
        member_name = phone[-4:]
        insert_member = f"""
            INSERT INTO {SCHEMA}.family_members 
            (family_id, user_id, name, role, points, level, workload, avatar, avatar_type) 
            VALUES (
                {escape_string(family['id'])}, 
                {escape_string(user['id'])}, 
                {escape_string(member_name)}, 
                {escape_string('Владелец')}, 
                0, 1, 0, 
                {escape_string('👤')}, 
                {escape_string('emoji')}
            )
            RETURNING id
        """
        cur.execute(insert_member)
        member = cur.fetchone()
        
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        
        insert_session = f"""
            INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) 
            VALUES (
                {escape_string(user['id'])}, 
                {escape_string(token)}, 
                {escape_string(expires_at.isoformat())}
            )
        """
        cur.execute(insert_session)
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'token': token,
            'user': {
                'id': str(user['id']),
                'email': user['email'],
                'phone': user['phone'],
                'family_id': str(family['id']),
                'family_name': family['name'],
                'member_id': str(member['id'])
            }
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка регистрации: {str(e)}'}

def login_user(login: str, password: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        is_email = '@' in login
        field = 'email' if is_email else 'phone'
        
        select_user = f"""
            SELECT id, email, phone, password_hash 
            FROM {SCHEMA}.users 
            WHERE {field} = {escape_string(login)}
        """
        cur.execute(select_user)
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {'error': 'Пользователь не найден'}
        
        password_hash = hash_password(password)
        if user['password_hash'] != password_hash:
            cur.close()
            conn.close()
            return {'error': 'Неверный пароль'}
        
        select_family = f"""
            SELECT fm.family_id, f.name as family_name, fm.id as member_id
            FROM {SCHEMA}.family_members fm
            JOIN {SCHEMA}.families f ON fm.family_id = f.id
            WHERE fm.user_id = {escape_string(user['id'])}
            LIMIT 1
        """
        cur.execute(select_family)
        family_info = cur.fetchone()
        
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        
        insert_session = f"""
            INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) 
            VALUES (
                {escape_string(user['id'])}, 
                {escape_string(token)}, 
                {escape_string(expires_at.isoformat())}
            )
        """
        cur.execute(insert_session)
        
        update_login = f"""
            UPDATE {SCHEMA}.users 
            SET last_login_at = CURRENT_TIMESTAMP 
            WHERE id = {escape_string(user['id'])}
        """
        cur.execute(update_login)
        
        cur.close()
        conn.close()
        
        user_data = {
            'id': str(user['id']),
            'email': user['email'],
            'phone': user['phone']
        }
        
        if family_info:
            user_data['family_id'] = str(family_info['family_id'])
            user_data['family_name'] = family_info['family_name']
            user_data['member_id'] = str(family_info['member_id'])
        
        return {
            'success': True,
            'token': token,
            'user': user_data
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка входа: {str(e)}'}

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        select_session = f"""
            SELECT s.user_id, s.expires_at, u.email, u.phone,
                   fm.family_id, f.name as family_name, fm.id as member_id
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON s.user_id = u.id
            LEFT JOIN {SCHEMA}.family_members fm ON fm.user_id = u.id
            LEFT JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE s.token = {escape_string(token)} AND s.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        """
        
        cur.execute(select_session)
        session = cur.fetchone()
        
        if not session:
            return None
        
        user_data = {
            'id': str(session['user_id']),
            'email': session['email'],
            'phone': session['phone']
        }
        
        if session.get('family_id'):
            user_data['family_id'] = str(session['family_id'])
            user_data['family_name'] = session['family_name']
            user_data['member_id'] = str(session['member_id'])
        
        return user_data
    except Exception as e:
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def logout_user(token: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        update_session = f"""
            UPDATE {SCHEMA}.sessions 
            SET expires_at = CURRENT_TIMESTAMP 
            WHERE token = {escape_string(token)}
        """
        cur.execute(update_session)
        cur.close()
        conn.close()
        return {'success': True}
    except Exception as e:
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
        body = json.loads(event.get('body', '{}'))
        query_params = event.get('queryStringParameters') or {}
        path = query_params.get('action', 'login')
        
        if method == 'POST':
            if path == 'register':
                result = register_user(
                    body.get('phone', ''),
                    body.get('password', ''),
                    body.get('family_name')
                )
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif path == 'login':
                result = login_user(
                    body.get('login', ''),
                    body.get('password', '')
                )
                if 'error' in result:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif path == 'logout':
                token = event.get('headers', {}).get('X-Auth-Token', '') or event.get('headers', {}).get('x-auth-token', '')
                result = logout_user(token)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            if path == 'verify':
                all_headers = event.get('headers', {})
                token = all_headers.get('X-Auth-Token', '') or all_headers.get('x-auth-token', '')
                
                if not token:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Токен не предоставлен'}),
                        'isBase64Encoded': False
                    }
                
                user = verify_token(token)
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Недействительный токен'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'user': user}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не найден'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }