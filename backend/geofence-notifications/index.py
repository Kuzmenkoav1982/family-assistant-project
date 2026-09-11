"""
Business: cron-рассылка уведомлений о выходе участника из геозоны
Args: event с httpMethod POST и заголовком X-Cron-Secret
Returns: JSON со счётчиком обработанных событий

Это служебный обработчик, а не пользовательский API: он вызывается
планировщиком и не имеет сессии. Поэтому вход закрыт общим для проекта
механизмом CRON_SECRET (как в scheduled-reminders), а не «отсутствием
проверок».

Было (инцидент SEC-2026-001):
  - POST без какой-либо авторизации: любой мог запустить рассылку
    и тем самым выяснить, происходят ли сейчас выходы из зон;
  - рассылка шла ПО ВСЕЙ ПЛАТФОРМЕ: подписки выбирались запросом
    `WHERE u.id::text != member_id AND active = TRUE` без family_id —
    то есть о выходе ребёнка из школы уведомлялись чужие семьи;
  - запросы шли к таблицам без префикса схемы и к несуществующим
    колонкам (ps.p256dh, ps.auth, ps.active), поэтому функция
    гарантированно падала в 500 — рассылка не работала вообще;
  - названия геозон («Школа», «Дом») попадали в текст уведомления
    чужим людям.

Стало: секрет обязателен, адресаты ограничены семьёй участника
и его настройками geofence_alert_settings.notify_members.
"""

import json
import os
from typing import Any, Dict, List

import psycopg2
from psycopg2.extras import RealDictCursor

try:
    from pywebpush import webpush, WebPushException
except ImportError:  # pragma: no cover — окружение без pywebpush
    webpush = None

    class WebPushException(Exception):
        pass

SCHEMA = 't_p5815085_family_assistant_pro'
CORS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

# Событие старше этого срока не рассылаем: уведомление «ребёнок ушёл
# из школы» через час после факта бесполезно, а старые события при сбое
# планировщика дали бы залповую рассылку.
MAX_EVENT_AGE_MINUTES = 15


def _resp(status: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps(payload), 'isBase64Encoded': False}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Secret',
            },
            'body': '', 'isBase64Encoded': False,
        }

    if method != 'POST':
        return _resp(405, {'error': 'Method not allowed'})

    headers = {str(k).lower(): v for k, v in (event.get('headers') or {}).items()}
    params = event.get('queryStringParameters') or {}
    expected = os.environ.get('CRON_SECRET', '')
    provided = headers.get('x-cron-secret') or params.get('secret') or ''

    # Пустой секрет в окружении не должен означать «пускать всех».
    if not expected or provided != expected:
        return _resp(403, {'error': 'Forbidden'})

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return _resp(500, {'error': 'DATABASE_URL not configured'})

    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    try:
        return _process(conn)
    except Exception as exc:  # noqa: BLE001
        print(f'[geofence-notifications] failed: {type(exc).__name__}')
        return _resp(500, {'error': 'Внутренняя ошибка'})
    finally:
        conn.close()


def _process(conn) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Событие + семья участника берутся одним запросом: рассылка
        # никогда не должна выходить за пределы family_id субъекта.
        cur.execute(
            f"""
            SELECT ge.id, ge.member_id, ge.geofence_id, ge.timestamp,
                   g.name        AS zone_name,
                   fm.family_id  AS family_id,
                   fm.name       AS member_name
            FROM {SCHEMA}.geofence_events ge
            JOIN {SCHEMA}.geofences g      ON g.id = ge.geofence_id
            JOIN {SCHEMA}.family_members fm
                 ON fm.id::text = ge.member_id
                AND COALESCE(fm.member_status, 'active') = 'active'
            WHERE ge.event_type = 'exit'
              AND COALESCE(ge.notified, FALSE) = FALSE
              AND ge.timestamp > NOW() - INTERVAL '%s minutes'
              AND g.family_id = fm.family_id
            ORDER BY ge.timestamp DESC
            LIMIT 100
            """ % MAX_EVENT_AGE_MINUTES
        )
        exit_events = cur.fetchall()

        if not exit_events:
            return _resp(200, {'message': 'No new exit events', 'sent': 0})

        vapid_key = os.environ.get('VAPID_PRIVATE_KEY')
        sent = 0
        processed = 0

        for ev in exit_events:
            recipients = _recipients(cur, str(ev['family_id']), str(ev['member_id']))
            if recipients is None:
                # Оповещения отключены самим участником — событие
                # помечаем обработанным, но никому не пишем.
                _mark_notified(cur, ev['id'])
                processed += 1
                continue

            title = f"⚠️ {ev['member_name'] or 'Член семьи'} вышел из зоны"
            body = f"Покинул зону «{ev['zone_name']}»"

            for sub_data in recipients:
                if not webpush or not vapid_key:
                    continue
                try:
                    webpush(
                        subscription_info=sub_data,
                        data=json.dumps({'title': f'{title} — Наша Семья',
                                         'body': body, 'url': '/family-tracker'}),
                        vapid_private_key=vapid_key,
                        vapid_claims={'sub': 'mailto:support@nasha-semiya.ru'},
                    )
                    sent += 1
                except WebPushException as exc:
                    response = getattr(exc, 'response', None)
                    if response is not None and response.status_code == 410:
                        _drop_subscription(cur, sub_data.get('endpoint'))

            _mark_notified(cur, ev['id'])
            processed += 1

        return _resp(200, {'success': True, 'events_processed': processed,
                           'notifications_sent': sent})


def _recipients(cur, family_id: str, member_id: str):
    """
    Подписки тех, кому этот участник разрешил получать оповещения.

    Возвращает None, если оповещения по участнику отключены.
    Круг адресатов: только его семья, и только перечисленные в
    notify_members (если список задан). Сам участник исключается.
    """
    cur.execute(
        f"""SELECT alerts_enabled, notify_members
            FROM {SCHEMA}.geofence_alert_settings
            WHERE family_id = %s AND member_id = %s""",
        (family_id, member_id),
    )
    settings = cur.fetchone()
    if settings and not settings['alerts_enabled']:
        return None

    allowed: List[str] = []
    if settings and settings.get('notify_members'):
        allowed = [str(m) for m in settings['notify_members']]

    sql = f"""
        SELECT ps.subscription_data, fm.id AS member_id
        FROM {SCHEMA}.push_subscriptions ps
        JOIN {SCHEMA}.family_members fm
             ON fm.user_id = ps.user_id
            AND fm.family_id::text = ps.family_id
        WHERE fm.family_id = %s
          AND fm.id::text <> %s
          AND COALESCE(fm.member_status, 'active') = 'active'
    """
    args: List[Any] = [family_id, member_id]
    if allowed:
        sql += ' AND fm.id = ANY(%s::uuid[])'
        args.append(allowed)

    cur.execute(sql, tuple(args))

    result = []
    for row in cur.fetchall():
        data = row['subscription_data']
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except ValueError:
                continue
        if isinstance(data, dict) and data.get('endpoint') and data.get('keys'):
            result.append(data)
    return result


def _mark_notified(cur, event_id: int) -> None:
    cur.execute(
        f'UPDATE {SCHEMA}.geofence_events SET notified = TRUE WHERE id = %s',
        (event_id,),
    )


def _drop_subscription(cur, endpoint: str) -> None:
    if not endpoint:
        return
    cur.execute(
        f"""DELETE FROM {SCHEMA}.push_subscriptions
            WHERE subscription_data->>'endpoint' = %s""",
        (endpoint,),
    )
