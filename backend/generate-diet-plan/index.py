"""
Генерация персонального плана питания на неделю через YandexGPT.
Принимает данные анкеты пользователя и возвращает план с блюдами на 7 дней.
"""

import json
import os
import requests
from typing import Dict, Any, Optional


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Генерация персонального плана питания на неделю через YandexGPT"""
    method = event.get('httpMethod', 'POST')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': '', 'isBase64Encoded': False}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')

    if not api_key or not folder_id:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'API ключи не настроены'}),
            'isBase64Encoded': False
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body)
    quiz_data = body.get('quizData', {})
    program_data = body.get('programData', {})

    if not quiz_data and not program_data:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Данные анкеты не переданы'}),
            'isBase64Encoded': False
        }

    if program_data:
        prompt = build_program_prompt(program_data)
    else:
        prompt = build_prompt(quiz_data)

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
    headers = {
        'Authorization': f'Api-Key {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt/latest',
        'completionOptions': {
            'stream': False,
            'temperature': 0.4,
            'maxTokens': 8000
        },
        'messages': [
            {
                'role': 'system',
                'text': 'Ты профессиональный диетолог-нутрициолог. Составляй планы питания строго в формате JSON. Не добавляй пояснений вне JSON. Отвечай ТОЛЬКО валидным JSON.'
            },
            {
                'role': 'user',
                'text': prompt
            }
        ]
    }

    print(f"[generate-diet-plan] Calling YandexGPT, folder={folder_id}")
    response = requests.post(url, headers=headers, json=payload, timeout=120)
    print(f"[generate-diet-plan] YandexGPT status={response.status_code}")

    if response.status_code != 200:
        print(f"[generate-diet-plan] YandexGPT error: {response.text[:500]}")
        return {
            'statusCode': 502,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Ошибка YandexGPT',
                'details': response.text[:500],
                'status': response.status_code
            }),
            'isBase64Encoded': False
        }

    result = response.json()
    ai_text = result.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')

    plan = parse_plan(ai_text)

    if not plan:
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'plan': None,
                'rawText': ai_text,
                'message': 'План сгенерирован, но не удалось разобрать JSON. Показываем текст.'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'plan': plan
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }


def build_program_prompt(data: Dict[str, Any]) -> str:
    budget_map = {
        'economy': 'экономный (до 500 руб/день)',
        'medium': 'средний (500-1000 руб/день)',
        'premium': 'без ограничений'
    }
    complexity_map = {
        'simple': 'простые (до 5 ингредиентов)',
        'medium': 'средней сложности',
        'complex': 'любой сложности'
    }

    program_name = data.get('program_name', 'Стандартное питание')
    program_slug = data.get('program_slug', '')
    servings = data.get('servings_count', '1')
    budget = budget_map.get(data.get('budget', ''), data.get('budget', ''))
    complexity = complexity_map.get(data.get('cooking_complexity', ''), data.get('cooking_complexity', ''))
    cooking_time = data.get('cooking_time_max', '30')
    disliked = ', '.join(data.get('disliked_foods', [])) or 'нет'
    allowed = ', '.join(data.get('allowed_foods', []))
    forbidden = ', '.join(data.get('forbidden_foods', []))
    principles = '\n'.join(f'- {p}' for p in data.get('principles', []))

    return f"""Составь план питания на 7 дней по программе "{program_name}".

Правила программы:
{principles}

Разрешённые продукты: {allowed}
Запрещённые продукты: {forbidden}

Дополнительные параметры:
- Порций на каждое блюдо: {servings} чел.
- Бюджет: {budget}
- Сложность блюд: {complexity}
- Макс. время готовки: {cooking_time} минут
- Нелюбимые продукты: {disliked}

