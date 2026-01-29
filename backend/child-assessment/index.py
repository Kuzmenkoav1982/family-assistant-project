import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерирует анкету для оценки развития ребенка на основе возраста через YandexGPT API
    Args: event - dict с httpMethod, queryStringParameters (age_range)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с анкетой навыков по категориям
    '''
    print(f'[START] child-assessment handler called')
    print(f'[DEBUG] Event: {json.dumps(event)}')
    
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
    
    print(f'[DEBUG] Age range: {age_range}')
    
    age_ranges_map = {
        '0-6': 'от 0 до 6 месяцев',
        '6-12': 'от 6 до 12 месяцев',
        '1-2': 'от 1 года до 2 лет',
        '2-3': 'от 2 до 3 лет',
        '3-4': 'от 3 до 4 лет',
        '4-5': 'от 4 до 5 лет',
        '5-6': 'от 5 до 6 лет',
        '6-7': 'от 6 до 7 лет',
        '7-8': 'от 7 до 8 лет',
        '8-9': 'от 8 до 9 лет',
        '9-10': 'от 9 до 10 лет',
        '10-12': 'от 10 до 12 лет'
    }
    
    age_description = age_ranges_map.get(age_range, 'от 1 года до 2 лет')
    
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    # Используем проверенный folder_id из старого каталога (как в trips-ai-recommend)
    folder_id = 'b1gaglg8i7v2i32nvism'
    
    print(f'[DEBUG] API key present: {bool(api_key)}')
    print(f'[DEBUG] Folder ID: {folder_id}')
    
    if not api_key:
        print('[ERROR] YANDEX_GPT_API_KEY not set')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Не удалось загрузить анкету',
                'message': 'Не настроен ключ API для генерации анкет. Обратитесь к администратору.'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    # Определяем категории в зависимости от возраста
    is_school_age = age_range in ['7-8', '8-9', '9-10', '10-12']
    
    if is_school_age:
        categories_text = """5 категорий навыков:
1. Физическое развитие (спорт, координация, выносливость)
2. Учебные навыки (чтение, письмо, математика, логика)
3. Социальные навыки (дружба, эмпатия, конфликты, командная работа)
4. Самостоятельность (быт, тайм-менеджмент, ответственность)
5. Творчество и хобби (интересы, креативность, увлечения)"""
        
        examples = f"""Примеры правильных навыков для {age_description}:
- Физическое: "Катается на велосипеде без поддержки", "Плавает 25 метров"
- Учебные: "Читает текст про себя и пересказывает", "Решает задачи в 2 действия"
- Социальные: "Находит компромиссы в спорах", "Работает в команде над проектом"
- Самостоятельность: "Готовит простые блюда", "Планирует свой день"
- Творчество: "Играет на музыкальном инструменте", "Собирает модели/конструкторы"""
    else:
        categories_text = """5 категорий навыков:
1. Крупная моторика
2. Мелкая моторика
3. Речь и коммуникация
4. Социальные навыки
5. Когнитивное развитие"""
        
        examples = f"""Примеры правильных навыков:
- Для 0-6 месяцев: "Держит голову", "Переворачивается"
- Для 4-5 лет: "Прыгает на одной ноге", "Рисует человека из 6+ частей", "Использует сложные предложения"""
    
    prompt = f"""Создай структурированную анкету для оценки развития ребенка СТРОГО возраста {age_description}.

КРИТИЧЕСКИ ВАЖНО: Навыки должны соответствовать ТОЛЬКО этому возрасту, НЕ младше!

Анкета должна включать {categories_text}

Для каждой категории предложи 5-8 конкретных навыков, которые:
- ПОЯВЛЯЮТСЯ И РАЗВИВАЮТСЯ именно в возрасте {age_description}
- НЕ включают базовые навыки из младших возрастов
- Представляют НОВЫЕ достижения для этого возраста

{examples}

Формат ответа строго JSON:
{{
  "categories": [
    {{
      "name": "Название категории",
      "skills": [
        "Навык 1 соответствующий возрасту {age_description}",
        "Навык 2 соответствующий возрасту {age_description}"
      ]
    }}
  ]
}}

Требования:
- Конкретные и измеримые навыки
- СТРОГО соответствующие возрасту {age_description}, НЕ младше
- Понятные родителям без медицинского образования
- На русском языке

Верни ТОЛЬКО JSON, без дополнительного текста."""

    print(f'[DEBUG] Calling YandexGPT with folder_id: {folder_id}')

    try:
        yandex_response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
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
            },
            timeout=30
        )
        
        print(f'[DEBUG] YandexGPT response status: {yandex_response.status_code}')
        
    except Exception as e:
        print(f'[ERROR] Request exception: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Не удалось загрузить анкету',
                'message': f'Ошибка подключения к сервису генерации: {str(e)}'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if yandex_response.status_code != 200:
        error_details = 'Неизвестная ошибка'
        try:
            error_data = yandex_response.json()
            error_details = error_data.get('message', error_data)
            print(f'[ERROR] YandexGPT error response: {json.dumps(error_data)}')
        except:
            error_details = yandex_response.text[:200]
            print(f'[ERROR] YandexGPT error text: {error_details}')
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Не удалось загрузить анкету',
                'message': f'Ошибка API ({yandex_response.status_code}): {error_details}'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    result = yandex_response.json()
    print(f'[DEBUG] YandexGPT response received')
    
    content = result['result']['alternatives'][0]['message']['text'].strip()
    
    # Агрессивная очистка markdown и лишнего текста
    if content.startswith('```json'):
        content = content[7:]
    elif content.startswith('```'):
        content = content[3:]
    if content.endswith('```'):
        content = content[:-3]
    
    content = content.strip()
    
    # Поиск JSON в ответе (на случай если есть текст до/после)
    start = content.find('{')
    end = content.rfind('}')
    if start != -1 and end != -1:
        content = content[start:end+1]
    
    try:
        questionnaire = json.loads(content)
        print(f'[SUCCESS] Questionnaire parsed successfully')
    except json.JSONDecodeError as e:
        print(f'[ERROR] JSON parse error: {str(e)}')
        print(f'[ERROR] Content: {content[:500]}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Не удалось загрузить анкету',
                'message': 'Ошибка обработки данных анкеты. Попробуйте еще раз.',
                'details': str(e)
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    print(f'[SUCCESS] Returning questionnaire')
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
