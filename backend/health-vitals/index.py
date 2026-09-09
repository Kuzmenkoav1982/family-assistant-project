"""
Business: дневник показателей здоровья (вес, рост, давление, пульс, температура, глюкоза)
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком показателей или результатом операции

Авторизация целиком в health_crud.run_crud: actor только из серверной сессии,
список ограничен доступными субъектами, PUT/DELETE проверяют принадлежность
записи семье и доступ к данным конкретного человека.
Значения показателей в аудит не пишутся — только факт доступа.
"""

from typing import Any, Dict

from health_crud import CrudSpec, run_crud

SPEC = CrudSpec(
    table='vital_records',
    module='health',
    resource_type='vital_record',
    select_columns=['id', 'profile_id', 'type', 'value', 'unit', 'date', 'time', 'created_at'],
    serialize=lambda r: {
        'id': r[0],
        'profileId': r[1],
        'type': r[2],
        'value': r[3],
        'unit': r[4],
        'date': r[5].isoformat() if r[5] else None,
        'time': str(r[6]) if r[6] else None,
        'createdAt': r[7].isoformat() if r[7] else None,
    },
    insert_columns=['type', 'value', 'unit', 'date', 'time'],
    insert_values=lambda b: (b.get('type'), b.get('value'), b.get('unit'),
                             b.get('date'), b.get('time') or '00:00'),
    update_columns=['type', 'value', 'unit', 'date', 'time'],
    update_values=lambda b: (b.get('type'), b.get('value'), b.get('unit'),
                             b.get('date'), b.get('time') or '00:00'),
    order_by='date DESC, time DESC',
    limit=100,
)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    return run_crud(event, SPEC)
