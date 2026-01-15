"""
Rate Limiter - защита от брутфорса и DDoS атак

Ограничения:
- Вход/регистрация: 5 попыток за 15 минут с одного IP
- Смена пароля: 3 попытки за 30 минут
- API запросы: 100 запросов в минуту

Использует PostgreSQL для хранения счетчиков
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

# Конфигурация лимитов
RATE_LIMITS = {
    'auth': {'max_attempts': 5, 'window_minutes': 15},
    'password_reset': {'max_attempts': 3, 'window_minutes': 30},
    'api': {'max_attempts': 100, 'window_minutes': 1}
}

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def check_rate_limit(ip_address: str, action_type: str) -> Dict[str, Any]:
    """
    Проверка лимита запросов
    
    Returns:
        {
            'allowed': bool,
            'remaining': int,
            'reset_at': datetime
        }
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    limit_config = RATE_LIMITS.get(action_type, RATE_LIMITS['api'])
    max_attempts = limit_config['max_attempts']
    window_minutes = limit_config['window_minutes']
    
    window_start = datetime.now() - timedelta(minutes=window_minutes)
    
    # Подсчёт попыток за временное окно
    cur.execute(
        f"""
        SELECT COUNT(*) as attempt_count
        FROM {SCHEMA}.rate_limit_log
        WHERE ip_address = %s 
        AND action_type = %s
        AND created_at > %s
        """,
        (ip_address, action_type, window_start)
    )
    
    result = cur.fetchone()
    attempt_count = result['attempt_count'] if result else 0
    
    allowed = attempt_count < max_attempts
    remaining = max(0, max_attempts - attempt_count - 1)
    reset_at = datetime.now() + timedelta(minutes=window_minutes)
    
    cur.close()
    conn.close()
    
    return {
        'allowed': allowed,
        'remaining': remaining,
        'reset_at': reset_at.isoformat(),
        'current_attempts': attempt_count
    }

def log_attempt(ip_address: str, action_type: str, user_id: Optional[int] = None):
    """Логирование попытки запроса"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.rate_limit_log (ip_address, action_type, user_id, created_at)
        VALUES (%s, %s, %s, NOW())
        """,
        (ip_address, action_type, user_id)
    )
    
    cur.close()
    conn.close()

def cleanup_old_logs():
    """Очистка старых логов (старше 24 часов)"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    yesterday = datetime.now() - timedelta(hours=24)
    
    cur.execute(
        f"""
        DELETE FROM {SCHEMA}.rate_limit_log
        WHERE created_at < %s
        """,
        (yesterday,)
    )
    
    deleted_count = cur.rowcount
    cur.close()
    conn.close()
    
    return deleted_count

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """API для проверки Rate Limit"""
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
        # Извлечение IP адреса
        headers = event.get('headers', {})
        ip_address = (
            headers.get('X-Forwarded-For', '').split(',')[0].strip() or
            headers.get('X-Real-IP') or
            event.get('requestContext', {}).get('identity', {}).get('sourceIp') or
            'unknown'
        )
        
        if method == 'POST':
            # Проверка лимита
            body = json.loads(event.get('body', '{}'))
            action_type = body.get('action_type', 'api')
            user_id = body.get('user_id')
            should_log = body.get('log_attempt', True)
            
            result = check_rate_limit(ip_address, action_type)
            
            if should_log and result['allowed']:
                log_attempt(ip_address, action_type, user_id)
            
            return {
                'statusCode': 200 if result['allowed'] else 429,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-RateLimit-Limit': str(RATE_LIMITS.get(action_type, RATE_LIMITS['api'])['max_attempts']),
                    'X-RateLimit-Remaining': str(result['remaining']),
                    'X-RateLimit-Reset': result['reset_at']
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            # Очистка старых логов (вызывается по расписанию)
            deleted = cleanup_old_logs()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'deleted_logs': deleted
                }),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Rate limiter error: {str(e)}'}),
            'isBase64Encoded': False
        }
