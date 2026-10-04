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
import re
from datetime import date, datetime, timedelta
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

VERSION = 'health-medications-2026-10-05.1'
_TIME_RE = re.compile(r'^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$')

# Безопасные сообщения: пользователю показываем только их, текст исключений — никогда.
ERRORS = {
    'INVALID_JSON': (400, 'Не удалось прочитать данные формы. Обновите страницу и повторите.'),
    'PROFILE_REQUIRED': (400, 'Не выбран профиль здоровья.'),
    'NAME_REQUIRED': (400, 'Укажите название препарата.'),
    'NAME_TOO_LONG': (400, 'Название препарата слишком длинное (не более 200 символов).'),
    'START_DATE_REQUIRED': (400, 'Укажите дату начала приёма.'),
    'START_DATE_INVALID': (400, 'Дата начала приёма указана неверно. Формат: ГГГГ-ММ-ДД, не раньше 100 лет назад и не позже чем через 2 года.'),
    'END_DATE_INVALID': (400, 'Дата окончания указана неверно.'),
    'END_BEFORE_START': (400, 'Дата окончания не может быть раньше даты начала.'),
    'TIME_INVALID': (400, 'Время приёма указано неверно. Формат: ЧЧ:ММ.'),
    'TOO_MANY_TIMES': (400, 'Слишком много времён приёма (не более 12).'),
    'DUPLICATE_COURSE': (409, 'Такое лекарство с той же дозировкой уже принимается в этот период. Измените даты курса или дозировку.'),
    'NOT_FOUND': (404, 'Запись не найдена.'),
    'INTERNAL': (500, 'Не удалось сохранить. Попробуйте ещё раз; если не получится, сообщите в поддержку код: {rid}.'),
}


def _out(ctx, event, status, payload):
    resp = json_response(payload, status, event)
    resp['headers']['X-Function-Version'] = VERSION
    if ctx is not None:
        resp['headers']['X-Request-Id'] = ctx.request_id
    return resp


def _err(ctx, event, code, extra=None):
    status, message = ERRORS[code]
    rid = ctx.request_id if ctx is not None else ''
    payload = {'error': message.format(rid=rid), 'code': code, 'request_id': rid}
    if extra:
        payload.update(extra)
    return _out(ctx, event, status, payload)


class ValidationError(Exception):
    def __init__(self, code):
        self.code = code


def _parse_date(value, required_code, invalid_code):
    if value is None or (isinstance(value, str) and not value.strip()):
        raise ValidationError(required_code) if required_code else ValidationError(invalid_code)
    try:
        d = datetime.strptime(str(value).strip(), '%Y-%m-%d').date()
    except ValueError:
        raise ValidationError(invalid_code)
    today = date.today()
    if d < today - timedelta(days=36525) or d > today + timedelta(days=730 if invalid_code == 'START_DATE_INVALID' else 3650):
        raise ValidationError(invalid_code)
    return d


def _validate_course(body):
    name = str(body.get('name') or '').strip()
    if not name:
        raise ValidationError('NAME_REQUIRED')
    if len(name) > 200:
        raise ValidationError('NAME_TOO_LONG')
    start = _parse_date(body.get('startDate'), 'START_DATE_REQUIRED', 'START_DATE_INVALID')
    end_raw = body.get('endDate')
    end = None
    if end_raw is not None and str(end_raw).strip():
        end = _parse_date(end_raw, None, 'END_DATE_INVALID')
        if end < start:
            raise ValidationError('END_BEFORE_START')
    times = body.get('times') or []
    if not isinstance(times, list) or len(times) > 12:
        raise ValidationError('TOO_MANY_TIMES')
    for t in times:
        if not isinstance(t, str) or not _TIME_RE.match(t.strip()):
            raise ValidationError('TIME_INVALID')
    for rem in (body.get('reminders') or []):
        if not isinstance(rem, dict) or not _TIME_RE.match(str(rem.get('time', '')).strip()):
            raise ValidationError('TIME_INVALID')
    return {
        'name': name,
        'dosage': str(body.get('dosage') or '').strip(),
        'frequency': str(body.get('frequency') or '').strip(),
        'start': start,
        'end': end,
    }


