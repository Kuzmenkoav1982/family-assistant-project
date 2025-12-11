import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

def escape_sql_string(value: Any) -> str:
    """Экранирование строк для SQL запросов"""
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def send_push_notification(subscription_data: dict, title: str, message: str, vapid_private_key: str) -> bool:
    """Отправка push-уведомления"""
    try:
        webpush(
            subscription_info=subscription_data,
            data=json.dumps({
                'title': title,
                'body': message,
                'icon': '/icon-192.png',
                'url': '/'
            }),
            vapid_private_key=vapid_private_key,
            vapid_claims={
                'sub': 'mailto:support@family-assistant.app'
            }
        )
        return True
    except WebPushException as e:
        print(f"[ERROR] WebPush failed: {str(e)}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return False

def check_important_dates(cur, family_id: str) -> List[Dict[str, str]]:
    """Проверка важных дат (дни рождения, годовщины)"""
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        # Проверяем важные даты на завтра
        query = f"""
            SELECT title, date, type 
            FROM t_p5815085_family_assistant_pro.important_dates 
            WHERE family_id = '{family_id_safe}' 
            AND date = CURRENT_DATE + INTERVAL '1 day'
        """
        cur.execute(query)
        tomorrow_dates = cur.fetchall()
        
        for date_info in tomorrow_dates:
            notifications.append({
                'title': f"Завтра: {date_info['title']}",
                'message': f"Не забудьте поздравить! 🎉"
            })
    except Exception as e:
        print(f"[ERROR] Important dates check failed: {str(e)}")
    
    try:
        # Проверяем дни рождения членов семьи
        query = f"""
            SELECT name, created_at::date as birthday 
            FROM t_p5815085_family_assistant_pro.family_members 
            WHERE family_id = '{family_id_safe}'
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 day')
            AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '1 day')
        """
        cur.execute(query)
        birthdays = cur.fetchall()
        
        for member in birthdays:
            notifications.append({
                'title': f"День рождения {member['name']}",
                'message': f"Завтра день рождения! Подготовьте поздравление 🎂"
            })
    except Exception as e:
        print(f"[ERROR] Birthday check failed: {str(e)}")
    
    return notifications

def check_calendar_events(cur, family_id: str) -> List[Dict[str, str]]:
    """Проверка событий календаря"""
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        # События на сегодня
        query = f"""
            SELECT title, start_date, end_date, description 
            FROM t_p5815085_family_assistant_pro.calendar_events 
            WHERE family_id = '{family_id_safe}' 
            AND start_date::date = CURRENT_DATE
            AND start_date > NOW()
            ORDER BY start_date 
            LIMIT 3
        """
        cur.execute(query)
        today_events = cur.fetchall()
        
        for event in today_events:
            time_str = event['start_date'].strftime('%H:%M')
            notifications.append({
                'title': f"Событие сегодня в {time_str}",
                'message': f"{event['title']}"
            })
    except Exception as e:
        print(f"[ERROR] Today events check failed: {str(e)}")
    
    try:
        # События на завтра
        query = f"""
            SELECT title, start_date 
            FROM t_p5815085_family_assistant_pro.calendar_events 
            WHERE family_id = '{family_id_safe}' 
            AND start_date::date = CURRENT_DATE + INTERVAL '1 day'
            ORDER BY start_date 
            LIMIT 3
        """
        cur.execute(query)
        tomorrow_events = cur.fetchall()
        
        for event in tomorrow_events:
            time_str = event['start_date'].strftime('%H:%M')
            notifications.append({
                'title': f"Завтра: {event['title']}",
                'message': f"Запланировано на {time_str} ⏰"
            })
    except Exception as e:
        print(f"[ERROR] Tomorrow events check failed: {str(e)}")
    
    return notifications

def check_medication_schedule(cur, family_id: str) -> List[Dict[str, str]]:
    """Проверка расписания приёма лекарств"""
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    # Получаем текущее время и время через 30 минут
    current_time = datetime.now().time()
    future_time = (datetime.now() + timedelta(minutes=30)).time()
    
    query = f"""
        SELECT 
            cms.time,
            cm.name as medication_name,
            cm.child_name,
            cms.dosage
        FROM t_p5815085_family_assistant_pro.children_medication_schedule cms
        JOIN t_p5815085_family_assistant_pro.children_medications cm ON cms.medication_id = cm.id
        WHERE cm.family_id = '{family_id_safe}'
        AND cms.is_active = true
        AND cms.time BETWEEN '{current_time}' AND '{future_time}'
    """
    
    try:
        cur.execute(query)
        upcoming_meds = cur.fetchall()
        
        for med in upcoming_meds:
            time_str = med['time'].strftime('%H:%M')
            notifications.append({
                'title': f"Лекарство для {med['child_name']}",
                'message': f"{med['medication_name']} ({med['dosage']}) в {time_str} 💊"
            })
    except Exception as e:
        print(f"[ERROR] Medication check failed: {str(e)}")
    
    return notifications

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Функция для автоматической отправки напоминаний по расписанию
    Проверяет важные даты, события, задачи и отправляет push-уведомления
    """
    try:
        print("[INFO] Starting scheduled reminders check...")
        
        dsn = os.environ.get('DATABASE_URL')
        vapid_private_key = os.environ.get('VAPID_PRIVATE_KEY')
        
        if not dsn or not vapid_private_key:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Missing configuration'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Получаем все семьи с активными push-подписками
        try:
            cur.execute("""
                SELECT DISTINCT ps.family_id, ps.subscription_data
                FROM t_p5815085_family_assistant_pro.push_subscriptions ps
                WHERE ps.subscription_data IS NOT NULL
            """)
            families_with_push = cur.fetchall()
        except Exception as e:
            print(f"[ERROR] Failed to fetch subscriptions: {str(e)}")
            cur.close()
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': f'Database error: {str(e)}'}),
                'isBase64Encoded': False
            }
        
        print(f"[INFO] Found {len(families_with_push)} families with push subscriptions")
        
        total_sent = 0
        total_failed = 0
        
        for family_record in families_with_push:
            family_id = family_record['family_id']
            subscription_data = family_record['subscription_data']
            
            print(f"[INFO] Checking reminders for family: {family_id}")
            
            # Собираем все напоминания
            all_notifications = []
            all_notifications.extend(check_important_dates(cur, family_id))
            all_notifications.extend(check_calendar_events(cur, family_id))
            all_notifications.extend(check_medication_schedule(cur, family_id))
            
            print(f"[INFO] Found {len(all_notifications)} notifications for family {family_id}")
            
            # Отправляем уведомления (максимум 3 за раз, чтобы не спамить)
            for notification in all_notifications[:3]:
                success = send_push_notification(
                    subscription_data,
                    notification['title'],
                    notification['message'],
                    vapid_private_key
                )
                
                if success:
                    total_sent += 1
                    print(f"[SUCCESS] Sent: {notification['title']}")
                else:
                    total_failed += 1
                    print(f"[FAILED] Could not send: {notification['title']}")
        
        cur.close()
        conn.close()
        
        print(f"[INFO] Completed: {total_sent} sent, {total_failed} failed")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'sent': total_sent,
                'failed': total_failed,
                'message': f'Processed reminders for {len(families_with_push)} families'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Scheduler error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }