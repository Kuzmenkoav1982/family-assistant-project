"""
Business: Управление расширенными профилями членов семьи (анкеты с детальной информацией)
Args: event с httpMethod, body, headers (X-Auth-Token)
Returns: JSON с профилем или списком профилей
"""

import json
import os
from typing import Dict, Any, Optional
from decimal import Decimal
from datetime import datetime, date
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def snake_to_camel(snake_str: str) -> str:
    """Конвертирует snake_case в camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def camel_to_snake(camel_str: str) -> str:
    """Конвертирует camelCase в snake_case"""
    result = [camel_str[0].lower()]
    for char in camel_str[1:]:
        if char.isupper():
            result.extend(['_', char.lower()])
        else:
            result.append(char)
    return ''.join(result)


def convert_decimals(obj: Any) -> Any:
    """Конвертирует Decimal и datetime в JSON-совместимые типы"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    return obj


def db_to_frontend(db_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Конвертирует snake_case ключи из БД в camelCase для фронтенда"""
    result = {}
    for key, value in db_dict.items():
        camel_key = snake_to_camel(key)
        result[camel_key] = convert_decimals(value)
    return result


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


def get_member_id_by_uuid(member_uuid: str) -> Optional[int]:
    """Получить ID члена семьи - просто проверяем что такой член семьи существует и возвращаем его integer id из member_profiles или создаем"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем существование члена семьи
        query = f"""
            SELECT id FROM {SCHEMA}.family_members
            WHERE id = {escape_string(member_uuid)}::uuid
            LIMIT 1
        """
        cur.execute(query)
        result = cur.fetchone()
        
        if not result:
            return None
            
        # Теперь находим или создаем запись в member_profiles
        check_profile = f"""
            SELECT id FROM {SCHEMA}.member_profiles
            WHERE member_id = {escape_string(member_uuid)}::uuid
            LIMIT 1
        """
        cur.execute(check_profile)
        profile = cur.fetchone()
        
        if profile:
            return profile['id']
        
        # Если профиля нет - возвращаем просто None, он создастся при upsert
        return None
            
    finally:
        cur.close()
        conn.close()


def get_profile(member_uuid: str) -> Optional[Dict[str, Any]]:
    """Получить профиль по UUID члена семьи"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT * FROM {SCHEMA}.member_profiles 
            WHERE member_id = {escape_string(member_uuid)}::uuid
            LIMIT 1
        """
        cur.execute(query)
        result = cur.fetchone()
        return db_to_frontend(dict(result)) if result else None
    finally:
        cur.close()
        conn.close()


def get_family_profiles(family_id: str) -> list:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            SELECT mp.*, fm.name as member_name, fm.avatar
            FROM {SCHEMA}.member_profiles mp
            JOIN {SCHEMA}.family_members fm ON mp.member_id = fm.id
            WHERE mp.family_id = {escape_string(family_id)}::uuid
        """
        cur.execute(query)
        return [db_to_frontend(dict(row)) for row in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def upsert_profile(member_uuid: str, family_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Создать или обновить профиль по UUID члена семьи"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        print(f"[DEBUG upsert_profile] member_uuid={member_uuid}, family_id={family_id}")
        print(f"[DEBUG upsert_profile] profile_data keys: {list(profile_data.keys())}")
        
        # Проверяем существует ли член семьи
        member_check = f"""
            SELECT id FROM {SCHEMA}.family_members
            WHERE id = {escape_string(member_uuid)}::uuid
            LIMIT 1
        """
        cur.execute(member_check)
        if not cur.fetchone():
            return {'success': False, 'error': f'Член семьи с ID {member_uuid} не найден'}
        
        # Проверяем существует ли профиль
        check_query = f"""
            SELECT id FROM {SCHEMA}.member_profiles 
            WHERE member_id = {escape_string(member_uuid)}::uuid
        """
        cur.execute(check_query)
        existing = cur.fetchone()
        
        if existing:
            # UPDATE
            print(f"[DEBUG upsert_profile] Updating existing profile id={existing['id']}")
            updates = []
            for key, value in profile_data.items():
                snake_key = camel_to_snake(key)
                updates.append(f"{snake_key} = {escape_string(value)}")
            
            if updates:
                updates.append("updated_at = NOW()")
                query = f"""
                    UPDATE {SCHEMA}.member_profiles
                    SET {', '.join(updates)}
                    WHERE member_id = {escape_string(member_uuid)}::uuid
                    RETURNING *
                """
                print(f"[DEBUG upsert_profile] UPDATE query: {query[:200]}")
                cur.execute(query)
                result = cur.fetchone()
                return {'success': True, 'profile': db_to_frontend(dict(result))}
        else:
            # INSERT
            print(f"[DEBUG upsert_profile] Creating new profile")
            columns = ['member_id', 'family_id']
            values = [f"{escape_string(member_uuid)}::uuid", f"{escape_string(family_id)}::uuid"]
            
            for key, value in profile_data.items():
                snake_key = camel_to_snake(key)
                columns.append(snake_key)
                values.append(escape_string(value))
            
            query = f"""
                INSERT INTO {SCHEMA}.member_profiles ({', '.join(columns)})
                VALUES ({', '.join(values)})
                RETURNING *
            """
            print(f"[DEBUG upsert_profile] INSERT query: {query[:200]}")
            cur.execute(query)
            result = cur.fetchone()
            return {'success': True, 'profile': db_to_frontend(dict(result))}
            
    except Exception as e:
        print(f"[ERROR upsert_profile] {str(e)}")
        return {'success': False, 'error': str(e)}
    finally:
        cur.close()
        conn.close()


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
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        all_headers = event.get('headers', {})
        token = all_headers.get('X-Auth-Token', '') or all_headers.get('x-auth-token', '')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        user_data = verify_token(token)
        if not user_data:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Недействительный токен'}),
                'isBase64Encoded': False
            }
        
        family_id = user_data['family_id']
        current_member_id = user_data['member_id']
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            member_uuid = params.get('memberId')
            
            print(f"[DEBUG GET] member_uuid from query: {member_uuid}")
            
            if member_uuid:
                # Получить профиль конкретного члена по UUID
                profile = get_profile(member_uuid)
                print(f"[DEBUG GET] profile result: {profile is not None}")
                
                if profile:
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'success': True, 'profile': profile}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'success': False, 'error': 'Профиль не найден'}),
                        'isBase64Encoded': False
                    }
            else:
                # Получить все профили семьи
                profiles = get_family_profiles(str(family_id))
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'profiles': profiles}),
                    'isBase64Encoded': False
                }
        
        elif method in ['POST', 'PUT']:
            raw_body = event.get('body') or '{}'
            body = json.loads(raw_body) if raw_body else {}
            
            member_uuid = body.get('memberId')
            profile_data = body.get('profileData', {})
            
            print(f"[DEBUG {method}] Received memberId: {member_uuid}, type: {type(member_uuid)}")
            print(f"[DEBUG {method}] Received profileData keys: {list(profile_data.keys())}")
            print(f"[DEBUG {method}] Full profileData: {json.dumps(profile_data, default=str, indent=2)}")
            
            if member_uuid is None:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Не указан ID члена семьи'}),
                    'isBase64Encoded': False
                }
            
            # Работаем напрямую с UUID
            print(f"[DEBUG {method}] Calling upsert_profile with member_uuid={member_uuid}, family_id={family_id}")
            result = upsert_profile(str(member_uuid), str(family_id), profile_data)
            print(f"[DEBUG {method}] Upsert result: success={result.get('success')}, error={result.get('error', 'None')}")
            
            if result.get('success'):
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 500,
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
        import traceback
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': f'Ошибка сервера: {str(e)}',
                'traceback': traceback.format_exc()
            }),
            'isBase64Encoded': False
        }