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

def get_expiring_subscriptions() -> List[Dict[str, Any]]:
    """Получить подписки, истекающие в ближайшие 7 дней"""
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
        AND s.end_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    """)
    
    subscriptions = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(s) for s in subscriptions]

def should_send_notification(subscription_id: str, days_left: int, channel: str) -> bool:
    """Проверить, нужно ли отправлять уведомление (максимум 3: за 7, 3 и 1 день)"""
    # Определяем тип уведомления по количеству оставшихся дней
    notification_type = None
    if days_left >= 7:
        notification_type = 'expiring_7days'
    elif 3 <= days_left < 7:
        notification_type = 'expiring_3days'
    elif 1 <= days_left < 3:
        notification_type = 'expiring_1day'
    else:
        return False  # Не отправляем уведомления за пределами этих диапазонов
    
    # Проверяем, отправляли ли уже такое уведомление
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(f"""
        SELECT COUNT(*) FROM {SCHEMA}.subscription_notifications_log
        WHERE subscription_id = %s 
        AND notification_type = %s 
        AND channel = %s
    """, (subscription_id, notification_type, channel))
    
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    
    return count == 0  # Отправляем только если ещё не отправляли

def save_notification_log(subscription_id: str, user_id: str, notification_type: str, channel: str, days_left: int):
    """Сохранить информацию об отправленном уведомлении"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(f"""
            INSERT INTO {SCHEMA}.subscription_notifications_log 
            (subscription_id, user_id, notification_type, channel, days_left)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (subscription_id, notification_type, channel) DO NOTHING
        """, (subscription_id, user_id, notification_type, channel, days_left))
        
        conn.commit()
    finally:
        cur.close()
        conn.close()

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

def get_notification_type(days_left: int) -> str:
    """Определить тип уведомления по количеству дней"""
    if days_left >= 7:
        return 'expiring_7days'
    elif 3 <= days_left < 7:
        return 'expiring_3days'
    elif 1 <= days_left < 3:
        return 'expiring_1day'
    return 'unknown'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Основной обработчик - запускается по расписанию (cron) или вручную"""
    
    try:
        # Получаем истекающие подписки
        expiring = get_expiring_subscriptions()
        
        if not expiring:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Нет истекающих подписок',
                    'sent': 0
                })
            }
        
        sent_count = 0
        skipped_count = 0
        errors = []
        
        for sub in expiring:
            days_left = (sub['end_date'] - datetime.now()).days
            notification_type = get_notification_type(days_left)
            
            # Проверяем Email
            if should_send_notification(sub['subscription_id'], days_left, 'email'):
                email_result = send_email_notification(
                    sub['user_email'],
                    sub['user_name'],
                    sub['plan_type'],
                    days_left
                )
                
                if 'error' not in email_result:
                    save_notification_log(
                        sub['subscription_id'],
                        sub['user_id'],
                        notification_type,
                        'email',
                        days_left
                    )
                    sent_count += 1
                    print(f"✅ Email sent to {sub['user_email']} (days_left={days_left}, type={notification_type})")
                else:
                    errors.append(f"Email to {sub['user_email']}: {email_result['error']}")
            else:
                skipped_count += 1
                print(f"⏭️ Skipped email for {sub['user_email']} (days_left={days_left}, already sent)")
            
            # Проверяем Push
            if should_send_notification(sub['subscription_id'], days_left, 'push'):
                push_result = send_push_notification(
                    sub['user_id'],
                    sub['plan_type'],
                    days_left
                )
                
                if 'error' not in push_result:
                    save_notification_log(
                        sub['subscription_id'],
                        sub['user_id'],
                        notification_type,
                        'push',
                        days_left
                    )
                    sent_count += 1
                    print(f"✅ Push sent to user {sub['user_id']} (days_left={days_left}, type={notification_type})")
                else:
                    errors.append(f"Push to user {sub['user_id']}: {push_result['error']}")
            else:
                skipped_count += 1
                print(f"⏭️ Skipped push for user {sub['user_id']} (days_left={days_left}, already sent)")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Отправлено {sent_count} уведомлений, пропущено {skipped_count}',
                'total_subscriptions': len(expiring),
                'sent': sent_count,
                'skipped': skipped_count,
                'errors': errors if errors else None
            }, default=str)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }