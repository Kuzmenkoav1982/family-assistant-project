import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import math
import requests
from pywebpush import webpush, WebPushException

SCHEMA = 't_p5815085_family_assistant_pro'
APP_URL = 'https://nasha-semiya.ru'

def handler(event: dict, context) -> dict:
    """API семейного маячка — приём и отдача координат членов семьи"""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    if not auth_token:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Требуется авторизация'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        cur.execute(
            f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
            (auth_token,)
        )
        result = cur.fetchone()

        if not result:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Недействительный токен'})
            }

        user_id = result[0]

        cur.execute(
            f"SELECT id, family_id, name FROM {SCHEMA}.family_members WHERE user_id = %s LIMIT 1",
            (str(user_id),)
        )
        family_result = cur.fetchone()

        if not family_result:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Семья не найдена'})
            }

        member_id = family_result[0]
        family_id = family_result[1]
        member_name = family_result[2] or 'Член семьи'

        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            lat = body.get('lat')
            lng = body.get('lng')
            accuracy = body.get('accuracy', 0)

            if not lat or not lng:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Отсутствуют координаты'})
                }

            cur.execute(
                f"""INSERT INTO {SCHEMA}.family_location_tracking 
                (user_id, family_id, latitude, longitude, accuracy, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())""",
                (str(user_id), str(family_id), lat, lng, accuracy)
            )

            exit_events = check_geofence_violations(cur, str(member_id), lat, lng)
            conn.commit()

            if exit_events:
                send_instant_alerts(cur, conn, str(family_id), str(member_id), str(user_id), member_name, exit_events)

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'success': True, 'message': 'Координаты сохранены'})
            }

        elif method == 'GET':
            cur.execute(f"""
                SELECT DISTINCT ON (lt.user_id)
                    fm.id as member_id,
                    lt.latitude,
                    lt.longitude,
                    lt.accuracy,
                    lt.created_at
                FROM {SCHEMA}.family_location_tracking lt
                JOIN {SCHEMA}.family_members fm ON fm.user_id = lt.user_id
                WHERE lt.family_id = %s
                ORDER BY lt.user_id, lt.created_at DESC
            """, (str(family_id),))

            locations = []
            for row in cur.fetchall():
                locations.append({
                    'memberId': str(row[0]),
                    'lat': float(row[1]),
                    'lng': float(row[2]),
                    'accuracy': float(row[3]) if row[3] else 0,
                    'timestamp': (row[4].isoformat() + 'Z') if row[4] else None
                })

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'success': True, 'locations': locations})
            }

        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
    finally:
        cur.close()
        conn.close()


def check_geofence_violations(cur, member_id: str, lat: float, lng: float) -> list:
    """Проверка геозон, возвращает список exit-событий для мгновенной отправки"""
    cur.execute(f'SELECT id, name, center_lat, center_lng, radius FROM {SCHEMA}.geofences')
    geofences = cur.fetchall()
    exit_events = []

    for geofence in geofences:
        zone_id, zone_name, center_lat, center_lng, radius = geofence
        distance = haversine_distance(lat, lng, float(center_lat), float(center_lng))

        cur.execute(f'''
            SELECT event_type FROM {SCHEMA}.geofence_events
            WHERE member_id = %s AND geofence_id = %s
            ORDER BY timestamp DESC LIMIT 1
        ''', (member_id, zone_id))

        last_event = cur.fetchone()
        last_state = last_event[0] if last_event else None
        is_inside = distance <= radius

        if is_inside and last_state != 'enter':
            cur.execute(f'''
                INSERT INTO {SCHEMA}.geofence_events (member_id, geofence_id, event_type, lat, lng)
                VALUES (%s, %s, 'enter', %s, %s)
            ''', (member_id, zone_id, lat, lng))

        elif not is_inside and last_state == 'enter':
            cur.execute(f'''
                INSERT INTO {SCHEMA}.geofence_events (member_id, geofence_id, event_type, lat, lng, notified)
                VALUES (%s, %s, 'exit', %s, %s, FALSE)
                RETURNING id
            ''', (member_id, zone_id, lat, lng))
            row = cur.fetchone()
            exit_events.append({
                'event_id': row[0] if row else None,
                'zone_name': zone_name,
                'zone_id': zone_id
            })

    return exit_events


def send_instant_alerts(cur, conn, family_id: str, sender_member_id: str, sender_user_id: str, member_name: str, exit_events: list):
    """Мгновенная отправка push/MAX/Telegram при выходе из зоны. Крон — подстраховка."""
    vapid_key = os.environ.get('VAPID_PRIVATE_KEY')

    cur2 = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur2.execute(f"""
            SELECT member_id, alerts_enabled, notify_members
            FROM {SCHEMA}.geofence_alert_settings
            WHERE family_id = %s AND member_id = %s
        """, (family_id, sender_member_id))
        alert_row = cur2.fetchone()

        if alert_row and not alert_row['alerts_enabled']:
            return

        allowed_member_ids = []
        if alert_row and alert_row.get('notify_members'):
            allowed_member_ids = alert_row['notify_members']

        cur2.execute(f"""
            SELECT fm.id as member_id, fm.user_id, ps.subscription_data, ps.notification_settings
            FROM {SCHEMA}.family_members fm
            LEFT JOIN {SCHEMA}.push_subscriptions ps ON ps.user_id = fm.user_id AND ps.family_id = fm.family_id
            WHERE fm.family_id = %s
        """, (family_id,))
        family_rows = cur2.fetchall()

        cur2.execute(f"""
            SELECT fm.id as member_id, u.id as user_id, u.telegram_chat_id, u.max_chat_id
            FROM {SCHEMA}.family_members fm
            JOIN {SCHEMA}.users u ON fm.user_id = u.id
            WHERE fm.family_id = %s
            AND (u.telegram_chat_id IS NOT NULL OR u.max_chat_id IS NOT NULL)
        """, (family_id,))
        messengers = cur2.fetchall()

        for ev in exit_events:
            zone_name = ev['zone_name']
            event_id = ev['event_id']

            title = f"⚠️ {member_name} вышел из зоны"
            message = f'Покинул(а) безопасную зону "{zone_name}"'
            target_url = '/family-tracker'
            any_sent = False

            for row in family_rows:
                if str(row.get('user_id', '')) == sender_user_id:
                    continue

                if allowed_member_ids and str(row['member_id']) not in [str(x) for x in allowed_member_ids]:
                    continue

                settings = row.get('notification_settings') or {}
                geo_setting = settings.get('geofence', True)
                if isinstance(geo_setting, dict) and not geo_setting.get('enabled', True):
                    continue
                if isinstance(geo_setting, bool) and not geo_setting:
                    continue

                if vapid_key and row.get('subscription_data'):
                    try:
                        webpush(
                            subscription_info=row['subscription_data'],
                            data=json.dumps({
                                'title': title,
                                'body': message,
                                'icon': '/icon-192.png',
                                'url': target_url
                            }),
                            vapid_private_key=vapid_key,
                            vapid_claims={'sub': 'mailto:support@family-assistant.app'}
                        )
                        any_sent = True
                    except WebPushException:
                        pass
                    except Exception:
                        pass

            for m in messengers:
                if str(m.get('user_id', '')) == sender_user_id:
                    continue

                if allowed_member_ids and str(m['member_id']) not in [str(x) for x in allowed_member_ids]:
                    continue

                if m.get('max_chat_id'):
                    if send_max(m['max_chat_id'], title, message, target_url):
                        any_sent = True

                if m.get('telegram_chat_id'):
                    if send_telegram(m['telegram_chat_id'], title, message, target_url):
                        any_sent = True

            if any_sent and event_id:
                cur2.execute(f"UPDATE {SCHEMA}.geofence_events SET notified = TRUE WHERE id = %s", (event_id,))
                conn.commit()

    except Exception as e:
        print(f"[WARN] Instant alert failed (cron will retry): {e}")
    finally:
        cur2.close()


def send_max(chat_id, title: str, message: str, target_url: str) -> bool:
    bot_token = os.environ.get('MAX_BOT_TOKEN')
    if not bot_token or not chat_id:
        return False
    try:
        text = f"{title}\n{message}\n\n{APP_URL}{target_url}"
        resp = requests.post(
            f'https://platform-api.max.ru/messages?access_token={bot_token}&chat_id={chat_id}',
            headers={'Content-Type': 'application/json'},
            json={'text': text},
            timeout=5
        )
        return resp.status_code == 200
    except Exception:
        return False


def send_telegram(chat_id, title: str, message: str, target_url: str) -> bool:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token or not chat_id:
        return False
    try:
        text = f"*{title}*\n{message}\n\n{APP_URL}{target_url}"
        resp = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'},
            timeout=5
        )
        return resp.status_code == 200
    except Exception:
        return False


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Расстояние между двумя точками на Земле (в метрах)"""
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c