"""
API для генерации туристических маршрутов с помощью YandexGPT.
Принимает параметры поездки и возвращает детальный маршрут с достопримечательностями.
"""

import json
import os
import requests
import psycopg2
from typing import Dict, Any


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token'
}


def respond(status, body):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(body, ensure_ascii=False)}


def get_user_and_family(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None, None
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM sessions WHERE token = '%s' AND expires_at > NOW()" % token.replace("'", "''"))
        row = cur.fetchone()
        if not row:
            return None, None
        user_id = row[0]
        cur.execute("SELECT family_id FROM family_members WHERE user_id = '%s' LIMIT 1" % str(user_id))
        fm = cur.fetchone()
        return user_id, fm[0] if fm else None
    finally:
        conn.close()


def wallet_spend(user_id, family_id, amount, reason, description):
    if not family_id:
        return {'error': 'no_family'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        safe_fid = str(family_id).replace("'", "''")
        cur.execute("SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % safe_fid)
        row = cur.fetchone()
        if not row:
            cur.execute("INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub" % safe_fid)
            row = cur.fetchone()
            conn.commit()
        wallet_id, balance = row[0], float(row[1])
        if balance < amount:
            return {'error': 'insufficient_funds', 'balance': balance, 'required': amount}
        cur.execute("UPDATE family_wallet SET balance_rub = balance_rub - %s, updated_at = NOW() WHERE id = %d" % (amount, wallet_id))
        cur.execute("INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id) VALUES (%d, 'spend', %s, '%s', '%s', '%s')" % (wallet_id, amount, reason, description.replace("'", "''"), str(user_id)))
        conn.commit()
        return {'success': True, 'new_balance': round(balance - amount, 2)}
    finally:
        conn.close()


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
            'headers': CORS,
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
    
    # Списание с кошелька
    PRICE = 5
    user_id, family_id = get_user_and_family(event)
    if not user_id:
        return respond(401, {'error': 'Не авторизован'})
    spend_result = wallet_spend(user_id, family_id, PRICE, 'ai_itinerary', 'Маршрут путешествия ИИ')
    if 'error' in spend_result:
        if spend_result['error'] == 'insufficient_funds':
            return respond(402, {'error': 'insufficient_funds', 'message': f'Недостаточно средств. Нужно {PRICE} руб, на балансе {spend_result.get("balance", 0):.0f} руб', 'balance': spend_result.get('balance', 0), 'required': PRICE})
        return respond(400, {'error': spend_result['error']})
    print(f"[wallet] Charged {PRICE} rub for ai_itinerary")
    
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