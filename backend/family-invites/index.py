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

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

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

def create_invite(user_id: str, max_uses: int = 1, days_valid: int = 7) -> Dict[str, Any]:
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
    
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'invite': {
            'id': str(invite['id']),
            'code': invite['invite_code'],
            'max_uses': invite['max_uses'],
            'expires_at': invite['expires_at'].isoformat(),
            'family_name': family['name']
        }
    }

def join_family(user_id: str, invite_code: str, member_name: str, relationship: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            f"""
            SELECT fm.id FROM {SCHEMA}.family_members fm
            WHERE fm.user_id = %s
            """,
            (user_id,)
        )
        if cur.fetchone():
            cur.close()
            conn.close()
            return {'error': 'Вы уже состоите в семье'}
        
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
                result = create_invite(user_id, max_uses, days_valid)
                
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
                
                if not invite_code or not member_name:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Требуются код приглашения и имя'})
                    }
                
                result = join_family(user_id, invite_code, member_name, relationship)
                
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
