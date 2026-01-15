"""
Вспомогательный модуль для проверки Rate Limit в auth
"""
import requests
from typing import Optional

RATE_LIMITER_URL = 'https://functions.poehali.dev/23dfd616-ea1a-480a-8c72-4702c42ac121'

def check_rate_limit(ip_address: str, action_type: str = 'auth') -> bool:
    """
    Проверка лимита запросов перед авторизацией
    
    Returns:
        True если запрос разрешён, False если превышен лимит
    """
    try:
        response = requests.post(
            RATE_LIMITER_URL,
            json={
                'action_type': action_type,
                'log_attempt': True
            },
            headers={'X-Forwarded-For': ip_address},
            timeout=2
        )
        
        if response.status_code == 429:
            return False  # Лимит превышен
        
        data = response.json()
        return data.get('allowed', False)
    except:
        # В случае ошибки разрешаем запрос (fail-open)
        return True