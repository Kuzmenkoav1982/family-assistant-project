"""
Business: возвращает актуальную identity и capabilities текущего пользователя из серверной сессии
Args: event с httpMethod GET, headers X-Auth-Token
Returns: JSON {user_id, family_id, member_id, role, is_owner, capabilities, policy_version}

Единственный источник прав для UI. Фронт НЕ хранит ролевую матрицу:
он получает capabilities отсюда и использует их только для отображения —
показать/скрыть кнопку, заблокировать действие, объяснить ограничение.
Каждый API-запрос всё равно повторно проверяется на backend.
"""

from typing import Any, Dict

from auth_guard import (
    AuthError,
    POLICY_VERSION,
    error_response,
    json_response,
    preflight,
    require_session,
)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return preflight(event)

    if method != 'GET':
        return json_response({'success': False, 'error': 'Method not allowed'}, 405, event)

    try:
        ctx = require_session(event)
    except AuthError as exc:
        return error_response(exc, event)

    payload = ctx.to_dict()
    payload['success'] = True
    payload['policy_version'] = POLICY_VERSION
    # subjects: чьи чувствительные данные актор вправе видеть — для UI-фильтров.
    from auth_guard import accessible_subject_ids
    payload['accessible_health_subjects'] = accessible_subject_ids(ctx, 'health')

    return json_response(payload, 200, event)
