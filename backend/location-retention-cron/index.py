"""
Business: физическая очистка координат по истечении срока хранения
Args: event с httpMethod GET/POST; POST требует X-Cron-Secret
Returns: POST — JSON со счётчиком очищенных точек; GET — статус мониторинга

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

ИДЕМПОТЕНТНОСТЬ. Повторный вызов безопасен: WHERE-условия отбирают
только записи, ещё не находящиеся в целевом состоянии (usage_status <>
'pending_deletion', затем DELETE только уже помеченных и просроченных).
Повторный запуск в тот же момент не изменит результат второй раз.

МОНИТОРИНГ. Каждый запуск (успешный, пропущенный из-за legal_hold или
упавший с ошибкой) пишется в location_retention_runs ДО завершения
(started) и обновляется по факту (finished_at, status). GET без секрета
отдаёт последний запуск и признак просрочки — это то, что дёргает
внешний монитор (health-check), не имея самого CRON_SECRET.
"""

import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
CORS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

# Верхняя граница за один запуск: очистка не должна держать транзакцию
# на всей таблице и упираться в таймаут функции.
BATCH_LIMIT = 5000

# Ожидаемая периодичность запуска cron-триггера. Если последний УСПЕШНЫЙ
# запуск старше этого порога — считаем расписание пропущенным. Берём с
# запасом (сутки), чтобы не поднимать ложную тревогу на разовую задержку
# внешнего триггера при периодичности запуска чаще раза в день.
EXPECTED_INTERVAL = timedelta(hours=26)


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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Secret',
            },
            'body': '', 'isBase64Encoded': False,
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return _resp(500, {'error': 'DATABASE_URL not configured'})

    # GET — публичный статус мониторинга: без него внешний health-check
    # не сможет спросить "давно ли был последний успешный запуск", не
    # зная CRON_SECRET. Отдаёт только счётчики и даты, не сами данные.
    if method == 'GET':
        conn = psycopg2.connect(dsn)
        conn.autocommit = True
        try:
            return _health(conn)
        finally:
            conn.close()

    if method != 'POST':
        return _resp(405, {'error': 'Method not allowed'})

    headers = {str(k).lower(): v for k, v in (event.get('headers') or {}).items()}
    params = event.get('queryStringParameters') or {}
    expected = os.environ.get('CRON_SECRET', '')
    provided = headers.get('x-cron-secret') or params.get('secret') or ''

    # Пустой секрет в окружении не означает «пускать всех».
    if not expected or provided != expected:
        return _resp(403, {'error': 'Forbidden'})

    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    run_id = _start_run(conn)
    try:
        result = _purge(conn)
        _finish_run(conn, run_id, 'skipped' if result.get('skipped_reason') else 'success', result)
        return _resp(200, result)
    except Exception as exc:  # noqa: BLE001
        print(f'[location-retention] failed: {type(exc).__name__}: {exc}')
        _finish_run(conn, run_id, 'failed', {}, error=str(exc))
        return _resp(500, {'error': 'Внутренняя ошибка', 'run_id': run_id})
    finally:
        conn.close()


def _start_run(conn) -> Optional[int]:
    """
    Пишем факт НАЧАЛА запуска до какой-либо очистки. Если функция упадёт
    или будет прервана таймаутом платформы, запись 'running' без
    finished_at сама по себе сигнал: последний запуск не завершился.
    """
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.location_retention_runs (status)
                    VALUES ('running') RETURNING id"""
            )
            return cur.fetchone()[0]
    except Exception as exc:  # noqa: BLE001
        print(f'[location-retention] could not log run start: {type(exc).__name__}')
        return None


def _finish_run(conn, run_id: Optional[int], status: str,
                result: Dict[str, Any], error: Optional[str] = None) -> None:
    if run_id is None:
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""UPDATE {SCHEMA}.location_retention_runs
                       SET finished_at = NOW(), status = %s,
                           purged = %s, marked_for_deletion = %s,
                           purge_after_backfilled = %s,
                           active_points_remaining = %s,
                           skipped_reason = %s, error_message = %s
                     WHERE id = %s""",
                (status, result.get('purged'), result.get('marked_for_deletion'),
                 result.get('purge_after_backfilled'), result.get('active_points_remaining'),
                 result.get('skipped_reason'), error, run_id),
            )
    except Exception as exc:  # noqa: BLE001
        print(f'[location-retention] could not log run finish: {type(exc).__name__}')


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
            return {
                'success': True, 'purged': 0, 'skipped_reason': 'legal_hold',
                'legal_hold_reason': policy.get('legal_hold_reason'),
            }

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

    return {
        'success': True,
        'purged': purged,
        'marked_for_deletion': marked,
        'purge_after_backfilled': backfilled,
        'active_points_remaining': remaining,
    }


def _health(conn) -> Dict[str, Any]:
    """
    Публичный статус для внешнего мониторинга: не требует CRON_SECRET
    (сам по себе не выполняет очистку и не раскрывает данные о людях),
    но отвечает на главный вопрос — "не пропущен ли плановый запуск".
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""SELECT id, started_at, finished_at, status, purged,
                       marked_for_deletion, skipped_reason, error_message
                  FROM {SCHEMA}.location_retention_runs
              ORDER BY started_at DESC LIMIT 1"""
        )
        last_run = cur.fetchone()

        cur.execute(
            f"""SELECT id, started_at, finished_at, status
                  FROM {SCHEMA}.location_retention_runs
                 WHERE status IN ('success', 'skipped')
              ORDER BY started_at DESC LIMIT 1"""
        )
        last_completed = cur.fetchone()

        cur.execute(
            f"""SELECT is_enabled FROM {SCHEMA}.feature_flags
                 WHERE flag_key = 'location_retention_cron_configured'"""
        )
        row = cur.fetchone()
        configured = bool(row['is_enabled']) if row else False

    overdue = False
    if configured:
        if not last_completed:
            overdue = True
        else:
            age = datetime.now(timezone.utc).replace(tzinfo=None) - last_completed['finished_at']
            overdue = age > EXPECTED_INTERVAL

    return _resp(200, {
        'success': True,
        'cron_configured': configured,
        'overdue': overdue,
        'last_run': dict(last_run) if last_run else None,
        'last_completed_run': dict(last_completed) if last_completed else None,
        'expected_interval_hours': EXPECTED_INTERVAL.total_seconds() / 3600,
    })