"""Единый крон уведомлений — проверяет ВСЕ источники, сохраняет в notifications, отправляет push/MAX/Telegram"""

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
APP_URL = 'https://nasha-semiya.ru'

def escape(v: Any) -> str:
    if v is None:
        return 'NULL'
    return str(v).replace("'", "''")

def make_hash(title: str, message: str) -> str:
    raw = f"{date.today().isoformat()}:{title}:{message}"
    return hashlib.md5(raw.encode()).hexdigest()

def is_already_sent(cur, family_id: str, h: str) -> bool:
    cur.execute(f"""
        SELECT id FROM {SCHEMA}.sent_notifications 
        WHERE family_id = '{escape(family_id)}' AND notification_hash = '{escape(h)}'
        AND sent_at > NOW() - INTERVAL '24 hours'
    """)
    return cur.fetchone() is not None

def mark_sent(cur, conn, family_id: str, h: str, title: str):
    cur.execute(f"""
        INSERT INTO {SCHEMA}.sent_notifications (family_id, notification_hash, title)
        VALUES ('{escape(family_id)}', '{escape(h)}', '{escape(title)}')
        ON CONFLICT (family_id, notification_hash) DO NOTHING
    """)
    conn.commit()

def cleanup_old(cur, conn):
    cur.execute(f"DELETE FROM {SCHEMA}.sent_notifications WHERE sent_at < NOW() - INTERVAL '48 hours'")
    conn.commit()

def save_notification(cur, conn, user_id: str, family_id: str, n_type: str, title: str, message: str, target_url: str, channel: str = 'push'):
    cur.execute(f"""
        INSERT INTO {SCHEMA}.notifications (user_id, family_id, type, title, message, target_url, channel, status, sent_at, created_at)
        VALUES ('{escape(user_id)}'::uuid, '{escape(family_id)}', '{escape(n_type)}', '{escape(title)}', '{escape(message)}', '{escape(target_url)}', '{escape(channel)}', 'sent', NOW(), NOW())
    """)
    conn.commit()

def send_push(sub_data: dict, title: str, message: str, target_url: str, vapid_key: str) -> bool:
    try:
        webpush(
            subscription_info=sub_data,
            data=json.dumps({'title': title, 'body': message, 'icon': '/icon-192.png', 'url': target_url}),
            vapid_private_key=vapid_key,
            vapid_claims={'sub': 'mailto:support@family-assistant.app'}
        )
        return True
    except WebPushException as e:
        print(f"[ERROR] WebPush: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Push unexpected: {e}")
        return False

def send_max(chat_id: int, title: str, message: str, target_url: str) -> bool:
    bot_token = os.environ.get('MAX_BOT_TOKEN')
    if not bot_token or not chat_id:
        return False
    try:
        full_url = f"{APP_URL}{target_url}"
        text = f"{title}\n{message}\n\n{full_url}"
        resp = requests.post(
            f'https://platform-api.max.ru/messages?access_token={bot_token}&chat_id={chat_id}',
            headers={'Content-Type': 'application/json'},
            json={'text': text},
            timeout=10
        )
        return resp.status_code == 200
    except Exception as e:
        print(f"[ERROR] MAX: {e}")
        return False

def send_telegram(chat_id: int, title: str, message: str, target_url: str = '') -> bool:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token or not chat_id:
        return False
    try:
        full_url = f"{APP_URL}{target_url}" if target_url else ''
        text = f"*{title}*\n{message}"
        if full_url:
            text += f"\n\n{full_url}"
        resp = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'},
            timeout=10
        )
        return resp.status_code == 200 and resp.json().get('ok', False)
    except Exception as e:
        print(f"[ERROR] Telegram: {e}")
        return False


# === ПРОВЕРКИ ИСТОЧНИКОВ ===

def format_date_ru(d) -> str:
    if not d:
        return ''
    months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
              'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    if hasattr(d, 'day'):
        return f"{d.day} {months[d.month - 1]}"
    return str(d)

def check_important_dates(cur, family_id: str) -> List[Dict]:
    notifications = []
    fid = escape(family_id)
    try:
        cur.execute(f"""
            SELECT title, date, type FROM {SCHEMA}.important_dates 
            WHERE family_id = '{fid}' AND date = CURRENT_DATE + INTERVAL '1 day'
        """)
        for d in cur.fetchall():
            dt = format_date_ru(d.get('date'))
            dtype = d.get('type', '')
            type_label = 'День рождения' if dtype == 'birthday' else 'Важная дата'
            notifications.append({
                'type': 'birthday', 'target_url': '/calendar',
                'title': f"Завтра ({dt}): {d['title']}",
                'message': f"{type_label}. Не забудьте поздравить и подготовить подарок!"
            })
    except Exception as e:
        print(f"[ERROR] Important dates: {e}")

    try:
        cur.execute(f"""
            SELECT name FROM {SCHEMA}.family_members 
            WHERE family_id = '{fid}'
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 day')
            AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '1 day')
        """)
        for m in cur.fetchall():
            tomorrow = date.today() + timedelta(days=1)
            dt = format_date_ru(tomorrow)
            notifications.append({
                'type': 'birthday', 'target_url': '/calendar',
                'title': f"Завтра ({dt}): День рождения — {m['name']}",
                'message': f"Завтра день рождения у {m['name']}! Подготовьте поздравление и подарок."
            })
    except Exception as e:
        print(f"[ERROR] Birthdays: {e}")
    return notifications

def check_calendar(cur, family_id: str) -> List[Dict]:
    notifications = []
    fid = escape(family_id)
    now = datetime.now()
    cur_t = now.strftime('%H:%M')
    fut_t = (now + timedelta(hours=1)).strftime('%H:%M')

    try:
        cur.execute(f"""
            SELECT title, date, time, description FROM {SCHEMA}.calendar_events 
            WHERE family_id = '{fid}' AND date = CURRENT_DATE
            AND time IS NOT NULL AND time != ''
            AND time >= '{cur_t}' AND time <= '{fut_t}'
            AND (completed = false OR completed IS NULL)
            ORDER BY time LIMIT 3
        """)
        for e in cur.fetchall():
            t = e.get('time', '')
            desc = e.get('description', '')
            desc_text = f"\n{desc[:80]}" if desc else ""
            notifications.append({
                'type': 'calendar', 'target_url': '/calendar',
                'title': f"Сегодня в {t}: {e['title']}",
                'message': f"Напоминание о событии через менее чем час.{desc_text}"
            })
    except Exception as e:
        print(f"[ERROR] Calendar upcoming: {e}")

    try:
        cur.execute(f"""
            SELECT title, date, time, description FROM {SCHEMA}.calendar_events 
            WHERE family_id = '{fid}' AND date = CURRENT_DATE + INTERVAL '1 day'
            AND (completed = false OR completed IS NULL)
            ORDER BY time LIMIT 5
        """)
        tomorrow_events = cur.fetchall()
        if tomorrow_events:
            tomorrow = date.today() + timedelta(days=1)
            dt = format_date_ru(tomorrow)
            for e in tomorrow_events:
                t = e.get('time')
                desc = e.get('description', '')
                time_text = f" в {t}" if t else " (на весь день)"
                desc_text = f"\n{desc[:80]}" if desc else ""
                notifications.append({
                    'type': 'calendar', 'target_url': '/calendar',
                    'title': f"Завтра ({dt}){time_text}: {e['title']}",
                    'message': f"Запланировано на завтра{time_text}.{desc_text}"
                })
    except Exception as e:
        print(f"[ERROR] Calendar tomorrow: {e}")
    return notifications

def check_medications_children(cur, family_id: str) -> List[Dict]:
    notifications = []
    now = datetime.now()
    t_start = (now - timedelta(minutes=5)).time()
    t_end = (now + timedelta(minutes=30)).time()

    try:
        cur.execute(f"""
            SELECT cms.time, cm.name, cm.dosage
            FROM {SCHEMA}.children_medication_schedule cms
            JOIN {SCHEMA}.children_medications cm ON cms.medication_id = cm.id
            WHERE cms.taken = false AND cms.time BETWEEN '{t_start}' AND '{t_end}'
        """)
        for med in cur.fetchall():
            ts = med['time'].strftime('%H:%M') if hasattr(med['time'], 'strftime') else str(med['time'])[:5]
            dose = f", дозировка: {med['dosage']}" if med.get('dosage') else ""
            notifications.append({
                'type': 'medication', 'target_url': '/health/medications',
                'title': f"Время лекарства в {ts}",
                'message': f"Нужно принять: {med['name']}{dose}. Не пропустите приём!"
            })
    except Exception as e:
        print(f"[ERROR] Children meds: {e}")
    return notifications

def check_health_medications(cur, user_id: str) -> List[Dict]:
    notifications = []
    uid = escape(user_id)
    now = datetime.now()
    t_start = (now - timedelta(minutes=5)).time()
    t_end = (now + timedelta(minutes=30)).time()

    try:
        cur.execute(f"""
            SELECT m.name, m.dosage, mr.time as reminder_time
            FROM {SCHEMA}.medications m
            JOIN {SCHEMA}.health_profiles hp ON m.profile_id = hp.id
            JOIN {SCHEMA}.medication_reminders mr ON mr.medication_id = m.id
            WHERE m.active = true AND hp.user_id = '{uid}'
            AND mr.time BETWEEN '{t_start}' AND '{t_end}'
        """)
        for med in cur.fetchall():
            ts = med['reminder_time'].strftime('%H:%M') if hasattr(med['reminder_time'], 'strftime') else str(med['reminder_time'])[:5]
            dose = f", дозировка: {med['dosage']}" if med.get('dosage') else ""
            notifications.append({
                'type': 'medication', 'target_url': '/health/medications',
                'title': f"Время лекарства в {ts}",
                'message': f"Нужно принять: {med['name']}{dose}. Не пропустите приём!"
            })
    except Exception as e:
        print(f"[ERROR] Health meds: {e}")
    return notifications

def check_tasks(cur, family_id: str) -> List[Dict]:
    notifications = []
    fid = escape(family_id)
    try:
        cur.execute(f"""
            SELECT title, priority, deadline FROM {SCHEMA}.tasks 
            WHERE family_id = '{fid}' AND status != 'done'
            AND (priority = 'high' OR (deadline IS NOT NULL AND deadline < NOW() + INTERVAL '2 hours'))
            LIMIT 3
        """)
        for t in cur.fetchall():
            if t.get('deadline') and t['deadline'] < datetime.now():
                dl = t['deadline'].strftime('%d.%m в %H:%M') if hasattr(t['deadline'], 'strftime') else str(t['deadline'])
                notifications.append({
                    'type': 'task', 'target_url': '/tasks',
                    'title': f"Просрочена задача: {t['title']}",
                    'message': f"Срок выполнения истёк ({dl}). Пожалуйста, выполните или перенесите задачу."
                })
            elif t.get('priority') == 'high':
                notifications.append({
                    'type': 'task', 'target_url': '/tasks',
                    'title': f"Срочная задача: {t['title']}",
                    'message': f"У вас есть срочная задача с высоким приоритетом. Не откладывайте!"
                })
    except Exception as e:
        print(f"[ERROR] Tasks: {e}")
    return notifications

def check_shopping(cur, family_id: str) -> List[Dict]:
    notifications = []
    fid = escape(family_id)
    try:
        cur.execute(f"""
            SELECT name FROM {SCHEMA}.shopping_items_v2 
            WHERE family_id = '{fid}' AND priority = 'urgent' AND bought = FALSE LIMIT 5
        """)
        items = cur.fetchall()
        if items:
            names = ', '.join([i['name'] for i in items])
            cnt = len(items)
            word = 'товар' if cnt == 1 else ('товара' if cnt < 5 else 'товаров')
            notifications.append({
                'type': 'shopping', 'target_url': '/shopping',
                'title': f"Срочные покупки ({cnt} {word})",
                'message': f"Нужно купить: {names}"
            })
    except Exception as e:
        print(f"[ERROR] Shopping: {e}")
    return notifications

