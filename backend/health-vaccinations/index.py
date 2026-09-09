"""
Business: прививки членов семьи и национальный календарь прививок
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком прививок, справочником календаря или результатом операции

Авторизация в health_crud.run_crud. Подпуть /schedule — общий справочник
без персональных данных, поэтому отдаётся любому аутентифицированному
пользователю (сессия всё равно требуется).
"""

from typing import Any, Dict, Optional

from auth_guard import json_response
from health_crud import CrudSpec, run_crud

SPEC = CrudSpec(
    table='vaccinations',
    module='health',
    resource_type='vaccination',
    select_columns=['id', 'profile_id', 'name', 'date', 'next_date',
                    'clinic', 'batch_number', 'created_at'],
    serialize=lambda r: {
        'id': r[0],
        'profileId': r[1],
        'name': r[2],
        'date': r[3].isoformat() if r[3] else None,
        'nextDate': r[4].isoformat() if r[4] else None,
        'clinic': r[5],
        'batchNumber': r[6],
        'attachments': [],
        'createdAt': r[7].isoformat() if r[7] else None,
    },
    insert_columns=['name', 'date', 'next_date', 'clinic', 'batch_number'],
    insert_values=lambda b: (b.get('name'), b.get('date'), b.get('nextDate'),
                             b.get('clinic'), b.get('batchNumber')),
    update_columns=['name', 'date', 'next_date', 'clinic', 'batch_number'],
    update_values=lambda b: (b.get('name'), b.get('date'), b.get('nextDate'),
                             b.get('clinic'), b.get('batchNumber')),
    order_by='date DESC',
)


def _schedule(event, ctx, cursor) -> Optional[Dict[str, Any]]:
    """Национальный календарь прививок — справочник, персональных данных нет."""
    if '/schedule' not in (event.get('path') or ''):
        return None
    cursor.execute(
        """SELECT id, name, age_months, description, is_mandatory
           FROM vaccination_schedule ORDER BY age_months ASC"""
    )
    schedule = [{
        'id': r[0], 'name': r[1], 'ageMonths': r[2],
        'description': r[3], 'isMandatory': r[4],
    } for r in cursor.fetchall()]
    return json_response(schedule, 200, event)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    return run_crud(event, SPEC, extra_get=_schedule)
