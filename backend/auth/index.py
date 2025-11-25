"""
Business: Регистрация и авторизация пользователей через телефон + OAuth (Yandex ID)
Args: event с httpMethod, path, body
Returns: JSON с токеном сессии или редирект на OAuth провайдера
"""

import json
import os
import hashlib
import secrets
import re
import urllib.parse
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
YANDEX_CLIENT_ID = os.environ.get('YANDEX_CLIENT_ID')
YANDEX_CLIENT_SECRET = os.environ.get('YANDEX_CLIENT_SECRET')
SCHEMA = 't_p5815085_family_assistant_pro'

# Force redeploy to pick up updated secrets

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
        existing_user = cur.fetchone()
        
        if existing_user and not invite_code:
            cur.close()
            conn.close()
            return {'error': 'Телефон уже зарегистрирован'}
        
        if existing_user and invite_code:
            user_id = existing_user['id']
            
            cur.execute(
                f"SELECT family_id FROM {SCHEMA}.family_members WHERE user_id = {escape_string(user_id)}"
            )
            old_member = cur.fetchone()
            
            if old_member:
                old_family_id = old_member['family_id']
                
                cur.execute(
                    f"SELECT COUNT(*) as count FROM {SCHEMA}.family_members WHERE family_id = {escape_string(old_family_id)}"
                )
                members_count = cur.fetchone()['count']
                
                if members_count <= 1:
                    cur.execute(f"DELETE FROM {SCHEMA}.tasks WHERE family_id = {escape_string(old_family_id)}")
                    cur.execute(f"DELETE FROM {SCHEMA}.family_invites WHERE family_id = {escape_string(old_family_id)}")
                    cur.execute(f"DELETE FROM {SCHEMA}.family_members WHERE family_id = {escape_string(old_family_id)}")
                    cur.execute(f"DELETE FROM {SCHEMA}.families WHERE id = {escape_string(old_family_id)}")
                else:
                    cur.execute(f"DELETE FROM {SCHEMA}.family_members WHERE user_id = {escape_string(user_id)}")
            
            update_password = f"""
                UPDATE {SCHEMA}.users 
                SET password_hash = {escape_string(password_hash)}
                WHERE id = {escape_string(user_id)}
            """
            cur.execute(update_password)
            
            user = {'id': user_id, 'email': None, 'phone': phone, 'created_at': None}
        else:
            existing_user = None
        
        if not existing_user:
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
            
            final_member_name = member_name or phone[-4:]
            insert_member = f"""
                INSERT INTO {SCHEMA}.family_members 
                (family_id, user_id, name, role, points, level, workload, avatar, avatar_type) 
                VALUES (
                    {escape_string(family['id'])}, 
                    {escape_string(user['id'])}, 
                    {escape_string(final_member_name)}, 
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

def login_user(phone: str, password: str) -> Dict[str, Any]:
    if not phone or not password:
        return {'error': 'Телефон и пароль обязательны'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        password_hash = hash_password(password)
        
        query = f"""
            SELECT id, email, phone, password_hash 
            FROM {SCHEMA}.users 
            WHERE phone = {escape_string(phone)}
        """
        cur.execute(query)
        user = cur.fetchone()
        
        if not user or user['password_hash'] != password_hash:
            cur.close()
            conn.close()
            return {'error': 'Неверный телефон или пароль'}
        
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
        
        member_query = f"""
            SELECT fm.id, fm.family_id, f.name as family_name
            FROM {SCHEMA}.family_members fm
            JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE fm.user_id = {escape_string(user['id'])}
            LIMIT 1
        """
        cur.execute(member_query)
        member = cur.fetchone()
        
        user_data = {
            'id': str(user['id']),
            'email': user['email'],
            'phone': user['phone']
        }
        
        if member:
            user_data['family_id'] = str(member['family_id'])
            user_data['family_name'] = member['family_name']
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
        return {'error': f'Ошибка авторизации: {str(e)}'}

def get_current_user(token: str) -> Dict[str, Any]:
    if not token:
        return {'error': 'Токен не предоставлен'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT s.user_id, s.expires_at, u.email, u.phone, u.oauth_provider, u.name, u.avatar_url
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = {escape_string(token)}
        """
        cur.execute(query)
        session = cur.fetchone()
        
        if not session:
            cur.close()
            conn.close()
            return {'error': 'Сессия не найдена'}
        
        if session['expires_at'] < datetime.now():
            cur.close()
            conn.close()
            return {'error': 'Сессия истекла'}
        
        member_query = f"""
            SELECT fm.id, fm.family_id, f.name as family_name
            FROM {SCHEMA}.family_members fm
            JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE fm.user_id = {escape_string(session['user_id'])}
            LIMIT 1
        """
        cur.execute(member_query)
        member = cur.fetchone()
        
        user_data = {
            'id': str(session['user_id']),
            'email': session['email'],
            'phone': session['phone'],
            'oauth_provider': session['oauth_provider'],
            'name': session['name'],
            'avatar_url': session['avatar_url']
        }
        
        if member:
            user_data['family_id'] = str(member['family_id'])
            user_data['family_name'] = member['family_name']
            user_data['member_id'] = str(member['id'])
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'user': user_data
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка получения пользователя: {str(e)}'}

def oauth_login_yandex(callback_url: str, frontend_url: str = '') -> Dict[str, Any]:
    """Генерирует URL для редиректа на Yandex OAuth"""
    if not YANDEX_CLIENT_ID:
        return {'error': 'YANDEX_CLIENT_ID не настроен'}
    
    state_data = {
        'random': secrets.token_urlsafe(8),
        'frontend': frontend_url or 'https://webapp.poehali.dev/login'
    }
    state = json.dumps(state_data)
    
    params = {
        'response_type': 'code',
        'client_id': YANDEX_CLIENT_ID,
        'redirect_uri': callback_url,
        'state': state
    }
    
    oauth_url = 'https://oauth.yandex.ru/authorize?' + urllib.parse.urlencode(params)
    
    return {
        'redirect_url': oauth_url,
        'state': state
    }

def oauth_callback_yandex(code: str, redirect_uri: str) -> Dict[str, Any]:
    """Обрабатывает callback от Yandex OAuth"""
    if not YANDEX_CLIENT_ID or not YANDEX_CLIENT_SECRET:
        return {'error': 'OAuth credentials не настроены'}
    
    import urllib.request
    
    token_url = 'https://oauth.yandex.ru/token'
    token_data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': YANDEX_CLIENT_ID,
        'client_secret': YANDEX_CLIENT_SECRET,
        'redirect_uri': redirect_uri
    }).encode()
    
    try:
        token_req = urllib.request.Request(token_url, data=token_data, method='POST')
        token_req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        try:
            with urllib.request.urlopen(token_req) as response:
                token_response = json.loads(response.read().decode())
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            return {'error': f'Яндекс вернул ошибку: {e.code} - {error_body}'}
        
        access_token = token_response.get('access_token')
        if not access_token:
            return {'error': f'Не получен access_token от Yandex. Ответ: {token_response}'}
        
        user_info_url = 'https://login.yandex.ru/info?format=json'
        user_req = urllib.request.Request(user_info_url)
        user_req.add_header('Authorization', f'OAuth {access_token}')
        
        with urllib.request.urlopen(user_req) as response:
            user_info = json.loads(response.read().decode())
        
        yandex_id = user_info.get('id')
        email = user_info.get('default_email')
        name = user_info.get('display_name') or user_info.get('real_name') or email
        avatar_url = None
        if user_info.get('default_avatar_id'):
            avatar_url = f"https://avatars.yandex.net/get-yapic/{user_info['default_avatar_id']}/islands-200"
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        check_query = f"""
            SELECT id FROM {SCHEMA}.users 
            WHERE oauth_provider = 'yandex' AND oauth_id = {escape_string(yandex_id)}
        """
        cur.execute(check_query)
        existing_user = cur.fetchone()
        
        if existing_user:
            user_id = existing_user['id']
            
            update_user = f"""
                UPDATE {SCHEMA}.users
                SET name = {escape_string(name)},
                    avatar_url = {escape_string(avatar_url)},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = {escape_string(user_id)}
            """
            cur.execute(update_user)
        else:
            insert_user = f"""
                INSERT INTO {SCHEMA}.users 
                (email, oauth_provider, oauth_id, name, avatar_url, is_verified, password_hash)
                VALUES (
                    {escape_string(email)},
                    'yandex',
                    {escape_string(yandex_id)},
                    {escape_string(name)},
                    {escape_string(avatar_url)},
                    TRUE,
                    NULL
                )
                RETURNING id
            """
            try:
                cur.execute(insert_user)
                user = cur.fetchone()
                user_id = user['id']
            except Exception as insert_error:
                cur.close()
                conn.close()
                return {'error': f'Ошибка создания пользователя: {str(insert_error)}. SQL: {insert_user}'}
            
            default_family_name = f"Семья {name}"
            insert_family = f"""
                INSERT INTO {SCHEMA}.families (name)
                VALUES ({escape_string(default_family_name)})
                RETURNING id
            """
            cur.execute(insert_family)
            family = cur.fetchone()
            family_id = family['id']
            
            insert_member = f"""
                INSERT INTO {SCHEMA}.family_members
                (family_id, user_id, name, role, points, level, workload, avatar, avatar_type)
                VALUES (
                    {escape_string(family_id)},
                    {escape_string(user_id)},
                    {escape_string(name)},
                    'Владелец',
                    0, 1, 0,
                    '👤',
                    'emoji'
                )
            """
            cur.execute(insert_member)
        
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=30)
        
        insert_session = f"""
            INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at)
            VALUES (
                {escape_string(user_id)},
                {escape_string(token)},
                {escape_string(expires_at.isoformat())}
            )
        """
        cur.execute(insert_session)
        
        member_query = f"""
            SELECT fm.id, fm.family_id, f.name as family_name
            FROM {SCHEMA}.family_members fm
            JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE fm.user_id = {escape_string(user_id)}
            LIMIT 1
        """
        cur.execute(member_query)
        member = cur.fetchone()
        
        user_data = {
            'id': str(user_id),
            'email': email,
            'oauth_provider': 'yandex',
            'name': name,
            'avatar_url': avatar_url
        }
        
        if member:
            user_data['family_id'] = str(member['family_id'])
            user_data['family_name'] = member['family_name']
            user_data['member_id'] = str(member['id'])
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'token': token,
            'user': user_data
        }
        
    except Exception as e:
        return {'error': f'Ошибка OAuth: {str(e)}'}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    oauth_action = query_params.get('oauth')
    
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
    
    if oauth_action == 'yandex' and method == 'GET':
        callback_url = query_params.get('callback_url')
        frontend_url = query_params.get('frontend_url', 'https://webapp.poehali.dev/login')
        
        if not callback_url:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'callback_url обязателен'})
            }
        
        result = oauth_login_yandex(callback_url, frontend_url)
        
        if 'error' in result:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 302,
            'headers': {
                'Location': result['redirect_url'],
                'Access-Control-Allow-Origin': '*'
            },
            'body': ''
        }
    
    if oauth_action == 'yandex_callback' and method == 'GET':
        code = query_params.get('code')
        state = query_params.get('state')
        
        frontend_url = 'https://webapp.poehali.dev/login'
        if state:
            try:
                state_data = json.loads(state)
                frontend_url = state_data.get('frontend', frontend_url)
            except:
                pass
        
        if not code:
            error_url = f"{frontend_url}?error={urllib.parse.quote('code обязателен')}"
            return {
                'statusCode': 302,
                'headers': {
                    'Location': error_url,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': ''
            }
        
        callback_url = "https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?oauth=yandex_callback"
        result = oauth_callback_yandex(code, callback_url)
        
        if 'error' in result:
            error_url = f"{frontend_url}?error={urllib.parse.quote(result['error'])}"
            return {
                'statusCode': 302,
                'headers': {
                    'Location': error_url,
                    'Access-Control-Allow-Origin': '*'
                },
                'body': ''
            }
        
        success_url = f"{frontend_url}?token={result['token']}&user={urllib.parse.quote(json.dumps(result['user']))}"
        return {
            'statusCode': 302,
            'headers': {
                'Location': success_url,
                'Access-Control-Allow-Origin': '*'
            },
            'body': ''
        }
    
    if method == 'GET':
        token = event.get('headers', {}).get('X-Auth-Token') or query_params.get('token')
        
        if token:
            result = get_current_user(token)
            status_code = 200 if result.get('success') else 401
            return {
                'statusCode': status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, ensure_ascii=False)
            }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Токен не предоставлен'})
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
        except:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Некорректный JSON'})
            }
        
        action = body.get('action')
        
        if action == 'register':
            result = register_user(
                phone=body.get('phone'),
                password=body.get('password'),
                family_name=body.get('family_name'),
                invite_code=body.get('invite_code'),
                member_name=body.get('member_name'),
                relationship=body.get('relationship')
            )
        elif action == 'login':
            result = login_user(
                phone=body.get('phone'),
                password=body.get('password')
            )
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
        
        status_code = 200 if result.get('success') else 400
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False)
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }