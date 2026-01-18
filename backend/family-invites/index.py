"""
Business: Управление приглашениями в семью (создание, использование кодов)
Args: event с httpMethod, body (action: create/join/list), headers с X-Auth-Token
Returns: JSON с кодом приглашения или результатом
"""

import json
import os
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3
from botocore.exceptions import ClientError
import requests

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

YANDEX_POSTBOX_ACCESS_KEY = os.environ.get('YANDEX_POSTBOX_ACCESS_KEY')
YANDEX_POSTBOX_SECRET_KEY = os.environ.get('YANDEX_POSTBOX_SECRET_KEY')
YANDEX_SMS_API_KEY = os.environ.get('YANDEX_SMS_API_KEY')
YANDEX_SMS_SENDER = os.environ.get('YANDEX_SMS_SENDER', 'FamilyApp')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@family-assistant.app')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def generate_invite_code() -> str:
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

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

def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id = %s LIMIT 1
        """,
        (user_id,)
    )
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member else None

def send_email_invite(email: str, invite_code: str, family_name: str, role: str) -> bool:
    if not all([YANDEX_POSTBOX_ACCESS_KEY, YANDEX_POSTBOX_SECRET_KEY]):
        print('Yandex Postbox credentials not configured')
        return False
    
    try:
        ses_client = boto3.client(
            'ses',
            region_name='ru-central1',
            endpoint_url='https://postbox.cloud.yandex.net',
            aws_access_key_id=YANDEX_POSTBOX_ACCESS_KEY,
            aws_secret_access_key=YANDEX_POSTBOX_SECRET_KEY
        )
        
        html_body = f'''
        <html>
        <body>
            <h2>Приглашение в семью</h2>
            <p>Вас пригласили присоединиться к семье <strong>{family_name}</strong> с ролью <strong>{role}</strong>.</p>
            <p>Ваш код приглашения: <strong>{invite_code}</strong></p>
            <p>Перейдите по ссылке для присоединения:</p>
            <a href="https://family-assistant.app/join?code={invite_code}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Присоединиться к семье</a>
            <p><small>Ссылка действительна 7 дней</small></p>
        </body>
        </html>
        '''
        
        response = ses_client.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': f'Приглашение в семью "{family_name}"', 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {'Data': html_body, 'Charset': 'UTF-8'},
                    'Text': {'Data': f'Приглашение в семью {family_name}. Код: {invite_code}. Ссылка: https://family-assistant.app/join?code={invite_code}', 'Charset': 'UTF-8'}
                }
            }
        )
        return True
    except ClientError as e:
        print(f'Error sending email via Yandex Postbox: {e}')
        return False
    except Exception as e:
        print(f'Unexpected error sending email: {e}')
        return False

def send_sms_invite(phone: str, invite_code: str, family_name: str) -> bool:
    if not YANDEX_SMS_API_KEY:
        print('Yandex SMS API key not configured')
        return False
    
    try:
        url = 'https://sms.yandex.ru/sendsms'
        
        message_text = f'Приглашение в семью "{family_name}". Код: {invite_code}. Ссылка: https://family-assistant.app/join?code={invite_code}'
        
        params = {
            'phone': phone,
            'text': message_text,
            'sender': YANDEX_SMS_SENDER
        }
        
        headers = {
            'Authorization': f'Bearer {YANDEX_SMS_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=params, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return result.get('status') == 'ok'
        else:
            print(f'SMS API error: {response.status_code} - {response.text}')
            return False
    except Exception as e:
        print(f'Error sending SMS via Yandex: {e}')
        return False

def create_invite(user_id: str, max_uses: int = 1, days_valid: int = 7, invite_type: str = 'link', invite_value: str = '', role: str = 'parent') -> Dict[str, Any]:
    family_id = get_user_family_id(user_id)
    if not family_id:
        return {'error': 'Пользователь не состоит в семье'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    code = generate_invite_code()
    expires_at = datetime.now() + timedelta(days=days_valid)
    
    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.family_invites 
        (family_id, invite_code, created_by, max_uses, expires_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, invite_code, max_uses, expires_at
        """,
        (family_id, code, user_id, max_uses, expires_at)
    )
    invite = cur.fetchone()
    conn.commit()
    
    cur.execute(
        f"SELECT name FROM {SCHEMA}.families WHERE id = %s",
        (family_id,)
    )
    family = cur.fetchone()
    family_name = family['name'] if family else 'Семья'
    
    cur.close()
    conn.close()
    
    sent = False
    if invite_type == 'email' and invite_value:
        sent = send_email_invite(invite_value, code, family_name, role)
    elif invite_type == 'sms' and invite_value:
        sent = send_sms_invite(invite_value, code, family_name)
    
    return {
        'success': True,
        'sent': sent,
        'invite': {
            'id': str(invite['id']),
            'code': invite['invite_code'],
            'max_uses': invite['max_uses'],
            'expires_at': invite['expires_at'].isoformat(),
            'family_name': family_name
        }
    }

def join_family(user_id: str, invite_code: str, member_name: str, relationship: str, force_leave: bool = False) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            f"""
            SELECT id, family_id, max_uses, uses_count, expires_at, is_active
            FROM {SCHEMA}.family_invites
            WHERE invite_code = %s
            """,
            (invite_code,)
        )
        invite = cur.fetchone()
        
        if not invite:
            cur.close()
            conn.close()
            return {'error': 'Неверный код приглашения'}
        
        cur.execute(
            f"""
            SELECT fm.id, fm.family_id, f.name as family_name 
            FROM {SCHEMA}.family_members fm
            JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE fm.user_id = %s
            """,
            (user_id,)
        )
        existing_member = cur.fetchone()
        
        if existing_member and not force_leave:
            if existing_member['family_id'] == invite['family_id']:
                cur.close()
                conn.close()
                return {
                    'success': True,
                    'already_member': True,
                    'message': 'Вы уже состоите в этой семье'
                }
            
            cur.execute(
                f"SELECT name FROM {SCHEMA}.families WHERE id = %s",
                (invite['family_id'],)
            )
            target_family = cur.fetchone()
            
            cur.close()
            conn.close()
            return {
                'warning': True,
                'current_family': existing_member['family_name'],
                'target_family': target_family['name'] if target_family else 'новой семье',
                'message': f'Вы уже состоите в семье "{existing_member["family_name"]}". Присоединение к новой семье приведёт к выходу из текущей.'
            }
        
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
        
        if existing_member and force_leave:
            cur.execute(
                f"""
                DELETE FROM {SCHEMA}.family_members 
                WHERE id = %s
                """,
                (existing_member['id'],)
            )
        
        cur.execute(
            f"""
            SELECT id FROM {SCHEMA}.family_members
            WHERE family_id = %s AND name = %s AND user_id IS NULL
            """,
            (invite['family_id'], member_name)
        )
        temp_member = cur.fetchone()
        
        if temp_member:
            cur.execute(
                f"""
                UPDATE {SCHEMA}.family_members
                SET user_id = %s, relationship = %s, role = %s
                WHERE id = %s
                RETURNING id
                """,
                (user_id, relationship, 'Член семьи', temp_member['id'])
            )
            member = cur.fetchone()
        else:
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.family_members 
                (family_id, user_id, name, relationship, role, points, level, workload, avatar, avatar_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (invite['family_id'], user_id, member_name, relationship, 'Член семьи', 0, 1, 0, '👤', 'emoji')
            )
            member = cur.fetchone()
        
        cur.execute(
            f"""
            UPDATE {SCHEMA}.family_invites
            SET uses_count = uses_count + 1
            WHERE id = %s
            """,
            (invite['id'],)
        )
        
        cur.execute(
            f"SELECT name FROM {SCHEMA}.families WHERE id = %s",
            (invite['family_id'],)
        )
        family = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'family': {
                'id': str(invite['family_id']),
                'name': family['name'],
                'member_id': str(member['id'])
            }
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': f'Ошибка присоединения: {str(e)}'}

def list_invites(user_id: str) -> Dict[str, Any]:
    family_id = get_user_family_id(user_id)
    if not family_id:
        return {'error': 'Пользователь не состоит в семье'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT id, invite_code, max_uses, uses_count, expires_at, is_active, created_at
        FROM {SCHEMA}.family_invites
        WHERE family_id = %s AND is_active = TRUE
        ORDER BY created_at DESC
        """,
        (family_id,)
    )
    invites = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'invites': [dict(invite) for invite in invites]
    }

def delete_invite(user_id: str, invite_id: str) -> Dict[str, Any]:
    family_id = get_user_family_id(user_id)
    if not family_id:
        return {'error': 'Пользователь не состоит в семье'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем, что приглашение принадлежит семье пользователя
        cur.execute(
            f"""
            SELECT family_id FROM {SCHEMA}.family_invites
            WHERE id = %s
            """,
            (invite_id,)
        )
        invite = cur.fetchone()
        
        if not invite:
            cur.close()
            conn.close()
            return {'error': 'Приглашение не найдено'}
        
        if str(invite['family_id']) != family_id:
            cur.close()
            conn.close()
            return {'error': 'Нет доступа к этому приглашению'}
        
        # Деактивируем приглашение вместо удаления
        cur.execute(
            f"""
            UPDATE {SCHEMA}.family_invites
            SET is_active = FALSE
            WHERE id = %s
            """,
            (invite_id,)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': f'Ошибка удаления: {str(e)}'}

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
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'create':
                max_uses = body.get('max_uses', 1)
                days_valid = body.get('days_valid', 7)
                invite_type = body.get('invite_type', 'link')
                invite_value = body.get('invite_value', '')
                role = body.get('role', 'parent')
                result = create_invite(user_id, max_uses, days_valid, invite_type, invite_value, role)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(result, default=str)
                }
            
            elif action == 'join':
                invite_code = body.get('invite_code', '')
                member_name = body.get('member_name', '')
                relationship = body.get('relationship', '')
                force_leave = body.get('force_leave', False)
                
                if not invite_code or not member_name:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуются код приглашения и имя'})
                    }
                
                result = join_family(user_id, invite_code, member_name, relationship, force_leave)
                
                if 'warning' in result:
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            elif action == 'delete':
                invite_id = body.get('invite_id', '')
                
                if not invite_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуется ID приглашения'})
                    }
                
                result = delete_invite(user_id, invite_id)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
        
        elif method == 'GET':
            result = list_invites(user_id)
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }