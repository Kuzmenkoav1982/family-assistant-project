"""
Business: физическая очистка координат по истечении срока хранения
Args: event с httpMethod POST и заголовком X-Cron-Secret
Returns: JSON со счётчиком очищенных точек

Служебный обработчик без сессии: вход закрыт CRON_SECRET, как
в scheduled-reminders.

ЗАЧЕМ. До этой функции срок хранения был декларацией: в
location_retention_policy лежали цифры, location-history огрублял
координаты при чтении, но физически данные оставались в базе навсегда.
Огрубление на чтении — не удаление: полные координаты продолжали
храниться и продолжали быть тем, что утекает при следующем инциденте.

ЧТО УДАЛЯЕТСЯ. Только точки, у которых наступил purge_after — момент,
рассчитанный из срока, который пользователь выбрал сам в согласии.
Плюс точки, помеченные pending_deletion при отзыве согласия или выборе
режима «не хранить историю».

ЧТО НЕ УДАЛЯЕТСЯ НИКОГДА автоматически:
  - usage_status = 'blocked_incident' (SEC-2026-001) — это доказательство
    по инциденту, и удаляется оно отдельным решением человека;
  - любые точки при legal_hold = true в location_retention_policy.
Юридическое удержание сильнее политики хранения: иначе автоочистка
уничтожила бы материалы расследования.
"""

import json
import os
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
CORS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

# Верхняя граница за один запуск: очистка не должна держать транзакцию
# на всей таблице и упираться в таймаут функции.
BATCH_LIMIT = 5000


def _resp(status: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps(payload, ensure_ascii=False, default=str),
            'isBase64Encoded': False}


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

    # Пустой секрет в окружении не означает «пускать всех».
    if not expected or provided != expected:
        return _resp(403, {'error': 'Forbidden'})

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return _resp(500, {'error': 'DATABASE_URL not configured'})

    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    try:
        return _purge(conn)
    except Exception as exc:  # noqa: BLE001
        print(f'[location-retention] failed: {type(exc).__name__}')
        return _resp(500, {'error': 'Внутренняя ошибка'})
    finally:
        conn.close()


def _purge(conn) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""SELECT COALESCE(legal_hold, false) AS legal_hold,
                       legal_hold_reason, retention_days
                FROM {SCHEMA}.location_retention_policy WHERE id = 1"""
        )
        policy = cur.fetchone() or {}

        if policy.get('legal_hold'):
            # Останавливаемся полностью, а не «очистим остальное»:
            # решение о судьбе данных под удержанием принимает человек.
            return _resp(200, {
                'success': True, 'purged': 0, 'skipped_reason': 'legal_hold',
                'legal_hold_reason': policy.get('legal_hold_reason'),
            })

        # Страховка на случай, если purge_after не проставлен (точки,
        # записанные до введения согласий): применяем общий срок из политики.
        retention_days = int(policy.get('retention_days') or 90)
        cur.execute(
            f"""UPDATE {SCHEMA}.family_location_tracking
                   SET purge_after = created_at + INTERVAL '%s days'
                 WHERE usage_status = 'active'
                   AND purge_after IS NULL""",
            (retention_days,),
        )
        backfilled = cur.rowcount

        cur.execute(
            f"""WITH expired AS (
                    SELECT id FROM {SCHEMA}.family_location_tracking
                     WHERE usage_status IN ('active', 'pending_deletion')
                       AND purge_after IS NOT NULL
                       AND purge_after <= NOW()
                     LIMIT {BATCH_LIMIT}
                )
                UPDATE {SCHEMA}.family_location_tracking t
                   SET usage_status = 'pending_deletion'
                  FROM expired
                 WHERE t.id = expired.id
                   AND t.usage_status <> 'pending_deletion'"""
        )
        marked = cur.rowcount

        # Физическая очистка помеченных записей. Координаты обнуляются
        # в полном смысле: строка перестаёт содержать местоположение.
        cur.execute(
            f"""DELETE FROM {SCHEMA}.family_location_tracking
                 WHERE usage_status = 'pending_deletion'
                   AND purge_after IS NOT NULL
                   AND purge_after <= NOW()"""
        )
        purged = cur.rowcount

        cur.execute(
            f"""SELECT COUNT(*) AS remaining
                FROM {SCHEMA}.family_location_tracking
                WHERE usage_status = 'active'"""
        )
        remaining = (cur.fetchone() or {}).get('remaining', 0)

    return _resp(200, {
        'success': True,
        'purged': purged,
        'marked_for_deletion': marked,
        'purge_after_backfilled': backfilled,
        'active_points_remaining': remaining,
    })
