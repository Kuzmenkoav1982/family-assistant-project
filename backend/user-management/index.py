"""
Business: Управление профилем, подтверждение email/SMS, восстановление пароля
Args: event с httpMethod, body (action, data), headers с X-Auth-Token
Returns: JSON с результатом операции
"""

import json
import os
import hashlib
import secrets
import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = %s AND expires_at > CURRENT_TIMESTAMP
        """,
        (token,)
    )
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def update_member_profile(user_id: str, name: str, role: str, relationship: str, avatar: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            f"""
            UPDATE {SCHEMA}.family_members
            SET name = %s, role = %s, relationship = %s, avatar = %s, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            RETURNING id, name, role, relationship, avatar
            """,
            (name, role, relationship, avatar, user_id)
        )
        member = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if not member:
            return {'error': 'Профиль не найден'}
        
        return {
            'success': True,
            'member': dict(member)
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def send_verification_code(email: Optional[str] = None, phone: Optional[str] = None) -> Dict[str, Any]:
    if not email and not phone:
        return {'error': 'Требуется email или телефон'}
    
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.now() + timedelta(minutes=10)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.verification_codes 
            (email, phone, code, code_type, expires_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, code
            """,
            (email, phone, code, 'email' if email else 'sms', expires_at)
        )
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': f'Код отправлен на {email or phone}',
            'code_for_demo': code
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def verify_code(email: Optional[str], phone: Optional[str], code: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    field = 'email' if email else 'phone'
    value = email or phone
    
    cur.execute(
        f"""
        SELECT id, user_id FROM {SCHEMA}.verification_codes
        WHERE {field} = %s AND code = %s AND expires_at > CURRENT_TIMESTAMP AND used = FALSE
        ORDER BY created_at DESC LIMIT 1
        """,
        (value, code)
    )
    verification = cur.fetchone()
    
    if not verification:
        cur.close()
        conn.close()
        return {'error': 'Неверный или истёкший код'}
    
    cur.execute(
        f"""
        UPDATE {SCHEMA}.verification_codes
        SET used = TRUE
        WHERE id = %s
        """,
        (verification['id'],)
    )
    
    if verification['user_id']:
        cur.execute(
            f"""
            UPDATE {SCHEMA}.users
            SET is_verified = TRUE
            WHERE id = %s
            """,
            (verification['user_id'],)
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'message': 'Код подтверждён'
    }

def request_password_reset(email: Optional[str], phone: Optional[str]) -> Dict[str, Any]:
    if not email and not phone:
        return {'error': 'Требуется email или телефон'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    field = 'email' if email else 'phone'
    value = email or phone
    
    cur.execute(
        f"SELECT id FROM {SCHEMA}.users WHERE {field} = %s",
        (value,)
    )
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {'error': 'Пользователь не найден'}
    
    token = secrets.token_urlsafe(48)
    expires_at = datetime.now() + timedelta(hours=1)
    
    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.password_reset_tokens
        (user_id, token, expires_at)
        VALUES (%s, %s, %s)
        RETURNING token
        """,
        (user['id'], token, expires_at)
    )
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'message': f'Ссылка для восстановления отправлена на {value}',
        'token_for_demo': result['token']
    }

def reset_password(token: str, new_password: str) -> Dict[str, Any]:
    if len(new_password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT user_id FROM {SCHEMA}.password_reset_tokens
        WHERE token = %s AND expires_at > CURRENT_TIMESTAMP AND used = FALSE
        """,
        (token,)
    )
    reset = cur.fetchone()
    
    if not reset:
        cur.close()
        conn.close()
        return {'error': 'Неверная или истёкшая ссылка'}
    
    password_hash = hash_password(new_password)
    
    cur.execute(
        f"""
        UPDATE {SCHEMA}.users
        SET password_hash = %s
        WHERE id = %s
        """,
        (password_hash, reset['user_id'])
    )
    
    cur.execute(
        f"""
        UPDATE {SCHEMA}.password_reset_tokens
        SET used = TRUE
        WHERE token = %s
        """,
        (token,)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'message': 'Пароль успешно изменён'
    }

def update_family_settings(user_id: str, family_name: str, logo_url: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            f"""
            SELECT family_id FROM {SCHEMA}.family_members
            WHERE user_id = %s
            LIMIT 1
            """,
            (user_id,)
        )
        member = cur.fetchone()
        
        if not member:
            cur.close()
            conn.close()
            return {'error': 'Пользователь не найден в семье'}
        
        family_id = member['family_id']
        
        cur.execute(
            f"""
            UPDATE {SCHEMA}.families
            SET name = %s, logo_url = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, name, logo_url
            """,
            (family_name, logo_url, family_id)
        )
        family = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if not family:
            return {'error': 'Семья не найдена'}
        
        return {
            'success': True,
            'family': dict(family)
        }
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        action = body.get('action', '')
        
        if action == 'update_profile':
            token = event.get('headers', {}).get('X-Auth-Token', '')
            user_id = verify_token(token)
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            result = update_member_profile(
                user_id,
                body.get('name', ''),
                body.get('role', ''),
                body.get('relationship', ''),
                body.get('avatar', '👤')
            )
            
            status = 200 if result.get('success') else 400
            return {
                'statusCode': status,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        elif action == 'send_verification':
            result = send_verification_code(
                body.get('email'),
                body.get('phone')
            )
            status = 200 if result.get('success') else 400
            return {
                'statusCode': status,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        elif action == 'verify_code':
            result = verify_code(
                body.get('email'),
                body.get('phone'),
                body.get('code', '')
            )
            status = 200 if result.get('success') else 400
            return {
                'statusCode': status,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        elif action == 'request_reset':
            result = request_password_reset(
                body.get('email'),
                body.get('phone')
            )
            status = 200 if result.get('success') else 400
            return {
                'statusCode': status,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        elif action == 'reset_password':
            result = reset_password(
                body.get('token', ''),
                body.get('new_password', '')
            )
            status = 200 if result.get('success') else 400
            return {
                'statusCode': status,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        elif action == 'get_max_status':
            h = event.get('headers', {})
            token = h.get('X-Auth-Token') or h.get('x-auth-token') or ''
            user_id = verify_token(token)
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(f"SELECT max_chat_id FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            connected = bool(row and row.get('max_chat_id'))
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'connected': connected, 'user_id': user_id})
            }

        elif action == 'disconnect_max':
            h = event.get('headers', {})
            token = h.get('X-Auth-Token') or h.get('x-auth-token') or ''
            user_id = verify_token(token)
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(f"UPDATE {SCHEMA}.users SET max_chat_id = NULL WHERE id = %s", (user_id,))
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'MAX отключён'})
            }

        elif action == 'update_family':
            token = event.get('headers', {}).get('X-Auth-Token', '')
            user_id = verify_token(token)
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            result = update_family_settings(
                user_id,
                body.get('family_name', ''),
                body.get('logo_url', '')
            )
            status = 200 if result.get('success') else 400
            return {
                'statusCode': status,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Неизвестное действие'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }