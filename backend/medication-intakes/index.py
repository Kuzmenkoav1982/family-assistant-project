"""
Business: отметка факта приёма лекарств и история приёмов
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON с историей приёмов или результатом операции

────────────────────────────────────────────────────────────────────────────
МОДЕЛЬ ДОСТУПА (волна 1)

До этой правки actor брался из X-User-Id, а GET по любому medicationId отдавал
историю приёмов чужого человека; POST/PUT не проверяли вообще ничего.
Теперь каждая операция привязана к цепочке
medication → health_profile → family_member → family и проходит проверки
require_session → require_permission → require_same_family → require_subject_access.
"""

import json
import os
from datetime import date, datetime
from typing import Any, Dict, Optional

import psycopg2

from auth_guard import (
    AuthContext,
    AuthError,
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


def _medication_scope(cursor, med_id: str) -> Optional[Dict[str, Any]]:
    cursor.execute(
        f"""
        SELECT m.id, hp.user_id AS subject_member_id, fm.family_id::text AS family_id
        FROM medications m
        JOIN health_profiles hp ON hp.id = m.profile_id
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE m.id = %s
        """,
        (med_id,),
    )
    row = cursor.fetchone()
    return {'med_id': row[0], 'subject_member_id': row[1], 'family_id': row[2]} if row else None


def _intake_scope(cursor, intake_id: str) -> Optional[Dict[str, Any]]:
    cursor.execute(
        f"""
        SELECT mi.id, mi.medication_id, hp.user_id AS subject_member_id,
               fm.family_id::text AS family_id
        FROM medication_intakes mi
        JOIN medications m ON m.id = mi.medication_id
        JOIN health_profiles hp ON hp.id = m.profile_id
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE mi.id = %s
        """,
        (intake_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return {'intake_id': row[0], 'med_id': row[1],
            'subject_member_id': row[2], 'family_id': row[3]}


def _guard_medication(ctx: AuthContext, cursor, med_id: str) -> Dict[str, Any]:
    scope = _medication_scope(cursor, med_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], 'medication_intake', med_id)
    require_subject_access(ctx, scope['subject_member_id'], MODULE,
                           resource_type='medication_intake', resource_id=med_id)
    return scope


def _handle_get(event, ctx: AuthContext, cursor) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'read_own')
    qs = event.get('queryStringParameters') or {}
    med_id = qs.get('medicationId')
    if not med_id:
        return json_response({'error': 'Medication ID required'}, 400, event)

    scope = _guard_medication(ctx, cursor, med_id)

    cursor.execute(
        """SELECT id, medication_id, reminder_id, scheduled_time, scheduled_date,
                  actual_time, status, notes, created_at
           FROM medication_intakes
           WHERE medication_id = %s
           ORDER BY scheduled_date DESC, scheduled_time DESC
           LIMIT 100""",
        (med_id,),
    )
    intakes = [{
        'id': r[0],
        'medicationId': r[1],
        'reminderId': r[2],
        'scheduledTime': str(r[3]),
        'scheduledDate': r[4].isoformat() if r[4] else None,
        'actualTime': r[5].isoformat() if r[5] else None,
        'status': r[6],
        'notes': r[7],
        'createdAt': r[8].isoformat() if r[8] else None,
    } for r in cursor.fetchall()]

    audit_allowed(ctx, MODULE, 'read', 'POLICY_ALLOW', resource_type='medication_intake',
                  resource_id=med_id, subject_member_id=scope['subject_member_id'])
    return json_response(intakes, 200, event)


def _handle_post(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    med_id = body.get('medicationId')
    if not med_id or not body.get('scheduledTime'):
        return json_response({'error': 'medicationId and scheduledTime required'}, 400, event)

    scope = _guard_medication(ctx, cursor, med_id)

    # reminder_id должен принадлежать тому же лекарству — иначе можно склеить
    # запись приёма с напоминанием чужого человека.
    reminder_id = body.get('reminderId')
    if reminder_id:
        cursor.execute(
            'SELECT id FROM medication_reminders WHERE id = %s AND medication_id = %s',
            (reminder_id, med_id),
        )
        if not cursor.fetchone():
            raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    status = body.get('status', 'pending')
    cursor.execute(
        """INSERT INTO medication_intakes
           (id, medication_id, reminder_id, scheduled_time, scheduled_date, actual_time, status, notes, created_at)
           VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
           RETURNING id""",
        (med_id, reminder_id, body['scheduledTime'],
         body.get('scheduledDate') or date.today().isoformat(),
         (body.get('actualTime') or datetime.now().isoformat()) if status == 'taken' else None,
         status, body.get('notes')),
    )
    intake_id = cursor.fetchone()[0]
    conn.commit()

    audit_allowed(ctx, MODULE, 'create', 'POLICY_ALLOW', resource_type='medication_intake',
                  resource_id=intake_id, subject_member_id=scope['subject_member_id'])
    return json_response({'id': intake_id, 'message': 'Intake recorded'}, 201, event)


def _handle_put(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    intake_id = body.get('id')
    if not intake_id:
        return json_response({'error': 'Intake ID required'}, 400, event)

    scope = _intake_scope(cursor, intake_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], 'medication_intake', intake_id)
    require_subject_access(ctx, scope['subject_member_id'], MODULE,
                           resource_type='medication_intake', resource_id=intake_id)

    status = body.get('status', 'pending')
    cursor.execute(
        'UPDATE medication_intakes SET status = %s, actual_time = %s, notes = %s WHERE id = %s',
        (status, datetime.now().isoformat() if status == 'taken' else None,
         body.get('notes'), intake_id),
    )
    conn.commit()

    audit_allowed(ctx, MODULE, 'update', 'POLICY_ALLOW', resource_type='medication_intake',
                  resource_id=intake_id, subject_member_id=scope['subject_member_id'])
    return json_response({'message': 'Intake updated'}, 200, event)


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

        return json_response({'error': 'Method not allowed'}, 405, event)

    except AuthError as exc:
        if conn:
            conn.rollback()
        return error_response(exc, event)
    except Exception as exc:
        if conn:
            conn.rollback()
        print(f'[ERROR] medication-intakes: {exc}')
        return json_response({'error': 'Internal error'}, 500, event)
    finally:
        if conn:
            conn.close()
