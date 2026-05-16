"""
Business: Portfolio Rebuild Worker — фоновая обработка portfolio_rebuild_queue.

Забирает pending-задачи из очереди через FOR UPDATE SKIP LOCKED,
вызывает portfolio?action=aggregate по X-Internal-Token,
при ошибке делает exponential backoff retry.
При attempts >= MAX_ATTEMPTS — переносит в dead-letter (portfolio_rebuild_dead_letter).

Actions (query param action=):
  run        — обработать до limit задач (default: 10)
  run_once   — обработать ровно 1 задачу
  health     — статус очереди без обработки

Auth:
  X-Cron-Secret или X-Internal-Token
"""

import json
import math
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List

import psycopg2
import psycopg2.extras
import urllib.parse
import urllib.request

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

PORTFOLIO_URL = os.environ.get(
    'PORTFOLIO_URL',
    'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a',
)
PORTFOLIO_INTERNAL_TOKEN = os.environ.get('PORTFOLIO_INTERNAL_TOKEN', '')
CRON_SECRET = os.environ.get('CRON_SECRET', '')

STUCK_LOCK_MINUTES = 10
MAX_BACKOFF_SECONDS = 3600
MAX_ATTEMPTS = 10  # после этого → dead-letter


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Secret, X-Internal-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(body: Any, status: int = 200) -> Dict:
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps(body, ensure_ascii=False, default=str)}


def err(status: int, msg: str) -> Dict:
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps({'error': msg})}


