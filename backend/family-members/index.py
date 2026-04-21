"""
Business: Управление членами семьи (получение, добавление, обновление)
Args: event с httpMethod, body, headers с X-Auth-Token
Returns: JSON со списком членов семьи или результатом операции
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = {escape_string(token)} AND expires_at > CURRENT_TIMESTAMP
    """
    cur.execute(query)
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    result = str(session['user_id']) if session else None
    print(f"[DEBUG] verify_token result: {result}")
    return result

def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    print(f"[DEBUG] get_user_family_id query: {query}")
    cur.execute(query)
    member = cur.fetchone()
    print(f"[DEBUG] get_user_family_id result: {member}")
    cur.close()
    conn.close()
    
    result = str(member['family_id']) if member and member['family_id'] else None
    print(f"[DEBUG] get_user_family_id returning: {result}")
    return result

def get_family_members(family_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT id, user_id, name, role, relationship, avatar, avatar_type, 
               photo_url, points, level, workload, age, birth_date, birth_time, 
               account_type, permissions, access_role, profile_data, created_at, updated_at
        FROM {SCHEMA}.family_members
        WHERE family_id::text = {escape_string(family_id)}
          AND name NOT LIKE '[ДУБЛИКАТ%'
        ORDER BY CASE WHEN role = 'Владелец' THEN 0 ELSE 1 END, created_at ASC
    """
    print(f"[DEBUG] get_family_members query: {query}")
    cur.execute(query)
    members = cur.fetchall()
    print(f"[DEBUG] get_family_members fetched {len(members)} members")
    cur.close()
    conn.close()
    
    # Объединяем данные из profile_data с основными полями
    result = []
    for m in members:
        member_dict = dict(m)
        profile_data = member_dict.get('profile_data', {})
        if profile_data:
            # Добавляем поля из profile_data в основной словарь
            for field in ['achievements', 'responsibilities', 'foodPreferences', 'dreams', 'piggyBank', 'moodStatus']:
                if field in profile_data:
                    member_dict[field] = profile_data[field]
        result.append(member_dict)
    
    print(f"[DEBUG] get_family_members returning: {result}")
    return result

def add_family_member(family_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Определяем тип аккаунта: если user_id непустой - full, иначе child_profile
        user_id = data.get('user_id')
        account_type = 'full' if (user_id and user_id != 'null') else data.get('account_type', 'child_profile')
        
        query = f"""
            INSERT INTO {SCHEMA}.family_members
            (family_id, name, role, relationship, avatar, avatar_type, 
             photo_url, points, level, workload, age, account_type)
            VALUES (
                {escape_string(family_id)},
                {escape_string(data.get('name', ''))},
                {escape_string(data.get('role', 'Член семьи'))},
                {escape_string(data.get('relationship', ''))},
                {escape_string(data.get('avatar', '👤'))},
                {escape_string(data.get('avatar_type', 'emoji'))},
                {escape_string(data.get('photo_url'))},
                {escape_string(data.get('points', 0))},
                {escape_string(data.get('level', 1))},
                {escape_string(data.get('workload', 0))},
                {escape_string(data.get('age'))},
                {escape_string(account_type)}
            )
            RETURNING id, name, role, relationship, avatar, points, level, workload, account_type
        """
        cur.execute(query)
        member = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'member': dict(member)
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def update_family_member(member_id: str, family_id: str, data: Dict[str, Any], requesting_user_id: str = '') -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        check_query = f"SELECT id, profile_data FROM {SCHEMA}.family_members WHERE id = {escape_string(member_id)} AND family_id = {escape_string(family_id)}"
        cur.execute(check_query)
        existing = cur.fetchone()
        if not existing:
            cur.close()
            conn.close()
            return {'error': 'Член семьи не найден'}
        
        role_sensitive_fields = {'access_role', 'permissions', 'role'}
        is_changing_role = any(f in data for f in role_sensitive_fields)
        
        if is_changing_role:
            if not requesting_user_id:
                cur.close()
                conn.close()
                return {'error': 'Требуется авторизация для изменения роли'}
            
            cur.execute(
                f"SELECT access_role FROM {SCHEMA}.family_members "
                f"WHERE user_id::text = {escape_string(requesting_user_id)} "
                f"AND family_id = {escape_string(family_id)} LIMIT 1"
            )
            requester = cur.fetchone()
            if not requester or requester.get('access_role') not in ('admin', 'owner'):
                cur.close()
                conn.close()
                return {'error': 'Только администратор семьи может менять роли и права'}
        
        current_profile_data = dict(existing['profile_data']) if existing.get('profile_data') else {}
        
        fields = []
        for field in ['name', 'role', 'relationship', 'avatar', 'avatar_type', 
                      'photo_url', 'points', 'level', 'workload', 'age', 'account_type']:
            if field in data:
                fields.append(f"{field} = {escape_string(data[field])}")
        
        if 'access_role' in data:
            fields.append(f"access_role = {escape_string(data['access_role'])}")
        
        # Обрабатываем birthDate и birthTime
        if 'birthDate' in data:
            fields.append(f"birth_date = {escape_string(data['birthDate'])}")
        if 'birthTime' in data:
            fields.append(f"birth_time = {escape_string(data['birthTime'])}")
        
        if 'permissions' in data:
            permissions_json = json.dumps(data['permissions'])
            fields.append(f"permissions = '{permissions_json}'::jsonb")
        
        if 'development' in data:
            development_json = json.dumps(data['development'])
            fields.append(f"development = '{development_json}'::jsonb")
        
        # Обновляем profile_data с дополнительными полями
        profile_fields = ['achievements', 'responsibilities', 'foodPreferences', 'dreams', 'piggyBank', 'moodStatus']
        profile_updated = False
        for field in profile_fields:
            if field in data:
                current_profile_data[field] = data[field]
                profile_updated = True
        
        if profile_updated:
            profile_json = json.dumps(current_profile_data, ensure_ascii=False)
            profile_json_escaped = profile_json.replace("'", "''")
            fields.append(f"profile_data = '{profile_json_escaped}'::jsonb")
        
        if not fields:
            cur.close()
            conn.close()
            return {'error': 'Нет данных для обновления'}
        
        fields.append("updated_at = CURRENT_TIMESTAMP")
        
        query = f"""
            UPDATE {SCHEMA}.family_members 
            SET {', '.join(fields)}
            WHERE id = {escape_string(member_id)} AND family_id = {escape_string(family_id)}
            RETURNING id, name, role, relationship, avatar, points, level, workload, birth_date, birth_time, account_type, access_role, permissions, profile_data
        """
        
        cur.execute(query)
        member = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'member': dict(member)
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def delete_family_member(member_id: str, family_id: str, requesting_user_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем, что запрашивающий - админ
        cur.execute(
            f"SELECT access_role FROM {SCHEMA}.family_members WHERE user_id::text = {escape_string(requesting_user_id)} AND family_id = {escape_string(family_id)}"
        )
        requester = cur.fetchone()
        
        if not requester or requester['access_role'] != 'admin':
            cur.close()
            conn.close()
            return {'error': 'Только администратор может удалять членов семьи'}
        
        # Проверяем удаляемого члена
        query = f"SELECT user_id, access_role FROM {SCHEMA}.family_members WHERE id = {escape_string(member_id)} AND family_id = {escape_string(family_id)}"
        cur.execute(query)
        member = cur.fetchone()
        
        if not member:
            cur.close()
            conn.close()
            return {'error': 'Член семьи не найден'}
        
        # Нельзя удалить администратора
        if member['access_role'] == 'admin':
            cur.close()
            conn.close()
            return {'error': 'Нельзя удалить администратора'}
        
        # Нельзя удалить самого себя
        if member['user_id'] and str(member['user_id']) == requesting_user_id:
            cur.close()
            conn.close()
            return {'error': 'Нельзя удалить самого себя'}
        
        delete_query = f"DELETE FROM {SCHEMA}.family_members WHERE id = {escape_string(member_id)} AND family_id = {escape_string(family_id)}"
        cur.execute(delete_query)
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def delete_all_duplicates(family_id: str, requesting_user_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем, что запрашивающий - админ
        cur.execute(
            f"SELECT access_role FROM {SCHEMA}.family_members WHERE user_id::text = {escape_string(requesting_user_id)} AND family_id = {escape_string(family_id)}"
        )
        requester = cur.fetchone()
        
        if not requester or requester['access_role'] != 'admin':
            cur.close()
            conn.close()
            return {'error': 'Только администратор может удалять дубликаты'}
        
        # Удаляем всех членов семьи с пометкой [ДУБЛИКАТ
        delete_query = f"""
            DELETE FROM {SCHEMA}.family_members 
            WHERE family_id = {escape_string(family_id)} 
              AND name LIKE '[ДУБЛИКАТ%'
        """
        cur.execute(delete_query)
        deleted_count = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True, 'deleted_count': deleted_count}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def get_global_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT 
                COUNT(DISTINCT id) as total_users,
                COUNT(DISTINCT family_id) as total_families
            FROM {SCHEMA}.family_members
            WHERE family_id IS NOT NULL
        """
        cur.execute(query)
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'total_users': int(result['total_users']) if result else 0,
            'total_families': int(result['total_families']) if result else 0
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'total_users': 0, 'total_families': 0}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    
    # Публичная статистика без авторизации
    query_params = event.get('queryStringParameters', {}) or {}
    if query_params.get('action') == 'stats':
        stats = get_global_stats()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'stats': stats}),
            'isBase64Encoded': False
        }
    
    try:
        token = event.get('headers', {}).get('X-Auth-Token', '') or event.get('headers', {}).get('x-auth-token', '')
        print(f"[DEBUG handler] Received token: {token[:20] if token else 'None'}...")
        
        user_id = verify_token(token)
        print(f"[DEBUG handler] user_id from token: {user_id}")
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        family_id = get_user_family_id(user_id)
        print(f"[DEBUG handler] family_id: {family_id}")
        
        if method == 'GET':
            if not family_id:
                print("[DEBUG handler] No family_id, returning empty members")
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'members': []}),
                    'isBase64Encoded': False
                }
            
            print(f"[DEBUG handler] Fetching members for family_id: {family_id}")
            members = get_family_members(family_id)
            print(f"[DEBUG handler] Got {len(members)} members")
            
            current_member_id = None
            for m in members:
                if str(m.get('user_id', '')) == user_id:
                    current_member_id = str(m['id'])
                    break
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'family_id': family_id, 'current_member_id': current_member_id, 'members': members}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            if not family_id:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь не состоит в семье'}),
                    'isBase64Encoded': False
                }
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'add')
            
            if action == 'update' or action == 'update_permissions':
                member_id = body.get('member_id') or body.get('id')
                if not member_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуется ID члена семьи'}),
                        'isBase64Encoded': False
                    }
                result = update_family_member(member_id, family_id, body, user_id)
                status_code = 200 if 'success' in result else 400
                if not status_code == 200 and 'администратор' in result.get('error', '').lower():
                    status_code = 403
            elif action == 'delete' or action == 'delete_member':
                member_id = body.get('member_id') or body.get('id')
                if not member_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуется ID члена семьи'}),
                        'isBase64Encoded': False
                    }
                result = delete_family_member(member_id, family_id, user_id)
                status_code = 200 if 'success' in result else 400
            elif action == 'delete_all_duplicates':
                result = delete_all_duplicates(family_id, user_id)
                status_code = 200 if 'success' in result else 400
            else:
                result = add_family_member(family_id, body)
                status_code = 201 if 'success' in result else 400
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': status_code,
                'headers': headers,
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            if not family_id:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь не состоит в семье'}),
                    'isBase64Encoded': False
                }
            body = json.loads(event.get('body', '{}'))
            member_id = body.get('id')
            
            if not member_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID члена семьи'}),
                    'isBase64Encoded': False
                }
            
            result = update_family_member(member_id, family_id, body)
            
            if 'error' in result:
                return {
                    'statusCode': 404 if 'не найден' in result['error'] else 400,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            if not family_id:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь не состоит в семье'}),
                    'isBase64Encoded': False
                }
            params = event.get('queryStringParameters', {})
            member_id = params.get('id')
            
            if not member_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID члена семьи'}),
                    'isBase64Encoded': False
                }
            
            result = delete_family_member(member_id, family_id, user_id)
            
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
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"[ERROR handler] Exception occurred: {str(e)}")
        import traceback
        print(f"[ERROR handler] Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
            'isBase64Encoded': False
        }