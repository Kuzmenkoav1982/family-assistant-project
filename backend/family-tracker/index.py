"""
Business: семейный маячок — приём своих координат и отдача координат семьи
Args: event с httpMethod GET/POST, body {lat, lng, accuracy}
Returns: JSON со списком последних позиций доступных участников

Авторизация: backend/_shared/auth_guard.py.

Было (инцидент SEC-2026-001):
  - сессия разбиралась вручную, семья определялась по `WHERE user_id = %s
    LIMIT 1` без учёта member_status: изолированный дубликат или отозванный
    участник продолжал работать;
  - GET отдавал последние координаты ВСЕХ участников семьи без адресной
    проверки — роль в списке не участвовала вообще;
  - check_geofence_violations читала `SELECT ... FROM geofences` без
    family_id, то есть сверяла координаты участника с геозонами всех семей
    платформы и писала события по чужим зонам;
  - текст ошибки psycopg2 отдавался клиенту.

Стало: require_session, набор видимых субъектов строится через
accessible_subject_ids('geolocation'), геозоны — только своей семьи.
"""

import json
import math
import os

import psycopg2
import requests
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

APP_URL = 'https://nasha-semiya.ru'


def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    if method not in ('GET', 'POST'):
        return ag.json_response({'error': 'Метод не поддерживается'},
                                status=405, event=event)

    try:
        ctx = ag.require_session(event)
        ag.require_family_member(ctx)

        conn = psycopg2.connect(ag.DATABASE_URL)
        cur = conn.cursor()
        try:
            if method == 'POST':
                return _post_location(conn, cur, ctx, event)
            return _get_locations(cur, ctx, event)
        finally:
            cur.close()
            conn.close()

    except AuthError as exc:
        return ag.error_response(exc, event)
    except Exception as exc:  # noqa: BLE001
        # Текст ошибки наружу не отдаём: он раскрывает структуру БД.
        print(f'[family-tracker] failed: {type(exc).__name__}: {exc}')
        return ag.json_response({'error': 'Внутренняя ошибка'},
                                status=500, event=event)


def _post_location(conn, cur, ctx: ag.AuthContext, event: dict) -> dict:
    """Отправить можно ТОЛЬКО свои координаты: субъект — сам актор,
    member_id из тела запроса не принимается принципиально.

    SEC-2026-001: сбор новых координат приостановлен до отдельного
    согласия на перемещения и интерфейса управления доступом. Это самый
    важный отказ во всей волне: пока человек не может увидеть и отозвать
    доступ к своим перемещениям, новых точек мы не накапливаем.
    """
    ag.require_geo_enabled(ag.GEO_COLLECTION_FLAG)
    ag.require_permission(ctx, 'geolocation', 'update')

    try:
        body = json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        body = {}

    lat, lng = _coord(body.get('lat'), 90), _coord(body.get('lng'), 180)
    if lat is None or lng is None:
        return ag.json_response({'error': 'Отсутствуют или неверны координаты'},
                                status=400, event=event)
    accuracy = _coord(body.get('accuracy', 0), 1_000_000) or 0

    cur.execute(
        f"""INSERT INTO {SCHEMA}.family_location_tracking
                (user_id, family_id, latitude, longitude, accuracy, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())""",
        (ctx.user_id, ctx.family_id, lat, lng, accuracy),
    )

    exit_events = check_geofence_violations(cur, ctx.family_id, ctx.member_id, lat, lng)
    conn.commit()

    if exit_events:
        cur.execute(
            f'SELECT name FROM {SCHEMA}.family_members WHERE id = %s',
            (ctx.member_id,),
        )
        row = cur.fetchone()
        send_instant_alerts(cur, conn, ctx.family_id, ctx.member_id, ctx.user_id,
                            (row[0] if row else None) or 'Член семьи', exit_events)

    return ag.json_response({'success': True, 'message': 'Координаты сохранены'},
                            event=event)


def _get_locations(cur, ctx: ag.AuthContext, event: dict) -> dict:
    """
    Видны координаты только тех, на кого есть право: сам актор плюс
    подопечные с подтверждённым scope 'geolocation'. Пустой список —
    штатный ответ, а не ошибка: до подтверждения опекунств родитель
    видит на карте только себя.

    SEC-2026-001: показ перемещений приостановлен, а 187 исторических
    точек помечены usage_status='blocked_incident' и из выдачи исключены.
    Точки не удалены — они доказательство по инциденту, — но приложение
    ими больше не пользуется.
    """
    ag.require_geo_enabled(ag.GEO_HISTORY_FLAG)
    ag.require_permission(ctx, 'geolocation', 'read_own')

    subjects = ag.accessible_subject_ids(ctx, 'geolocation', action='read')
    if not subjects:
        return ag.json_response({'success': True, 'locations': []}, event=event)

    cur.execute(
        f"""
        SELECT DISTINCT ON (lt.user_id)
               fm.id, lt.latitude, lt.longitude, lt.accuracy, lt.created_at
        FROM {SCHEMA}.family_location_tracking lt
        JOIN {SCHEMA}.family_members fm ON fm.user_id = lt.user_id
        WHERE lt.family_id = %s
          AND fm.family_id = %s
          AND fm.id = ANY(%s::uuid[])
          AND COALESCE(fm.member_status, 'active') = 'active'
          AND lt.usage_status = 'active'
        ORDER BY lt.user_id, lt.created_at DESC
        """,
        (ctx.family_id, ctx.family_id, subjects),
    )

    locations = []
    for row in cur.fetchall():
        member_id = str(row[0])
        if member_id != ctx.member_id:
            ag.audit_allowed(ctx, 'geolocation', 'read', 'ASSIGNED_GUARDIAN',
                             resource_type='live_location',
                             resource_id=member_id, subject_member_id=member_id)
        locations.append({
            'memberId': member_id,
            'lat': float(row[1]),
            'lng': float(row[2]),
            'accuracy': float(row[3]) if row[3] else 0,
            'timestamp': (row[4].isoformat() + 'Z') if row[4] else None,
        })

    return ag.json_response({'success': True, 'locations': locations}, event=event)


def _coord(value, limit: float):
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    return v if -limit <= v <= limit else None


def check_geofence_violations(cur, family_id: str, member_id: str,
                              lat: float, lng: float) -> list:
    """
    Проверка геозон СВОЕЙ семьи.

    Раньше выборка шла без family_id: координаты участника сверялись
    с геозонами всех семей платформы, и в geofence_events писались
    события по чужим зонам — то есть чужая семья могла узнать, что
    некий участник находится рядом с их домом или школой.
    """
    cur.execute(
        f"""SELECT id, name, center_lat, center_lng, radius
            FROM {SCHEMA}.geofences WHERE family_id = %s""",
        (family_id,),
    )
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
        text = f"{title}\n{message}"
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