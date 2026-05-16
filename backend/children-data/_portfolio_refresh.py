"""
Best-effort trigger для portfolio/aggregate после сохранения данных источника.

Алгоритм (порядок операций):
  1. source-data COMMIT (происходит в вызывающем коде до вызова этого helper-а)
  2. mark_dirty_in_db() — отдельное соединение + autocommit=True.
     UPSERT needs_refresh=true немедленно коммитится.
     Это durable dirty state: даже если HTTP aggregate упадёт — get увидит stale=true.
  3. HTTP POST portfolio?action=aggregate (best-effort).
     Если aggregate успешен — он сам сбросит needs_refresh=false.

Важно: mark_dirty использует отдельное соединение (не cursor из основной транзакции),
чтобы dirty flag гарантированно был записан вне зависимости от commit/rollback основной транзакции.

Ошибки не пробрасываются — только логируются.

Использование:
    from _portfolio_refresh import trigger_portfolio_aggregate
    # Вызывать ПОСЛЕ conn.commit() в основном коде
    trigger_portfolio_aggregate([member_id], user_id, reason="dream_save")
"""

import json
import logging
import os
import urllib.parse
import urllib.request

import psycopg2

PORTFOLIO_URL = os.environ.get(
    'PORTFOLIO_URL',
    'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a',
)

SCHEMA = 't_p5815085_family_assistant_pro'
DATABASE_URL = os.environ.get('DATABASE_URL')


def _esc(value) -> str:
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def mark_dirty_in_db(member_ids: list) -> None:
    """UPSERT needs_refresh=true для каждого member_id через отдельное соединение.

    Использует autocommit=True — dirty flag коммитится немедленно,
    независимо от состояния основной транзакции в вызывающем коде.
    Вызывается ДО HTTP trigger.
    """
    if not member_ids or not DATABASE_URL:
        return
    seen: set = set()
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()
        try:
            for member_id in member_ids:
                if not member_id or member_id in seen:
                    continue
                seen.add(member_id)
                try:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.member_portfolios
                            (member_id, family_id, age_group, current_scores, confidence_scores,
                             strengths, growth_zones, next_actions, completeness,
                             needs_refresh, marked_dirty_at)
                        VALUES (
                            {_esc(member_id)}::uuid,
                            '00000000-0000-0000-0000-000000000000'::uuid,
                            'unknown', '{{}}'::jsonb, '{{}}'::jsonb,
                            '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 0,
                            TRUE, CURRENT_TIMESTAMP
                        )
                        ON CONFLICT (member_id) DO UPDATE SET
                            needs_refresh = TRUE,
                            marked_dirty_at = CURRENT_TIMESTAMP
                    """)
                except Exception as exc:
                    logging.warning(
                        '[portfolio_refresh] mark_dirty failed: member=%s error=%s',
                        member_id, exc,
                    )
        finally:
            cur.close()
            conn.close()
    except Exception as exc:
        logging.warning('[portfolio_refresh] mark_dirty connection failed: error=%s', exc)


def trigger_portfolio_aggregate(
    member_ids: list,
    user_id: str,
    reason: str,
    timeout_seconds: float = 5.0,
    force_fail: bool = False,
    cur=None,  # сохранён для совместимости подписи, больше не используется для dirty
) -> list:
    """
    1. Ставит needs_refresh=true через отдельное соединение (durable dirty flag).
    2. Вызывает portfolio?action=aggregate по HTTP (best-effort).

    Args:
        member_ids: список member_id (str UUID)
        user_id: X-User-Id (users.id) для auth в portfolio API
        reason: строка-причина для логов (например "dream_save")
        timeout_seconds: таймаут на один HTTP-запрос
        force_fail: failpoint — пропустить HTTP-вызов (для тестирования dirty/stale)
        cur: устарел, игнорируется (dirty flag теперь через отдельное соединение)

    Returns:
        список результатов [{member_id, ok, status?, error?}]
    """
    if not user_id:
        logging.warning('[portfolio_refresh] skipped: no user_id, reason=%s', reason)
        return []

    # Шаг 1: durable dirty flag (autocommit=True, независимое соединение)
    mark_dirty_in_db(member_ids)

    # Failpoint: dirty выставлен, HTTP aggregate пропускаем
    if force_fail:
        logging.warning(
            '[portfolio_refresh] FAILPOINT: HTTP aggregate skipped: reason=%s members=%s',
            reason, member_ids,
        )
        return [{'member_id': m, 'ok': False, 'error': 'failpoint'} for m in member_ids if m]

    results = []
    seen: set = set()

    for member_id in member_ids:
        if not member_id or member_id in seen:
            continue
        seen.add(member_id)

        url = (
            f"{PORTFOLIO_URL}"
            f"?action=aggregate&member_id={urllib.parse.quote(str(member_id))}"
        )
        req = urllib.request.Request(
            url=url,
            method='POST',
            headers={
                'X-User-Id': str(user_id),
                'Content-Type': 'application/json',
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
                raw = resp.read().decode('utf-8', errors='replace')
                ok = 200 <= resp.status < 300
                if not ok:
                    logging.warning(
                        '[portfolio_refresh] aggregate non-2xx: member=%s status=%s reason=%s',
                        member_id, resp.status, reason,
                    )
                results.append({'member_id': member_id, 'ok': ok, 'status': resp.status})
        except Exception as exc:
            logging.warning(
                '[portfolio_refresh] aggregate failed: member=%s reason=%s error=%s',
                member_id, reason, exc,
            )
            results.append({'member_id': member_id, 'ok': False, 'error': str(exc)})

    ok_count = sum(1 for r in results if r.get('ok'))
    fail_count = len(results) - ok_count
    logging.info(
        '[portfolio_refresh] done: reason=%s member_count=%d ok=%d fail=%d',
        reason, len(seen), ok_count, fail_count,
    )
    return results
