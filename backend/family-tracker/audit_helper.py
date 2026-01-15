"""
Вспомогательный модуль для логирования геолокации
"""
import requests
from typing import Dict, Any, Optional

AUDIT_LOGGER_URL = 'https://functions.poehali.dev/4891fda0-83fb-499e-833a-b3b88aeb0c4f'

def log_location_update(
    user_id: int,
    lat: float,
    lng: float,
    accuracy: float
):
    """Логирование обновления геолокации"""
    try:
        requests.post(
            AUDIT_LOGGER_URL,
            json={
                'user_id': user_id,
                'action_type': 'location_update',
                'action_category': 'location',
                'details': {
                    'lat': round(lat, 6),
                    'lng': round(lng, 6),
                    'accuracy': round(accuracy, 2)
                },
                'status': 'success'
            },
            timeout=2
        )
    except:
        pass