def check_votings(cur, family_id: str) -> List[Dict]:
    notifications = []
    fid = escape(family_id)
    try:
        cur.execute(f"""
            SELECT v.title, v.end_date, COUNT(vt.id) as total_votes 
            FROM {SCHEMA}.votings v
            LEFT JOIN {SCHEMA}.votes vt ON v.id = vt.voting_id
            WHERE v.family_id = '{fid}' AND v.end_date > NOW()
            AND v.created_at > NOW() - INTERVAL '24 hours'
            GROUP BY v.id, v.title, v.end_date HAVING COUNT(vt.id) < 3 LIMIT 2
        """)
        for v in cur.fetchall():
            end = v.get('end_date')
            end_text = f" (до {end.strftime('%d.%m в %H:%M')})" if end and hasattr(end, 'strftime') else ""
            notifications.append({
                'type': 'voting', 'target_url': '/votings',
                'title': f"Голосование: {v['title']}",
                'message': f"Ваш голос ещё не учтён! Проголосуйте{end_text}."
            })
    except Exception as e:
        print(f"[ERROR] Votings: {e}")
    return notifications

def check_leisure(cur, user_id: str) -> List[Dict]:
    notifications = []
    uid = escape(user_id)
    try:
        cur.execute(f"""
            SELECT id, title, date, time, location FROM {SCHEMA}.leisure_activities
            WHERE user_id = '{uid}' AND status = 'planned'
            AND reminder_datetime IS NOT NULL
            AND reminder_datetime BETWEEN NOW() AND NOW() + INTERVAL '10 minutes'
            AND (reminder_sent = FALSE OR reminder_sent IS NULL) LIMIT 3
        """)
        for a in cur.fetchall():
            loc = f" | Место: {a['location']}" if a.get('location') else ""
            t = a.get('time', '')
            d = format_date_ru(a.get('date'))
            notifications.append({
                'type': 'leisure', 'target_url': '/leisure',
                'title': f"Скоро: {a['title']}",
                'message': f"{d} в {t}{loc}. Пора собираться!"
            })
            if a.get('id'):
                cur.execute(f"UPDATE {SCHEMA}.leisure_activities SET reminder_sent = TRUE WHERE id = {a['id']}")
    except Exception as e:
        print(f"[ERROR] Leisure: {e}")
    return notifications


def get_diet_settings(cur, user_id: str) -> dict:
    uid = escape(user_id)
    settings = {}
    try:
        cur.execute(f"""
            SELECT notification_type, enabled, time_value, interval_minutes, quiet_start, quiet_end
            FROM {SCHEMA}.nutrition_notification_settings WHERE user_id = '{uid}'
        """)
        for r in cur.fetchall():
            settings[r['notification_type']] = r
    except:
        pass
    return settings

def is_quiet(qs: str, qe: str) -> bool:
    now = datetime.now().strftime('%H:%M')
    if qs <= qe:
        return qs <= now <= qe
    return now >= qs or now <= qe

def setting_enabled(settings: dict, ntype: str) -> bool:
    if ntype in settings:
        return settings[ntype]['enabled']
    return True

def time_match(settings: dict, ntype: str, default: str, window: int = 15) -> bool:
    target = default
    if ntype in settings and settings[ntype].get('time_value'):
        target = settings[ntype]['time_value']
    if not target:
        return True
    now = datetime.now()
    try:
        h, m = map(int, target.split(':'))
        t_dt = now.replace(hour=h, minute=m, second=0)
        return abs((now - t_dt).total_seconds()) <= window * 60
    except:
        return True

def check_diet(cur, user_id: str) -> List[Dict]:
    notifications = []
    uid = escape(user_id)
    try:
        settings = get_diet_settings(cur, user_id)
        qs = settings.get('motivation', {}).get('quiet_start', '22:00') or '22:00'
        qe = settings.get('motivation', {}).get('quiet_end', '07:00') or '07:00'
        if is_quiet(qs, qe):
            return notifications

        cur.execute(f"""
            SELECT id, start_date, end_date, duration_days, target_calories_daily, daily_water_ml
            FROM {SCHEMA}.diet_plans
            WHERE user_id = '{uid}' AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """)
        plan = cur.fetchone()
        if not plan:
            return notifications

        plan_id = plan['id']

        if setting_enabled(settings, 'weight_reminder') and time_match(settings, 'weight_reminder', '08:00'):
            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.diet_weight_log
                WHERE user_id = '{uid}' AND plan_id = {plan_id} AND measured_at::date = CURRENT_DATE
            """)
            if cur.fetchone()['cnt'] == 0:
                notifications.append({
                    'type': 'diet', 'target_url': '/diet',
                    'title': 'Утреннее взвешивание',
                    'message': 'Не забудьте записать утренний вес натощак для отслеживания прогресса.'
                })

        if setting_enabled(settings, 'meal_reminder') and time_match(settings, 'meal_reminder', '12:00'):
            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.diet_meals
                WHERE plan_id = {plan_id} AND completed = FALSE AND date = CURRENT_DATE
            """)
            r = cur.fetchone()
            if r and r['cnt'] > 0:
                word = 'приём' if r['cnt'] == 1 else ('приёма' if r['cnt'] < 5 else 'приёмов')
                notifications.append({
                    'type': 'diet', 'target_url': '/diet',
                    'title': f"План питания: {r['cnt']} {word} пищи",
                    'message': f"Осталось {r['cnt']} {word} пищи на сегодня. Придерживайтесь плана!"
                })

        if setting_enabled(settings, 'water_reminder') and time_match(settings, 'water_reminder', '14:00'):
            water_target = plan.get('daily_water_ml', 2000)
            notifications.append({
                'type': 'diet', 'target_url': '/diet',
                'title': 'Напоминание о воде',
                'message': f"Не забывайте пить воду! Ваша дневная цель — {water_target} мл."
            })

    except Exception as e:
        print(f"[ERROR] Diet: {e}")
    return notifications


def check_geofences(cur) -> List[Dict]:
    notifications = []
    try:
        cur.execute(f"""
            SELECT ge.id, ge.member_id, g.name as zone_name, g.family_id,
                   fm.name as member_name
            FROM {SCHEMA}.geofence_events ge
            JOIN {SCHEMA}.geofences g ON ge.geofence_id = g.id
            LEFT JOIN {SCHEMA}.family_members fm ON ge.member_id::text = fm.id::text
            WHERE ge.event_type = 'exit'
            AND ge.timestamp > NOW() - INTERVAL '10 minutes'
            AND (ge.notified = FALSE OR ge.notified IS NULL)
        """)
        for ev in cur.fetchall():
            member_name = ev.get('member_name', 'Член семьи')
            notifications.append({
                'type': 'geofence', 'target_url': '/family-tracker',
                'title': f"Выход из зоны: {ev['zone_name']}",
                'message': f"{member_name} покинул(а) зону \"{ev['zone_name']}\".",
                'family_id': ev['family_id'],
                'geofence_event_id': ev['id']
            })
    except Exception as e:
        print(f"[ERROR] Geofences: {e}")
    return notifications


def check_subscriptions(cur) -> List[Dict]:
    notifications = []
    try:
        cur.execute(f"""
            SELECT s.id as sub_id, s.plan_type, s.end_date, f.id as family_id,
                   u.id as user_id, u.name as user_name
            FROM {SCHEMA}.subscriptions s
            JOIN {SCHEMA}.families f ON s.family_id = f.id
            JOIN {SCHEMA}.family_members fm ON f.id = fm.family_id AND fm.role = 'owner'
            JOIN {SCHEMA}.users u ON fm.user_id = u.id
            WHERE s.status = 'active'
            AND s.end_date > CURRENT_TIMESTAMP
            AND s.end_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
        """)
        plan_names = {'basic': 'Базовый', 'standard': 'Семейный', 'premium': 'Премиум'}

        for s in cur.fetchall():
            days_left = (s['end_date'] - datetime.now()).days
            if days_left not in [7, 3, 1]:
                continue

            sub_id = str(s['sub_id'])
            ntype = f"expiring_{days_left}days"

            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.subscription_notifications_log
                WHERE subscription_id = '{escape(sub_id)}' AND notification_type = '{ntype}'
            """)
            if cur.fetchone()['cnt'] > 0:
                continue

            plan_display = plan_names.get(s['plan_type'], s['plan_type'])
            end_date_str = s['end_date'].strftime('%d.%m.%Y') if hasattr(s['end_date'], 'strftime') else str(s['end_date'])
            word = 'день' if days_left == 1 else ('дня' if days_left < 5 else 'дней')
            notifications.append({
                'type': 'subscription', 'target_url': '/pricing',
                'title': f"Подписка \"{plan_display}\" заканчивается",
                'message': f"Осталось {days_left} {word} (до {end_date_str}). Продлите, чтобы не потерять доступ.",
                'user_id': str(s['user_id']),
                'family_id': str(s['family_id']),
                'sub_id': sub_id,
                'ntype': ntype,
                'days_left': days_left
            })
    except Exception as e:
        print(f"[ERROR] Subscriptions: {e}")
    return notifications


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Единый крон уведомлений — проверяет все источники каждые 5 минут"""
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
            'body': '', 'isBase64Encoded': False
        }

    headers = event.get('headers', {})
    params = event.get('queryStringParameters', {}) or {}

    cron_secret = os.environ.get('CRON_SECRET', '')
    provided = headers.get('X-Cron-Secret') or headers.get('x-cron-secret') or params.get('secret') or params.get('token') or ''

    if not cron_secret or provided != cron_secret:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}), 'isBase64Encoded': False
        }

    try:
        print("[INFO] Starting unified notification check...")
        dsn = os.environ.get('DATABASE_URL')
        vapid_key = os.environ.get('VAPID_PRIVATE_KEY')

        if not dsn or not vapid_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing config'}), 'isBase64Encoded': False
            }

        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cleanup_old(cur, conn)

        cur.execute(f"""
            SELECT DISTINCT ps.family_id, ps.user_id, ps.subscription_data, ps.notification_settings
            FROM {SCHEMA}.push_subscriptions ps WHERE ps.subscription_data IS NOT NULL
        """)
        subscriptions = cur.fetchall()
        print(f"[INFO] Found {len(subscriptions)} push subscriptions")

        family_notifs = {}
        user_notifs = {}

        for sub in subscriptions:
            fid = sub['family_id']
            uid = str(sub.get('user_id', ''))

            if fid not in family_notifs:
                family_notifs[fid] = []
                family_notifs[fid].extend(check_important_dates(cur, fid))
                family_notifs[fid].extend(check_calendar(cur, fid))
                family_notifs[fid].extend(check_medications_children(cur, fid))
                family_notifs[fid].extend(check_tasks(cur, fid))
                family_notifs[fid].extend(check_shopping(cur, fid))
                family_notifs[fid].extend(check_votings(cur, fid))

            if uid and uid not in user_notifs:
                user_notifs[uid] = []
                user_notifs[uid].extend(check_leisure(cur, uid))
                user_notifs[uid].extend(check_diet(cur, uid))
                user_notifs[uid].extend(check_health_medications(cur, uid))

        geo_notifs = check_geofences(cur)
        sub_notifs = check_subscriptions(cur)
        conn.commit()

        telegram_cache = {}
        max_cache = {}
        total_sent = 0
        total_skipped = 0
        total_failed = 0

        for sub in subscriptions:
            fid = sub['family_id']
            uid = str(sub.get('user_id', ''))
            sub_data = sub['subscription_data']
            settings = sub.get('notification_settings') or {}

            all_n = list(family_notifs.get(fid, []))
            if uid:
                all_n.extend(user_notifs.get(uid, []))

            for gn in geo_notifs:
                if gn.get('family_id') == fid:
                    all_n.append(gn)

            if fid not in telegram_cache:
                telegram_cache[fid] = []
                max_cache[fid] = []
                try:
                    cur.execute(f"""
                        SELECT u.telegram_chat_id, u.max_chat_id FROM {SCHEMA}.family_members fm
                        JOIN {SCHEMA}.users u ON fm.user_id = u.id
                        WHERE fm.family_id = '{escape(fid)}'
                        AND (u.telegram_chat_id IS NOT NULL OR u.max_chat_id IS NOT NULL)
                    """)
                    for row in cur.fetchall():
                        if row.get('telegram_chat_id'):
                            telegram_cache[fid].append(row['telegram_chat_id'])
                        if row.get('max_chat_id'):
                            max_cache[fid].append(row['max_chat_id'])
                except:
                    pass

            for n in all_n[:8]:
                n_type = n.get('type', 'general')
                setting_key = {
                    'medication': 'medications', 'calendar': 'calendar', 'task': 'tasks',
                    'shopping': 'shopping', 'voting': 'votings', 'birthday': 'birthdays',
                    'diet': 'diet', 'geofence': 'geofence', 'leisure': 'leisure',
                    'subscription': 'subscription'
                }.get(n_type, n_type)

                if isinstance(settings, dict) and setting_key in settings:
                    if not settings[setting_key]:
                        continue

                h = make_hash(n['title'], n['message'])
                if is_already_sent(cur, fid, h):
                    total_skipped += 1
                    continue

                target_url = n.get('target_url', '/notifications')

                push_ok = send_push(sub_data, n['title'], n['message'], target_url, vapid_key)

                max_ok = False
                for chat_id in max_cache.get(fid, []):
                    if send_max(chat_id, n['title'], n['message'], target_url):
                        max_ok = True

                tg_ok = False
                for chat_id in telegram_cache.get(fid, []):
                    if send_telegram(chat_id, n['title'], n['message'], target_url):
                        tg_ok = True

                any_sent = push_ok or max_ok or tg_ok
                if any_sent:
                    total_sent += 1
                    mark_sent(cur, conn, fid, h, n['title'])
                    if uid:
                        save_notification(cur, conn, uid, fid, n_type, n['title'], n['message'], target_url, 'push')
                else:
                    total_failed += 1

                if n.get('geofence_event_id'):
                    try:
                        cur.execute(f"UPDATE {SCHEMA}.geofence_events SET notified = TRUE WHERE id = {n['geofence_event_id']}")
                        conn.commit()
                    except:
                        pass

        for sn in sub_notifs:
            h = make_hash(sn['title'], sn['message'])
            target_url = sn.get('target_url', '/pricing')
            sn_uid = sn.get('user_id', '')
            sn_fid = sn.get('family_id', '')

            for sub in subscriptions:
                if str(sub.get('user_id', '')) == sn_uid:
                    push_ok = send_push(sub['subscription_data'], sn['title'], sn['message'], target_url, vapid_key)
                    if push_ok:
                        total_sent += 1
                    break

            for chat_id in max_cache.get(sn_fid, []):
                send_max(chat_id, sn['title'], sn['message'], target_url)

            if sn_uid:
                save_notification(cur, conn, sn_uid, sn_fid, 'subscription', sn['title'], sn['message'], target_url, 'push')

            try:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.subscription_notifications_log
                    (subscription_id, user_id, notification_type, channel, days_left)
                    VALUES ('{escape(sn['sub_id'])}'::uuid, '{escape(sn_uid)}'::uuid, '{escape(sn['ntype'])}', 'push', {sn['days_left']})
                    ON CONFLICT DO NOTHING
                """)
                conn.commit()
            except Exception as e:
                print(f"[ERROR] Sub log: {e}")

        cur.close()
        conn.close()

        print(f"[INFO] Done: sent={total_sent}, skipped={total_skipped}, failed={total_failed}")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True, 'sent': total_sent, 'skipped': total_skipped, 'failed': total_failed,
                'subscriptions_checked': len(sub_notifs)
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f"[FATAL] {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}), 'isBase64Encoded': False
        }
