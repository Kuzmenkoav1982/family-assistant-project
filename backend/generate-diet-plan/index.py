"""
Генерация персонального плана питания через YandexGPT (асинхронный режим).
Два действия: start — запускает генерацию, check — проверяет результат.
Списание с семейного кошелька при каждой генерации.
"""

import json
import os
import requests
import psycopg2
from typing import Dict, Any, Optional


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Access-Control-Max-Age': '86400'
}

PRICES = {
    'start': 17,
    'recipe': 2,
    'generate_photo': 7,
    'greeting_photo': 7,
    'recipe_from_products': 5,
}

REASON_MAP = {
    'start': 'ai_diet_plan',
    'recipe': 'ai_recipe',
    'generate_photo': 'ai_photo',
    'greeting_photo': 'ai_greeting',
    'recipe_from_products': 'ai_recipe',
}

DESC_MAP = {
    'start': 'ИИ-диета',
    'recipe': 'Рецепт ИИ',
    'generate_photo': 'Фото блюда ИИ',
    'greeting_photo': 'ИИ-открытка',
    'recipe_from_products': 'Рецепт из продуктов',
}


def respond(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False) if isinstance(body, dict) else body,
        'isBase64Encoded': False
    }


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_and_family(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None, None
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT s.user_id FROM sessions s WHERE s.token = '%s' AND s.expires_at > NOW()"
            % token.replace("'", "''")
        )
        row = cur.fetchone()
        if not row:
            return None, None
        user_id = row[0]
        cur.execute(
            "SELECT family_id FROM family_members WHERE user_id = '%s' LIMIT 1"
            % str(user_id)
        )
        fm = cur.fetchone()
        return user_id, fm[0] if fm else None
    finally:
        conn.close()


def wallet_spend(user_id, family_id, amount, reason, description):
    if not family_id:
        return {'error': 'no_family'}
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % str(family_id)
        )
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub"
                % str(family_id)
            )
            row = cur.fetchone()
            conn.commit()
        wallet_id, balance = row[0], float(row[1])
        if balance < amount:
            return {'error': 'insufficient_funds', 'balance': balance, 'required': amount}
        cur.execute(
            "UPDATE family_wallet SET balance_rub = balance_rub - %s, updated_at = NOW() WHERE id = %d"
            % (amount, wallet_id)
        )
        cur.execute("""
            INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
            VALUES (%d, 'spend', %s, '%s', '%s', '%s')
        """ % (wallet_id, amount, reason, description.replace("'", "''"), str(user_id)))
        conn.commit()
        return {'success': True, 'new_balance': round(balance - amount, 2)}
    finally:
        conn.close()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Генерация плана питания через YandexGPT (async: start + check) с оплатой из кошелька"""
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

    check_actions = ('check', 'check_recipe', 'check_photo', 'check_greeting', 'check_products')
    if action in check_actions:
        if action == 'check':
            return handle_check(api_key, body)
        if action == 'check_recipe':
            return handle_recipe_check(api_key, body)
        if action == 'check_photo':
            return handle_photo_check(api_key, body)
        if action == 'check_greeting':
            return handle_photo_check(api_key, body)
        if action == 'check_products':
            return handle_products_check(api_key, body)

    price = PRICES.get(action)
    if price:
        user_id, family_id = get_user_and_family(event)
        if not user_id:
            return respond(401, {'error': 'Не авторизован'})
        spend_result = wallet_spend(
            user_id, family_id, price,
            REASON_MAP.get(action, 'ai_other'),
            DESC_MAP.get(action, 'ИИ-генерация')
        )
        if 'error' in spend_result:
            if spend_result['error'] == 'insufficient_funds':
                return respond(402, {
                    'error': 'insufficient_funds',
                    'message': f'Недостаточно средств. Нужно {price} руб, на балансе {spend_result.get("balance", 0):.0f} руб',
                    'balance': spend_result.get('balance', 0),
                    'required': price
                })
            return respond(400, {'error': spend_result['error']})
        print(f"[wallet] Charged {price} rub for {action}, new balance: {spend_result.get('new_balance')}")

    if action == 'recipe':
        return handle_recipe_start(api_key, folder_id, body)
    if action == 'generate_photo':
        return handle_photo_start(api_key, folder_id, body)
    if action == 'greeting_photo':
        return handle_greeting_start(api_key, folder_id, body)
    if action == 'recipe_from_products':
        return handle_products_start(api_key, folder_id, body)

    return handle_start(api_key, folder_id, body)


def handle_start(api_key: str, folder_id: str, body: Dict) -> Dict[str, Any]:
    quiz_data = body.get('quizData', {})
    program_data = body.get('programData', {})
    med_tables = body.get('medTables', [])
    duration_days = int(body.get('duration_days', 7))
    if duration_days not in (7, 14, 30):
        duration_days = 7

    if not quiz_data and not program_data:
        return respond(400, {'error': 'Данные анкеты не переданы'})

    if program_data:
        prompt = build_program_prompt(program_data, duration_days)
    else:
        prompt = build_prompt(quiz_data, med_tables, duration_days)

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
            'maxTokens': 32000 if duration_days >= 30 else 16000 if duration_days > 7 else 8000
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


def handle_greeting_start(api_key: str, folder_id: str, body: Dict) -> Dict[str, Any]:
    event_title = body.get('eventTitle', '')
    theme = body.get('theme', '')
    style = body.get('style', 'elegant')

    if not event_title:
        return respond(400, {'error': 'Название события не передано'})

    art_api_key = os.environ.get('YANDEX_ART_API_KEY', api_key)

    theme_hint = f', тема: {theme}' if theme else ''
    prompt = f'Красивая праздничная открытка-приглашение на событие "{event_title}"{theme_hint}. Яркий {style} дизайн, праздничная атмосфера, цветы, декоративные элементы, тёплые тона, без текста на изображении, высокое качество.'

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync'
    headers = {'Authorization': f'Api-Key {art_api_key}', 'Content-Type': 'application/json'}
    payload = {
        'modelUri': f'art://{folder_id}/yandex-art/latest',
        'generationOptions': {'seed': 42},
        'messages': [{'weight': 1, 'text': prompt}]
    }

    print(f"[greeting] Starting greeting card generation for: {event_title}")
    response = requests.post(url, headers=headers, json=payload, timeout=25)
    print(f"[greeting] Start status={response.status_code}")

    if response.status_code != 200:
        print(f"[greeting] Error: {response.text[:300]}")
        return respond(502, {'error': 'Ошибка генерации открытки'})

    result = response.json()
    return respond(200, {'success': True, 'status': 'started', 'operationId': result.get('id', '')})


def handle_products_start(api_key: str, folder_id: str, body: Dict) -> Dict[str, Any]:
    products = body.get('products', [])
    meal_type = body.get('mealType', '')
    people_count = body.get('peopleCount', 2)
    preferences = body.get('preferences', '')

    if not products:
        return respond(400, {'error': 'Список продуктов не передан'})

    products_text = ', '.join(products)
    meal_hint = f'\nТип приёма пищи: {meal_type}.' if meal_type else ''
    pref_hint = f'\nПредпочтения: {preferences}.' if preferences else ''

    prompt = f"""У меня есть следующие продукты: {products_text}.{meal_hint}{pref_hint}
Количество порций: {people_count}.

Предложи 3 блюда, которые можно приготовить из этих продуктов (можно использовать базовые приправы: соль, перец, масло).

Верни ТОЛЬКО JSON (без markdown, без ```):
{{
  "dishes": [
    {{
      "name": "Название блюда",
      "description": "Краткое описание в 1 предложении",
      "cooking_time_min": число,
      "calories_per_serving": число,
      "difficulty": "easy" или "medium" или "hard",
      "used_products": ["продукт1", "продукт2"],
      "extra_products": ["доп. продукт если нужен"],
      "emoji": "подходящий эмодзи",
      "ingredients": ["продукт — 100г", "продукт — 50г"],
      "steps": ["Шаг 1", "Шаг 2", "Шаг 3"]
    }}
  ]
}}

Блюда должны быть разнообразными, реалистичными и вкусными. Указывай граммовки. Шагов: 4-7 на блюдо."""

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completionAsync'
    headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}
    payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt/latest',
        'completionOptions': {'stream': False, 'temperature': 0.5, 'maxTokens': 4000},
        'messages': [
            {'role': 'system', 'text': 'Ты опытный шеф-повар. Предлагай вкусные и простые блюда из имеющихся продуктов. Отвечай ТОЛЬКО валидным JSON.'},
            {'role': 'user', 'text': prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=payload, timeout=25)
    if response.status_code != 200:
        print(f"[products] Error: {response.text[:300]}")
        return respond(502, {'error': 'Ошибка YandexGPT'})

    result = response.json()
    return respond(200, {'success': True, 'status': 'started', 'operationId': result.get('id', '')})


def handle_products_check(api_key: str, body: Dict) -> Dict[str, Any]:
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

    dishes = parse_dishes(ai_text)
    return respond(200, {'success': True, 'status': 'done', 'dishes': dishes})


def parse_dishes(text: str) -> list:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        lines = lines[1:] if lines[0].startswith('```') else lines
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        cleaned = '\n'.join(lines)

    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start != -1 and end != -1:
        try:
            data = json.loads(cleaned[start:end + 1])
            if isinstance(data, dict) and 'dishes' in data:
                return data['dishes']
        except json.JSONDecodeError:
            pass

    start_arr = cleaned.find('[')
    end_arr = cleaned.rfind(']')
    if start_arr != -1 and end_arr != -1:
        try:
            arr = json.loads(cleaned[start_arr:end_arr + 1])
            if isinstance(arr, list):
                return arr
        except json.JSONDecodeError:
            pass

    return []


def build_program_prompt(data: Dict[str, Any], duration_days: int = 7) -> str:
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

    return f"""Составь план питания на {duration_days} дней по программе "{program_name}".

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
  "daily_water_ml": число (рекомендуемый объём воды в мл),
  "daily_steps": число (рекомендуемое количество шагов),
  "exercise_recommendation": "Текст рекомендации по физической активности (2-3 предложения)",
  "days": [
    {{
      "day": "День 1",
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

Всего {duration_days} дней. Каждый день обозначай как "День N" (День 1, День 2, ..., День {duration_days}).
Каждый день должен содержать 4 приёма: breakfast, lunch, dinner, snack.
Строго соблюдай правила программы "{program_name}".
Блюда должны быть разнообразными каждый день. Указывай граммовки в ингредиентах.
Рассчитай порции на {servings} чел.
Рассчитай daily_water_ml, daily_steps и exercise_recommendation подходящие для данной программы.
{"КРИТИЧЕСКИ ВАЖНО: ты ОБЯЗАН сгенерировать ВСЕ " + str(duration_days) + " дней. Не останавливайся на полпути. Пиши компактно: короткие описания (до 5 слов), ингредиенты без лишних слов. Каждый день ОБЯЗАТЕЛЕН." if duration_days > 7 else ""}"""


def build_prompt(data: Dict[str, Any], med_tables: list = None, duration_days: int = 7) -> str:
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

    med_section = ''
    if med_tables:
        for t in med_tables:
            table_name = t.get('table', '')
            forbidden = ', '.join(t.get('forbidden', []))
            principles = '\n'.join(f'  - {p}' for p in t.get('principles', []))
            med_section += f"""
ВАЖНО! Применяется медицинский {table_name} (гибридный режим):
  Запрещённые продукты: {forbidden}
  Принципы:
{principles}
"""

    return f"""Составь план питания на {duration_days} дней для человека:
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
{med_section}
Верни ТОЛЬКО JSON (без markdown, без ```):
{{
  "daily_calories": число,
  "daily_protein": число,
  "daily_fats": число,
  "daily_carbs": число,
  "daily_water_ml": число (рекомендуемый объём воды в мл),
  "daily_steps": число (рекомендуемое количество шагов),
  "exercise_recommendation": "Текст рекомендации по физической активности (2-3 предложения: какие упражнения, сколько раз в неделю, продолжительность)",
  "days": [
    {{
      "day": "День 1",
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

Всего {duration_days} дней. Каждый день обозначай как "День N" (День 1, День 2, ..., День {duration_days}).
Каждый день должен содержать 4 приёма: breakfast, lunch, dinner, snack.
Калорийность должна соответствовать цели (похудение/набор/поддержание).
Учти все заболевания, аллергии и предпочтения. Блюда должны быть разнообразными каждый день.
Указывай граммовки в ингредиентах (формат: "продукт — 100г").
Рассчитай daily_water_ml, daily_steps и exercise_recommendation с учётом пола, веса, возраста и уровня активности.
{"СТРОГО соблюдай ограничения медицинских столов! Ни одно запрещённое блюдо/продукт не должно попасть в план." if med_tables else ""}
{"КРИТИЧЕСКИ ВАЖНО: ты ОБЯЗАН сгенерировать ВСЕ " + str(duration_days) + " дней. Не останавливайся на полпути. Пиши компактно: короткие описания (до 5 слов), ингредиенты без лишних слов. Каждый день ОБЯЗАТЕЛЕН." if duration_days > 7 else ""}"""


def parse_plan(text: str) -> Optional[Dict[str, Any]]:
    import re
    cleaned = text.strip()
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        lines = lines[1:] if lines[0].startswith('```') else lines
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        cleaned = '\n'.join(lines)

    start = cleaned.find('{')
    if start == -1:
        return None
    end = cleaned.rfind('}')
    if end == -1:
        json_str = cleaned[start:]
    else:
        json_str = cleaned[start:end + 1]

    fixed = re.sub(r',\s*([}\]])', r'\1', json_str)

    try:
        result = json.loads(fixed)
        if isinstance(result, dict):
            return result
    except json.JSONDecodeError:
        pass

    plan = _recover_truncated_plan(fixed)
    if plan:
        print(f"[parse_plan] Recovered truncated plan with {len(plan.get('days', []))} days")
        return plan

    print(f"[parse_plan] Failed to parse plan, text length={len(text)}, first 200 chars: {text[:200]}")
    return None


def _recover_truncated_plan(text: str) -> Optional[Dict[str, Any]]:
    import re
    result = {}

    for field in ('daily_calories', 'daily_protein', 'daily_fats', 'daily_carbs', 'daily_water_ml', 'daily_steps'):
        m = re.search(rf'"{field}"\s*:\s*(\d+)', text)
        if m:
            result[field] = int(m.group(1))

    m = re.search(r'"exercise_recommendation"\s*:\s*"([^"]*)"', text)
    if m:
        result['exercise_recommendation'] = m.group(1)

    if 'daily_calories' not in result:
        return None

    days_match = re.search(r'"days"\s*:\s*\[', text)
    if not days_match:
        return None

    days_text = text[days_match.end():]
    days = []
    day_pattern = re.compile(r'"day"\s*:\s*"([^"]*)"')
    meal_block_re = re.compile(
        r'\{\s*'
        r'"type"\s*:\s*"([^"]*)"\s*,\s*'
        r'"time"\s*:\s*"([^"]*)"\s*,\s*'
        r'"name"\s*:\s*"([^"]*)"\s*,\s*'
        r'"description"\s*:\s*"([^"]*)"\s*,\s*'
        r'"calories"\s*:\s*(\d+)\s*,\s*'
        r'"protein"\s*:\s*(\d+)\s*,\s*'
        r'"fats"\s*:\s*(\d+)\s*,\s*'
        r'"carbs"\s*:\s*(\d+)\s*,\s*'
        r'"ingredients"\s*:\s*\[([^\]]*)\]\s*,\s*'
        r'"cooking_time_min"\s*:\s*(\d+)\s*,\s*'
        r'"emoji"\s*:\s*"([^"]*)"'
    )

    day_splits = list(day_pattern.finditer(days_text))

    for idx, dm in enumerate(day_splits):
        day_name = dm.group(1)
        start_pos = dm.end()
        end_pos = day_splits[idx + 1].start() if idx + 1 < len(day_splits) else len(days_text)
        day_chunk = days_text[start_pos:end_pos]

        meals = []
        for mm in meal_block_re.finditer(day_chunk):
            raw_ings = mm.group(9)
            ingredients = [s.strip().strip('"') for s in raw_ings.split('",') if s.strip().strip('"')]
            meals.append({
                'type': mm.group(1),
                'time': mm.group(2),
                'name': mm.group(3),
                'description': mm.group(4),
                'calories': int(mm.group(5)),
                'protein': int(mm.group(6)),
                'fats': int(mm.group(7)),
                'carbs': int(mm.group(8)),
                'ingredients': ingredients,
                'cooking_time_min': int(mm.group(10)),
                'emoji': mm.group(11),
            })

        if meals:
            days.append({'day': day_name, 'meals': meals})

    if not days:
        return None

    result['days'] = days
    return result