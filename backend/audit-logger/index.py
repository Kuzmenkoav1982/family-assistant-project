"""
Универсальная функция журналирования критичных действий (аудит безопасности)
Соответствие: 152-ФЗ, Приказ ФСТЭК №21

Категории действий:
- auth: вход, выход, смена пароля
- location: обновление геолокации
- data_export: экспорт данных
- account_management: удаление аккаунта, изменение профиля
- payment: платежи, подписки

Args: event с action_type, action_category, user_id, details, status
Returns: JSON с результатом логирования
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def log_action(
    user_id: int,
    action_type: str,
    action_category: str,
    details: Optional[Dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = 'success',
    error_message: Optional[str] = None
) -> bool:
    """
    Логирование критичного действия пользователя
    
    Примеры:
    - log_action(123, 'login', 'auth', {'method': 'phone'}, '192.168.1.1')
    - log_action(123, 'location_update', 'location', {'lat': 55.75, 'lng': 37.61})
    - log_action(123, 'data_export', 'data_export', {'format': 'csv'})
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.security_audit_log 
            (user_id, action_type, action_category, details, ip_address, user_agent, status, error_message)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                action_type,
                action_category,
                json.dumps(details) if details else None,
                ip_address,
                user_agent,
                status,
                error_message
            )
        )
        
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Ошибка логирования: {e}")
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            user_id = body.get('user_id')
            action_type = body.get('action_type')
            action_category = body.get('action_category')
            details = body.get('details')
            status = body.get('status', 'success')
            error_message = body.get('error_message')
            
            if not user_id or not action_type or not action_category:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Обязательные поля: user_id, action_type, action_category'}),
                    'isBase64Encoded': False
                }
            
            # Извлечение IP и User-Agent из заголовков
            headers = event.get('headers', {})
            ip_address = (
                headers.get('X-Forwarded-For', '').split(',')[0].strip() or
                headers.get('X-Real-IP') or
                event.get('requestContext', {}).get('identity', {}).get('sourceIp')
            )
            user_agent = headers.get('User-Agent')
            
            success = log_action(
                user_id=user_id,
                action_type=action_type,
                action_category=action_category,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent,
                status=status,
                error_message=error_message
            )
            
            if success:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Действие залогировано'}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Ошибка логирования'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            # Просмотр логов (для админов)
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('user_id')
            action_category = query_params.get('category')
            limit = int(query_params.get('limit', 100))
            
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            where_clauses = []
            params = []
            
            if user_id:
                where_clauses.append("user_id = %s")
                params.append(user_id)
            
            if action_category:
                where_clauses.append("action_category = %s")
                params.append(action_category)
            
            where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
            params.append(limit)
            
            cur.execute(
                f"""
                SELECT id, user_id, action_type, action_category, details, 
                       ip_address, status, error_message, created_at
                FROM {SCHEMA}.security_audit_log
                WHERE {where_sql}
                ORDER BY created_at DESC
                LIMIT %s
                """,
                params
            )
            
            logs = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'logs': [dict(log) for log in logs]
                }, default=str),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