def _find_duplicate(cursor, profile_id, v, exclude_id=None):
    """Дубль = тот же профиль + то же название + та же дозировка + пересекающийся
    период у активного курса. Разные дозировки и непересекающиеся курсы
    одного препарата — разные записи."""
    cursor.execute(
        """SELECT id FROM medications
           WHERE profile_id = %s AND active = TRUE
             AND LOWER(TRIM(name)) = LOWER(%s)
             AND LOWER(TRIM(dosage)) = LOWER(%s)
             AND start_date <= COALESCE(%s::date, DATE '9999-12-31')
             AND COALESCE(end_date, DATE '9999-12-31') >= %s::date
             AND (%s::text IS NULL OR id <> %s::text)
           LIMIT 1""",
        (profile_id, v['name'], v['dosage'], v['end'], v['start'], exclude_id, exclude_id),
    )
    row = cursor.fetchone()
    return row[0] if row else None


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
    try:
        body = json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        return _err(ctx, event, 'INVALID_JSON')
    profile_id = body.get('profileId')
    if not profile_id:
        return _err(ctx, event, 'PROFILE_REQUIRED')
    try:
        v = _validate_course(body)
    except ValidationError as ve:
        return _err(ctx, event, ve.code)

    scope = _guard_profile(ctx, cursor, profile_id, 'create')

    dup = _find_duplicate(cursor, profile_id, v)
    if dup:
        return _err(ctx, event, 'DUPLICATE_COURSE', {'existing_id': dup})

    # start_date — медицинская дата курса, задаётся пользователем явно.
    # Момент создания записи хранится отдельно (created_at).
    cursor.execute(
        """INSERT INTO medications
           (id, profile_id, name, dosage, frequency, start_date, end_date, active, files, created_at)
           VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW())
           RETURNING id""",
        (profile_id, v['name'], v['dosage'], v['frequency'], v['start'], v['end'],
         bool(body.get('active', True)), json.dumps(body.get('files', []))),
    )
    med_id = cursor.fetchone()[0]
    _write_reminders(cursor, med_id, body.get('times', []), body.get('reminders', []))
    conn.commit()

    audit_allowed(ctx, MODULE, 'create', 'POLICY_ALLOW', resource_type='medication',
                  resource_id=med_id, subject_member_id=scope['subject_member_id'])
    return _out(ctx, event, 201, {'id': med_id, 'message': 'Medication created',
                                  'startDate': v['start'].isoformat()})


def _handle_put(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    try:
        body = json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        return _err(ctx, event, 'INVALID_JSON')
    med_id = body.get('id')
    if not med_id:
        return _err(ctx, event, 'NOT_FOUND')
    try:
        v = _validate_course(body)
    except ValidationError as ve:
        return _err(ctx, event, ve.code)

    scope = _load_medication_scope(cursor, med_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], 'medication', med_id)
    require_subject_access(ctx, scope['subject_member_id'], MODULE,
                           resource_type='medication', resource_id=med_id)

    target_profile = body.get('profileId') or scope['profile_id']
    if str(target_profile) != str(scope['profile_id']):
        _guard_profile(ctx, cursor, target_profile, 'update')

    active = bool(body.get('active', True))
    if active:
        dup = _find_duplicate(cursor, target_profile, v, exclude_id=med_id)
        if dup:
            return _err(ctx, event, 'DUPLICATE_COURSE', {'existing_id': dup})

    cursor.execute(
        """UPDATE medications
           SET name = %s, dosage = %s, frequency = %s, start_date = %s, end_date = %s,
               active = %s, files = %s::jsonb, profile_id = %s
           WHERE id = %s""",
        (v['name'], v['dosage'], v['frequency'], v['start'], v['end'], active,
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
    return _out(ctx, event, 200, {'success': True, 'message': 'Medication updated',
                                  'startDate': v['start'].isoformat()})


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
            resp = _handle_get(event, ctx, cursor)
            resp['headers']['X-Function-Version'] = VERSION
            return resp
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
        print(f'[ERROR] health-medications rid={ctx.request_id} v={VERSION} type={type(exc).__name__}')
        return _err(ctx, event, 'INTERNAL')
    finally:
        if conn:
            conn.close()
