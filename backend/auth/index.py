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
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from audit_helper import log_auth_action

DATABASE_URL = os.environ.get('DATABASE_URL')
YANDEX_CLIENT_ID = os.environ.get('YANDEX_CLIENT_ID')
YANDEX_CLIENT_SECRET = os.environ.get('YANDEX_CLIENT_SECRET')
SCHEMA = 't_p5815085_family_assistant_pro'
NOTIFICATIONS_URL = 'https://functions.poehali.dev/82852794-3586-44b2-8796-f0de94642774'

# Force redeploy: New Yandex OAuth app credentials (28.12.2025)
# Client ID: 1b7664da437442acbcef20ef175f8c39
# Redirect URI: https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0

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

def generate_reset_code() -> str:
    """Генерирует 6-значный код восстановления"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def send_sms(phone: str, message: str) -> bool:
    """Отправка SMS через notifications функцию"""
    try:
        response = requests.post(
            f"{NOTIFICATIONS_URL}?action=sms",
            json={'phone': phone, 'message': message},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        return response.status_code == 200
    except:
        return False

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
                SELECT name, logo_url FROM {SCHEMA}.families WHERE id = {escape_string(invite['family_id'])}
            """
            cur.execute(select_family)
            family = cur.fetchone()
            
            user_data['family_id'] = str(invite['family_id'])
            user_data['family_name'] = family['name']
            user_data['logo_url'] = family.get('logo_url')
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
            user_data['logo_url'] = family.get('logo_url')
            user_data['member_id'] = str(member['id'])
        
        cur.close()
        conn.close()
        
        # Логирование регистрации
        log_auth_action(
            user_id=user['id'],
            action_type='register',
            details={'phone': phone, 'has_invite': bool(invite_code)},
            status='success'
        )
        
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
        
        if not user or not user['password_hash'] or user['password_hash'] != password_hash:
            cur.close()
            conn.close()
            # Логирование неудачной попытки входа
            if user:
                log_auth_action(
                    user_id=user['id'],
                    action_type='login',
                    details={'phone': phone},
                    status='failure',
                    error_message='Неверный пароль'
                )
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
            SELECT fm.id, fm.family_id, f.name as family_name, f.logo_url
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
            user_data['logo_url'] = member.get('logo_url')
            user_data['member_id'] = str(member['id'])
        
        cur.close()
        conn.close()
        
        # Логирование успешного входа
        log_auth_action(
            user_id=user['id'],
            action_type='login',
            details={'phone': phone, 'method': 'password'},
            status='success'
        )
        
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
            SELECT fm.id, fm.family_id, f.name as family_name, f.logo_url
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
            user_data['logo_url'] = member.get('logo_url')
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

