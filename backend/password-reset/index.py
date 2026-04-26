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
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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

def send_email_smtp(to_email: str, code: str) -> bool:
    smtp_login = os.environ.get('YANDEX_SMTP_LOGIN', '')
    smtp_password = os.environ.get('YANDEX_SMTP_PASSWORD', '')
    
    if not smtp_login or not smtp_password:
        print('❌ SMTP credentials not configured')
        return False
    
    html_body = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Восстановление пароля</h1>
          </div>
          <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; margin-top: 20px; text-align: center;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Ваш код для восстановления пароля:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #667eea; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">{code}</span>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">⏰ Код действителен в течение <strong>15 минут</strong></p>
          </div>
          <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">⚠️ Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>С уважением,<br/>Команда Наша Семья</p>
          </div>
        </div>
    '''
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Код для восстановления пароля — Наша Семья'
        msg['From'] = smtp_login
        msg['To'] = to_email
        msg.attach(MIMEText(f'Ваш код для восстановления пароля: {code}. Код действует 15 минут.', 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
            server.login(smtp_login, smtp_password)
            server.sendmail(smtp_login, to_email, msg.as_string())
        
        print(f'✅ Email sent to {to_email}')
        return True
    except Exception as e:
        print(f'❌ Email SMTP error: {e}')
        return False


def send_sms_smsru(phone: str, code: str) -> bool:
    """Отправка SMS через SMS.ru. Требует SMS_RU_API_KEY в env."""
    api_key = os.environ.get('SMS_RU_API_KEY', '')
    if not api_key:
        print('ℹ️ SMS_RU_API_KEY не настроен')
        return False
    try:
        import urllib.request
        import urllib.parse
        clean_phone = ''.join(c for c in phone if c.isdigit() or c == '+')
        msg = f'Код для восстановления пароля: {code}. Действует 15 минут.'
        url = 'https://sms.ru/sms/send?' + urllib.parse.urlencode({
            'api_id': api_key,
            'to': clean_phone,
            'msg': msg,
            'json': '1',
        })
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        if data.get('status') == 'OK':
            print(f'✅ SMS sent to {clean_phone}')
            return True
        print(f'❌ SMS.ru error: {data}')
        return False
    except Exception as e:
        print(f'❌ SMS error: {e}')
        return False


def send_verification_code(phone: Optional[str], email: Optional[str], code: str) -> bool:
    """Сначала пробуем email (приоритет). Если не получилось — SMS."""
    if email:
        if send_email_smtp(email, code):
            return True

    if phone:
        if send_sms_smsru(phone, code):
            return True

    return False

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
        
        sent = send_verification_code(user['phone'], user['email'], code)

        if not sent:
            # Откатываем токен — нет смысла хранить, если письмо не ушло
            cur.execute(f'''
                DELETE FROM {SCHEMA}.password_reset_tokens
                WHERE user_id = {escape_string(user['id'])}
            ''')
            return {
                'error': 'Не удалось отправить письмо. Попробуйте позже или обратитесь в поддержку.',
                'debug_email_sent': False,
            }

        return {
            'success': True,
            'message': 'Код отправлен на ' + (user['email'] or user['phone']),
            'contact': user['phone'] or user['email'],
            'debug_email_sent': True,
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