"""
Best-effort trigger для portfolio/aggregate после сохранения данных источника.

Алгоритм:
  1. mark_dirty_in_db() — UPSERT needs_refresh=true в member_portfolios (durable).
     Даже если HTTP aggregate упадёт — get увидит stale=true.
  2. trigger_portfolio_aggregate() — HTTP POST к portfolio/aggregate.
     Если успешен — aggregate сам сбросит needs_refresh=false.

Ошибки не пробрасываются — только логируются.

Использование:
    from _portfolio_refresh import trigger_portfolio_aggregate
    trigger_portfolio_aggregate([member_id], user_id, reason="dream_save", cur=cur)
"""

import json
import logging
import os
import urllib.parse
import urllib.request

PORTFOLIO_URL = os.environ.get(
    'PORTFOLIO_URL',
    'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a',
)

SCHEMA = 't_p5815085_family_assistant_pro'


def _esc(value) -> str:
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def mark_dirty_in_db(member_ids: list, cur) -> None:
    """UPSERT needs_refresh=true для каждого member_id.
    Вызывается ДО HTTP trigger — гарантирует durable dirty state.
    """
    seen: set = set()
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
            logging.warning('[portfolio_refresh] mark_dirty failed: member=%s error=%s', member_id, exc)


def trigger_portfolio_aggregate(
    member_ids: list,
    user_id: str,
    reason: str,
    timeout_seconds: float = 5.0,
    cur=None,
) -> list:
    """
    1. Выставляет needs_refresh=true в БД (если передан cur).
    2. Вызывает portfolio?action=aggregate по HTTP (best-effort).

    Args:
        member_ids: список member_id (str UUID)
        user_id: X-User-Id (users.id) для auth в portfolio API
        reason: строка-причина для логов (например "grade_save")
        timeout_seconds: таймаут на один HTTP-запрос
        cur: psycopg2 cursor (необязателен; если передан — ставит dirty flag)

    Returns:
        список результатов [{member_id, ok, status?, error?}]
    """
    if not user_id:
        logging.warning('[portfolio_refresh] skipped: no user_id, reason=%s', reason)
        return []

    # Шаг 1: durable dirty flag — до HTTP-вызова
    if cur is not None:
        mark_dirty_in_db(member_ids, cur)

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