def request_password_reset(phone: str) -> Dict[str, Any]:
    """Запрос на восстановление пароля - генерирует код и отправляет SMS"""
    if not phone or not validate_phone(phone):
        return {'error': 'Некорректный номер телефона'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        check_query = f"SELECT id FROM {SCHEMA}.users WHERE phone = {escape_string(phone)}"
        cur.execute(check_query)
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {'error': 'Пользователь с таким телефоном не найден'}
        
        reset_code = generate_reset_code()
        expires_at = datetime.now() + timedelta(minutes=10)
        
        delete_old = f"""
            DELETE FROM {SCHEMA}.password_reset_tokens 
            WHERE user_id = {escape_string(user['id'])}
        """
        cur.execute(delete_old)
        
        insert_reset = f"""
            INSERT INTO {SCHEMA}.password_reset_tokens (user_id, reset_code, expires_at, used)
            VALUES (
                {escape_string(user['id'])},
                {escape_string(reset_code)},
                {escape_string(expires_at.isoformat())},
                FALSE
            )
        """
        cur.execute(insert_reset)
        
        sms_sent = send_sms(phone, f'Код восстановления пароля: {reset_code}. Действителен 10 минут.')
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': 'Код отправлен на ваш телефон',
            'sms_sent': sms_sent
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка запроса восстановления: {str(e)}'}

def reset_password(phone: str, reset_code: str, new_password: str) -> Dict[str, Any]:
    """Сброс пароля по коду из SMS"""
    if not phone or not reset_code or not new_password:
        return {'error': 'Все поля обязательны'}
    
    if len(new_password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT pr.user_id, pr.expires_at, pr.used, u.phone
            FROM {SCHEMA}.password_reset_tokens pr
            JOIN {SCHEMA}.users u ON u.id = pr.user_id
            WHERE u.phone = {escape_string(phone)} 
            AND pr.reset_code = {escape_string(reset_code)}
        """
        cur.execute(query)
        reset = cur.fetchone()
        
        if not reset:
            cur.close()
            conn.close()
            return {'error': 'Неверный код восстановления'}
        
        if reset['used']:
            cur.close()
            conn.close()
            return {'error': 'Код уже использован'}
        
        if reset['expires_at'] < datetime.now():
            cur.close()
            conn.close()
            return {'error': 'Код восстановления истёк'}
        
        password_hash = hash_password(new_password)
        update_password = f"""
            UPDATE {SCHEMA}.users
            SET password_hash = {escape_string(password_hash)}
            WHERE id = {escape_string(reset['user_id'])}
        """
        cur.execute(update_password)
        
        mark_used = f"""
            UPDATE {SCHEMA}.password_reset_tokens
            SET used = TRUE
            WHERE user_id = {escape_string(reset['user_id'])}
            AND reset_code = {escape_string(reset_code)}
        """
        cur.execute(mark_used)
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': 'Пароль успешно изменён'
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка сброса пароля: {str(e)}'}

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
                    ''
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
            
            default_family_name = "Моя семья"
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
            SELECT fm.id, fm.family_id, fm.access_role, 
                   f.name as family_name, f.logo_url
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
            user_data['logo_url'] = member.get('logo_url')
            user_data['member_id'] = str(member['id'])
            user_data['access_role'] = member.get('access_role', 'viewer')
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'token': token,
            'user': user_data
        }
        
    except Exception as e:
        return {'error': f'Ошибка OAuth: {str(e)}'}

def register_user_email(email: str, password: str, name: str = '') -> Dict[str, Any]:
    """Регистрация через email"""
    if not email or '@' not in email:
        return {'error': 'Некорректный email'}
    
    if len(password) < 6:
        return {'error': 'Пароль должен быть минимум 6 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        check_query = f"SELECT id FROM {SCHEMA}.users WHERE email = {escape_string(email.lower())}"
        cur.execute(check_query)
        existing_user = cur.fetchone()
        
        if existing_user:
            cur.close()
            conn.close()
            return {'error': 'Email уже зарегистрирован'}
        
        password_hash = hash_password(password)
        
        insert_user = f"""
            INSERT INTO {SCHEMA}.users (email, password_hash, name, is_verified) 
            VALUES ({escape_string(email.lower())}, {escape_string(password_hash)}, {escape_string(name)}, TRUE) 
            RETURNING id, email, name
        """
        cur.execute(insert_user)
        user = cur.fetchone()
        
        family_name = "Моя семья"
        insert_family = f"""
            INSERT INTO {SCHEMA}.families (name) 
            VALUES ({escape_string(family_name)}) 
            RETURNING id
        """
        cur.execute(insert_family)
        family = cur.fetchone()
        
        insert_member = f"""
            INSERT INTO {SCHEMA}.family_members
            (family_id, user_id, name, role, points, level, workload, avatar, avatar_type)
            VALUES (
                {escape_string(family['id'])},
                {escape_string(user['id'])},
                {escape_string(name or email.split('@')[0])},
                'Владелец',
                0, 1, 0,
                '👤',
                'emoji'
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
                'name': user['name'],
                'family_id': str(family['id']),
                'family_name': family_name,
                'member_id': str(member['id'])
            }
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка регистрации: {str(e)}'}

def login_user_email(email: str, password: str) -> Dict[str, Any]:
    """Вход через email"""
    if not email or not password:
        return {'error': 'Email и пароль обязательны'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        user_query = f"""
            SELECT id, email, password_hash, name, avatar_url
            FROM {SCHEMA}.users
            WHERE email = {escape_string(email.lower())}
        """
        cur.execute(user_query)
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {'error': 'Неверный email или пароль'}
        
        password_hash = hash_password(password)
        if user['password_hash'] != password_hash:
            cur.close()
            conn.close()
            return {'error': 'Неверный email или пароль'}
        
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
            SELECT fm.id, fm.family_id, f.name as family_name, f.logo_url
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
            'name': user['name'],
            'avatar_url': user['avatar_url']
        }
        
        if member:
            user_data['family_id'] = str(member['family_id'])
            user_data['family_name'] = member['family_name']
            user_data['logo_url'] = member.get('logo_url')
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
        return {'error': f'Ошибка входа: {str(e)}'}

def delete_user_account(user_id: str) -> Dict[str, Any]:
    """Удаление аккаунта пользователя и всех связанных данных"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        check_query = f"SELECT id FROM {SCHEMA}.users WHERE id = {escape_string(user_id)}"
        cur.execute(check_query)
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {'error': 'Пользователь не найден'}
        
        delete_sessions = f"DELETE FROM {SCHEMA}.sessions WHERE user_id = {escape_string(user_id)}"
        cur.execute(delete_sessions)
        
        delete_members = f"DELETE FROM {SCHEMA}.family_members WHERE user_id = {escape_string(user_id)}"
        cur.execute(delete_members)
        
        delete_user = f"DELETE FROM {SCHEMA}.users WHERE id = {escape_string(user_id)}"
        cur.execute(delete_user)
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': 'Аккаунт успешно удалён'
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': f'Ошибка удаления аккаунта: {str(e)}'}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    oauth_action = query_params.get('oauth')
    action_param = query_params.get('action')
    
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
    
    if action_param == 'delete_account' and method == 'POST':
        token = event.get('headers', {}).get('X-Auth-Token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        user_result = get_current_user(token)
        if not user_result.get('success'):
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Неверный токен'})
            }
        
        user_id = user_result['user']['id']
        result = delete_user_account(user_id)
        
        status_code = 200 if result.get('success') else 400
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False)
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
            if body.get('email'):
                result = register_user_email(
                    email=body.get('email'),
                    password=body.get('password'),
                    name=body.get('name', '')
                )
            else:
                result = register_user(
                    phone=body.get('phone'),
                    password=body.get('password'),
                    family_name=body.get('family_name'),
                    invite_code=body.get('invite_code'),
                    member_name=body.get('member_name'),
                    relationship=body.get('relationship')
                )
        elif action == 'login':
            if body.get('email'):
                result = login_user_email(
                    email=body.get('email'),
                    password=body.get('password')
                )
            else:
                result = login_user(
                    phone=body.get('phone'),
                    password=body.get('password')
                )
        elif action == 'request_reset':
            result = request_password_reset(
                phone=body.get('phone')
            )
        elif action == 'reset_password':
            if body.get('email') and not body.get('reset_code'):
                # Email password reset request
                email = body.get('email')
                if not email or '@' not in email:
                    result = {'error': 'Некорректный email'}
                else:
                    conn = get_db_connection()
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    
                    try:
                        # Check if user exists
                        check_query = f"SELECT id FROM {SCHEMA}.users WHERE email = {escape_string(email.lower())}"
                        cur.execute(check_query)
                        user = cur.fetchone()
                        
                        if not user:
                            cur.close()
                            conn.close()
                            result = {'error': 'Пользователь с таким email не найден'}
                        else:
                            # Generate reset code
                            reset_code = generate_reset_code()
                            expires_at = datetime.now() + timedelta(minutes=15)
                            
                            # Insert into password_resets table
                            insert_reset = f"""
                                INSERT INTO {SCHEMA}.password_resets (email, reset_code, expires_at, created_at)
                                VALUES (
                                    {escape_string(email.lower())},
                                    {escape_string(reset_code)},
                                    {escape_string(expires_at.isoformat())},
                                    {escape_string(datetime.now().isoformat())}
                                )
                            """
                            cur.execute(insert_reset)
                            
                            # Send email via NOTIFICATIONS_URL
                            email_body = f"Ваш код для восстановления пароля: {reset_code}. Код действителен в течение 15 минут."
                            email_html = f"""
                            <html>
                            <body style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>Код восстановления пароля</h2>
                                <p>Ваш код для восстановления пароля:</p>
                                <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">{reset_code}</h1>
                                <p>Код действителен в течение 15 минут.</p>
                                <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
                            </body>
                            </html>
                            """
                            
                            try:
                                print(f"[DEBUG] Отправка email на {email}, код: {reset_code}")
                                response = requests.post(
                                    NOTIFICATIONS_URL,
                                    json={
                                        'action': 'send_email',
                                        'to': email,
                                        'subject': 'Код восстановления пароля',
                                        'body': email_body,
                                        'html': email_html
                                    },
                                    headers={'Content-Type': 'application/json'},
                                    timeout=10
                                )
                                print(f"[DEBUG] Notifications response: {response.status_code}, {response.text[:200]}")
                                email_sent = response.status_code == 200
                            except Exception as email_error:
                                print(f"[ERROR] Ошибка отправки email: {str(email_error)}")
                                email_sent = False
                            
                            cur.close()
                            conn.close()
                            
                            result = {'success': True, 'debug_email_sent': email_sent}
                    except Exception as e:
                        cur.close()
                        conn.close()
                        result = {'error': f'Ошибка запроса восстановления: {str(e)}'}
            elif body.get('reset_code') and body.get('new_password'):
                # Email password reset confirmation with code
                email = body.get('email')
                reset_code = body.get('reset_code')
                new_password = body.get('new_password')
                
                if not email or not reset_code or not new_password:
                    result = {'error': 'Email, код и новый пароль обязательны'}
                elif len(new_password) < 6:
                    result = {'error': 'Пароль должен быть минимум 6 символов'}
                else:
                    conn = get_db_connection()
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    
                    try:
                        # Find valid reset code
                        check_reset = f"""
                            SELECT id, email, expires_at, used_at
                            FROM {SCHEMA}.password_resets
                            WHERE email = {escape_string(email.lower())}
                            AND reset_code = {escape_string(reset_code)}
                            ORDER BY created_at DESC
                            LIMIT 1
                        """
                        cur.execute(check_reset)
                        reset = cur.fetchone()
                        
                        if not reset:
                            result = {'error': 'Неверный код восстановления'}
                        elif reset['used_at'] is not None:
                            result = {'error': 'Код уже использован'}
                        elif reset['expires_at'] < datetime.now():
                            result = {'error': 'Код восстановления истёк'}
                        else:
                            # Update password
                            password_hash = hash_password(new_password)
                            update_password = f"""
                                UPDATE {SCHEMA}.users
                                SET password_hash = {escape_string(password_hash)}
                                WHERE email = {escape_string(email.lower())}
                            """
                            cur.execute(update_password)
                            
                            # Mark code as used
                            mark_used = f"""
                                UPDATE {SCHEMA}.password_resets
                                SET used_at = {escape_string(datetime.now().isoformat())}
                                WHERE id = {escape_string(reset['id'])}
                            """
                            cur.execute(mark_used)
                            
                            result = {'success': True, 'message': 'Пароль успешно изменён'}
                        
                        cur.close()
                        conn.close()
                    except Exception as e:
                        cur.close()
                        conn.close()
                        result = {'error': f'Ошибка сброса пароля: {str(e)}'}
            else:
                # Phone password reset with code (legacy)
                if body.get('phone'):
                    result = reset_password(
                        phone=body.get('phone'),
                        reset_code=body.get('reset_code'),
                        new_password=body.get('new_password')
                    )
                else:
                    result = {'error': 'Недостаточно данных для восстановления'}
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