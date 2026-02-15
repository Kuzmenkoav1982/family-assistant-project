import json
import os
import requests
from datetime import datetime, date, timedelta
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
                'title': f"Завтра: {date_info['title']} от Наша Семья",
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
                'title': f"День рождения {member['name']} от Наша Семья",
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
        # События за час до начала
        query = f"""
            SELECT title, start_date, end_date, description 
            FROM t_p5815085_family_assistant_pro.calendar_events 
            WHERE family_id = '{family_id_safe}' 
            AND start_date BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
            ORDER BY start_date 
            LIMIT 3
        """
        cur.execute(query)
        upcoming_events = cur.fetchall()
        
        for event in upcoming_events:
            time_str = event['start_date'].strftime('%H:%M')
            notifications.append({
                'title': f"📅 Скоро событие в {time_str} от Наша Семья",
                'message': f"{event['title']}"
            })
    except Exception as e:
        print(f"[ERROR] Upcoming events check failed: {str(e)}")
    
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
                'title': f"Завтра: {event['title']} от Наша Семья",
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
                'title': f"Лекарство для {med['child_name']} от Наша Семья",
                'message': f"{med['medication_name']} ({med['dosage']}) в {time_str} 💊"
            })
    except Exception as e:
        print(f"[ERROR] Medication check failed: {str(e)}")
    
    return notifications

def check_urgent_tasks(cur, family_id: str) -> List[Dict[str, str]]:
    """Проверка просроченных и срочных задач"""
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT title, deadline, priority FROM t_p5815085_family_assistant_pro.tasks_v2 
            WHERE family_id = '{family_id_safe}' 
            AND completed = FALSE
            AND (deadline < NOW() OR priority = 'high')
            LIMIT 3
        """
        cur.execute(query)
        urgent_tasks = cur.fetchall()
        
        for task in urgent_tasks:
            if task['deadline'] and task['deadline'] < datetime.now():
                notifications.append({
                    'title': f"⚠️ Просрочена задача от Наша Семья",
                    'message': f"{task['title']}"
                })
            elif task['priority'] == 'high':
                notifications.append({
                    'title': f"⚡ Срочная задача от Наша Семья",
                    'message': f"{task['title']}"
                })
    except Exception as e:
        print(f"[ERROR] Tasks check failed: {str(e)}")
    
    return notifications

def check_urgent_shopping(cur, family_id: str) -> List[Dict[str, str]]:
    """Проверка срочных покупок"""
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT name FROM t_p5815085_family_assistant_pro.shopping_items_v2 
            WHERE family_id = '{family_id_safe}' 
            AND priority = 'urgent'
            AND bought = FALSE
            LIMIT 3
        """
        cur.execute(query)
        urgent_items = cur.fetchall()
        
        if urgent_items:
            items_list = ', '.join([item['name'] for item in urgent_items])
            notifications.append({
                'title': f"🚨 Срочные покупки",
                'message': f"Нужно купить: {items_list}"
            })
    except Exception as e:
        print(f"[ERROR] Shopping check failed: {str(e)}")
    
    return notifications

def check_new_votings(cur, family_id: str) -> List[Dict[str, str]]:
    """Проверка активных голосований"""
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT v.title, COUNT(vt.id) as total_votes 
            FROM t_p5815085_family_assistant_pro.votings v
            LEFT JOIN t_p5815085_family_assistant_pro.votes vt ON v.id = vt.voting_id
            WHERE v.family_id = '{family_id_safe}' 
            AND v.end_date > NOW()
            AND v.created_at > NOW() - INTERVAL '24 hours'
            GROUP BY v.id, v.title
            HAVING COUNT(vt.id) < 3
            LIMIT 2
        """
        cur.execute(query)
        new_votings = cur.fetchall()
        
        for voting in new_votings:
            notifications.append({
                'title': f"🗳️ Проголосуйте",
                'message': f"{voting['title']}"
            })
    except Exception as e:
        print(f"[ERROR] Votings check failed: {str(e)}")
    
    return notifications


def check_leisure_activities(cur, user_id: str) -> List[Dict[str, str]]:
    """Проверка предстоящих досуговых активностей"""
    notifications = []
    user_id_safe = escape_sql_string(user_id)
    
    try:
        # Активности за 1 час до начала
        query = f"""
            SELECT title, date, time, location
            FROM t_p5815085_family_assistant_pro.leisure_activities
            WHERE user_id = '{user_id_safe}'
            AND status = 'planned'
            AND reminder_datetime IS NOT NULL
            AND reminder_datetime BETWEEN NOW() AND NOW() + INTERVAL '10 minutes'
            AND (reminder_sent = FALSE OR reminder_sent IS NULL)
            LIMIT 3
        """
        cur.execute(query)
        upcoming_activities = cur.fetchall()
        
        for activity in upcoming_activities:
            time_str = activity['time'] if activity['time'] else '—'
            location_str = f" ({activity['location']})" if activity['location'] else ''
            notifications.append({
                'title': f"Скоро: {activity['title']}",
                'message': f"{time_str}{location_str} 🎉",
                'activity_id': activity.get('id')
            })
            
            # Помечаем напоминание отправленным
            if activity.get('id'):
                cur.execute(
                    f"UPDATE t_p5815085_family_assistant_pro.leisure_activities SET reminder_sent = TRUE WHERE id = {activity['id']}"
                )
                
    except Exception as e:
        print(f"[ERROR] Leisure activities check failed: {str(e)}")
    
    return notifications

def call_yandex_gpt_lite(system_prompt: str, user_prompt: str) -> str:
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    if not api_key or not folder_id:
        return ''
    payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
        'completionOptions': {'stream': False, 'temperature': 0.8, 'maxTokens': 200},
        'messages': [
            {'role': 'system', 'text': system_prompt},
            {'role': 'user', 'text': user_prompt}
        ]
    }
    try:
        resp = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'},
            json=payload, timeout=15
        )
        if resp.status_code == 200:
            return resp.json().get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
    except Exception as e:
        print(f"[ERROR] YandexGPT call failed: {e}")
    return ''


def check_diet_motivation(cur, user_id: str) -> List[Dict[str, str]]:
    notifications = []
    user_id_safe = escape_sql_string(user_id)
    schema = 't_p5815085_family_assistant_pro'

    try:
        cur.execute(f"""
            SELECT id, start_date, duration_days, target_weight_loss_kg, target_calories_daily, plan_type
            FROM {schema}.diet_plans
            WHERE user_id = '{user_id_safe}' AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """)
        plan = cur.fetchone()
        if not plan:
            return notifications

        plan_id = plan['id']
        days_on = (date.today() - plan['start_date']).days + 1
        duration = plan['duration_days'] or 7

        if days_on > duration:
            return notifications

        cur.execute(f"""
            SELECT COUNT(*) as cnt FROM {schema}.diet_motivation_log
            WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id}
            AND created_at::date = CURRENT_DATE
        """)
        already_sent = cur.fetchone()
        if already_sent and already_sent['cnt'] > 0:
            return notifications

        cur.execute(f"SELECT weight_kg FROM {schema}.diet_weight_log WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id} ORDER BY measured_at ASC LIMIT 1")
        first_w = cur.fetchone()
        cur.execute(f"SELECT weight_kg FROM {schema}.diet_weight_log WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id} ORDER BY measured_at DESC LIMIT 1")
        last_w = cur.fetchone()
        lost = round(float(first_w['weight_kg']) - float(last_w['weight_kg']), 1) if first_w and last_w else 0

        cur.execute(f"SELECT COUNT(*) as cnt FROM {schema}.diet_meals WHERE plan_id = {plan_id} AND completed = TRUE")
        done = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {schema}.diet_meals WHERE plan_id = {plan_id}")
        total = cur.fetchone()['cnt']
        adherence = round(done / total * 100) if total > 0 else 0

        hour = datetime.now().hour
        time_label = "утреннее" if hour < 14 else "вечернее"
        time_of_day = "morning" if hour < 14 else "evening"

        system = "Ты заботливый тренер-диетолог. Пиши тепло и кратко, 1-2 предложения. Без смайликов."
        user_prompt = f"""Напиши короткое {time_label} мотивационное push-уведомление для человека на диете.
День: {days_on} из {duration}. Сброшено: {lost} кг. Соблюдение: {adherence}%.
{'Утро — задай настрой.' if time_of_day == 'morning' else 'Вечер — похвали за день.'}"""

        ai_text = call_yandex_gpt_lite(system, user_prompt)

        if not ai_text:
            if time_of_day == 'morning':
                ai_text = f"День {days_on} твоей диеты! " + (f"Уже -{lost} кг — продолжай в том же духе!" if lost > 0 else "Каждый день приближает к цели!")
            else:
                ai_text = f"День {days_on} позади! " + (f"Ты уже сбросил {lost} кг — молодец!" if lost > 0 else "Отдыхай, завтра продолжим!")

        cur.execute(f"""
            INSERT INTO {schema}.diet_motivation_log (user_id, plan_id, message_type, message_text)
            VALUES ('{user_id_safe}', {plan_id}, '{time_of_day}', '{escape_sql_string(ai_text)}')
        """)

        notifications.append({
            'title': 'Диета — день %d' % days_on,
            'message': ai_text
        })

    except Exception as e:
        print(f"[ERROR] Diet motivation check failed: {e}")

    return notifications


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Функция для автоматической отправки напоминаний по расписанию
    Проверяет важные даты, события, задачи, диету и отправляет push-уведомления
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
            all_notifications.extend(check_urgent_tasks(cur, family_id))
            
            try:
                cur.execute(f"SELECT user_id FROM t_p5815085_family_assistant_pro.family_members WHERE family_id = '{escape_sql_string(family_id)}'")
                family_users = cur.fetchall()
                for user in family_users:
                    all_notifications.extend(check_leisure_activities(cur, user['user_id']))
                    all_notifications.extend(check_diet_motivation(cur, user['user_id']))
            except:
                pass
            all_notifications.extend(check_urgent_shopping(cur, family_id))
            all_notifications.extend(check_new_votings(cur, family_id))
            
            conn.commit()
            
            print(f"[INFO] Found {len(all_notifications)} notifications for family {family_id}")
            
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