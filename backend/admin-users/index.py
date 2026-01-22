"""
API для получения списка зарегистрированных пользователей
Возвращает открытые данные: email, ФИО, дата регистрации, последний вход
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')


def get_users_list() -> Dict[str, Any]:
    """Получить список всех пользователей"""
    if not DATABASE_URL:
        return {'error': 'DATABASE_URL не настроен'}
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT 
                u.id,
                u.email,
                u.phone,
                u.name,
                u.created_at,
                u.last_login_at,
                u.oauth_provider,
                u.is_verified,
                COUNT(DISTINCT fm.family_id) as families_count,
                STRING_AGG(DISTINCT f.name, ', ' ORDER BY f.name) as families_names
            FROM t_p5815085_family_assistant_pro.users u
            LEFT JOIN t_p5815085_family_assistant_pro.family_members fm ON u.id = fm.user_id
            LEFT JOIN t_p5815085_family_assistant_pro.families f ON fm.family_id = f.id
            GROUP BY u.id, u.email, u.phone, u.name, u.created_at, u.last_login_at, u.oauth_provider, u.is_verified
            ORDER BY u.created_at DESC
        """
        
        cursor.execute(query)
        users = cursor.fetchall()
        
        users_list = []
        for user in users:
            users_list.append({
                'id': str(user['id']),
                'email': user['email'],
                'phone': user['phone'],
                'name': user['name'],
                'created_at': user['created_at'].isoformat() if user['created_at'] else None,
                'last_login_at': user['last_login_at'].isoformat() if user['last_login_at'] else None,
                'oauth_provider': user['oauth_provider'],
                'is_verified': user['is_verified'],
                'families_count': user['families_count'],
                'families_names': user['families_names']
            })
        
        cursor.close()
        conn.close()
        
        return {
            'success': True,
            'users': users_list,
            'total': len(users_list)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Ошибка базы данных: {str(e)}'
        }


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    API для управления пользователями
    - GET / - получить список всех пользователей
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
        admin_token = event.get('headers', {}).get('x-admin-token') or \
                     event.get('headers', {}).get('X-Admin-Token')
        
        if admin_token != 'admin_authenticated':
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            result = get_users_list()
            
            return {
                'statusCode': 200 if result.get('success') else 500,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }