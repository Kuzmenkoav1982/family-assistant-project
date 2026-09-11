"""
Business: медицинские записи — визиты к врачам, анализы, симптомы, рецепты
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком записей или результатом операции

────────────────────────────────────────────────────────────────────────────
МОДЕЛЬ ДОСТУПА (волна 1)

Раньше actor брался из X-User-Id, а PUT/DELETE меняли запись по id без
единой проверки принадлежности. Теперь:
  require_session → require_permission → guard_profile / guard_resource

guard_* проверяет и семью (same_family, защита от IDOR), и доступ к данным
именно этого человека (require_subject_access). Содержимое записей —
диагнозы, интерпретации — в аудит не пишется, только факт доступа.
"""

import json
from typing import Any, Dict

from auth_guard import (
    AuthContext,
    AuthError,
    audit_allowed,
    error_response,
    json_response,
    preflight,
    require_permission,
    require_session,
)
from encryption_utils import decrypt_data, encrypt_data
from health_scope import accessible_profile_ids, connect, guard_profile, guard_resource

MODULE = 'health'
TABLE = 'health_records'
RESOURCE = 'health_record'


def _serialize(cursor, rows) -> list:
    records = []
    for row in rows:
        cursor.execute(
            """SELECT id, file_name, file_url, file_type, uploaded_at
               FROM health_attachments WHERE record_id = %s""",
            (row[0],),
        )
        attachments = [{
            'id': a[0], 'fileName': a[1], 'fileUrl': a[2], 'fileType': a[3],
            'uploadedAt': a[4].isoformat() if hasattr(a[4], 'isoformat') else str(a[4]) if a[4] else None,
        } for a in cursor.fetchall()]

        ai_analysis = None
        if row[10]:
            ai_analysis = {
                'status': row[10],
                'extractedText': decrypt_data(row[11]) if row[11] else None,
                'interpretation': decrypt_data(row[12]) if row[12] else None,
                'warnings': row[13] or [],
                'sourceImageUrl': row[14],
            }

        records.append({
            'id': row[0],
            'profileId': row[1],
            'type': row[2],
            'date': row[3].isoformat() if hasattr(row[3], 'isoformat') else str(row[3]) if row[3] else None,
            'title': row[4],
            'description': decrypt_data(row[5]) if row[5] else None,
            'doctor': row[6],
            'clinic': row[7],
            'diagnosis': decrypt_data(row[8]) if row[8] else None,
            'recommendations': decrypt_data(row[9]) if row[9] else None,
            'attachments': attachments,
            'aiAnalysis': ai_analysis,
            'createdAt': row[15].isoformat() if hasattr(row[15], 'isoformat') else str(row[15]) if row[15] else None,
        })
    return records


SELECT_COLS = """
    hr.id, hr.profile_id, hr.type, hr.date, hr.title, hr.description,
    hr.doctor, hr.clinic, hr.diagnosis, hr.recommendations,
    hr.ai_analysis_status, hr.ai_extracted_text, hr.ai_interpretation,
    hr.ai_warnings, hr.ai_source_image_url, hr.created_at
"""


def _handle_get(event, ctx: AuthContext, cursor) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'read_own')
    qs = event.get('queryStringParameters') or {}
    profile_id = qs.get('profileId')

    if profile_id:
        scope = guard_profile(ctx, cursor, profile_id, MODULE, RESOURCE)
        cursor.execute(
            f'SELECT {SELECT_COLS} FROM health_records hr WHERE hr.profile_id = %s ORDER BY hr.date DESC',
            (profile_id,),
        )
        subject = scope['subject_member_id']
    else:
        profiles = accessible_profile_ids(ctx, cursor, MODULE)
        if not profiles:
            return json_response([], 200, event)
        cursor.execute(
            f'SELECT {SELECT_COLS} FROM health_records hr WHERE hr.profile_id = ANY(%s) ORDER BY hr.date DESC',
            (profiles,),
        )
        subject = None

    records = _serialize(cursor, cursor.fetchall())
    audit_allowed(ctx, MODULE, 'read', 'POLICY_ALLOW', resource_type=RESOURCE,
                  resource_id=profile_id, subject_member_id=subject)
    return json_response(records, 200, event)


