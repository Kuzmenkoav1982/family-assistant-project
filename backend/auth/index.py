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

def register_user(phone: str, password: str, family_name: Optional[str] = None, skip_family_creation: bool = False, invite_code: Optional[str] = None, member_name: Optional[str] = None, relationship: Optional[str] = None) -> Dict[str, Any]:
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
        
        user_data = {
            'id': str(user['id']),
            'email': user['email'],
            'phone': user['phone']
        }
        
        if invite_code:
            cur.execute(
                f"""
                SELECT id, family_id, max_uses, uses_count, expires_at, is_active
                FROM {SCHEMA}.family_invites
                WHERE invite_code = {escape_string(invite_code)}
                """
            )
            invite = cur.fetchone()
            
            if not invite:
                cur.close()
                conn.close()
                return {'error': 'Неверный код приглашения'}
            
            if not invite['is_active']:
                cur.close()
                conn.close()
                return {'error': 'Приглашение деактивировано'}
            
            if invite['expires_at'] and invite['expires_at'] < datetime.now():
                cur.close()
                conn.close()
                return {'error': 'Срок действия приглашения истёк'}
            
            if invite['uses_count'] >= invite['max_uses']:
                cur.close()
                conn.close()
                return {'error': 'Приглашение исчерпано'}
            
            final_member_name = member_name or phone[-4:]
            final_relationship = relationship or 'Член семьи'
            
            insert_member = f"""
                INSERT INTO {SCHEMA}.family_members 
                (family_id, user_id, name, relationship, role, points, level, workload, avatar, avatar_type) 
                VALUES (
                    {escape_string(invite['family_id'])}, 
                    {escape_string(user['id'])}, 
                    {escape_string(final_member_name)}, 
                    {escape_string(final_relationship)}, 
                    'Член семьи', 
                    0, 1, 0, 
                    {escape_string('👤')}, 
                    {escape_string('emoji')}
                )
                RETURNING id
            """
            cur.execute(insert_member)
            member = cur.fetchone()
            
            update_invite = f"""
                UPDATE {SCHEMA}.family_invites
                SET uses_count = uses_count + 1
                WHERE id = {escape_string(invite['id'])}
            """
            cur.execute(update_invite)
            
            select_family = f"""
                SELECT name FROM {SCHEMA}.families WHERE id = {escape_string(invite['family_id'])}
            """
            cur.execute(select_family)
            family = cur.fetchone()
            
            user_data['family_id'] = str(invite['family_id'])
            user_data['family_name'] = family['name']
            user_data['member_id'] = str(member['id'])
        elif not skip_family_creation:
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
            
            user_data['family_id'] = str(family['id'])
            user_data['family_name'] = family['name']
            user_data['member_id'] = str(member['id'])
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'token': token,
            'user': user_data
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка регистрации: {str(e)}'}

def login_user(login: str, password: str) -> Dict[str, Any]:
    if not login or not password:
        return {'error': 'Логин и пароль обязательны'}
    
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
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
            if cur:
                cur.close()
            if conn:
                conn.close()
            return {'error': 'Пользователь не найден'}
        
        password_hash = hash_password(password)
        if user['password_hash'] != password_hash:
            if cur:
                cur.close()
            if conn:
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
        
        user_data = {
            'id': str(user['id']),
            'email': user['email'],
            'phone': user['phone']
        }
        
        if family_info:
            user_data['family_id'] = str(family_info['family_id'])
            user_data['family_name'] = family_info['family_name']
            user_data['member_id'] = str(family_info['member_id'])
        
        if cur:
            cur.close()
        if conn:
            conn.close()
        
        return {
            'success': True,
            'token': token,
            'user': user_data
        }
    except Exception as e:
        if cur:
            cur.close()
        if conn:
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

def forgot_password(phone: str) -> Dict[str, Any]:
    if not phone or not validate_phone(phone):
        return {'error': 'Некорректный номер телефона'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем существует ли пользователь
        check_user = f"SELECT id FROM {SCHEMA}.users WHERE phone = {escape_string(phone)}"
        cur.execute(check_user)
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {'error': 'Пользователь с таким номером не найден'}
        
        # Генерируем 6-значный код
        reset_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        reset_token = generate_token()
        expires_at = datetime.now() + timedelta(minutes=15)
        
        # Удаляем старые токены
        delete_old = f"DELETE FROM {SCHEMA}.password_reset_tokens WHERE user_id = {escape_string(user['id'])}"
        cur.execute(delete_old)
        
        # Сохраняем новый токен
        insert_token = f"""
            INSERT INTO {SCHEMA}.password_reset_tokens 
            (user_id, token, code, expires_at) 
            VALUES (
                {escape_string(user['id'])}, 
                {escape_string(reset_token)}, 
                {escape_string(reset_code)}, 
                {escape_string(expires_at.isoformat())}
            )
        """
        cur.execute(insert_token)
        
        cur.close()
        conn.close()
        
        # TODO: Отправить SMS с кодом reset_code
        # Пока просто возвращаем код (для тестирования)
        return {
            'success': True, 
            'message': 'Код подтверждения отправлен',
            'code': reset_code  # Уберите это в продакшене!
        }
    except Exception as e:
        if cur:
            cur.close()
        if conn:
            conn.close()
        return {'error': f'Ошибка: {str(e)}'}

def verify_reset_code(phone: str, code: str) -> Dict[str, Any]:
    if not phone or not code:
        return {'error': 'Телефон и код обязательны'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        check_query = f"""
            SELECT prt.token, prt.expires_at
            FROM {SCHEMA}.password_reset_tokens prt
            JOIN {SCHEMA}.users u ON prt.user_id = u.id
            WHERE u.phone = {escape_string(phone)} 
            AND prt.code = {escape_string(code)}
            AND prt.expires_at > CURRENT_TIMESTAMP
            AND prt.used_at IS NULL
            ORDER BY prt.created_at DESC
            LIMIT 1
        """
        cur.execute(check_query)
        token_data = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not token_data:
            return {'error': 'Неверный код или код устарел'}
        
        return {
            'success': True,
            'reset_token': token_data['token']
        }
    except Exception as e:
        if cur:
            cur.close()
        if conn:
            conn.close()
        return {'error': f'Ошибка: {str(e)}'}

def reset_password(reset_token: str, new_password: str) -> Dict[str, Any]:
    if not reset_token or not new_password:
        return {'error': 'Токен и пароль обязательны'}
    
    if len(new_password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем токен
        check_token = f"""
            SELECT user_id 
            FROM {SCHEMA}.password_reset_tokens 
            WHERE token = {escape_string(reset_token)} 
            AND expires_at > CURRENT_TIMESTAMP
            AND used_at IS NULL
        """
        cur.execute(check_token)
        token_data = cur.fetchone()
        
        if not token_data:
            cur.close()
            conn.close()
            return {'error': 'Неверный или просроченный токен'}
        
        user_id = token_data['user_id']
        new_password_hash = hash_password(new_password)
        
        # Обновляем пароль
        update_password = f"""
            UPDATE {SCHEMA}.users 
            SET password_hash = {escape_string(new_password_hash)} 
            WHERE id = {escape_string(user_id)}
        """
        cur.execute(update_password)
        
        # Помечаем токен как использованный
        mark_used = f"""
            UPDATE {SCHEMA}.password_reset_tokens 
            SET used_at = CURRENT_TIMESTAMP 
            WHERE token = {escape_string(reset_token)}
        """
        cur.execute(mark_used)
        
        # Удаляем все сессии пользователя (принудительный выход)
        delete_sessions = f"""
            UPDATE {SCHEMA}.sessions 
            SET expires_at = CURRENT_TIMESTAMP 
            WHERE user_id = {escape_string(user_id)}
        """
        cur.execute(delete_sessions)
        
        cur.close()
        conn.close()
        
        return {'success': True, 'message': 'Пароль успешно изменён'}
    except Exception as e:
        if cur:
            cur.close()
        if conn:
            conn.close()
        return {'error': f'Ошибка: {str(e)}'}

def delete_account(token: str) -> Dict[str, Any]:
    user = verify_token(token)
    if not user:
        return {'error': 'Неверный токен'}
    
    user_id = user['id']
    conn = None
    cur = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE user_id = {escape_string(user_id)}")
        cur.execute(f"DELETE FROM {SCHEMA}.password_reset_tokens WHERE user_id = {escape_string(user_id)}")
        
        cur.execute(f"SELECT family_id FROM {SCHEMA}.family_members WHERE user_id = {escape_string(user_id)}")
        member_data = cur.fetchone()
        
        if member_data:
            family_id = member_data['family_id']
            
            cur.execute(f"SELECT COUNT(*) as count FROM {SCHEMA}.family_members WHERE family_id = {escape_string(family_id)}")
            members_count = cur.fetchone()['count']
            
            if members_count <= 1:
                cur.execute(f"DELETE FROM {SCHEMA}.tasks WHERE family_id = {escape_string(family_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.family_invites WHERE family_id = {escape_string(family_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.family_members WHERE family_id = {escape_string(family_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.families WHERE id = {escape_string(family_id)}")
            else:
                cur.execute(f"DELETE FROM {SCHEMA}.family_members WHERE user_id = {escape_string(user_id)}")
        
        cur.execute(f"DELETE FROM {SCHEMA}.users WHERE id = {escape_string(user_id)}")
        
        return {'success': True, 'message': 'Аккаунт успешно удалён'}
    except Exception as e:
        return {'error': f'Ошибка удаления: {str(e)}'}
    finally:
        if cur:
            cur.close()
        if conn:
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
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if raw_body else {}
        query_params = event.get('queryStringParameters') or {}
        path = query_params.get('action', 'login')
        
        if method == 'POST':
            if path == 'register':
                invite_code = body.get('invite_code', '')
                skip_family = bool(invite_code)
                result = register_user(
                    body.get('phone', ''),
                    body.get('password', ''),
                    body.get('family_name'),
                    skip_family_creation=skip_family,
                    invite_code=invite_code if invite_code else None,
                    member_name=body.get('name'),
                    relationship=body.get('relationship')
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
            
            elif path == 'forgot_password':
                result = forgot_password(body.get('phone', ''))
                if 'error' in result:
                    return {
                        'statusCode': 400,
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
            
            elif path == 'verify_reset_code':
                result = verify_reset_code(
                    body.get('phone', ''),
                    body.get('code', '')
                )
                if 'error' in result:
                    return {
                        'statusCode': 400,
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
            
            elif path == 'reset_password':
                result = reset_password(
                    body.get('reset_token', ''),
                    body.get('new_password', '')
                )
                if 'error' in result:
                    return {
                        'statusCode': 400,
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
            
            elif path == 'delete_account':
                token = event.get('headers', {}).get('X-Auth-Token', '') or event.get('headers', {}).get('x-auth-token', '')
                result = delete_account(token)
                if 'error' in result:
                    return {
                        'statusCode': 400,
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
        import traceback
        error_details = {
            'error': f'Server error: {str(e)}',
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        print(f"ERROR in handler: {error_details}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Server error: {str(e)}', 'type': type(e).__name__}),
            'isBase64Encoded': False
        }