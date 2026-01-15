"""
Вспомогательный модуль для логирования действий в функции auth
"""
import requests
import json
from typing import Dict, Any, Optional

AUDIT_LOGGER_URL = 'https://functions.poehali.dev/4891fda0-83fb-499e-833a-b3b88aeb0c4f'

def log_auth_action(
    user_id: int,
    action_type: str,
    details: Optional[Dict] = None,
    status: str = 'success',
    error_message: Optional[str] = None
):
    """
    Асинхронное логирование действий авторизации
    
    action_type: login, logout, register, password_change, password_reset
    """
    try:
        requests.post(
            AUDIT_LOGGER_URL,
            json={
                'user_id': user_id,
                'action_type': action_type,
                'action_category': 'auth',
                'details': details,
                'status': status,
                'error_message': error_message
            },
            timeout=2
        )
    except:
        pass
