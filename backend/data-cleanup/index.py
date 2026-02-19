"""
Автоматическая очистка устаревших данных согласно политике хранения

Удаляет:
- Истёкшие сессии пользователей
- Логи безопасности старше 1 года
- Геолокации старше 30 дней
- Данные неактивных пользователей (>3 года без активности)

Должна вызываться по расписанию (например, раз в день)
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def cleanup_expired_sessions() -> int:
    """Удаление истёкших сессий"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE expires_at < NOW()")
    deleted_count = cur.rowcount
    cur.close()
    conn.close()
    return deleted_count

def cleanup_security_logs() -> int:
    """Удаление логов старше 1 года"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    one_year_ago = datetime.now() - timedelta(days=365)
    
    cur.execute(
        f"""
        DELETE FROM {SCHEMA}.security_audit_log
        WHERE created_at < %s
        """,
        (one_year_ago,)
    )
    
    deleted_count = cur.rowcount
    cur.close()
    conn.close()
    
    return deleted_count

def cleanup_old_locations() -> int:
    """Удаление геолокаций старше 30 дней"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    cur.execute(
        f"""
        DELETE FROM {SCHEMA}.family_location_tracking
        WHERE created_at < %s
        """,
        (thirty_days_ago,)
    )
    
    deleted_count = cur.rowcount
    cur.close()
    conn.close()
    
    return deleted_count

def cleanup_inactive_users() -> int:
    """Удаление данных пользователей без активности более 3 лет"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    three_years_ago = datetime.now() - timedelta(days=3*365)
    
    # Находим неактивных пользователей
    cur.execute(
        f"""
        SELECT u.id, u.phone, u.email
        FROM {SCHEMA}.users u
        LEFT JOIN {SCHEMA}.sessions s ON u.id = s.user_id
        WHERE u.created_at < %s
        AND (s.created_at IS NULL OR s.created_at < %s)
        GROUP BY u.id
        """,
        (three_years_ago, three_years_ago)
    )
    
    inactive_users = cur.fetchall()
    deleted_users = 0
    
    for user in inactive_users:
        user_id = user['id']
        
        # Удаляем связанные данные
        cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE user_id = %s", (user_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.family_members WHERE user_id = %s", (user_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.family_location_tracking WHERE user_id = %s", (user_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.security_audit_log WHERE user_id = %s", (user_id,))
        
        # Удаляем пользователя
        cur.execute(f"DELETE FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        deleted_users += 1
    
    cur.close()
    conn.close()
    
    return deleted_users

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Запуск очистки данных"""
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Проверка административного токена (для безопасности)
        admin_token = event.get('headers', {}).get('X-Admin-Token', '')
        expected_token = os.environ.get('ADMIN_TOKEN', 'change-me')
        
        if admin_token != expected_token:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        # Выполняем очистку
        sessions_deleted = cleanup_expired_sessions()
        logs_deleted = cleanup_security_logs()
        locations_deleted = cleanup_old_locations()
        users_deleted = cleanup_inactive_users()
        
        result = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'deleted': {
                'expired_sessions': sessions_deleted,
                'security_logs': logs_deleted,
                'locations': locations_deleted,
                'inactive_users': users_deleted
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Cleanup failed: {str(e)}'}),
            'isBase64Encoded': False
        }