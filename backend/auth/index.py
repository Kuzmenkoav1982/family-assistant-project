"""
Business: Регистрация и авторизация пользователей через email/телефон
Args: event с httpMethod, body (email/phone, password)
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

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    cleaned = re.sub(r'[^\d+]', '', phone)
    return len(cleaned) >= 10 and len(cleaned) <= 15

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def register_user(email: Optional[str], phone: Optional[str], password: str, family_name: Optional[str] = None) -> Dict[str, Any]:
    if not email and not phone:
        return {'error': 'Email или телефон обязательны'}
    
    if email and not validate_email(email):
        return {'error': 'Некорректный email'}
    
    if phone and not validate_phone(phone):
        return {'error': 'Некорректный телефон'}
    
    if len(password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        password_hash = hash_password(password)
        
        if email:
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                cur.close()
                conn.close()
                return {'error': 'Email уже зарегистрирован'}
        
        if phone:
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE phone = %s", (phone,))
            if cur.fetchone():
                cur.close()
                conn.close()
                return {'error': 'Телефон уже зарегистрирован'}
        
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (email, phone, password_hash, is_verified) VALUES (%s, %s, %s, %s) RETURNING id, email, phone, created_at",
            (email, phone, password_hash, True)
        )
        user = cur.fetchone()
        conn.commit()
        
        default_family_name = family_name or f"Семья {email or phone}"
        cur.execute(
            f"INSERT INTO {SCHEMA}.families (name) VALUES (%s) RETURNING id, name",
            (default_family_name,)
        )
        family = cur.fetchone()
        conn.commit()
        
        member_name = email.split('@')[0] if email else phone[-4:]
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.family_members 
            (family_id, user_id, name, role, points, level, workload, avatar, avatar_type) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (family['id'], user['id'], member_name, 'Владелец', 0, 1, 0, '👤', 'emoji')
        )
        member = cur.fetchone()
        conn.commit()
        
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], token, expires_at)
        )
        conn.commit()
        
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
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': f'Ошибка регистрации: {str(e)}'}

def login_user(login: str, password: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    is_email = '@' in login
    field = 'email' if is_email else 'phone'
    
    cur.execute(
        f"SELECT id, email, phone, password_hash FROM {SCHEMA}.users WHERE {field} = %s",
        (login,)
    )
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
    
    cur.execute(
        f"""
        SELECT fm.family_id, f.name as family_name, fm.id as member_id
        FROM {SCHEMA}.family_members fm
        JOIN {SCHEMA}.families f ON fm.family_id = f.id
        WHERE fm.user_id = %s
        LIMIT 1
        """,
        (user['id'],)
    )
    family_info = cur.fetchone()
    
    token = generate_token()
    expires_at = datetime.now() + timedelta(days=30)
    
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user['id'], token, expires_at)
    )
    conn.commit()
    
    cur.execute(
        f"UPDATE {SCHEMA}.users SET last_login_at = CURRENT_TIMESTAMP WHERE id = %s",
        (user['id'],)
    )
    conn.commit()
    
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

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT s.user_id, s.expires_at, u.email, u.phone 
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON s.user_id = u.id
        WHERE s.token = %s AND s.expires_at > CURRENT_TIMESTAMP
        """,
        (token,)
    )
    session = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not session:
        return None
    
    return {
        'id': str(session['user_id']),
        'email': session['email'],
        'phone': session['phone']
    }

def logout_user(token: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        f"UPDATE {SCHEMA}.sessions SET expires_at = CURRENT_TIMESTAMP WHERE token = %s",
        (token,)
    )
    conn.commit()
    
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        body = json.loads(event.get('body', '{}'))
        path = event.get('queryStringParameters', {}).get('action', 'login')
        
        if method == 'POST':
            if path == 'register':
                result = register_user(
                    body.get('email'),
                    body.get('phone'),
                    body.get('password', ''),
                    body.get('family_name')
                )
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(result)
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
                        'body': json.dumps(result)
                    }
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            elif path == 'logout':
                token = event.get('headers', {}).get('X-Auth-Token', '')
                result = logout_user(token)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
        
        elif method == 'GET':
            if path == 'verify':
                token = event.get('headers', {}).get('X-Auth-Token', '')
                user = verify_token(token)
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': headers,
                        'body': json.dumps({'error': 'Недействительный токен'})
                    }
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'user': user})
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не найден'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }