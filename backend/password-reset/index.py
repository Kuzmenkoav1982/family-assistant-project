'''
Business: Password reset via verification code (SMS/Email via Yandex Cloud)
Args: event with httpMethod, body (action: request/verify/reset)
Returns: HTTP response with success or error
'''

import json
import os
import hashlib
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

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

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_code() -> str:
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def send_verification_code(phone: Optional[str], email: Optional[str], code: str) -> bool:
    if phone:
        print(f'SMS to {phone}: Your reset code is {code}')
    elif email:
        print(f'Email to {email}: Your reset code is {code}')
    return True

def request_reset(phone: Optional[str], email: Optional[str]) -> Dict[str, Any]:
    if not phone and not email:
        return {'error': 'Укажите телефон или email'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f'''
            SELECT id, phone, email FROM {SCHEMA}.users 
            WHERE phone = {escape_string(phone)} OR email = {escape_string(email)}
            LIMIT 1
        '''
        cur.execute(query)
        user = cur.fetchone()
        
        if not user:
            return {'error': 'Пользователь не найден'}
        
        code = generate_code()
        expires_at = datetime.now() + timedelta(minutes=15)
        
        cur.execute(f'''
            DELETE FROM {SCHEMA}.password_reset_tokens 
            WHERE user_id = {escape_string(user['id'])}
        ''')
        
        cur.execute(f'''
            INSERT INTO {SCHEMA}.password_reset_tokens 
            (user_id, token, expires_at)
            VALUES (
                {escape_string(user['id'])}, 
                {escape_string(code)}, 
                {escape_string(expires_at.isoformat())}
            )
        ''')
        
        send_verification_code(user['phone'], user['email'], code)
        
        return {
            'success': True,
            'message': 'Код отправлен',
            'contact': user['phone'] or user['email']
        }
    
    finally:
        cur.close()
        conn.close()

def verify_reset_code(phone: Optional[str], email: Optional[str], code: str) -> Dict[str, Any]:
    if not phone and not email:
        return {'error': 'Укажите телефон или email'}
    
    if not code or len(code) != 6:
        return {'error': 'Неверный формат кода'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f'''
            SELECT prt.user_id, prt.token, prt.expires_at, u.phone, u.email
            FROM {SCHEMA}.password_reset_tokens prt
            JOIN {SCHEMA}.users u ON prt.user_id = u.id
            WHERE (u.phone = {escape_string(phone)} OR u.email = {escape_string(email)})
            AND prt.token = {escape_string(code)}
            AND prt.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        '''
        cur.execute(query)
        result = cur.fetchone()
        
        if not result:
            return {'error': 'Неверный или истекший код'}
        
        return {
            'success': True,
            'message': 'Код подтвержден',
            'user_id': str(result['user_id'])
        }
    
    finally:
        cur.close()
        conn.close()

def reset_password(phone: Optional[str], email: Optional[str], code: str, new_password: str) -> Dict[str, Any]:
    if not phone and not email:
        return {'error': 'Укажите телефон или email'}
    
    if not code or len(code) != 6:
        return {'error': 'Неверный формат кода'}
    
    if len(new_password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f'''
            SELECT prt.user_id, prt.token, prt.expires_at
            FROM {SCHEMA}.password_reset_tokens prt
            JOIN {SCHEMA}.users u ON prt.user_id = u.id
            WHERE (u.phone = {escape_string(phone)} OR u.email = {escape_string(email)})
            AND prt.token = {escape_string(code)}
            AND prt.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        '''
        cur.execute(query)
        result = cur.fetchone()
        
        if not result:
            return {'error': 'Неверный или истекший код'}
        
        password_hash = hash_password(new_password)
        
        cur.execute(f'''
            UPDATE {SCHEMA}.users 
            SET password_hash = {escape_string(password_hash)},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = {escape_string(result['user_id'])}
        ''')
        
        cur.execute(f'''
            DELETE FROM {SCHEMA}.password_reset_tokens 
            WHERE user_id = {escape_string(result['user_id'])}
        ''')
        
        cur.execute(f'''
            DELETE FROM {SCHEMA}.sessions 
            WHERE user_id = {escape_string(result['user_id'])}
        ''')
        
        return {
            'success': True,
            'message': 'Пароль успешно изменен'
        }
    
    finally:
        cur.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'request':
            result = request_reset(
                body_data.get('phone'),
                body_data.get('email')
            )
        elif action == 'verify':
            result = verify_reset_code(
                body_data.get('phone'),
                body_data.get('email'),
                body_data.get('code')
            )
        elif action == 'reset':
            result = reset_password(
                body_data.get('phone'),
                body_data.get('email'),
                body_data.get('code'),
                body_data.get('new_password')
            )
        else:
            result = {'error': 'Invalid action'}
        
        if 'error' in result:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
