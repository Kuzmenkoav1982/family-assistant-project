import json
import os
import secrets
from typing import Dict, Any
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создаёт подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def generate_token() -> str:
    """Генерирует уникальный токен приглашения"""
    return secrets.token_urlsafe(32)

def generate_code() -> str:
    """Генерирует код приглашения для SMS"""
    return f"FAM-{secrets.token_hex(3).upper()}"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Система приглашений в семью
    
    Endpoints:
    POST /family-invites-v2/create - создать приглашение
    POST /family-invites-v2/accept - принять приглашение
    GET /family-invites-v2?familyId=xxx - получить приглашения семьи
    POST /family-invites-v2/revoke - отозвать приглашение
    GET /family-invites-v2/validate?token=xxx - проверить приглашение
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
        path = event.get('path', '')
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            
            # Валидация приглашения
            if '/validate' in path:
                token = params.get('token')
                if not token:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Token is required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """
                    SELECT 
                        fi.*,
                        f.name as family_name,
                        fm.name as invited_by_name
                    FROM t_p5815085_family_assistant_pro.family_invitations fi
                    JOIN t_p5815085_family_assistant_pro.families f ON fi.family_id = f.id
                    JOIN t_p5815085_family_assistant_pro.family_members fm ON fi.invited_by = fm.id
                    WHERE fi.token = %s AND fi.used_at IS NULL AND fi.expires_at > NOW()
                    """,
                    (token,)
                )
                invitation = cursor.fetchone()
                
                cursor.close()
                conn.close()
                
                if not invitation:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'valid': False,
                            'error': 'Invitation not found or expired'
                        }),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'valid': True,
                        'invitation': dict(invitation)
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            # Получить приглашения семьи
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
                    fi.*,
                    fm.name as invited_by_name
                FROM t_p5815085_family_assistant_pro.family_invitations fi
                JOIN t_p5815085_family_assistant_pro.family_members fm ON fi.invited_by = fm.id
                WHERE fi.family_id = %s
                ORDER BY fi.created_at DESC
                """,
                (family_id,)
            )
            invitations = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'invitations': [dict(inv) for inv in invitations]
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            # Создать приглашение
            if action == 'create' or '/create' in path:
                family_id = body.get('familyId')
                invited_by = body.get('invitedBy')
                invite_type = body.get('inviteType')  # email, sms, link
                invite_value = body.get('inviteValue')  # email или телефон
                access_role = body.get('role', 'viewer')
                expires_days = body.get('expiresDays', 7)
                
                if not all([family_id, invited_by, invite_type]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                # Проверка прав
                cursor.execute(
                    """
                    SELECT access_role 
                    FROM t_p5815085_family_assistant_pro.family_members 
                    WHERE id = %s AND family_id = %s
                    """,
                    (invited_by, family_id)
                )
                inviter = cursor.fetchone()
                
                if not inviter or inviter['access_role'] != 'admin':
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Only admins can invite members'}),
                        'isBase64Encoded': False
                    }
                
                # Генерация токена
                token = generate_token()
                if invite_type == 'sms':
                    code = generate_code()
                    invite_value = invite_value or code
                
                expires_at = datetime.now() + timedelta(days=expires_days)
                
                cursor.execute(
                    """
                    INSERT INTO t_p5815085_family_assistant_pro.family_invitations
                    (family_id, invited_by, invite_type, invite_value, access_role, token, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, token, invite_value, expires_at
                    """,
                    (family_id, invited_by, invite_type, invite_value, access_role, token, expires_at)
                )
                invitation = cursor.fetchone()
                conn.commit()
                
                cursor.close()
                conn.close()
                
                # Формируем ссылку
                base_url = os.environ.get('BASE_URL', 'https://app.poehali.dev')
                invite_link = f"{base_url}/invite?token={token}"
                
                result = dict(invitation)
                result['invite_link'] = invite_link
                if invite_type == 'sms':
                    result['sms_code'] = invite_value
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'invitation': result
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            # Принять приглашение
            elif action == 'accept' or '/accept' in path:
                token = body.get('token')
                user_email = body.get('email')
                member_name = body.get('name')
                
                if not all([token, user_email, member_name]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                # Найти приглашение
                cursor.execute(
                    """
                    SELECT * FROM t_p5815085_family_assistant_pro.family_invitations
                    WHERE token = %s AND used_at IS NULL AND expires_at > NOW()
                    """,
                    (token,)
                )
                invitation = cursor.fetchone()
                
                if not invitation:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid or expired invitation'}),
                        'isBase64Encoded': False
                    }
                
                # Создать нового участника
                now = datetime.now()
                cursor.execute(
                    """
                    INSERT INTO t_p5815085_family_assistant_pro.family_members
                    (family_id, name, user_email, access_role, invited_by, invited_at, joined_at, member_status, avatar)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, name, access_role, family_id
                    """,
                    (
                        invitation['family_id'],
                        member_name,
                        user_email,
                        invitation['access_role'],
                        invitation['invited_by'],
                        invitation['created_at'],
                        now,
                        'active',
                        '👤'
                    )
                )
                new_member = cursor.fetchone()
                
                # Отметить приглашение использованным
                cursor.execute(
                    """
                    UPDATE t_p5815085_family_assistant_pro.family_invitations
                    SET used_at = %s, used_by_email = %s
                    WHERE id = %s
                    """,
                    (now, user_email, invitation['id'])
                )
                conn.commit()
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'member': dict(new_member)
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            # Отозвать приглашение
            elif action == 'revoke' or '/revoke' in path:
                invitation_id = body.get('invitationId')
                requesting_member_id = body.get('requestingMemberId')
                
                if not all([invitation_id, requesting_member_id]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                # Проверка прав
                cursor.execute(
                    """
                    SELECT fm.access_role 
                    FROM t_p5815085_family_assistant_pro.family_members fm
                    WHERE fm.id = %s
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
                        'body': json.dumps({'error': 'Only admins can revoke invitations'}),
                        'isBase64Encoded': False
                    }
                
                # Удалить приглашение
                cursor.execute(
                    """
                    UPDATE t_p5815085_family_assistant_pro.family_invitations
                    SET expires_at = NOW()
                    WHERE id = %s
                    RETURNING id
                    """,
                    (invitation_id,)
                )
                conn.commit()
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
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
