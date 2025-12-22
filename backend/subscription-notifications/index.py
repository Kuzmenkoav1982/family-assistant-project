"""
Business: Автоматические уведомления об истечении подписок (Email + Push)
Args: event - cron trigger или HTTP вызов для тестирования
Returns: JSON с количеством отправленных уведомлений
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.request import urlopen, Request

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'
NOTIFICATIONS_API = 'https://functions.poehali.dev/82852794-3586-44b2-8796-f0de94642774'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def get_expiring_subscriptions(days_threshold: int = 7) -> List[Dict[str, Any]]:
    """Получить подписки, истекающие в ближайшие N дней"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT 
            s.id as subscription_id,
            s.plan_type,
            s.end_date,
            f.id as family_id,
            f.name as family_name,
            u.id as user_id,
            u.name as user_name,
            u.email as user_email
        FROM {SCHEMA}.subscriptions s
        JOIN {SCHEMA}.families f ON s.family_id = f.id
        JOIN {SCHEMA}.family_members fm ON f.id = fm.family_id AND fm.role = 'owner'
        JOIN {SCHEMA}.users u ON fm.user_id = u.id
        WHERE s.status = 'active'
        AND s.end_date > CURRENT_TIMESTAMP
        AND s.end_date <= CURRENT_TIMESTAMP + INTERVAL '{days_threshold} days'
    """)
    
    subscriptions = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(s) for s in subscriptions]

def send_email_notification(user_email: str, user_name: str, plan_name: str, days_left: int):
    """Отправить email через notifications API"""
    try:
        plan_names = {'basic': 'Базовый', 'standard': 'Семейный', 'premium': 'Премиум'}
        plan_display = plan_names.get(plan_name, plan_name)
        
        notification_data = {
            'action': 'send_email',
            'to_email': user_email,
            'subject': f'⏰ Ваша подписка "{plan_display}" истекает через {days_left} дн.',
            'template': 'subscription_expiring',
            'data': {
                'user_name': user_name,
                'plan_name': plan_display,
                'days_left': days_left,
                'renewal_url': 'https://family-assistant-project.poehali.dev/pricing'
            }
        }
        
        req = Request(
            NOTIFICATIONS_API,
            data=json.dumps(notification_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        response = urlopen(req)
        return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Email error: {str(e)}")
        return {'error': str(e)}

def send_push_notification(user_id: str, plan_name: str, days_left: int):
    """Отправить push-уведомление"""
    try:
        plan_names = {'basic': 'Базовый', 'standard': 'Семейный', 'premium': 'Премиум'}
        plan_display = plan_names.get(plan_name, plan_name)
        
        push_data = {
            'action': 'send_push',
            'user_id': user_id,
            'title': '⏰ Подписка заканчивается',
            'body': f'Ваша подписка "{plan_display}" истекает через {days_left} дн. Продлите, чтобы не потерять доступ!',
            'url': '/pricing'
        }
        
        req = Request(
            NOTIFICATIONS_API,
            data=json.dumps(push_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        response = urlopen(req)
        return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Push error: {str(e)}")
        return {'error': str(e)}

def log_notification(user_id: str, notification_type: str, channel: str, details: Dict[str, Any]):
    """Записать в лог (временно только print)"""
    print(f"[NOTIFICATION LOG] user={user_id}, type={notification_type}, channel={channel}, details={details}")

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Основной обработчик - запускается по расписанию (cron) или вручную"""
    
    try:
        # Получаем истекающие подписки
        expiring = get_expiring_subscriptions(days_threshold=7)
        
        if not expiring:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Нет истекающих подписок',
                    'sent': 0
                })
            }
        
        sent_count = 0
        errors = []
        
        for sub in expiring:
            days_left = (sub['end_date'] - datetime.now()).days
            
            # Отправляем Email
            email_result = send_email_notification(
                sub['user_email'],
                sub['user_name'],
                sub['plan_type'],
                days_left
            )
            
            if 'error' not in email_result:
                log_notification(
                    sub['user_id'],
                    'subscription_expiring',
                    'email',
                    {'plan': sub['plan_type'], 'days_left': days_left}
                )
                sent_count += 1
            else:
                errors.append(f"Email to {sub['user_email']}: {email_result['error']}")
            
            # Отправляем Push
            push_result = send_push_notification(
                sub['user_id'],
                sub['plan_type'],
                days_left
            )
            
            if 'error' not in push_result:
                log_notification(
                    sub['user_id'],
                    'subscription_expiring',
                    'push',
                    {'plan': sub['plan_type'], 'days_left': days_left}
                )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Отправлено {sent_count} уведомлений',
                'total_subscriptions': len(expiring),
                'sent': sent_count,
                'errors': errors if errors else None
            }, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }