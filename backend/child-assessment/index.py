import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерирует анкету для оценки развития ребенка на основе возраста
    Args: event - dict с httpMethod, queryStringParameters (age_range)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с анкетой навыков по категориям
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    age_range: str = params.get('age_range', '1-2')
    
    age_ranges_map = {
        '0-6': 'от 0 до 6 месяцев',
        '6-12': 'от 6 до 12 месяцев',
        '1-2': 'от 1 года до 2 лет',
        '2-3': 'от 2 до 3 лет',
        '3-4': 'от 3 до 4 лет',
        '4-5': 'от 4 до 5 лет',
        '5-6': 'от 5 до 6 лет',
        '6-7': 'от 6 до 7 лет'
    }
    
    age_description = age_ranges_map.get(age_range, 'от 1 года до 2 лет')
    
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    
    prompt = f"""Создай структурированную анкету для оценки развития ребенка возраста {age_description}.

Анкета должна включать 5 категорий навыков:
1. Крупная моторика
2. Мелкая моторика
3. Речь и коммуникация
4. Социальные навыки
5. Когнитивное развитие

Для каждой категории предложи 5-8 конкретных навыков, которые типичны для этого возраста.

Формат ответа строго JSON:
{{
  "categories": [
    {{
      "name": "Крупная моторика",
      "skills": [
        "Может самостоятельно сидеть",
        "Переворачивается со спины на живот"
      ]
    }}
  ]
}}

Навыки должны быть:
- Конкретные и измеримые
- Соответствующие возрастным нормам
- Понятные родителям без медицинского образования
- На русском языке

Верни ТОЛЬКО JSON, без дополнительного текста."""

    yandex_response = requests.post(
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
                'maxTokens': 2000
            },
            'messages': [
                {
                    'role': 'user',
                    'text': prompt
                }
            ]
        }
    )
    
    if yandex_response.status_code != 200:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YandexGPT API error'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    result = yandex_response.json()
    content = result['result']['alternatives'][0]['message']['text'].strip()
    
    if content.startswith('```json'):
        content = content[7:]
    if content.startswith('```'):
        content = content[3:]
    if content.endswith('```'):
        content = content[:-3]
    
    questionnaire = json.loads(content.strip())
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'age_range': age_range,
            'age_description': age_description,
            'questionnaire': questionnaire
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }