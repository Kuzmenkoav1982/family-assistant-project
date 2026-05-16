"""
Best-effort trigger для portfolio/aggregate после сохранения данных источника.

Вызывается ПОСЛЕ commit, чтобы aggregate видел актуальные данные.
Ошибки aggregate не валят основной save — только логируются.

Использование:
    from _portfolio_refresh import trigger_portfolio_aggregate
    trigger_portfolio_aggregate([member_id], user_id, reason="dream_save")
"""

import json
import logging
import os
import urllib.parse
import urllib.request
from typing import Any

PORTFOLIO_URL = os.environ.get(
    'PORTFOLIO_URL',
    'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a',
)


def trigger_portfolio_aggregate(
    member_ids: list,
    user_id: str,
    reason: str,
    timeout_seconds: float = 5.0,
) -> list:
    """
    Вызывает portfolio?action=aggregate для каждого из member_ids.
    Дедуплицирует список. Ошибки не пробрасывает — только логирует.

    Args:
        member_ids: список member_id (str UUID)
        user_id: X-User-Id (users.id) для auth в portfolio API
        reason: строка-причина для логов (например "grade_save")
        timeout_seconds: таймаут на один HTTP-запрос

    Returns:
        список результатов [{member_id, ok, status?, error?}]
    """
    if not user_id:
        logging.warning('[portfolio_refresh] skipped: no user_id, reason=%s', reason)
        return []

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
                try:
                    parsed = json.loads(raw) if raw else None
                except Exception:
                    parsed = raw
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
