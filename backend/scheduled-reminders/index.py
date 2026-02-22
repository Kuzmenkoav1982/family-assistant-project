import json
import os
import hashlib
import requests
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

SCHEMA = 't_p5815085_family_assistant_pro'

def escape_sql_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def make_notification_hash(title: str, message: str) -> str:
    today = date.today().isoformat()
    raw = f"{today}:{title}:{message}"
    return hashlib.md5(raw.encode()).hexdigest()

def is_already_sent(cur, family_id: str, notification_hash: str) -> bool:
    cur.execute(f"""
        SELECT id FROM {SCHEMA}.sent_notifications 
        WHERE family_id = '{escape_sql_string(family_id)}' 
        AND notification_hash = '{escape_sql_string(notification_hash)}'
        AND sent_at > NOW() - INTERVAL '6 hours'
    """)
    return cur.fetchone() is not None

def mark_as_sent(cur, conn, family_id: str, notification_hash: str, title: str):
    cur.execute(f"""
        INSERT INTO {SCHEMA}.sent_notifications (family_id, notification_hash, title)
        VALUES ('{escape_sql_string(family_id)}', '{escape_sql_string(notification_hash)}', '{escape_sql_string(title)}')
        ON CONFLICT (family_id, notification_hash) DO NOTHING
    """)
    conn.commit()

def cleanup_old_sent(cur, conn):
    cur.execute(f"DELETE FROM {SCHEMA}.sent_notifications WHERE sent_at < NOW() - INTERVAL '24 hours'")
    conn.commit()

def send_push_notification(subscription_data: dict, title: str, message: str, vapid_private_key: str) -> bool:
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


def send_max_message(chat_id: int, title: str, message: str) -> bool:
    bot_token = os.environ.get('MAX_BOT_TOKEN')
    if not bot_token or not chat_id:
        return False
    try:
        text = f"{title}\n{message}"
        resp = requests.post(
            f'https://platform-api.max.ru/messages?access_token={bot_token}&chat_id={chat_id}',
            headers={'Content-Type': 'application/json'},
            json={'text': text},
            timeout=10
        )
        print(f"[DEBUG] MAX API response: status={resp.status_code}, body={resp.text[:500]}")
        return resp.status_code == 200
    except Exception as e:
        print(f"[ERROR] MAX send failed: {e}")
        return False


def send_telegram_message(chat_id: int, title: str, message: str) -> bool:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token or not chat_id:
        return False
    try:
        text = f"*{title}*\n{message}"
        resp = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'},
            timeout=10
        )
        return resp.status_code == 200 and resp.json().get('ok', False)
    except Exception as e:
        print(f"[ERROR] Telegram send failed: {e}")
        return False

def check_important_dates(cur, family_id: str) -> List[Dict[str, str]]:
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT title, date, type 
            FROM {SCHEMA}.important_dates 
            WHERE family_id = '{family_id_safe}' 
            AND date = CURRENT_DATE + INTERVAL '1 day'
        """
        cur.execute(query)
        tomorrow_dates = cur.fetchall()
        
        for date_info in tomorrow_dates:
            notifications.append({
                'title': f"Завтра: {date_info['title']} от Наша Семья",
                'message': f"Не забудьте поздравить!"
            })
    except Exception as e:
        print(f"[ERROR] Important dates check failed: {str(e)}")
    
    try:
        query = f"""
            SELECT name, created_at::date as birthday 
            FROM {SCHEMA}.family_members 
            WHERE family_id = '{family_id_safe}'
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 day')
            AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '1 day')
        """
        cur.execute(query)
        birthdays = cur.fetchall()
        
        for member in birthdays:
            notifications.append({
                'title': f"День рождения {member['name']} от Наша Семья",
                'message': f"Завтра день рождения! Подготовьте поздравление"
            })
    except Exception as e:
        print(f"[ERROR] Birthday check failed: {str(e)}")
    
    return notifications

def check_calendar_events(cur, family_id: str) -> List[Dict[str, str]]:
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    now = datetime.now()
    current_time = now.strftime('%H:%M')
    future_time = (now + timedelta(hours=1)).strftime('%H:%M')
    
    try:
        query = f"""
            SELECT title, date, time 
            FROM {SCHEMA}.calendar_events 
            WHERE family_id = '{family_id_safe}' 
            AND date = CURRENT_DATE
            AND time IS NOT NULL AND time != ''
            AND time >= '{current_time}' AND time <= '{future_time}'
            AND (completed = false OR completed IS NULL)
            ORDER BY time 
            LIMIT 3
        """
        cur.execute(query)
        upcoming_events = cur.fetchall()
        
        for event in upcoming_events:
            time_str = event['time'] or ''
            notifications.append({
                'title': f"Скоро событие в {time_str} от Наша Семья",
                'message': f"{event['title']}"
            })
    except Exception as e:
        print(f"[ERROR] Upcoming events check failed: {str(e)}")
    
    try:
        query = f"""
            SELECT title, date, time 
            FROM {SCHEMA}.calendar_events 
            WHERE family_id = '{family_id_safe}' 
            AND date = CURRENT_DATE + INTERVAL '1 day'
            AND (completed = false OR completed IS NULL)
            ORDER BY time 
            LIMIT 3
        """
        cur.execute(query)
        tomorrow_events = cur.fetchall()
        
        for event in tomorrow_events:
            time_str = event['time'] or 'весь день'
            notifications.append({
                'title': f"Завтра: {event['title']} от Наша Семья",
                'message': f"Запланировано на {time_str}"
            })
    except Exception as e:
        print(f"[ERROR] Tomorrow events check failed: {str(e)}")
    
    return notifications

def check_medication_schedule(cur, family_id: str) -> List[Dict[str, str]]:
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    current_time = datetime.now().time()
    future_time = (datetime.now() + timedelta(minutes=30)).time()
    
    query = f"""
        SELECT 
            cms.time,
            cm.name as medication_name,
            cm.dosage,
            cm.member_id
        FROM {SCHEMA}.children_medication_schedule cms
        JOIN {SCHEMA}.children_medications cm ON cms.medication_id = cm.id
        WHERE cms.taken = false
        AND cms.time BETWEEN '{current_time}' AND '{future_time}'
    """
    
    try:
        cur.execute(query)
        upcoming_meds = cur.fetchall()
        
        for med in upcoming_meds:
            time_str = med['time'].strftime('%H:%M') if hasattr(med['time'], 'strftime') else str(med['time'])[:5]
            dosage_str = f" ({med['dosage']})" if med.get('dosage') else ""
            notifications.append({
                'title': f"Время лекарства от Наша Семья",
                'message': f"{med['medication_name']}{dosage_str} в {time_str}"
            })
    except Exception as e:
        print(f"[ERROR] Medication check failed: {str(e)}")
    
    return notifications

def check_urgent_tasks(cur, family_id: str) -> List[Dict[str, str]]:
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT title, deadline, priority FROM {SCHEMA}.tasks_v2 
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
                    'title': f"Просрочена задача от Наша Семья",
                    'message': f"{task['title']}"
                })
            elif task['priority'] == 'high':
                notifications.append({
                    'title': f"Срочная задача от Наша Семья",
                    'message': f"{task['title']}"
                })
    except Exception as e:
        print(f"[ERROR] Tasks check failed: {str(e)}")
    
    return notifications

def check_urgent_shopping(cur, family_id: str) -> List[Dict[str, str]]:
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT name FROM {SCHEMA}.shopping_items_v2 
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
                'title': f"Срочные покупки от Наша Семья",
                'message': f"Нужно купить: {items_list}"
            })
    except Exception as e:
        print(f"[ERROR] Shopping check failed: {str(e)}")
    
    return notifications

def check_new_votings(cur, family_id: str) -> List[Dict[str, str]]:
    notifications = []
    family_id_safe = escape_sql_string(family_id)
    
    try:
        query = f"""
            SELECT v.title, COUNT(vt.id) as total_votes 
            FROM {SCHEMA}.votings v
            LEFT JOIN {SCHEMA}.votes vt ON v.id = vt.voting_id
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
                'title': f"Проголосуйте от Наша Семья",
                'message': f"{voting['title']}"
            })
    except Exception as e:
        print(f"[ERROR] Votings check failed: {str(e)}")
    
    return notifications