def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def esc(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"


def backoff_seconds(attempts: int) -> int:
    base = min(MAX_BACKOFF_SECONDS, 2 ** min(attempts, int(math.log2(MAX_BACKOFF_SECONDS))))
    jitter = int(base * 0.1)
    return base + (hash(str(attempts)) % (2 * jitter + 1) - jitter)


def claim_jobs(cur, limit: int, worker_id: str) -> List[Dict]:
    cur.execute(f"""
        WITH picked AS (
            SELECT member_id
            FROM {SCHEMA}.portfolio_rebuild_queue
            WHERE next_attempt_at <= now()
              AND (
                locked_at IS NULL
                OR locked_at < now() - INTERVAL '{STUCK_LOCK_MINUTES} minutes'
              )
            ORDER BY priority ASC, next_attempt_at ASC, updated_at ASC
            LIMIT {limit}
            FOR UPDATE SKIP LOCKED
        )
        UPDATE {SCHEMA}.portfolio_rebuild_queue q
        SET
            locked_at  = now(),
            locked_by  = {esc(worker_id)},
            attempts   = q.attempts + 1,
            updated_at = now()
        FROM picked
        WHERE q.member_id = picked.member_id
        RETURNING
            q.member_id, q.requested_by_user_id, q.reasons,
            q.priority, q.attempts, q.last_error, q.payload
    """)
    return [dict(r) for r in cur.fetchall()]


def move_to_dead_letter(cur, job: Dict) -> None:
    """Перемещает poison-job в DLQ."""
    member_id = str(job['member_id'])
    cur.execute(f"""
        INSERT INTO {SCHEMA}.portfolio_rebuild_dead_letter
            (member_id, reasons, attempts, last_error, payload)
        VALUES (
            {esc(member_id)}::uuid,
            {esc(job.get('reasons', []))},
            {job.get('attempts', 0)},
            {esc(str(job.get('last_error', ''))[:500])},
            {esc(job.get('payload', {}))}
        )
    """)
    # Убираем из активной очереди через UPDATE locked (чтобы worker больше не брал)
    cur.execute(f"""
        UPDATE {SCHEMA}.portfolio_rebuild_queue
        SET
            locked_at  = now() + INTERVAL '100 years',
            locked_by  = 'dead-letter',
            updated_at = now()
        WHERE member_id = {esc(member_id)}::uuid
    """)


def mark_success(cur, member_id: str) -> None:
    """Помечаем needs_refresh=false + убираем lock."""
    cur.execute(f"""
        UPDATE {SCHEMA}.member_portfolios
        SET needs_refresh = FALSE, marked_dirty_at = NULL, updated_at = now()
        WHERE member_id = {esc(member_id)}::uuid
    """)
    cur.execute(f"""
        UPDATE {SCHEMA}.portfolio_rebuild_queue
        SET
            locked_at  = now() + INTERVAL '100 years',
            locked_by  = 'completed',
            updated_at = now()
        WHERE member_id = {esc(member_id)}::uuid
    """)


def mark_failed(cur, member_id: str, error_msg: str, attempts: int) -> None:
    delay = backoff_seconds(attempts)
    next_at = (datetime.now(timezone.utc) + timedelta(seconds=delay)).isoformat()
    cur.execute(f"""
        UPDATE {SCHEMA}.portfolio_rebuild_queue
        SET
            last_error      = {esc(error_msg[:500])},
            locked_at       = NULL,
            locked_by       = NULL,
            next_attempt_at = {esc(next_at)}::timestamptz,
            updated_at      = now()
        WHERE member_id = {esc(member_id)}::uuid
    """)


def call_aggregate(member_id: str, timeout: float = 15.0) -> Dict[str, Any]:
    if not PORTFOLIO_INTERNAL_TOKEN:
        raise RuntimeError('PORTFOLIO_INTERNAL_TOKEN not configured')
    url = f"{PORTFOLIO_URL}?action=aggregate&member_id={urllib.parse.quote(member_id)}"
    req = urllib.request.Request(
        url=url, method='POST',
        headers={'X-Internal-Token': PORTFOLIO_INTERNAL_TOKEN,
                 'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode('utf-8', errors='replace')
        if resp.status >= 400:
            raise RuntimeError(f'aggregate HTTP {resp.status}: {raw[:200]}')
        return json.loads(raw) if raw else {}


def queue_health(cur) -> Dict[str, Any]:
    cur.execute(f"""
        SELECT
            COUNT(*)                                                              AS total,
            COUNT(*) FILTER (WHERE locked_at IS NOT NULL
                AND locked_at >= now() - INTERVAL '{STUCK_LOCK_MINUTES} minutes'
                AND locked_by NOT IN ('completed', 'dead-letter'))                AS locked,
            COUNT(*) FILTER (WHERE locked_at IS NOT NULL
                AND locked_at < now() - INTERVAL '{STUCK_LOCK_MINUTES} minutes'
                AND locked_by NOT IN ('completed', 'dead-letter'))                AS stuck,
            COUNT(*) FILTER (WHERE next_attempt_at > now()
                AND (locked_at IS NULL OR locked_at < now() - INTERVAL '{STUCK_LOCK_MINUTES} minutes'))
                                                                                  AS delayed,
            COUNT(*) FILTER (WHERE next_attempt_at <= now()
                AND (locked_at IS NULL OR locked_at < now() - INTERVAL '{STUCK_LOCK_MINUTES} minutes'))
                                                                                  AS ready,
            MAX(attempts) AS max_attempts,
            MAX(next_attempt_at) AS furthest_retry
        FROM {SCHEMA}.portfolio_rebuild_queue
        WHERE locked_by NOT IN ('completed', 'dead-letter') OR locked_by IS NULL
    """)
    row = cur.fetchone()
    dlq_cur = cur
    dlq_cur.execute(f"SELECT COUNT(*) AS dlq_total FROM {SCHEMA}.portfolio_rebuild_dead_letter")
    dlq_row = dlq_cur.fetchone()
    result = dict(row) if row else {}
    result['dlq_total'] = dlq_row['dlq_total'] if dlq_row else 0
    return result


def run_worker(limit: int) -> Dict[str, Any]:
    worker_id = str(uuid.uuid4())[:8]
    conn = get_conn()
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    results = []

    try:
        jobs = claim_jobs(cur, limit, worker_id)
        if not jobs:
            return {'processed': 0, 'worker_id': worker_id, 'results': []}

        for job in jobs:
            member_id = str(job['member_id'])
            attempts = int(job.get('attempts', 1))
            result = {'member_id': member_id, 'attempts': attempts}

            # Poison-job → dead-letter
            if attempts >= MAX_ATTEMPTS:
                try:
                    move_to_dead_letter(cur, job)
                except Exception as exc:
                    result['dlq_error'] = str(exc)
                result['ok'] = False
                result['action'] = 'moved_to_dead_letter'
                results.append(result)
                continue

            try:
                call_aggregate(member_id)
                mark_success(cur, member_id)
                result['ok'] = True
                result['action'] = 'aggregated'
            except Exception as exc:
                error_msg = str(exc)[:500]
                mark_failed(cur, member_id, error_msg, attempts)
                result['ok'] = False
                result['error'] = error_msg
                result['next_retry_seconds'] = backoff_seconds(attempts)

            results.append(result)

    finally:
        cur.close()
        conn.close()

    ok_count = sum(1 for r in results if r.get('ok'))
    dlq_count = sum(1 for r in results if r.get('action') == 'moved_to_dead_letter')
    return {
        'processed': len(results),
        'ok': ok_count,
        'failed': len(results) - ok_count - dlq_count,
        'dead_lettered': dlq_count,
        'worker_id': worker_id,
        'results': results,
    }


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Portfolio Rebuild Worker."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers_lower = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    cron_token = headers_lower.get('x-cron-secret', '')
    internal_token = headers_lower.get('x-internal-token', '')

    authed = False
    if CRON_SECRET and cron_token == CRON_SECRET:
        authed = True
    if PORTFOLIO_INTERNAL_TOKEN and internal_token == PORTFOLIO_INTERNAL_TOKEN:
        authed = True

    if not authed:
        return err(403, 'forbidden: X-Cron-Secret or X-Internal-Token required')

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'run')
    limit = min(int(params.get('limit', '10')), 50)

    try:
        if action in ('run', 'run_once'):
            actual_limit = 1 if action == 'run_once' else limit
            result = run_worker(actual_limit)
            return ok(result)

        if action == 'health':
            conn = get_conn()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                health = queue_health(cur)
                return ok({'queue': health, 'worker': 'portfolio-worker',
                           'max_attempts': MAX_ATTEMPTS})
            finally:
                cur.close()
                conn.close()

        return err(400, f'Unknown action: {action}. Use: run | run_once | health')

    except Exception as exc:
        return err(500, str(exc))