Верни ТОЛЬКО JSON (без markdown, без ```):
{{
  "daily_calories": число,
  "daily_protein": число,
  "daily_fats": число,
  "daily_carbs": число,
  "days": [
    {{
      "day": "Понедельник",
      "meals": [
        {{
          "type": "breakfast",
          "time": "08:00",
          "name": "Название блюда",
          "description": "Краткое описание",
          "calories": число,
          "protein": число,
          "fats": число,
          "carbs": число,
          "ingredients": ["продукт 1 — 100г", "продукт 2 — 50г"],
          "cooking_time_min": число,
          "emoji": "подходящий эмодзи"
        }}
      ]
    }}
  ]
}}

Каждый день должен содержать 4 приёма: breakfast, lunch, dinner, snack.
Строго соблюдай правила программы "{program_name}".
Блюда должны быть разнообразными каждый день. Указывай граммовки в ингредиентах.
Рассчитай порции на {servings} чел."""


def build_prompt(data: Dict[str, Any]) -> str:
    gender_map = {'male': 'мужчина', 'female': 'женщина'}
    activity_map = {
        'sedentary': 'малоподвижный',
        'light': 'лёгкая активность',
        'moderate': 'умеренная активность',
        'active': 'высокая активность',
        'very_active': 'очень высокая активность'
    }
    budget_map = {
        'economy': 'экономный (до 500₽/день)',
        'medium': 'средний (500-1000₽/день)',
        'premium': 'без ограничений'
    }
    complexity_map = {
        'simple': 'простые (до 15 минут)',
        'medium': 'средней сложности (15-40 минут)',
        'complex': 'сложные (от 40 минут)'
    }

    gender = gender_map.get(data.get('gender', ''), data.get('gender', ''))
    age = data.get('age', '')
    height = data.get('height_cm', '')
    weight = data.get('current_weight_kg', '')
    target = data.get('target_weight_kg', '')
    activity = activity_map.get(data.get('activity_level', ''), data.get('activity_level', ''))
    budget = budget_map.get(data.get('budget', ''), data.get('budget', ''))
    complexity = complexity_map.get(data.get('cooking_complexity', ''), data.get('cooking_complexity', ''))
    diseases = ', '.join(data.get('chronic_diseases', [])) or 'нет'
    allergies = ', '.join(data.get('allergies', [])) or 'нет'
    disliked = ', '.join(data.get('disliked_foods', [])) or 'нет'
    cuisines = ', '.join(data.get('cuisine_preferences', [])) or 'любая'
    diet_type = data.get('diet_type', '') or 'стандартное'
    cooking_time = data.get('cooking_time_max', '30')
    wake_time = data.get('wake_time', '07:00')
    sleep_time = data.get('sleep_time', '23:00')

    return f"""Составь план питания на 7 дней для человека:
- Пол: {gender}, возраст: {age} лет
- Рост: {height} см, вес: {weight} кг, цель: {target} кг
- Активность: {activity}
- Хронические заболевания: {diseases}
- Аллергии/непереносимость: {allergies}
- Нелюбимые продукты: {disliked}
- Тип питания: {diet_type}
- Кухня: {cuisines}
- Бюджет: {budget}
- Сложность блюд: {complexity}
- Макс. время готовки: {cooking_time} минут
- Подъём: {wake_time}, отбой: {sleep_time}

Верни ТОЛЬКО JSON (без markdown, без ```):
{{
  "daily_calories": число,
  "daily_protein": число,
  "daily_fats": число,
  "daily_carbs": число,
  "days": [
    {{
      "day": "Понедельник",
      "meals": [
        {{
          "type": "breakfast",
          "time": "08:00",
          "name": "Название блюда",
          "description": "Краткое описание",
          "calories": число,
          "protein": число,
          "fats": число,
          "carbs": число,
          "ingredients": ["продукт 1", "продукт 2"],
          "cooking_time_min": число,
          "emoji": "подходящий эмодзи"
        }}
      ]
    }}
  ]
}}

Каждый день должен содержать 4 приёма: breakfast, lunch, dinner, snack.
Калорийность должна соответствовать цели (похудение/набор/поддержание).
Учти все заболевания, аллергии и предпочтения. Блюда должны быть разнообразными каждый день."""


def parse_plan(text: str) -> Optional[Dict[str, Any]]:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        lines = lines[1:] if lines[0].startswith('```') else lines
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        cleaned = '\n'.join(lines)

    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start == -1 or end == -1:
        return None

    json_str = cleaned[start:end + 1]

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None