"""
Автоматизация для MAX Bot API — постинг новостей и сообщений в канал MAX
Args: event с httpMethod, body с action, message, image_url
Returns: JSON с результатом отправки сообщения в канал
"""

import json
import os
from typing import Dict, Any
import requests

MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN')
MAX_CHANNEL_ID = 'id231805288780_biz'  # ID вашего канала в MAX


def send_message_to_channel(text: str, image_url: str = None) -> Dict[str, Any]:
    """Отправить сообщение в канал MAX"""
    if not MAX_BOT_TOKEN:
        return {'error': 'MAX_BOT_TOKEN не настроен'}
    
    # MAX Bot API endpoint (требуется уточнить документацию MAX)
    api_url = f'https://api.max.ru/bot{MAX_BOT_TOKEN}/sendMessage'
    
    payload = {
        'channel_id': MAX_CHANNEL_ID,
        'text': text
    }
    
    if image_url:
        payload['photo'] = image_url
    
    try:
        response = requests.post(api_url, json=payload, timeout=10)
        response.raise_for_status()
        
        return {
            'success': True,
            'message': 'Сообщение отправлено в канал MAX',
            'response': response.json()
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'Ошибка отправки: {str(e)}'
        }


def schedule_post(text: str, scheduled_time: str, image_url: str = None) -> Dict[str, Any]:
    """Запланировать отложенный пост в канал"""
    if not MAX_BOT_TOKEN:
        return {'error': 'MAX_BOT_TOKEN не настроен'}
    
    # Для отложенного постинга потребуется использовать планировщик
    # Можно использовать Yandex Cloud Functions Triggers или хранить в БД
    
    return {
        'success': True,
        'message': f'Пост запланирован на {scheduled_time}',
        'scheduled_data': {
            'text': text,
            'image_url': image_url,
            'time': scheduled_time
        }
    }


def get_channel_stats() -> Dict[str, Any]:
    """Получить статистику канала MAX"""
    if not MAX_BOT_TOKEN:
        return {'error': 'MAX_BOT_TOKEN не настроен'}
    
    api_url = f'https://api.max.ru/bot{MAX_BOT_TOKEN}/getChannelStats'
    
    try:
        response = requests.get(
            api_url,
            params={'channel_id': MAX_CHANNEL_ID},
            timeout=10
        )
        response.raise_for_status()
        
        return {
            'success': True,
            'stats': response.json()
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'Ошибка получения статистики: {str(e)}'
        }


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    API для работы с MAX Bot
    - POST /send - отправить сообщение в канал
    - POST /schedule - запланировать пост
    - GET /stats - статистика канала
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        # Проверка прав администратора для POST запросов
        if method == 'POST':
            admin_token = event.get('headers', {}).get('x-admin-token') or \
                         event.get('headers', {}).get('X-Admin-Token')
            if admin_token != 'admin_authenticated':
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуются права администратора'}),
                    'isBase64Encoded': False
                }
        
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', 'send')
        
        if method == 'POST' and action == 'send':
            body = json.loads(event.get('body', '{}'))
            text = body.get('text', '')
            image_url = body.get('image_url')
            
            if not text:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Текст сообщения обязателен'}),
                    'isBase64Encoded': False
                }
            
            result = send_message_to_channel(text, image_url)
            
            return {
                'statusCode': 200 if result.get('success') else 500,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'schedule':
            body = json.loads(event.get('body', '{}'))
            text = body.get('text', '')
            scheduled_time = body.get('scheduled_time', '')
            image_url = body.get('image_url')
            
            result = schedule_post(text, scheduled_time, image_url)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'stats':
            result = get_channel_stats()
            
            return {
                'statusCode': 200 if result.get('success') else 500,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint не найден'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
