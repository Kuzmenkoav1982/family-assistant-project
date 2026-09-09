"""
Business: справочник врачей пользователя — CRUD
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком врачей или результатом операции

doctors.user_id хранит family_members.id (та же аномалия KE-health, что и
health_profiles). Раньше владельцем считался предъявитель X-User-Id — то есть
любой, кто подставил чужой UUID, видел и правил чужой справочник врачей.
Теперь владелец берётся из серверной сессии (ctx.member_id), а все запросы
дополнительно фильтруются по нему.
"""

import json
import os
from typing import Any, Dict

import psycopg2

from auth_guard import (
    AuthContext,
    AuthError,
    error_response,
    json_response,
    preflight,
    require_family_member,
    require_permission,
    require_session,
)

MODULE = 'health'


def _connect():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))


def _handle_get(event, ctx: AuthContext, cursor) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'read_own')
    cursor.execute(
        """SELECT id, name, specialization, clinic, phone, rating, is_favorite, created_at
           FROM doctors WHERE user_id = %s ORDER BY is_favorite DESC, name""",
        (ctx.member_id,),
    )
    doctors = [{
        'id': r[0],
        'name': r[1],
        'specialization': r[2],
        'clinic': r[3],
        'phone': r[4],
        'rating': float(r[5]) if r[5] else None,
        'isFavorite': r[6],
        'createdAt': r[7].isoformat() if r[7] else None,
    } for r in cursor.fetchall()]
    return json_response(doctors, 200, event)


def _handle_post(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'create')
    require_family_member(ctx)
    body = json.loads(event.get('body') or '{}')
    if not body.get('name'):
        return json_response({'error': 'name required'}, 400, event)

    # Владелец записи — только actor из сессии. Из body не берём.
    cursor.execute(
        """INSERT INTO doctors (id, user_id, name, specialization, clinic, phone, rating, is_favorite, created_at)
           VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW())
           RETURNING id""",
        (ctx.member_id, body.get('name'), body.get('specialization'), body.get('clinic'),
         body.get('phone'), body.get('rating'), body.get('isFavorite', False)),
    )
    doctor_id = cursor.fetchone()[0]
    conn.commit()
    return json_response({'id': doctor_id, 'message': 'Doctor created'}, 201, event)


def _handle_put(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    doctor_id = body.get('id')
    if not doctor_id:
        return json_response({'error': 'Doctor ID required'}, 400, event)

    cursor.execute(
        """UPDATE doctors
           SET name = %s, specialization = %s, clinic = %s, phone = %s,
               rating = %s, is_favorite = %s
           WHERE id = %s AND user_id = %s""",
        (body.get('name'), body.get('specialization'), body.get('clinic'), body.get('phone'),
         body.get('rating'), body.get('isFavorite', False), doctor_id, ctx.member_id),
    )
    if cursor.rowcount == 0:
        # Не подтверждаем существование чужой записи.
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    conn.commit()
    return json_response({'message': 'Doctor updated'}, 200, event)


def _handle_delete(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    qs = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    doctor_id = body.get('id') or qs.get('id')
    if not doctor_id:
        return json_response({'error': 'Doctor ID required'}, 400, event)

    cursor.execute('DELETE FROM doctors WHERE id = %s AND user_id = %s',
                   (doctor_id, ctx.member_id))
    if cursor.rowcount == 0:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    conn.commit()
    return json_response({'message': 'Doctor deleted'}, 200, event)


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
        print(f'[ERROR] health-doctors: {exc}')
        return json_response({'error': 'Internal error'}, 500, event)
    finally:
        if conn:
            conn.close()
