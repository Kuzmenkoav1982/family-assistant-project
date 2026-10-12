# ============================================================
# АВТОСГЕНЕРИРОВАННАЯ КОПИЯ — НЕ РЕДАКТИРОВАТЬ
# Источник: backend/_shared/section_access.py
# Обновление: python3 backend/_shared/sync_auth_guard.py
# ============================================================
"""
Доступ участника к разделам по галочкам на экране «Права доступа».

Галочки (family_members.permissions JSONB) только СУЖАЮТ доступ, который
даёт роль: снятая галочка закрывает раздел целиком (чтение и запись).
Отсутствующий ключ = раздел открыт. Владельца семьи и администратора
галочки не ограничивают, иначе можно закрыть доступ самому себе.
"""

import json
from typing import Any, Dict, Optional

SCHEMA = 't_p5815085_family_assistant_pro'

SECTIONS = frozenset({
    'tasks', 'calendar', 'traditions', 'meals', 'tree', 'chat', 'album',
})

DENIED_MESSAGE = 'Доступ к этому разделу закрыт администратором семьи'


def _load(cur, where_sql: str, value: str) -> Optional[Dict[str, Any]]:
    cur.execute(
        f"""SELECT fm.access_role, fm.permissions,
                   (f.owner_user_id IS NOT NULL AND f.owner_user_id = fm.user_id) AS is_owner
            FROM {SCHEMA}.family_members fm
            LEFT JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE {where_sql} = %s
              AND COALESCE(fm.member_status, 'active') = 'active'
            ORDER BY (fm.access_role = 'admin') DESC, fm.created_at ASC
            LIMIT 1""",
        (value,),
    )
    row = cur.fetchone()
    if row is None:
        return None
    if isinstance(row, dict):
        return dict(row)
    return {'access_role': row[0], 'permissions': row[1], 'is_owner': row[2]}


def _allowed(row: Optional[Dict[str, Any]], section: str) -> bool:
    if section not in SECTIONS or not row:
        return True
    if row.get('is_owner') or row.get('access_role') == 'admin':
        return True
    perms = row.get('permissions') or {}
    if isinstance(perms, str):
        try:
            perms = json.loads(perms)
        except ValueError:
            return True
    if not isinstance(perms, dict):
        return True
    return perms.get(section) is not False


def user_can_access(cur, user_id: Optional[str], section: str) -> bool:
    """Проверка по users.id (тот, кто вошёл по сессии)."""
    if not user_id:
        return True
    return _allowed(_load(cur, 'fm.user_id::text', str(user_id)), section)


def member_can_access(cur, member_id: Optional[str], section: str) -> bool:
    """Проверка по family_members.id."""
    if not member_id:
        return True
    return _allowed(_load(cur, 'fm.id::text', str(member_id)), section)


def denied_response(cors: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    if cors:
        headers.update(cors)
    return {
        'statusCode': 403,
        'headers': headers,
        'body': json.dumps({'error': DENIED_MESSAGE, 'code': 'SECTION_DISABLED'},
                           ensure_ascii=False),
        'isBase64Encoded': False,
    }
