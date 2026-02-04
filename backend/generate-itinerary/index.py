"""
API для генерации туристических маршрутов с помощью YandexGPT.
Принимает параметры поездки и возвращает детальный маршрут с достопримечательностями.
"""

import json
import os
import requests
from typing import Dict, Any


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Генерирует туристический маршрут на основе параметров поездки.
    
    Параметры:
    - location: город/страна назначения
    - duration: длительность поездки в днях
    - interests: интересы пользователя (культура, природа, еда и т.д.)
    - budget: уровень бюджета (low, medium, high)
    """
    
    method = event.get('httpMethod', 'POST')
    
    # CORS обработка
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Парсим входные данные
    try:
        body = json.loads(event.get('body', '{}'))
        location = body.get('location', '')
        duration = body.get('duration', 3)
        interests = body.get('interests', [])
        budget = body.get('budget', 'medium')
        
        if not location:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Location is required'})
            }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    
    # Получаем API ключи
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    
    if not api_key or not folder_id:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'API configuration error'})
        }
    
    # Формируем промпт для YandexGPT
    interests_text = ', '.join(interests) if interests else 'разнообразные интересы'
    budget_text = {
        'low': 'экономный бюджет',
        'medium': 'средний бюджет',
        'high': 'неограниченный бюджет'
    }.get(budget, 'средний бюджет')
    
    prompt = f"""Создай детальный туристический маршрут для поездки в {location} на {duration} дн.
    
Интересы: {interests_text}
Бюджет: {budget_text}

Требования к ответу:
1. Структурируй маршрут по дням
2. Для каждого дня укажи 3-5 достопримечательностей или мест
3. Добавь краткое описание каждого места (2-3 предложения)
4. Укажи примерное время на посещение
5. Добавь практические советы по перемещению между местами

Формат ответа - JSON:
{{
  "title": "Название маршрута",
  "description": "Краткое описание",
  "days": [
    {{
      "day": 1,
      "theme": "Тема дня",
      "places": [
        {{
          "name": "Название места",
          "description": "Описание",
          "duration": "Время на посещение",
          "tips": "Практические советы"
        }}
      ]
    }}
  ],
  "generalTips": ["Общий совет 1", "Общий совет 2"]
}}

Ответь ТОЛЬКО валидным JSON, без дополнительного текста."""

    # Запрос к YandexGPT API
    try:
        response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
                'completionOptions': {
                    'stream': False,
                    'temperature': 0.7,
                    'maxTokens': 3000
                },
                'messages': [
                    {
                        'role': 'system',
                        'text': 'Ты опытный туристический гид. Создаешь детальные и практичные маршруты путешествий.'
                    },
                    {
                        'role': 'user',
                        'text': prompt
                    }
                ]
            },
            timeout=60
        )
        
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'YandexGPT API error',
                    'details': response.text
                })
            }
        
        result = response.json()
        
        # Извлекаем текст ответа
        gpt_text = result.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
        
        if not gpt_text:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Empty response from YandexGPT'})
            }
        
        # Парсим JSON из ответа
        # Убираем возможные markdown блоки кода
        gpt_text = gpt_text.strip()
        if gpt_text.startswith('```json'):
            gpt_text = gpt_text[7:]
        if gpt_text.startswith('```'):
            gpt_text = gpt_text[3:]
        if gpt_text.endswith('```'):
            gpt_text = gpt_text[:-3]
        gpt_text = gpt_text.strip()
        
        itinerary = json.loads(gpt_text)
        
        # Добавляем метаданные
        itinerary['metadata'] = {
            'location': location,
            'duration': duration,
            'interests': interests,
            'budget': budget,
            'generatedAt': context.request_id
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(itinerary, ensure_ascii=False)
        }
        
    except requests.Timeout:
        return {
            'statusCode': 504,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Request timeout'})
        }
    except json.JSONDecodeError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to parse YandexGPT response',
                'details': str(e),
                'raw_response': gpt_text[:500]
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            })
        }