def check_leisure_activities(cur, user_id: str) -> List[Dict[str, str]]:
    notifications = []
    user_id_safe = escape_sql_string(user_id)
    
    try:
        query = f"""
            SELECT title, date, time, location
            FROM {SCHEMA}.leisure_activities
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
            time_str = activity['time'] if activity['time'] else ''
            location_str = f" ({activity['location']})" if activity['location'] else ''
            notifications.append({
                'title': f"Скоро: {activity['title']} от Наша Семья",
                'message': f"{time_str}{location_str}",
                'activity_id': activity.get('id')
            })
            
            if activity.get('id'):
                cur.execute(
                    f"UPDATE {SCHEMA}.leisure_activities SET reminder_sent = TRUE WHERE id = {activity['id']}"
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


def get_user_diet_settings(cur, user_id: str) -> dict:
    user_id_safe = escape_sql_string(user_id)
    settings = {}
    try:
        cur.execute(f"""
            SELECT notification_type, enabled, time_value, interval_minutes, quiet_start, quiet_end
            FROM {SCHEMA}.nutrition_notification_settings
            WHERE user_id = '{user_id_safe}'
        """)
        for r in cur.fetchall():
            settings[r['notification_type']] = r
    except:
        pass
    return settings


def is_in_quiet_hours(quiet_start: str, quiet_end: str) -> bool:
    now = datetime.now().strftime('%H:%M')
    if quiet_start <= quiet_end:
        return quiet_start <= now <= quiet_end
    return now >= quiet_start or now <= quiet_end


def is_setting_enabled(settings: dict, ntype: str) -> bool:
    if ntype in settings:
        return settings[ntype]['enabled']
    return True


def is_time_match(settings: dict, ntype: str, default_time: str, window_min: int = 15) -> bool:
    target = default_time
    if ntype in settings and settings[ntype].get('time_value'):
        target = settings[ntype]['time_value']
    if not target:
        return True
    now = datetime.now()
    try:
        h, m = map(int, target.split(':'))
        target_dt = now.replace(hour=h, minute=m, second=0)
        diff = abs((now - target_dt).total_seconds())
        return diff <= window_min * 60
    except:
        return True


def check_diet_notifications(cur, user_id: str) -> List[Dict[str, str]]:
    notifications = []
    user_id_safe = escape_sql_string(user_id)

    try:
        settings = get_user_diet_settings(cur, user_id)

        qs = settings.get('motivation', {}).get('quiet_start', '22:00') or '22:00'
        qe = settings.get('motivation', {}).get('quiet_end', '07:00') or '07:00'
        if is_in_quiet_hours(qs, qe):
            return notifications

        cur.execute(f"""
            SELECT id, start_date, end_date, duration_days, target_weight_loss_kg,
                   target_calories_daily, plan_type, daily_water_ml, daily_steps
            FROM {SCHEMA}.diet_plans
            WHERE user_id = '{user_id_safe}' AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """)
        plan = cur.fetchone()
        if not plan:
            return notifications

        plan_id = plan['id']
        days_on = (date.today() - plan['start_date']).days + 1
        duration = plan['duration_days'] or 7
        days_remaining = max(0, (plan['end_date'] - date.today()).days)

        cur.execute(f"SELECT weight_kg FROM {SCHEMA}.diet_weight_log WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id} ORDER BY measured_at ASC LIMIT 1")
        first_w = cur.fetchone()
        cur.execute(f"SELECT weight_kg FROM {SCHEMA}.diet_weight_log WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id} ORDER BY measured_at DESC LIMIT 1")
        last_w = cur.fetchone()
        lost = round(float(first_w['weight_kg']) - float(last_w['weight_kg']), 1) if first_w and last_w else 0

        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.diet_meals WHERE plan_id = {plan_id} AND completed = TRUE")
        done = cur.fetchone()['cnt']
        cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.diet_meals WHERE plan_id = {plan_id}")
        total = cur.fetchone()['cnt']
        adherence = round(done / total * 100) if total > 0 else 0

        if is_setting_enabled(settings, 'weight_reminder') and is_time_match(settings, 'weight_reminder', '08:00'):
            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.diet_weight_log
                WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id} AND measured_at::date = CURRENT_DATE
            """)
            if cur.fetchone()['cnt'] == 0:
                hour = datetime.now().hour
                if hour < 12:
                    notifications.append({'title': 'Взвешивание от Наша Семья', 'message': f'День {days_on} — самое время взвеситься!'})
                elif hour >= 18:
                    cur.execute(f"""
                        SELECT measured_at FROM {SCHEMA}.diet_weight_log
                        WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id}
                        ORDER BY measured_at DESC LIMIT 1
                    """)
                    last_entry = cur.fetchone()
                    if last_entry:
                        days_since = (datetime.now() - last_entry['measured_at']).days
                        if days_since >= 2:
                            notifications.append({'title': 'Не забудьте взвеситься от Наша Семья', 'message': f'Последнее взвешивание {days_since} дней назад.'})

        if is_setting_enabled(settings, 'water_reminder') and is_time_match(settings, 'water_reminder', '10:00', 120):
            target_water = plan.get('daily_water_ml', 2000) or 2000
            cur.execute(f"""
                SELECT COALESCE(SUM(amount_ml), 0) as total
                FROM {SCHEMA}.diet_water_log
                WHERE user_id = '{user_id_safe}' AND plan_id = {plan_id} AND logged_at::date = CURRENT_DATE
            """)
            water_today = cur.fetchone()['total']
            pct = round(water_today / target_water * 100) if target_water > 0 else 0
            if pct < 50:
                remaining = target_water - water_today
                notifications.append({'title': 'Пора попить воды от Наша Семья', 'message': f'Выпито {water_today} мл из {target_water} мл. Осталось {remaining} мл.'})

        if is_setting_enabled(settings, 'meal_reminder') and is_time_match(settings, 'meal_reminder', '12:00', 60):
            cur.execute(f"""
                SELECT meal_type FROM {SCHEMA}.diet_meals
                WHERE plan_id = {plan_id} AND day_number = {days_on} AND completed = FALSE
            """)
            pending_meals = cur.fetchall()
            if pending_meals:
                meals_str = ', '.join([m['meal_type'] for m in pending_meals[:3]])
                notifications.append({'title': 'Время поесть от Наша Семья', 'message': f'Не отмечено: {meals_str}. Следуйте плану!'})

        if is_setting_enabled(settings, 'motivation'):
            if days_on == 3 and lost > 0:
                notifications.append({'title': 'Отличное начало от Наша Семья', 'message': f'3-й день диеты. Уже -{lost} кг! Продолжайте!'})
            elif days_on == 7:
                notifications.append({'title': 'Неделя диеты от Наша Семья', 'message': f'Результат: {lost} кг за неделю.'})
            elif days_on == duration // 2:
                notifications.append({'title': 'Половина пути от Наша Семья', 'message': f'Осталось {days_remaining} дней. Результат: {lost} кг.'})
            elif days_remaining == 0:
                notifications.append({'title': 'План завершён от Наша Семья', 'message': f'{duration} дней диеты позади. Результат: {lost} кг.'})

    except Exception as e:
        print(f"[ERROR] Diet notifications check failed: {e}")

    return notifications


def check_health_medications(cur, user_id: str) -> List[Dict[str, str]]:
    notifications = []
    user_id_safe = escape_sql_string(user_id)
    
    current_time = datetime.now().time()
    window_start = (datetime.now() - timedelta(minutes=5)).time()
    window_end = (datetime.now() + timedelta(minutes=30)).time()
    
    try:
        cur.execute(f"""
            SELECT m.id, m.name, m.dosage, mr.time as reminder_time
            FROM {SCHEMA}.medications m
            JOIN {SCHEMA}.health_profiles hp ON m.profile_id = hp.id
            JOIN {SCHEMA}.medication_reminders mr ON mr.medication_id = m.id
            WHERE m.active = true
            AND mr.enabled = true
            AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
            AND hp.user_id = '{user_id_safe}'
            AND mr.time BETWEEN '{window_start}' AND '{window_end}'
        """)
        medications = cur.fetchall()
        
        for med in medications:
            time_str = med['reminder_time'].strftime('%H:%M') if hasattr(med['reminder_time'], 'strftime') else str(med['reminder_time'])[:5]
            dosage_str = f" ({med['dosage']})" if med.get('dosage') else ""
            notifications.append({
                'title': f"Время лекарства от Наша Семья",
                'message': f"{med['name']}{dosage_str} в {time_str}"
            })
    except Exception as e:
        print(f"[ERROR] Health medications check failed: {e}")
    
    return notifications


def parse_time_of_day(time_of_day: str) -> list:
    time_map = {
        'утро': ['08:00'],
        'день': ['14:00'],
        'вечер': ['20:00'],
        'утро+вечер': ['08:00', '20:00'],
        'утро+день+вечер': ['08:00', '14:00', '20:00'],
    }
    
    times = []
    time_strings = time_map.get(time_of_day, [time_of_day] if ':' in str(time_of_day) else [])
    
    for ts in time_strings:
        try:
            parts = ts.strip().split(':')
            from datetime import time as dt_time
            times.append(dt_time(int(parts[0]), int(parts[1])))
        except:
            pass
    
    return times


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Автоматическая отправка напоминаний по расписанию.
    Вызывается крон-сервисом каждые 5 минут.
    Защищён секретным ключом CRON_SECRET.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Secret',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    params = event.get('queryStringParameters', {}) or {}
    
    cron_secret = os.environ.get('CRON_SECRET', '')
    provided_secret = (
        headers.get('X-Cron-Secret') or 
        headers.get('x-cron-secret') or 
        params.get('secret') or 
        params.get('token') or
        ''
    )
    
    if not cron_secret or provided_secret != cron_secret:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}),
            'isBase64Encoded': False
        }
    
    try:
        print("[INFO] Starting scheduled reminders check...")
        
        dsn = os.environ.get('DATABASE_URL')
        vapid_private_key = os.environ.get('VAPID_PRIVATE_KEY')
        
        if not dsn or not vapid_private_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing configuration'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cleanup_old_sent(cur, conn)
        
        try:
            cur.execute(f"""
                SELECT DISTINCT ps.family_id, ps.user_id, ps.subscription_data
                FROM {SCHEMA}.push_subscriptions ps
                WHERE ps.subscription_data IS NOT NULL
            """)
            subscriptions = cur.fetchall()
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
        
        print(f"[INFO] Found {len(subscriptions)} push subscriptions")
        
        families_processed = set()
        family_notifications = {}
        
        for sub in subscriptions:
            family_id = sub['family_id']
            user_id = str(sub.get('user_id', ''))
            
            if family_id not in family_notifications:
                family_notifications[family_id] = []
                
                family_notifications[family_id].extend(check_important_dates(cur, family_id))
                family_notifications[family_id].extend(check_calendar_events(cur, family_id))
                family_notifications[family_id].extend(check_medication_schedule(cur, family_id))
                family_notifications[family_id].extend(check_urgent_tasks(cur, family_id))
                family_notifications[family_id].extend(check_urgent_shopping(cur, family_id))
                family_notifications[family_id].extend(check_new_votings(cur, family_id))
            
            if user_id:
                family_notifications.setdefault(f"{family_id}:{user_id}", [])
                if not family_notifications[f"{family_id}:{user_id}"]:
                    family_notifications[f"{family_id}:{user_id}"].extend(check_leisure_activities(cur, user_id))
                    family_notifications[f"{family_id}:{user_id}"].extend(check_diet_notifications(cur, user_id))
                    family_notifications[f"{family_id}:{user_id}"].extend(check_health_medications(cur, user_id))
        
        conn.commit()
        
        total_sent = 0
        total_skipped = 0
        total_failed = 0
        
        telegram_cache = {}
        max_cache = {}
        
        for sub in subscriptions:
            family_id = sub['family_id']
            user_id = str(sub.get('user_id', ''))
            subscription_data = sub['subscription_data']
            
            all_notifications = list(family_notifications.get(family_id, []))
            if user_id:
                all_notifications.extend(family_notifications.get(f"{family_id}:{user_id}", []))
            
            if family_id not in telegram_cache:
                telegram_cache[family_id] = []
                max_cache[family_id] = []
                try:
                    cur.execute(f"""
                        SELECT u.telegram_chat_id, u.max_chat_id FROM {SCHEMA}.family_members fm 
                        JOIN {SCHEMA}.users u ON fm.user_id = u.id 
                        WHERE fm.family_id = '{escape_sql_string(family_id)}' 
                        AND (u.telegram_chat_id IS NOT NULL OR u.max_chat_id IS NOT NULL)
                    """)
                    for row in cur.fetchall():
                        if row.get('telegram_chat_id'):
                            telegram_cache[family_id].append(row['telegram_chat_id'])
                        if row.get('max_chat_id'):
                            max_cache[family_id].append(row['max_chat_id'])
                except:
                    pass
            
            for notification in all_notifications[:5]:
                n_hash = make_notification_hash(notification['title'], notification['message'])
                
                if is_already_sent(cur, family_id, n_hash):
                    total_skipped += 1
                    continue
                
                push_ok = send_push_notification(
                    subscription_data,
                    notification['title'],
                    notification['message'],
                    vapid_private_key
                )
                
                tg_ok = False
                for chat_id in telegram_cache.get(family_id, []):
                    if send_telegram_message(chat_id, notification['title'], notification['message']):
                        tg_ok = True
                
                max_ok = False
                for chat_id in max_cache.get(family_id, []):
                    if send_max_message(chat_id, notification['title'], notification['message']):
                        max_ok = True
                
                if push_ok or tg_ok or max_ok:
                    mark_as_sent(cur, conn, family_id, n_hash, notification['title'])
                    total_sent += 1
                    channels = []
                    if push_ok:
                        channels.append('push')
                    if tg_ok:
                        channels.append('telegram')
                    if max_ok:
                        channels.append('max')
                    print(f"[SUCCESS] Sent via {'+'.join(channels)}: {notification['title']}")
                else:
                    total_failed += 1
                    print(f"[FAILED] Could not send: {notification['title']}")
        
        cur.close()
        conn.close()
        
        print(f"[INFO] Completed: sent={total_sent}, skipped={total_skipped}, failed={total_failed}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'sent': total_sent,
                'skipped': total_skipped,
                'failed': total_failed,
                'subscriptions': len(subscriptions),
                'message': f'Processed reminders'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Scheduler error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }