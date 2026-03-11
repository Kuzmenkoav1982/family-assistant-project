import json
import os
import requests
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime


SCHEMA = 't_p5815085_family_assistant_pro'


def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL не настроен')
    return psycopg2.connect(database_url)


def check_subscription_and_limits(family_id: str) -> dict:
    """
    Возвращает:
    - 'allowed': True если можно использовать AI
    - 'is_premium': True если платная подписка
    - 'reason': причина отказа если allowed=False
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        safe_family_id = family_id.replace("'", "''")

        cursor.execute(f"""
            SELECT plan_type FROM {SCHEMA}.subscriptions
            WHERE family_id = '{safe_family_id}'
            AND status = 'active'
            AND end_date > CURRENT_TIMESTAMP
            ORDER BY end_date DESC LIMIT 1
        """)
        sub = cursor.fetchone()

        plan_type = sub[0] if sub else None
        is_premium = bool(plan_type and (
            plan_type.startswith('premium_') or
            plan_type in ('ai_assistant', 'full')
        ))

        if is_premium:
            cursor.close()
            conn.close()
            return {'allowed': True, 'is_premium': True}

        cursor.execute(f"""
            SELECT ai_requests_used, ai_requests_reset_date
            FROM {SCHEMA}.subscription_usage
            WHERE family_id = '{safe_family_id}'
        """)
        usage = cursor.fetchone()

        from datetime import date
        today = date.today()

        if usage:
            ai_used = usage[0]
            reset_date = usage[1]
            if reset_date and reset_date < today:
                cursor.execute(f"""
                    UPDATE {SCHEMA}.subscription_usage
                    SET ai_requests_used = 0, ai_requests_reset_date = CURRENT_DATE
                    WHERE family_id = '{safe_family_id}'
                """)
                conn.commit()
                ai_used = 0
        else:
            cursor.execute(f"""
                INSERT INTO {SCHEMA}.subscription_usage
                (family_id, ai_requests_used, photos_used, family_members_count)
                VALUES ('{safe_family_id}', 0, 0, 0)
                ON CONFLICT (family_id) DO NOTHING
            """)
            conn.commit()
            ai_used = 0

        cursor.close()
        conn.close()

        if ai_used >= 5:
            return {'allowed': False, 'is_premium': False, 'reason': 'daily_limit_reached', 'used': ai_used, 'limit': 5}

        return {'allowed': True, 'is_premium': False}

    except Exception as e:
        print(f'[ERROR] Ошибка проверки подписки: {str(e)}')
        return {'allowed': False, 'is_premium': False, 'reason': 'error'}


def load_chat_history(family_id: str, limit: int = 10) -> List[Dict[str, str]]:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        safe_family_id = family_id.replace("'", "''")
        query = f"""
            SELECT role, content 
            FROM {SCHEMA}.chat_messages 
            WHERE family_id::text = '{safe_family_id}' 
            ORDER BY created_at DESC 
            LIMIT {int(limit)}
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        history = []
        for row in reversed(rows):
            history.append({'role': row[0], 'content': row[1]})
        return history
    except Exception as e:
        print(f'[ERROR] Ошибка загрузки истории: {str(e)}')
        return []


def save_message(family_id: str, user_id: Optional[int], role: str, content: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        safe_family_id = family_id.replace("'", "''")
        safe_role = role.replace("'", "''")
        safe_content = content.replace("'", "''")
        user_id_val = f"'{str(user_id)}'" if user_id else "NULL"
        query = f"""
            INSERT INTO {SCHEMA}.chat_messages (family_id, sender_id, role, content, type, created_at)
            VALUES ('{safe_family_id}'::uuid, {user_id_val}, '{safe_role}', '{safe_content}', 'text', NOW())
        """
        cursor.execute(query)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f'[ERROR] Ошибка сохранения сообщения: {str(e)}')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''AI-ассистент для семьи на базе YandexGPT'''
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
            'body': json.dumps({'status': 'ok', 'service': 'ai-assistant'})
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body_data = json.loads(event.get('body', '{}'))
        messages = body_data.get('messages', [])
        system_prompt = body_data.get('systemPrompt')
        family_id = body_data.get('familyId')
        user_id = body_data.get('userId')

        if not messages:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указаны сообщения'})
            }

        if not family_id:
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'auth_required', 'message': 'Для использования AI-помощника необходимо зарегистрироваться'})
            }

        access = check_subscription_and_limits(family_id)
        if not access['allowed']:
            reason = access.get('reason', '')
            if reason == 'daily_limit_reached':
                used = access.get('used', 5)
                limit = access.get('limit', 5)
                message = f'Вы использовали {used} из {limit} бесплатных AI-запросов сегодня. Обновитесь до Premium для безлимитного доступа!'
                error_code = 'daily_limit_reached'
            else:
                message = 'Для использования AI-помощника требуется подписка'
                error_code = 'subscription_required'
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': error_code, 'message': message})
            }

        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')

        if not api_key or not folder_id:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не настроены ключи YandexGPT'})
            }

        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}

        history_messages = []
        if family_id:
            history_messages = load_chat_history(family_id, limit=10)

        yandex_messages = []
        if system_prompt:
            yandex_messages.append({'role': 'system', 'text': system_prompt})

        for msg in history_messages:
            yandex_messages.append({'role': msg['role'], 'text': msg['content']})

        user_message_content = ''
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'user':
                user_message_content = content
            if role in ['user', 'assistant']:
                yandex_messages.append({'role': role, 'text': content})

        correct_folder_id = 'b1gaglg8i7v2i32nvism'

        payload = {
            'modelUri': f'gpt://{correct_folder_id}/yandexgpt-lite',
            'completionOptions': {'stream': False, 'temperature': 0.7, 'maxTokens': 2000},
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
            ai_text = 'Не удалось получить ответ от AI.'

        if family_id and user_message_content:
            save_message(family_id, user_id, 'user', user_message_content)
        if family_id and ai_text:
            save_message(family_id, user_id, 'assistant', ai_text)

        if family_id and not access.get('is_premium', True):
            try:
                conn2 = get_db_connection()
                cur2 = conn2.cursor()
                safe_fid = family_id.replace("'", "''")
                cur2.execute(f"""
                    UPDATE {SCHEMA}.subscription_usage
                    SET ai_requests_used = ai_requests_used + 1
                    WHERE family_id = '{safe_fid}'
                """)
                conn2.commit()
                cur2.close()
                conn2.close()
            except Exception as e:
                print(f'[ERROR] Ошибка инкремента счётчика: {str(e)}')

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'response': ai_text, 'model': 'yandexgpt-lite'})
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