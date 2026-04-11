import json
import os
import requests
import psycopg2
from typing import Dict, Any


def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL не настроен')
    return psycopg2.connect(database_url)


def wallet_spend(user_id, family_id, amount, reason, description):
    """Списание средств с семейного кошелька"""
    if not family_id:
        return {'error': 'no_family'}
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        safe_fid = str(family_id).replace("'", "''")
        cur.execute(
            "SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % safe_fid
        )
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub"
                % safe_fid
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


def build_system_prompt(member1, member2, numerology_data):
    """Построение системного промпта для анализа конфликта"""
    m1_num = numerology_data.get('member1', {})
    m2_num = numerology_data.get('member2', {})

    return f"""Ты — опытный семейный психолог, который глубоко разбирается в нумерологии, астрологии, стихиях и китайском гороскопе. Ты помогаешь семьям разрешать конфликты, учитывая уникальные личностные особенности каждого участника.

Информация об участниках конфликта:

УЧАСТНИК 1: {member1.get('name', 'Участник 1')}
- Дата рождения: {member1.get('birthDate', 'неизвестна')}
- Число жизненного пути: {m1_num.get('lifePath', 'неизвестно')}
- Знак зодиака: {m1_num.get('zodiacSign', 'неизвестен')}
- Стихия: {m1_num.get('element', 'неизвестна')}
- Китайский гороскоп: {m1_num.get('chineseAnimal', 'неизвестен')}
- Тип личности: {m1_num.get('personality', 'неизвестен')}

УЧАСТНИК 2: {member2.get('name', 'Участник 2')}
- Дата рождения: {member2.get('birthDate', 'неизвестна')}
- Число жизненного пути: {m2_num.get('lifePath', 'неизвестно')}
- Знак зодиака: {m2_num.get('zodiacSign', 'неизвестен')}
- Стихия: {m2_num.get('element', 'неизвестна')}
- Китайский гороскоп: {m2_num.get('chineseAnimal', 'неизвестен')}
- Тип личности: {m2_num.get('personality', 'неизвестен')}

ВАЖНЫЕ ИНСТРУКЦИИ:
1. Проанализируй ситуацию с точки зрения каждого участника, основываясь на их нумерологическом и астрологическом профиле.
2. Объясни, ПОЧЕМУ каждый участник реагирует именно так — через призму числа жизненного пути, знака зодиака и стихии.
3. Определи корневую причину конфликта между этими конкретными типами личностей.
4. Предложи конкретные шаги примирения (минимум 3, максимум 6).
5. Дай общий мудрый совет.
6. Укажи лучшее время для разговора (учитывая астрологические особенности обоих участников).

ФОРМАТ ОТВЕТА — строго JSON (без markdown, без комментариев, без лишнего текста):
{{
  "member1Perspective": "Как участник 1 видит ситуацию, исходя из его профиля",
  "member2Perspective": "Как участник 2 видит ситуацию, исходя из его профиля",
  "rootCause": "Почему этот конфликт возникает между этими конкретными типами личностей",
  "steps": ["шаг 1", "шаг 2", "шаг 3"],
  "advice": "Общая мудрость и рекомендация",
  "bestTime": "Лучшее время для разговора"
}}

Отвечай ТОЛЬКО валидным JSON. Не добавляй никакого текста до или после JSON."""


def parse_ai_response(ai_text):
    """Парсинг ответа AI, с фоллбэком если не JSON"""
    # Try to extract JSON from the response
    text = ai_text.strip()

    # Remove possible markdown code block wrapping
    if text.startswith('```'):
        lines = text.split('\n')
        # Remove first line (```json or ```) and last line (```)
        lines = [l for l in lines if not l.strip().startswith('```')]
        text = '\n'.join(lines).strip()

    try:
        parsed = json.loads(text)
        # Validate expected fields exist
        defaults = {
            'member1Perspective': '',
            'member2Perspective': '',
            'rootCause': '',
            'steps': [],
            'advice': '',
            'bestTime': ''
        }
        for key, default_val in defaults.items():
            if key not in parsed:
                parsed[key] = default_val
        return parsed
    except (json.JSONDecodeError, ValueError):
        # Fallback: wrap raw text as advice
        return {
            'member1Perspective': '',
            'member2Perspective': '',
            'rootCause': '',
            'steps': [],
            'advice': ai_text,
            'bestTime': ''
        }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """ИИ-анализ конфликтов в семье с учётом нумерологии и астрологии"""
    method = event.get('httpMethod', 'POST')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ok', 'service': 'conflict-ai'})
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body_data = json.loads(event.get('body', '{}'))
        member1 = body_data.get('member1', {})
        member2 = body_data.get('member2', {})
        situation = body_data.get('situation', '')
        family_id = body_data.get('familyId')
        user_id = body_data.get('userId')
        numerology_data = body_data.get('numerologyData', {})

        if not situation:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указана ситуация конфликта'})
            }

        if not member1.get('name') or not member2.get('name'):
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указаны имена участников конфликта'})
            }

        if not family_id:
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'auth_required', 'message': 'Для использования анализа конфликтов необходимо зарегистрироваться'})
            }

        PRICE = 5
        spend_result = wallet_spend(user_id, family_id, PRICE, 'conflict_ai', 'ИИ-анализ конфликта')
        if 'error' in spend_result:
            if spend_result['error'] == 'insufficient_funds':
                return {
                    'statusCode': 402,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'error': 'insufficient_funds',
                        'message': f'Недостаточно средств. Нужно {PRICE} руб, на балансе {spend_result.get("balance", 0):.0f} руб. Пополните кошелёк.',
                        'balance': spend_result.get('balance', 0),
                        'required': PRICE
                    })
                }
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': spend_result['error']})
            }
        print(f"[wallet] Charged {PRICE} rub for conflict_ai, new balance: {spend_result.get('new_balance')}")

        api_key = os.environ.get('YANDEX_GPT_API_KEY')

        if not api_key:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не настроены ключи YandexGPT'})
            }

        folder_id = 'b1gaglg8i7v2i32nvism'

        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}

        system_prompt = build_system_prompt(member1, member2, numerology_data)

        user_message = f"Ситуация конфликта между {member1.get('name', 'Участник 1')} и {member2.get('name', 'Участник 2')}: {situation}"

        yandex_messages = [
            {'role': 'system', 'text': system_prompt},
            {'role': 'user', 'text': user_message}
        ]

        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
            'completionOptions': {'stream': False, 'temperature': 0.7, 'maxTokens': 3000},
            'messages': yandex_messages
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)

        if response.status_code != 200:
            print(f'[ERROR] YandexGPT ответ: {response.status_code} {response.text[:500]}')
            return {
                'statusCode': 502,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Ошибка сервиса AI', 'details': f'Status: {response.status_code}'})
            }

        result = response.json()
        ai_text = result.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')

        if not ai_text:
            return {
                'statusCode': 502,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не удалось получить ответ от AI'})
            }

        parsed_response = parse_ai_response(ai_text)

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'analysis': parsed_response,
                'model': 'yandexgpt-lite',
                'cost': PRICE
            }, ensure_ascii=False)
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Некорректный JSON'})
        }
    except Exception as e:
        print(f'[ERROR] handler: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'})
        }
