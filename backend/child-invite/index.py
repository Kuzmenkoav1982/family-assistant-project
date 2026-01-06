"""
Backend функция для создания инвайт-ссылок для активации детских профилей.
Позволяет администратору семьи создать уникальную ссылку для ребёнка,
по которой ребёнок сможет привязать свой аккаунт Yandex ID.
"""

import json
import os
import uuid
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
    if isinstance(value, list):
        return "'" + json.dumps(value).replace("'", "''") + "'"
    if isinstance(value, dict):
        return "'" + json.dumps(value).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Проверка токена и получение данных пользователя"""
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT s.user_id, fm.family_id, fm.id as member_id
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
            WHERE s.token = {escape_string(token)} 
            AND s.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        """
        cur.execute(query)
        result = cur.fetchone()
        
        if result:
            return {
                'user_id': result['user_id'],
                'family_id': result['family_id'],
                'member_id': result['member_id']
            }
        return None
    finally:
        cur.close()
        conn.close()

def create_child_invite(family_id: str, child_member_id: str, created_by: str) -> Dict[str, Any]:
    """Создание инвайт-ссылки для детского профиля"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем, что это детский профиль без активности
        check_query = f"""
            SELECT id, name, account_type
            FROM {SCHEMA}.family_members
            WHERE id = {escape_string(child_member_id)}::uuid 
            AND family_id = {escape_string(family_id)}::uuid
            AND account_type = 'child_profile'
        """
        cur.execute(check_query)
        child = cur.fetchone()
        
        if not child:
            return {'success': False, 'error': 'Детский профиль не найден'}
        
        # Генерируем уникальный токен
        invite_token = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(days=365)  # Действует год
        
        # Создаём инвайт
        insert_query = f"""
            INSERT INTO {SCHEMA}.child_invites 
            (family_id, child_member_id, invite_token, created_by, expires_at)
            VALUES (
                {escape_string(family_id)}::uuid,
                {escape_string(child_member_id)}::uuid,
                {escape_string(invite_token)},
                {escape_string(created_by)}::uuid,
                {escape_string(expires_at.isoformat())}
            )
            RETURNING id, invite_token
        """
        cur.execute(insert_query)
        result = cur.fetchone()
        
        if result:
            invite_url = f"https://family-assistant-project--preview.poehali.dev/activate/{result['invite_token']}"
            return {
                'success': True,
                'invite_token': result['invite_token'],
                'invite_url': invite_url,
                'child_name': child['name']
            }
        
        return {'success': False, 'error': 'Не удалось создать инвайт'}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        cur.close()
        conn.close()

def get_invite_info(invite_token: str) -> Dict[str, Any]:
    """Получение информации об инвайте"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT 
                ci.id,
                ci.family_id,
                ci.child_member_id,
                ci.invite_token,
                ci.is_used,
                ci.used_at,
                ci.expires_at,
                fm.name as child_name,
                f.name as family_name
            FROM {SCHEMA}.child_invites ci
            JOIN {SCHEMA}.family_members fm ON ci.child_member_id = fm.id
            JOIN {SCHEMA}.families f ON ci.family_id = f.id
            WHERE ci.invite_token = {escape_string(invite_token)}
            AND ci.is_used = FALSE
            AND ci.expires_at > NOW()
        """
        cur.execute(query)
        result = cur.fetchone()
        
        if result:
            return {'success': True, 'invite': dict(result)}
        
        return {'success': False, 'error': 'Приглашение недействительно или истекло'}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        cur.close()
        conn.close()

def activate_child_account(invite_token: str, yandex_user_id: str) -> Dict[str, Any]:
    """Активация детского аккаунта через инвайт"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Получаем информацию об инвайте
        invite_info = get_invite_info(invite_token)
        
        if not invite_info['success']:
            return invite_info
        
        invite = invite_info['invite']
        
        # Обновляем child_member: привязываем user_id и меняем account_type
        update_member_query = f"""
            UPDATE {SCHEMA}.family_members
            SET 
                user_id = {escape_string(yandex_user_id)},
                account_type = 'full',
                updated_at = NOW()
            WHERE id = {invite['child_member_id']}
            RETURNING id, name, user_id
        """
        cur.execute(update_member_query)
        updated_member = cur.fetchone()
        
        if not updated_member:
            return {'success': False, 'error': 'Не удалось активировать аккаунт'}
        
        # Отмечаем инвайт как использованный
        mark_used_query = f"""
            UPDATE {SCHEMA}.child_invites
            SET 
                is_used = TRUE,
                used_at = NOW(),
                activated_user_id = {escape_string(yandex_user_id)}
            WHERE invite_token = {escape_string(invite_token)}
        """
        cur.execute(mark_used_query)
        
        return {
            'success': True,
            'member_id': updated_member['id'],
            'member_name': updated_member['name'],
            'family_id': str(invite['family_id'])
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        cur.close()
        conn.close()

def handler(event: dict, context) -> dict:
    """
    Обработка запросов для работы с инвайтами детских профилей.
    
    Методы:
    - POST /create: создать инвайт для детского профиля
    - POST /info: получить информацию об инвайте
    - POST /activate: активировать детский аккаунт
    """
    
    method = event.get('httpMethod', 'POST')
    
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
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'create')
        
        # Для info и activate токен не обязателен
        if action in ['info', 'activate']:
            if action == 'info':
                invite_token = body.get('invite_token')
                if not invite_token:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Не указан invite_token'})
                    }
                
                result = get_invite_info(invite_token)
                
                return {
                    'statusCode': 200 if result['success'] else 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, ensure_ascii=False)
                }
            
            elif action == 'activate':
                invite_token = body.get('invite_token')
                yandex_user_id = body.get('yandex_user_id')
                
                if not invite_token or not yandex_user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Не указаны обязательные параметры'})
                    }
                
                result = activate_child_account(invite_token, yandex_user_id)
                
                return {
                    'statusCode': 200 if result['success'] else 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result, ensure_ascii=False)
                }
        
        # Для create нужна авторизация
        token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
        user_data = verify_token(token)
        
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Unauthorized'})
            }
        
        if action == 'create':
            child_member_id = body.get('child_member_id')
            
            if not child_member_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Не указан child_member_id'})
                }
            
            result = create_child_invite(
                family_id=str(user_data['family_id']),
                child_member_id=child_member_id,
                created_by=user_data['member_id']
            )
            
            return {
                'statusCode': 200 if result['success'] else 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, ensure_ascii=False)
            }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Неизвестное действие'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}, ensure_ascii=False)
        }