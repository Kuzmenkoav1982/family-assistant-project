"""
Генерация персонального плана питания через YandexGPT (асинхронный режим).
Два действия: start — запускает генерацию, check — проверяет результат.
"""

import json
import os
import requests
from typing import Dict, Any, Optional


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Access-Control-Max-Age': '86400'
}


def respond(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False) if isinstance(body, dict) else body,
        'isBase64Encoded': False
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Генерация плана питания через YandexGPT (async: start + check)"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    if method != 'POST':
        return respond(405, {'error': 'Method not allowed'})

    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')

    if not api_key or not folder_id:
        return respond(500, {'error': 'API ключи не настроены'})

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body)
    action = body.get('action', 'start')

    if action == 'check':
        return handle_check(api_key, body)

    if action == 'recipe':
        return handle_recipe_start(api_key, folder_id, body)

    if action == 'check_recipe':
        return handle_recipe_check(api_key, body)

    if action == 'generate_photo':
        return handle_photo_start(api_key, folder_id, body)

    if action == 'check_photo':
        return handle_photo_check(api_key, body)

    return handle_start(api_key, folder_id, body)


def handle_start(api_key: str, folder_id: str, body: Dict) -> Dict[str, Any]:
    quiz_data = body.get('quizData', {})
    program_data = body.get('programData', {})

    if not quiz_data and not program_data:
        return respond(400, {'error': 'Данные анкеты не переданы'})

    if program_data:
        prompt = build_program_prompt(program_data)
    else:
        prompt = build_prompt(quiz_data)

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completionAsync'
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

    print(f"[generate-diet-plan] Starting async generation, folder={folder_id}")
    response = requests.post(url, headers=headers, json=payload, timeout=25)
    print(f"[generate-diet-plan] Async start status={response.status_code}")

    if response.status_code != 200:
        print(f"[generate-diet-plan] Error: {response.text[:500]}")
        return respond(502, {
            'error': 'Ошибка YandexGPT',
            'details': response.text[:500],
            'status': response.status_code
        })

    result = response.json()
    operation_id = result.get('id', '')
    print(f"[generate-diet-plan] Operation started: {operation_id}")

    return respond(200, {
        'success': True,
        'status': 'started',
        'operationId': operation_id
    })


def handle_check(api_key: str, body: Dict) -> Dict[str, Any]:
    operation_id = body.get('operationId', '')
    if not operation_id:
        return respond(400, {'error': 'operationId не передан'})

    url = f'https://operation.api.cloud.yandex.net/operations/{operation_id}'
    headers = {'Authorization': f'Api-Key {api_key}'}

    print(f"[generate-diet-plan] Checking operation: {operation_id}")
    response = requests.get(url, headers=headers, timeout=25)
    print(f"[generate-diet-plan] Check status={response.status_code}")

    if response.status_code != 200:
        return respond(502, {
            'error': 'Ошибка проверки статуса',
            'details': response.text[:500]
        })

    result = response.json()
    done = result.get('done', False)

    if not done:
        return respond(200, {
            'success': True,
            'status': 'processing'
        })

    if 'error' in result:
        return respond(200, {
            'success': False,
            'status': 'error',
            'error': result['error'].get('message', 'Ошибка генерации')
        })

    ai_response = result.get('response', {})
    alternatives = ai_response.get('alternatives', [])
    ai_text = alternatives[0].get('message', {}).get('text', '') if alternatives else ''

    plan = parse_plan(ai_text)

    if not plan:
        return respond(200, {
            'success': True,
            'status': 'done',
            'plan': None,
            'rawText': ai_text,
            'message': 'План сгенерирован, но не удалось разобрать JSON.'
        })

    return respond(200, {
        'success': True,
        'status': 'done',
        'plan': plan
    })


def handle_recipe_start(api_key: str, folder_id: str, body: Dict) -> Dict[str, Any]:
    dish_name = body.get('dishName', '')
    ingredients = body.get('ingredients', [])

    if not dish_name:
        return respond(400, {'error': 'Название блюда не передано'})

    ing_text = ', '.join(ingredients) if ingredients else 'не указаны'

    prompt = f"""Напиши пошаговый рецепт приготовления блюда "{dish_name}".
Ингредиенты: {ing_text}

Верни ТОЛЬКО JSON-массив строк (каждая строка — один шаг приготовления, без нумерации):
["Шаг 1 текст", "Шаг 2 текст", ...]

Количество шагов: 4-8. Кратко и понятно. Без markdown."""

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completionAsync'
    headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}
    payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
        'completionOptions': {'stream': False, 'temperature': 0.3, 'maxTokens': 1500},
        'messages': [
            {'role': 'system', 'text': 'Ты шеф-повар. Пиши рецепты кратко и чётко. Отвечай ТОЛЬКО JSON-массивом строк.'},
            {'role': 'user', 'text': prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=payload, timeout=25)
    if response.status_code != 200:
        return respond(502, {'error': 'Ошибка YandexGPT'})

    result = response.json()
    return respond(200, {'success': True, 'status': 'started', 'operationId': result.get('id', '')})


def handle_recipe_check(api_key: str, body: Dict) -> Dict[str, Any]:
    operation_id = body.get('operationId', '')
    if not operation_id:
        return respond(400, {'error': 'operationId не передан'})

    url = f'https://operation.api.cloud.yandex.net/operations/{operation_id}'
    headers = {'Authorization': f'Api-Key {api_key}'}
    response = requests.get(url, headers=headers, timeout=25)

    if response.status_code != 200:
        return respond(502, {'error': 'Ошибка проверки'})

    result = response.json()
    if not result.get('done', False):
        return respond(200, {'success': True, 'status': 'processing'})

    if 'error' in result:
        return respond(200, {'success': False, 'status': 'error', 'error': result['error'].get('message', '')})

    ai_text = result.get('response', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')

    recipe = parse_recipe(ai_text)
    return respond(200, {'success': True, 'status': 'done', 'recipe': recipe})


def parse_recipe(text: str) -> list:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        lines = lines[1:] if lines[0].startswith('```') else lines
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        cleaned = '\n'.join(lines)

    start = cleaned.find('[')
    end = cleaned.rfind(']')
    if start != -1 and end != -1:
        try:
            arr = json.loads(cleaned[start:end + 1])
            if isinstance(arr, list):
                return [str(s) for s in arr]
        except json.JSONDecodeError:
            pass

    return [line.strip().lstrip('0123456789.-) ') for line in cleaned.split('\n') if line.strip() and len(line.strip()) > 5]


def handle_photo_start(api_key: str, folder_id: str, body: Dict) -> Dict[str, Any]:
    dish_name = body.get('dishName', '')
    description = body.get('description', '')

    if not dish_name:
        return respond(400, {'error': 'Название блюда не передано'})

    art_api_key = os.environ.get('YANDEX_ART_API_KEY', api_key)

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync'
    headers = {'Authorization': f'Api-Key {art_api_key}', 'Content-Type': 'application/json'}
    payload = {
        'modelUri': f'art://{folder_id}/yandex-art/latest',
        'generationOptions': {'seed': 42},
        'messages': [
            {
                'weight': 1,
                'text': f'Фотореалистичное изображение блюда "{dish_name}". {description}. Красивая подача на тарелке, вид сверху, профессиональная фуд-фотография, тёплое освещение.'
            }
        ]
    }

    print(f"[generate-diet-plan] Starting photo generation for: {dish_name}")
    response = requests.post(url, headers=headers, json=payload, timeout=25)
    print(f"[generate-diet-plan] Photo start status={response.status_code}")

    if response.status_code != 200:
        print(f"[generate-diet-plan] Photo error: {response.text[:300]}")
        return respond(502, {'error': 'Ошибка генерации фото'})

    result = response.json()
    return respond(200, {'success': True, 'status': 'started', 'operationId': result.get('id', '')})


def handle_photo_check(api_key: str, body: Dict) -> Dict[str, Any]:
    operation_id = body.get('operationId', '')
    if not operation_id:
        return respond(400, {'error': 'operationId не передан'})

    art_api_key = os.environ.get('YANDEX_ART_API_KEY', api_key)

    url = f'https://operation.api.cloud.yandex.net/operations/{operation_id}'
    headers = {'Authorization': f'Api-Key {art_api_key}'}
    response = requests.get(url, headers=headers, timeout=25)

    if response.status_code != 200:
        return respond(502, {'error': 'Ошибка проверки фото'})

    result = response.json()
    if not result.get('done', False):
        return respond(200, {'success': True, 'status': 'processing'})

    if 'error' in result:
        return respond(200, {'success': False, 'status': 'error', 'error': result['error'].get('message', '')})

    import base64

    image_b64 = result.get('response', {}).get('image', '')
    if not image_b64:
        return respond(200, {'success': False, 'status': 'error', 'error': 'Изображение не получено'})

    try:
        import boto3
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )

        import hashlib
        file_hash = hashlib.md5(image_b64[:100].encode()).hexdigest()[:12]
        key = f'diet-photos/{file_hash}.png'

        s3.put_object(
            Bucket='files',
            Key=key,
            Body=base64.b64decode(image_b64),
            ContentType='image/png'
        )

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        return respond(200, {'success': True, 'status': 'done', 'imageUrl': cdn_url})
    except Exception as e:
        print(f"[generate-diet-plan] S3 upload error: {e}")
        return respond(200, {
            'success': True,
            'status': 'done',
            'imageUrl': f'data:image/png;base64,{image_b64[:100000]}'
        })


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