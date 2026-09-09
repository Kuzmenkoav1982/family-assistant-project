"""
Business: лекарства и напоминания о приёме — чтение, создание, изменение, удаление
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком лекарств или результатом операции

────────────────────────────────────────────────────────────────────────────
МОДЕЛЬ ДОСТУПА (волна 1)

До этой правки: actor брался из X-User-Id, а PUT/DELETE вообще не проверяли
принадлежность лекарства — по известному med_id любой мог изменить или удалить
запись в чужой семье. Теперь каждая операция проходит четыре проверки:

  require_session → require_permission → require_same_family → require_subject_access

Субъект лекарства определяется через health_profiles.user_id (= family_members.id,
известная аномалия KE-health) и его family_id.
"""

import json
import os
from typing import Any, Dict, Optional

import psycopg2

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
MODULE = 'medications'


def _connect():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))


def _load_profile_scope(cursor, profile_id: str) -> Optional[Dict[str, Any]]:
    """Профиль → субъект и его семья. Без этого невозможна проверка доступа."""
    cursor.execute(
        f"""
        SELECT hp.id, hp.user_id AS subject_member_id, fm.family_id::text AS family_id
        FROM health_profiles hp
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE hp.id = %s
        """,
        (profile_id,),
    )
    row = cursor.fetchone()
    return {'profile_id': row[0], 'subject_member_id': row[1], 'family_id': row[2]} if row else None


def _load_medication_scope(cursor, med_id: str) -> Optional[Dict[str, Any]]:
    """Лекарство → профиль → субъект → семья."""
    cursor.execute(
        f"""
        SELECT m.id, m.profile_id, hp.user_id AS subject_member_id, fm.family_id::text AS family_id
        FROM medications m
        JOIN health_profiles hp ON hp.id = m.profile_id
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE m.id = %s
        """,
        (med_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return {'med_id': row[0], 'profile_id': row[1],
            'subject_member_id': row[2], 'family_id': row[3]}


def _guard_profile(ctx: AuthContext, cursor, profile_id: str, action: str) -> Dict[str, Any]:
    """Единая последовательность проверок для операций над профилем."""
    scope = _load_profile_scope(cursor, profile_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], 'health_profile', profile_id)
    require_subject_access(ctx, scope['subject_member_id'], MODULE,
                           resource_type='medication', resource_id=profile_id)
    return scope


def _fetch_reminders(cursor, med_id: str):
    cursor.execute(
        'SELECT id, time, enabled FROM medication_reminders WHERE medication_id = %s ORDER BY time',
        (med_id,),
    )
    return [{'id': r[0], 'time': str(r[1]), 'enabled': r[2]} for r in cursor.fetchall()]


def _handle_get(event, ctx: AuthContext, cursor) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'read_own')
    qs = event.get('queryStringParameters') or {}
    profile_id = qs.get('profileId')

    if profile_id:
        _guard_profile(ctx, cursor, profile_id, 'read')
        cursor.execute(
            """SELECT m.id, m.profile_id, m.name, m.dosage, m.frequency,
                      m.start_date, m.end_date, m.active, m.files, m.created_at
               FROM medications m
               WHERE m.profile_id = %s
               ORDER BY m.active DESC, m.start_date DESC""",
            (profile_id,),
        )
    else:
        # Массовый список: только субъекты с подтверждённым доступом.
        subjects = accessible_subject_ids(ctx, MODULE)
        if not subjects:
            return json_response([], 200, event)
        cursor.execute(
            """SELECT m.id, m.profile_id, m.name, m.dosage, m.frequency,
                      m.start_date, m.end_date, m.active, m.files, m.created_at
               FROM medications m
               JOIN health_profiles hp ON hp.id = m.profile_id
               WHERE hp.user_id = ANY(%s)
               ORDER BY m.active DESC, m.start_date DESC""",
            (subjects,),
        )

    medications = []
    for row in cursor.fetchall():
        medications.append({
            'id': row[0],
            'profileId': row[1],
            'name': row[2] or '',
            'dosage': row[3],
            'frequency': row[4],
            'startDate': row[5].isoformat() if row[5] else None,
            'endDate': row[6].isoformat() if row[6] else None,
            'active': row[7],
            'files': row[8] or [],
            'reminders': [],
            'createdAt': row[9].isoformat() if row[9] else None,
        })
    for med in medications:
        med['reminders'] = _fetch_reminders(cursor, med['id'])

    audit_allowed(ctx, MODULE, 'read', 'ACCESSIBLE_SUBJECTS', resource_type='medication')
    return json_response(medications, 200, event)


def _write_reminders(cursor, med_id: str, times, reminders) -> None:
    if times:
        for t in times:
            cursor.execute(
                """INSERT INTO medication_reminders (id, medication_id, time, enabled)
                   VALUES (gen_random_uuid()::text, %s, %s, TRUE)""",
                (med_id, t),
            )
    elif reminders:
        for rem in reminders:
            cursor.execute(
                """INSERT INTO medication_reminders (id, medication_id, time, enabled)
                   VALUES (gen_random_uuid()::text, %s, %s, %s)""",
                (med_id, rem['time'], rem.get('enabled', True)),
            )


def _handle_post(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'create')
    body = json.loads(event.get('body') or '{}')
    profile_id = body.get('profileId')
    if not profile_id:
        return json_response({'error': 'Profile ID required'}, 400, event)
    if not body.get('name'):
        return json_response({'error': 'Name required'}, 400, event)

    scope = _guard_profile(ctx, cursor, profile_id, 'create')

    cursor.execute(
        """SELECT id FROM medications
           WHERE profile_id = %s AND LOWER(name) = LOWER(%s) AND active = TRUE LIMIT 1""",
        (profile_id, body['name']),
    )
    existing = cursor.fetchone()
    if existing:
        return json_response(
            {'error': f'Лекарство «{body["name"]}» уже добавлено', 'existing_id': existing[0]},
            409, event,
        )

    cursor.execute(
        """INSERT INTO medications
           (id, profile_id, name, dosage, frequency, start_date, end_date, active, files, created_at)
           VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW())
           RETURNING id""",
        (profile_id, body['name'], body.get('dosage', ''), body.get('frequency', ''),
         body.get('startDate') or None, body.get('endDate') or None,
         body.get('active', True), json.dumps(body.get('files', []))),
    )
    med_id = cursor.fetchone()[0]
    _write_reminders(cursor, med_id, body.get('times', []), body.get('reminders', []))
    conn.commit()

    audit_allowed(ctx, MODULE, 'create', 'POLICY_ALLOW', resource_type='medication',
                  resource_id=med_id, subject_member_id=scope['subject_member_id'])
    return json_response({'id': med_id, 'message': 'Medication created'}, 201, event)


def _handle_put(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    med_id = body.get('id')
    if not med_id:
        return json_response({'error': 'Medication ID required'}, 400, event)
    if not body.get('name'):
        return json_response({'error': 'Name required'}, 400, event)

    # Проверка принадлежности существующего лекарства.
    scope = _load_medication_scope(cursor, med_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], 'medication', med_id)
    require_subject_access(ctx, scope['subject_member_id'], MODULE,
                           resource_type='medication', resource_id=med_id)

    # Перенос лекарства в другой профиль допустим только в доступный профиль.
    target_profile = body.get('profileId') or scope['profile_id']
    if str(target_profile) != str(scope['profile_id']):
        _guard_profile(ctx, cursor, target_profile, 'update')

    start_date = body.get('startDate') or None
    end_date = body.get('endDate') or None
    if isinstance(start_date, str) and not start_date.strip():
        start_date = None
    if isinstance(end_date, str) and not end_date.strip():
        end_date = None

    cursor.execute(
        """UPDATE medications
           SET name = %s, dosage = %s, frequency = %s, start_date = %s, end_date = %s,
               active = %s, files = %s::jsonb, profile_id = %s
           WHERE id = %s""",
        (body['name'], body.get('dosage', ''), body.get('frequency', ''),
         start_date, end_date, body.get('active', True),
         json.dumps(body.get('files', [])), target_profile, med_id),
    )

    times = body.get('times', [])
    reminders = body.get('reminders', [])
    if ('times' in body or 'reminders' in body) and (times or reminders):
        cursor.execute(
            """DELETE FROM medication_intakes
               WHERE reminder_id IN (SELECT id FROM medication_reminders WHERE medication_id = %s)""",
            (med_id,),
        )
        cursor.execute('DELETE FROM medication_reminders WHERE medication_id = %s', (med_id,))
        _write_reminders(cursor, med_id, times, reminders)

    conn.commit()
    audit_allowed(ctx, MODULE, 'update', 'POLICY_ALLOW', resource_type='medication',
                  resource_id=med_id, subject_member_id=scope['subject_member_id'])
    return json_response({'success': True, 'message': 'Medication updated'}, 200, event)


def _handle_delete(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    qs = event.get('queryStringParameters') or {}
    med_id = body.get('id') or qs.get('id')
    if not med_id:
        return json_response({'error': 'Medication ID required'}, 400, event)

    scope = _load_medication_scope(cursor, med_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], 'medication', med_id)
    require_subject_access(ctx, scope['subject_member_id'], MODULE,
                           resource_type='medication', resource_id=med_id)

    cursor.execute('DELETE FROM medication_intakes WHERE medication_id = %s', (med_id,))
    cursor.execute('DELETE FROM medication_reminders WHERE medication_id = %s', (med_id,))
    cursor.execute('DELETE FROM medications WHERE id = %s', (med_id,))
    conn.commit()

    audit_allowed(ctx, MODULE, 'delete', 'POLICY_ALLOW', resource_type='medication',
                  resource_id=med_id, subject_member_id=scope['subject_member_id'])
    return json_response({'message': 'Medication deleted'}, 200, event)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return preflight(event)

    try:
        ctx = require_session(event)
    except AuthError as exc:
        return error_response(exc, event)

    conn = None
    try:
        conn = _connect()
        cursor = conn.cursor()

        if method == 'GET':
            return _handle_get(event, ctx, cursor)
        if method == 'POST':
            return _handle_post(event, ctx, cursor, conn)
        if method == 'PUT':
            return _handle_put(event, ctx, cursor, conn)
        if method == 'DELETE':
            return _handle_delete(event, ctx, cursor, conn)

        return json_response({'error': 'Method not allowed'}, 405, event)

    except AuthError as exc:
        if conn:
            conn.rollback()
        return error_response(exc, event)
    except Exception as exc:
        if conn:
            conn.rollback()
        print(f'[ERROR] health-medications: {exc}')
        return json_response({'error': 'Internal error'}, 500, event)
    finally:
        if conn:
            conn.close()
