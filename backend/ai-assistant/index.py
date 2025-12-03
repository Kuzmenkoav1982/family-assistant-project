import json
import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI-ассистент для семьи на базе YandexGPT
    Args: event - dict с httpMethod, body (messages, systemPrompt)
          context - object с request_id
    Returns: HTTP response с ответом от AI
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # CORS для всех запросов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем данные запроса
        body_data = json.loads(event.get('body', '{}'))
        messages: List[Dict[str, str]] = body_data.get('messages', [])
        system_prompt: Optional[str] = body_data.get('systemPrompt')
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указаны сообщения'}),
                'isBase64Encoded': False
            }
        
        # Получаем credentials
        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')
        
        if not api_key or not folder_id:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не настроены ключи YandexGPT'}),
                'isBase64Encoded': False
            }
        
        # Формируем запрос к YandexGPT
        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        
        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Подготавливаем сообщения для YandexGPT
        yandex_messages = []
        
        # Добавляем системный промпт, если есть
        if system_prompt:
            yandex_messages.append({
                'role': 'system',
                'text': system_prompt
            })
        
        # Добавляем сообщения пользователя
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            # YandexGPT использует 'user' и 'assistant'
            if role in ['user', 'assistant']:
                yandex_messages.append({
                    'role': role,
                    'text': content
                })
        
        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 2000
            },
            'messages': yandex_messages
        }
        
        # Отправляем запрос к YandexGPT
        print(f'[DEBUG] Отправка запроса к YandexGPT. ModelUri: gpt://{folder_id}/yandexgpt-lite')
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            error_text = response.text
            print(f'[ERROR] YandexGPT вернул {response.status_code}: {error_text}')
            return {
                'statusCode': response.status_code,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': f'Ошибка YandexGPT: {error_text}'
                }),
                'isBase64Encoded': False
            }
        
        # Парсим ответ
        result = response.json()
        alternatives = result.get('result', {}).get('alternatives', [])
        
        if not alternatives:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Пустой ответ от YandexGPT'}),
                'isBase64Encoded': False
            }
        
        # Получаем текст ответа
        ai_response = alternatives[0].get('message', {}).get('text', '')
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'response': ai_response,
                'model': 'yandexgpt-lite',
                'timestamp': datetime.now().isoformat()
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный формат JSON'}),
            'isBase64Encoded': False
        }
    except requests.Timeout:
        return {
            'statusCode': 504,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Превышено время ожидания ответа от YandexGPT'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }