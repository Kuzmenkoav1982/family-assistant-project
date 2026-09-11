"""
Business: список участников семьи для карты маячка
Args: event с httpMethod GET
Returns: JSON со списком участников, чьи координаты актор вправе видеть

Авторизация: backend/_shared/auth_guard.py.

Было: сессия разбиралась вручную, семья определялась `WHERE user_id = %s
LIMIT 1` без учёта member_status, и список отдавал ВСЕХ участников семьи.
На карте маячка это значит «вот все, кого можно отслеживать» — обещание,
которого backend после закрытия SEC-2026-001 не выполняет.

Дубликаты отфильтровывались по `name NOT LIKE '%ДУБЛИКАТ%'` — фильтрация
персональных данных по содержимому строки имени. Теперь состояние записи
хранится в member_status, и фильтр опирается на него.

Стало: список = accessible_subject_ids('geolocation'), то есть ровно те,
для кого location-history и family-tracker реально отдадут координаты.
"""

import json
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B',
          '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16']


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    if method != 'GET':
        return ag.json_response({'error': 'Method not allowed'},
                                status=405, event=event)

    try:
        ctx = ag.require_session(event)
        ag.require_family_member(ctx)
        # SEC-2026-001: список «кого можно отслеживать» — тоже часть
        # функции слежения, и пока она приостановлена, такого списка нет.
        ag.require_geo_enabled(ag.GEO_HISTORY_FLAG)
        ag.require_permission(ctx, 'geolocation', 'read_own')

        trackable = ag.accessible_subject_ids(ctx, 'geolocation', action='read')

        conn = psycopg2.connect(ag.DATABASE_URL)
        conn.autocommit = True
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Карточка участника семьи сама по себе не секрет (имя
                # и аватар видны в разделе «Семья»), но для маячка нужно
                # различать: кого показываем на карте, а кого нет.
                cur.execute(
                    f"""
                    SELECT fm.id,
                           COALESCE(fm.name, u.name)             AS name,
                           COALESCE(fm.photo_url, u.avatar_url)  AS avatar_url,
                           fm.role
                    FROM {SCHEMA}.family_members fm
                    LEFT JOIN {SCHEMA}.users u ON fm.user_id = u.id
                    WHERE fm.family_id = %s
                      AND COALESCE(fm.member_status, 'active') = 'active'
                      AND fm.id = ANY(%s::uuid[])
                    ORDER BY fm.created_at
                    """,
                    (ctx.family_id, trackable or [ctx.member_id]),
                )
                members = cur.fetchall()
        finally:
            conn.close()

        result = [
            {
                'id': str(m['id']),
                'name': m['name'] or 'Без имени',
                'avatar_url': m['avatar_url'],
                'role': m['role'] or 'Член семьи',
                'color': COLORS[idx % len(COLORS)],
                'is_self': str(m['id']) == ctx.member_id,
            }
            for idx, m in enumerate(members)
        ]

        return ag.json_response({'success': True, 'members': result}, event=event)

    except AuthError as exc:
        return ag.error_response(exc, event)
    except Exception as exc:  # noqa: BLE001
        print(f'[family-tracker-members] failed: {type(exc).__name__}')
        return ag.json_response({'error': 'Внутренняя ошибка'},
                                status=500, event=event)