def _handle_post(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'create')
    body = json.loads(event.get('body') or '{}')
    profile_id = body.get('profileId')
    if not profile_id:
        return json_response({'error': 'profileId required'}, 400, event)

    scope = guard_profile(ctx, cursor, profile_id, MODULE, RESOURCE)

    ai = body.get('aiAnalysis') or {}
    ai_status = 'completed' if ai else None
    ai_extracted = encrypt_data(ai['extractedText']) if ai.get('extractedText') else None
    ai_interpret = encrypt_data(ai['interpretation']) if ai.get('interpretation') else None

    cursor.execute(
        """INSERT INTO health_records
           (id, profile_id, type, date, title, description, doctor, clinic, diagnosis,
            recommendations, ai_analysis_status, ai_extracted_text, ai_interpretation,
            ai_warnings, ai_source_image_url, created_at)
           VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
           RETURNING id""",
        (profile_id, body.get('type'), body.get('date'), body.get('title'),
         encrypt_data(body.get('description', '')), body.get('doctor'), body.get('clinic'),
         encrypt_data(body.get('diagnosis', '')), encrypt_data(body.get('recommendations', '')),
         ai_status, ai_extracted, ai_interpret, ai.get('warnings'), ai.get('sourceImageUrl')),
    )
    record_id = cursor.fetchone()[0]

    for att in body.get('attachments', []):
        cursor.execute(
            """INSERT INTO health_attachments (id, record_id, file_name, file_url, file_type, uploaded_at)
               VALUES (gen_random_uuid()::text, %s, %s, %s, %s, NOW())""",
            (record_id, att['fileName'], att['fileUrl'], att['fileType']),
        )

    conn.commit()
    audit_allowed(ctx, MODULE, 'create', 'POLICY_ALLOW', resource_type=RESOURCE,
                  resource_id=record_id, subject_member_id=scope['subject_member_id'])
    return json_response({'id': record_id, 'message': 'Record created'}, 201, event)


def _handle_put(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    record_id = body.get('id')
    if not record_id:
        return json_response({'error': 'Record ID required'}, 400, event)

    scope = guard_resource(ctx, cursor, TABLE, record_id, MODULE, RESOURCE)

    cursor.execute(
        """UPDATE health_records
           SET title = %s, description = %s, doctor = %s, clinic = %s,
               diagnosis = %s, recommendations = %s
           WHERE id = %s""",
        (body.get('title'), encrypt_data(body.get('description', '')), body.get('doctor'),
         body.get('clinic'), encrypt_data(body.get('diagnosis', '')),
         encrypt_data(body.get('recommendations', '')), record_id),
    )
    conn.commit()
    audit_allowed(ctx, MODULE, 'update', 'POLICY_ALLOW', resource_type=RESOURCE,
                  resource_id=record_id, subject_member_id=scope['subject_member_id'])
    return json_response({'message': 'Record updated'}, 200, event)


def _handle_delete(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    qs = event.get('queryStringParameters') or {}
    record_id = body.get('id') or qs.get('id')
    if not record_id:
        return json_response({'error': 'Record ID required'}, 400, event)

    scope = guard_resource(ctx, cursor, TABLE, record_id, MODULE, RESOURCE)

    cursor.execute('DELETE FROM health_attachments WHERE record_id = %s', (record_id,))
    cursor.execute('DELETE FROM health_records WHERE id = %s', (record_id,))
    conn.commit()
    audit_allowed(ctx, MODULE, 'delete', 'POLICY_ALLOW', resource_type=RESOURCE,
                  resource_id=record_id, subject_member_id=scope['subject_member_id'])
    return json_response({'message': 'Record deleted'}, 200, event)


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
        conn = connect()
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
        print(f'[ERROR] health-records: {exc}')
        return json_response({'error': 'Internal error'}, 500, event)
    finally:
        if conn:
            conn.close()

# redeploy marker: wave-3 authz
