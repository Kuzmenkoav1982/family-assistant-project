"""
Business: страховые полисы членов семьи (ОМС/ДМС) — CRUD
Args: event с httpMethod, body, headers X-Auth-Token (обязательно)
Returns: JSON со списком полисов или результатом операции

Авторизация целиком в health_crud.run_crud. Номер полиса шифруется в БД
и никогда не попадает в аудит — журналируется только факт доступа.
"""

from typing import Any, Dict

from encryption_utils import decrypt_data, encrypt_data
from health_crud import CrudSpec, run_crud

SPEC = CrudSpec(
    table='insurance_policies',
    module='documents',
    resource_type='insurance_policy',
    select_columns=['id', 'profile_id', 'type', 'policy_number', 'provider',
                    'start_date', 'end_date', 'status', 'created_at'],
    serialize=lambda r: {
        'id': r[0],
        'profileId': r[1],
        'type': r[2],
        'policyNumber': decrypt_data(r[3]) if r[3] else '',
        'provider': r[4],
        'startDate': r[5].isoformat() if r[5] else None,
        'endDate': r[6].isoformat() if r[6] else None,
        'status': r[7],
        'coverage': [],
        'attachments': [],
        'createdAt': r[8].isoformat() if r[8] else None,
    },
    insert_columns=['type', 'policy_number', 'provider', 'start_date', 'end_date', 'status'],
    insert_values=lambda b: (b.get('type'), encrypt_data(b.get('policyNumber', '')),
                             b.get('provider'), b.get('startDate'), b.get('endDate'),
                             b.get('status', 'active')),
    update_columns=['policy_number', 'provider', 'end_date', 'status'],
    update_values=lambda b: (encrypt_data(b.get('policyNumber', '')), b.get('provider'),
                             b.get('endDate'), b.get('status', 'active')),
    order_by='status, end_date',
)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    return run_crud(event, SPEC)

# redeploy marker: wave-3 authz
