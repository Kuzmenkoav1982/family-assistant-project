"""
Business: персональный календарь ребёнка — чтение, создание, изменение, удаление событий
Args: event с httpMethod, body (action, childId, eventId, event), headers X-Auth-Token (обязательно)
Returns: JSON со списком событий или результатом операции

────────────────────────────────────────────────────────────────────────────
МОДЕЛЬ ДОСТУПА (волна 2, P0)

До этой правки функция не требовала сессии вообще: familyId и childId
приходили из тела запроса и подставлялись в SQL как есть. Любой человек
в интернете мог прочитать расписание чужого ребёнка (школа, кружки, врачи —
это фактически его маршрут по городу) и писать туда события.

Теперь каждая операция проходит четыре проверки:

  require_session → require_permission → require_same_family → require_subject_access

familyId из тела запроса БОЛЬШЕ НЕ ЧИТАЕТСЯ. Семья берётся из сессии.
Если клиент всё же прислал familyId и он не совпадает с сессией — это
фиксируется как попытка межсемейного доступа и запрос отклоняется.

Отдельно: доступа «ко всем детям своей семьи» не существует. Календарь
конкретного ребёнка открывается только тому, у кого есть адресная связь
в member_guardianships (см. auth_guard.can_access_subject).
"""

import json
import os
from typing import Any, Dict, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

from auth_guard import (
    AuthContext,
    AuthError,
    accessible_subject_ids,
    audit_allowed,
    error_response,
    json_response,
    preflight,
    require_permission,
    require_same_family,
    require_session,
    require_subject_access,
)

SCHEMA = 't_p5815085_family_assistant_pro'
MODULE = 'children'


def _connect():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))


def _reject_client_family(ctx: AuthContext, body: Dict[str, Any]) -> None:
    """
    familyId от клиента не является источником истины. Молча игнорировать
    его тоже нельзя: несовпадение — это сигнал о попытке доступа в чужую
    семью, и он должен попасть в аудит, а не потеряться.
    """
    claimed = body.get('familyId')
    if claimed and str(claimed) != str(ctx.family_id):
        require_same_family(ctx, str(claimed), resource_type='child_calendar')


def _load_event_scope(cursor, event_id: Any) -> Optional[Dict[str, Any]]:
    """
    Событие → его семья и ребёнок. Без этого PUT/DELETE проверить нечем.

    calendar_events.id — INTEGER. Нечисловой идентификатор от клиента должен
    давать честный 404, а не ошибку приведения типа: 500 на подобранном id
    подтверждал бы атакующему, что запрос дошёл до базы.
    """
    try:
        numeric_id = int(str(event_id))
    except (TypeError, ValueError):
        return None

    cursor.execute(
        f"""
        SELECT id::text, family_id::text AS family_id, child_id::text AS child_id
        FROM {SCHEMA}.calendar_events
        WHERE id = %s
        """,
        (numeric_id,),
    )
    row = cursor.fetchone()
    return dict(row) if row else None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return preflight(event)

    if method != 'POST':
        return json_response({'error': 'Method not allowed'}, 405, event)

    try:
        ctx = require_session(event)

        try:
            body = json.loads(event.get('body') or '{}')
        except json.JSONDecodeError:
            return json_response({'error': 'Invalid JSON'}, 400, event)

        action = body.get('action')
        if not action:
            return json_response({'error': 'Action is required'}, 400, event)

        _reject_client_family(ctx, body)

        conn = _connect()
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            if action == 'get_child_events':
                result = _get_events(ctx, cursor, body.get('childId'))
            elif action == 'add_child_event':
                result = _add_event(ctx, conn, cursor, body.get('childId'),
                                    body.get('event') or {})
            elif action == 'update_child_event':
                result = _update_event(ctx, conn, cursor, body.get('eventId'),
                                       body.get('event') or {})
            elif action == 'delete_child_event':
                result = _delete_event(ctx, conn, cursor, body.get('eventId'))
            else:
                return json_response({'error': f'Unknown action: {action}'}, 400, event)

            cursor.close()
            return json_response(result, 200, event)
        finally:
            conn.close()

    except AuthError as exc:
        return error_response(exc, event)
    except ValueError as exc:
        return json_response({'error': str(exc)}, 400, event)
    except Exception:
        # Текст исключения может содержать фрагменты SQL и данные — наружу не отдаём.
        return json_response({'error': 'Internal error'}, 500, event)


def _get_events(ctx: AuthContext, cursor, child_id: Optional[str]) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'read')

    if child_id:
        # Конкретный ребёнок — нужна адресная связь именно с ним.
        require_subject_access(ctx, str(child_id), MODULE,
                               resource_type='child_calendar')
        subjects = [str(child_id)]
    else:
        # Список без указания ребёнка возвращает только доступных субъектов,
        # а не весь календарь семьи.
        subjects = accessible_subject_ids(ctx, MODULE)
        if not subjects:
            return {'events': []}

    cursor.execute(
        f"""
        SELECT id::text, child_id::text, title, description, date::text, time,
               category, color, reminder_time, completed,
               created_at::text, updated_at::text
        FROM {SCHEMA}.calendar_events
        WHERE family_id = %s AND child_id::text = ANY(%s)
        ORDER BY date ASC, time ASC NULLS LAST
        """,
        (ctx.family_id, subjects),
    )
    rows = cursor.fetchall()

    audit_allowed(ctx, MODULE, 'read', resource_type='child_calendar')

    return {
        'events': [
            {
                'id': r['id'],
                'child_id': r['child_id'],
                'title': r['title'],
                'description': r['description'],
                'date': r['date'],
                'time': r['time'],
                'category': r['category'] or 'other',
                'color': r['color'],
                'reminder_enabled': r['reminder_time'] is not None,
                'completed': r['completed'] or False,
                'created_at': r['created_at'],
                'updated_at': r['updated_at'],
            }
            for r in rows
        ]
    }


def _add_event(ctx: AuthContext, conn, cursor, child_id: Optional[str],
               data: Dict[str, Any]) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'create')

    if not child_id:
        raise ValueError('childId is required')
    require_subject_access(ctx, str(child_id), MODULE, resource_type='child_calendar')

    title = data.get('title')
    date = data.get('date')
    if not title or not date:
        raise ValueError('Title and date are required')

    reminder_time = '09:00' if data.get('reminder_enabled') else None

    cursor.execute(
        f"""
        INSERT INTO {SCHEMA}.calendar_events
            (family_id, child_id, title, description, date, time, category, color,
             reminder_time, visibility, completed, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'family', false, NOW(), NOW())
        RETURNING id::text
        """,
        (ctx.family_id, child_id, title, data.get('description'), date,
         data.get('time'), data.get('category', 'other'), data.get('color'),
         reminder_time),
    )
    new_id = cursor.fetchone()['id']
    conn.commit()

    audit_allowed(ctx, MODULE, 'create', resource_type='child_calendar',
                  resource_id=new_id, subject_member_id=str(child_id))

    return {'success': True, 'eventId': new_id, 'message': 'Event added successfully'}


ALLOWED_FIELDS = {
    'title': 'title',
    'description': 'description',
    'date': 'date',
    'time': 'time',
    'category': 'category',
    'color': 'color',
    'completed': 'completed',
}


def _update_event(ctx: AuthContext, conn, cursor, event_id: Optional[str],
                  data: Dict[str, Any]) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')

    if not event_id:
        raise ValueError('eventId is required')

    scope = _load_event_scope(cursor, event_id)
    if not scope:
        # 404, а не 403: не подтверждаем существование чужого объекта.
        raise AuthError(404, 'RESOURCE_NOT_FOUND')
    require_same_family(ctx, scope['family_id'], resource_type='child_calendar',
                        resource_id=event_id)
    require_subject_access(ctx, scope['child_id'], MODULE,
                           resource_type='child_calendar', resource_id=event_id)

    fields, values = [], []
    for key, column in ALLOWED_FIELDS.items():
        if key in data:
            fields.append(f'{column} = %s')
            values.append(data[key])

    if 'reminder_enabled' in data:
        fields.append('reminder_time = %s')
        values.append('09:00' if data['reminder_enabled'] else None)

    if not fields:
        raise ValueError('Nothing to update')

    fields.append('updated_at = NOW()')
    values.extend([int(scope['id']), ctx.family_id])

    cursor.execute(
        f"""
        UPDATE {SCHEMA}.calendar_events
        SET {', '.join(fields)}
        WHERE id = %s AND family_id = %s
        """,
        values,
    )
    conn.commit()

    audit_allowed(ctx, MODULE, 'update', resource_type='child_calendar',
                  resource_id=event_id, subject_member_id=scope['child_id'])

    return {'success': True, 'message': 'Event updated successfully'}


def _delete_event(ctx: AuthContext, conn, cursor, event_id: Optional[str]) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'delete')

    if not event_id:
        raise ValueError('eventId is required')

    scope = _load_event_scope(cursor, event_id)
    if not scope:
        raise AuthError(404, 'RESOURCE_NOT_FOUND')
    require_same_family(ctx, scope['family_id'], resource_type='child_calendar',
                        resource_id=event_id)
    require_subject_access(ctx, scope['child_id'], MODULE,
                           resource_type='child_calendar', resource_id=event_id)

    cursor.execute(
        f"DELETE FROM {SCHEMA}.calendar_events WHERE id = %s AND family_id = %s",
        (int(scope['id']), ctx.family_id),
    )
    conn.commit()

    audit_allowed(ctx, MODULE, 'delete', resource_type='child_calendar',
                  resource_id=event_id, subject_member_id=scope['child_id'])

    return {'success': True, 'message': 'Event deleted successfully'}
