"""
Business: сеансы телемедицины — запись, список, изменение статуса
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком сеансов или результатом операции

Авторизация целиком в health_crud.run_crud. Дополнительно validate_doctor
проверяет, что doctor_id из body принадлежит актору: иначе сеанс можно было
привязать к записи врача другого пользователя.
"""

from typing import Any, Dict

from auth_guard import AuthError
from health_crud import CrudSpec, run_crud


def _validate_doctor(ctx, cursor, body) -> None:
    """doctor_id из тела запроса должен быть врачом текущего актора."""
    doctor_id = body.get('doctorId')
    if not doctor_id:
        return
    cursor.execute(
        'SELECT id FROM doctors WHERE id = %s AND user_id = %s',
        (doctor_id, ctx.member_id),
    )
    if not cursor.fetchone():
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')


def _attach_doctor(cursor, item):
    cursor.execute('SELECT name, specialization FROM doctors WHERE id = %s',
                   (item.get('doctorId'),))
    doctor = cursor.fetchone()
    item['doctorName'] = doctor[0] if doctor else 'Неизвестно'
    item['specialization'] = doctor[1] if doctor else 'Неизвестно'
    return item


SPEC = CrudSpec(
    table='telemedicine_sessions',
    module='health',
    resource_type='telemedicine_session',
    select_columns=['id', 'profile_id', 'doctor_id', 'scheduled_at',
                    'duration', 'status', 'created_at'],
    serialize=lambda r: {
        'id': r[0],
        'profileId': r[1],
        'doctorId': r[2],
        'scheduledAt': r[3].isoformat() if r[3] else None,
        'duration': r[4],
        'status': r[5],
        'createdAt': r[6].isoformat() if r[6] else None,
    },
    insert_columns=['doctor_id', 'scheduled_at', 'duration', 'status'],
    insert_values=lambda b: (b.get('doctorId'), b.get('scheduledAt'),
                             b.get('duration'), b.get('status', 'scheduled')),
    update_columns=['status'],
    update_values=lambda b: (b.get('status'),),
    order_by='scheduled_at DESC',
    validate_write=_validate_doctor,
    postprocess=_attach_doctor,
)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    return run_crud(event, SPEC)
