"""
Transactional outbox helper для пересборки портфолио.

В family-traditions используется autocommit=True — каждый SQL коммитится
автоматически. enqueue_portfolio_rebuild() вызывается через тот же cur
сразу после handle_sync.

trigger_fast_path() — best-effort HTTP aggregate для низкой задержки.
"""

import json
import logging
import os
import urllib.parse
import urllib.request

SCHEMA = 't_p5815085_family_assistant_pro'
PORTFOLIO_URL = os.environ.get(
    'PORTFOLIO_URL',
    'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a',
)


def _esc(value) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"


def enqueue_portfolio_rebuild(
    cur,
    member_ids: list,
    requested_by_user_id,
    reason: str,
    priority: int = 100,
    payload: dict = None,
) -> None:
    """Upsert needs_refresh + queue row через текущий cursor.

    В autocommit=True каждый запрос коммитится немедленно.
    Дедупликация по member_id: несколько вызовов coalesce в одну строку.
    """
    seen: set = set()
    payload_json = json.dumps(payload or {}, ensure_ascii=False)
    reasons_json = json.dumps([reason], ensure_ascii=False)
    uid_sql = f"{_esc(requested_by_user_id)}::uuid" if requested_by_user_id else 'NULL'

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
                    needs_refresh    = TRUE,
                    marked_dirty_at  = CURRENT_TIMESTAMP,
                    updated_at       = member_portfolios.updated_at
            """)

            cur.execute(f"""
                INSERT INTO {SCHEMA}.portfolio_rebuild_queue
                    (member_id, requested_by_user_id, reasons, priority, payload)
                VALUES (
                    {_esc(member_id)}::uuid,
                    {uid_sql},
                    {_esc(reasons_json)}::jsonb,
                    {priority},
                    {_esc(payload_json)}::jsonb
                )
                ON CONFLICT (member_id) DO UPDATE SET
                    requested_by_user_id = COALESCE(
                        EXCLUDED.requested_by_user_id,
                        portfolio_rebuild_queue.requested_by_user_id
                    ),
                    reasons = (
                        SELECT to_jsonb(array(
                            SELECT DISTINCT value
                            FROM jsonb_array_elements_text(
                                portfolio_rebuild_queue.reasons || EXCLUDED.reasons
                            ) AS t(value)
                            ORDER BY 1
                        ))
                    ),
                    priority        = LEAST(portfolio_rebuild_queue.priority, EXCLUDED.priority),
                    next_attempt_at = LEAST(portfolio_rebuild_queue.next_attempt_at, now()),
                    payload         = EXCLUDED.payload,
                    locked_at       = NULL,
                    locked_by       = NULL,
                    updated_at      = now()
            """)

        except Exception as exc:
            logging.warning(
                '[portfolio_enqueue] failed: member=%s reason=%s error=%s',
                member_id, reason, exc,
            )


def trigger_fast_path(
    member_ids: list,
    user_id: str,
    reason: str,
    timeout_seconds: float = 5.0,
    force_fail: bool = False,
) -> list:
    """Best-effort direct aggregate после enqueue."""
    if not user_id:
        return []
    if force_fail:
        logging.warning(
            '[portfolio_enqueue] fast-path FAILPOINT skipped: reason=%s members=%s',
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
            url=url, method='POST',
            headers={'X-User-Id': str(user_id), 'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
                ok = 200 <= resp.status < 300
                results.append({'member_id': member_id, 'ok': ok, 'status': resp.status})
        except Exception as exc:
            logging.warning(
                '[portfolio_enqueue] fast-path failed: member=%s reason=%s error=%s',
                member_id, reason, exc,
            )
            results.append({'member_id': member_id, 'ok': False, 'error': str(exc)})

    ok_count = sum(1 for r in results if r.get('ok'))
    logging.info(
        '[portfolio_enqueue] fast-path done: reason=%s ok=%d/%d',
        reason, ok_count, len(seen),
    )
    return results
