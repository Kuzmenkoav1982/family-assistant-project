"""
Вспомогательный модуль для логирования экспорта данных
"""
import requests
from typing import Dict, Any, Optional

AUDIT_LOGGER_URL = 'https://functions.poehali.dev/4891fda0-83fb-499e-833a-b3b88aeb0c4f'

def log_data_export(
    user_id: int,
    export_format: str,
    records_count: int = 0
):
    """Логирование экспорта данных"""
    try:
        requests.post(
            AUDIT_LOGGER_URL,
            json={
                'user_id': user_id,
                'action_type': 'data_export',
                'action_category': 'data_export',
                'details': {
                    'format': export_format,
                    'records_count': records_count
                },
                'status': 'success'
            },
            timeout=2
        )
    except:
        pass
