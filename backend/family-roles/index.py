import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создаёт подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

# Матрица прав доступа
ROLE_PERMISSIONS = {
    'admin': {
        'profile': ['view', 'edit', 'delete'],
        'health': ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
        'dreams': ['view', 'add', 'edit', 'achieve', 'delete'],
        'finance': ['view', 'budget', 'piggybank', 'export'],
        'education': ['view', 'add', 'tests', 'export'],
        'diary': ['view', 'add', 'edit', 'delete'],
        'family': ['invite', 'remove', 'roles', 'delete']
    },
    'parent': {
        'profile': ['view', 'edit'],
        'health': ['view', 'doctor.add', 'medicine.add', 'medicine.mark', 'delete'],
        'dreams': ['view', 'add', 'edit', 'achieve', 'delete'],
        'finance': ['view', 'budget', 'piggybank', 'export'],
        'education': ['view', 'add', 'export'],
        'diary': ['view', 'add', 'edit', 'delete'],
        'family': []
    },
    'guardian': {
        'profile': ['view'],
        'health': ['view', 'doctor.add', 'medicine.add', 'medicine.mark'],
        'dreams': ['view'],
        'finance': ['view'],
        'education': ['view'],
        'diary': ['view', 'add'],
        'family': []
    },
    'viewer': {
        'profile': ['view'],
        'health': ['view'],
        'dreams': ['view'],
        'finance': ['view'],
        'education': ['view'],
        'diary': ['view'],
        'family': []
    },
    'child': {
        'profile': ['view_own', 'edit_own'],
        'health': ['view_own', 'medicine.mark'],
        'dreams': ['view_own', 'add_own', 'edit_own', 'achieve_own'],
        'finance': ['view_own', 'piggybank_own'],
        'education': ['view_own', 'tests_own'],
        'diary': ['view_own', 'add_own', 'edit_own'],
        'family': []
    }
}

def has_permission(role: str, module: str, action: str, granular_perms: Optional[Dict] = None) -> bool:
    """Проверяет наличие права у роли"""
    if granular_perms and module in granular_perms:
        return action in granular_perms[module]
    
    if role not in ROLE_PERMISSIONS:
        return False
    
    if module not in ROLE_PERMISSIONS[role]:
        return False
    
    return action in ROLE_PERMISSIONS[role][module]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление ролями членов семьи
    
    Endpoints:
    GET /family-roles?familyId=xxx - получить всех участников с ролями
    GET /family-roles/check?familyId=xxx&memberId=yyy&module=health&action=view - проверить право
    POST /family-roles - обновить роль участника
    POST /family-roles/permissions - получить все права роли
    """
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            path = event.get('path', '')
            
            # Проверка прав
            if '/check' in path:
                family_id = params.get('familyId')
                member_id = params.get('memberId')
                module = params.get('module')
                action = params.get('action')
                
                if not all([family_id, member_id, module, action]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required parameters'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """
                    SELECT access_role, granular_permissions 
                    FROM t_p5815085_family_assistant_pro.family_members 
                    WHERE id = %s AND family_id = %s
                    """,
                    (member_id, family_id)
                )
                member = cursor.fetchone()
                
                if not member:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Member not found'}),
                        'isBase64Encoded': False
                    }
                
                allowed = has_permission(
                    member['access_role'],
                    module,
                    action,
                    member.get('granular_permissions')
                )
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'allowed': allowed,
                        'role': member['access_role']
                    }),
                    'isBase64Encoded': False
                }
            
            # Получить всех участников с ролями
            family_id = params.get('familyId')
            if not family_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'familyId is required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """
                SELECT 
                    id,
                    name,
                    role as display_role,
                    access_role,
                    user_email,
                    member_status,
                    invited_at,
                    joined_at,
                    granular_permissions,
                    avatar,
                    photo_url
                FROM t_p5815085_family_assistant_pro.family_members
                WHERE family_id = %s
                ORDER BY 
                    CASE access_role
                        WHEN 'admin' THEN 1
                        WHEN 'parent' THEN 2
                        WHEN 'guardian' THEN 3
                        WHEN 'child' THEN 4
                        WHEN 'viewer' THEN 5
                    END,
                    created_at
                """,
                (family_id,)
            )
            members = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'members': [dict(m) for m in members]
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action_type = body.get('action')
            
            # Получить все права роли
            if action_type == 'get_permissions':
                role = body.get('role')
                if not role or role not in ROLE_PERMISSIONS:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid role'}),
                        'isBase64Encoded': False
                    }
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'role': role,
                        'permissions': ROLE_PERMISSIONS[role]
                    }),
                    'isBase64Encoded': False
                }
            
            # Обновить роль участника
            # Поддержка двух форматов: старый (memberId/role) и новый (member_id/access_role)
            member_id = body.get('memberId') or body.get('member_id')
            new_role = body.get('role') or body.get('access_role')
            requesting_member_id = body.get('requestingMemberId')
            granular_perms = body.get('granularPermissions') or body.get('permissions')
            
            # Маппинг старых ролей на новые
            role_mapping = {
                'editor': 'parent',  # editor → parent
                'admin': 'admin',
                'viewer': 'viewer',
                'child': 'child',
                'parent': 'parent',
                'guardian': 'guardian'
            }
            
            if new_role in role_mapping:
                new_role = role_mapping[new_role]
            
            if not all([member_id, new_role]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields: member_id and role'}),
                    'isBase64Encoded': False
                }
            
            if new_role not in ROLE_PERMISSIONS:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Invalid role: {new_role}. Allowed: {list(ROLE_PERMISSIONS.keys())}'}),
                    'isBase64Encoded': False
                }
            
            # Если requesting_member_id не передан, получаем его из токена
            if not requesting_member_id:
                token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
                if not token:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Authentication required'}),
                        'isBase64Encoded': False
                    }
                
                # Получаем user_id из токена через таблицу сессий
                cursor.execute(
                    """
                    SELECT user_id FROM t_p5815085_family_assistant_pro.user_sessions 
                    WHERE session_token = %s AND expires_at > NOW()
                    """,
                    (token,)
                )
                session = cursor.fetchone()
                
                if not session:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid or expired token'}),
                        'isBase64Encoded': False
                    }
                
                # Получаем member_id из user_id и family_id целевого участника
                cursor.execute(
                    """
                    SELECT fm2.id as requesting_member_id
                    FROM t_p5815085_family_assistant_pro.family_members fm1
                    JOIN t_p5815085_family_assistant_pro.family_members fm2 
                      ON fm1.family_id = fm2.family_id AND fm2.user_id = %s
                    WHERE fm1.id = %s
                    """,
                    (session['user_id'], member_id)
                )
                result = cursor.fetchone()
                
                if not result:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'You are not a member of this family'}),
                        'isBase64Encoded': False
                    }
                
                requesting_member_id = result['requesting_member_id']
            
            # Проверка прав запрашивающего
            cursor.execute(
                """
                SELECT access_role 
                FROM t_p5815085_family_assistant_pro.family_members 
                WHERE id = %s
                """,
                (requesting_member_id,)
            )
            requester = cursor.fetchone()
            
            if not requester or requester['access_role'] != 'admin':
                cursor.close()
                conn.close()
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Only admins can change roles'}),
                    'isBase64Encoded': False
                }
            
            # Обновление роли
            cursor.execute(
                """
                UPDATE t_p5815085_family_assistant_pro.family_members
                SET access_role = %s, granular_permissions = %s
                WHERE id = %s
                RETURNING id, name, access_role
                """,
                (new_role, json.dumps(granular_perms) if granular_perms else None, member_id)
            )
            updated = cursor.fetchone()
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'member': dict(updated)
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }