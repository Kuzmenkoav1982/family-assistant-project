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


def check_subscription(family_id: str) -> bool:
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        safe_family_id = family_id.replace("'", "''")
        query = f"""
            SELECT plan_type FROM {SCHEMA}.subscriptions
            WHERE family_id = '{safe_family_id}'
            AND status = 'active'
            AND end_date > CURRENT_TIMESTAMP
            AND plan_type IN ('ai_assistant', 'full', 'premium_1m', 'premium_3m', 'premium_6m', 'premium_12m')
            LIMIT 1
        """
        cursor.execute(query)
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result is not None
    except Exception as e:
        print(f'[ERROR] Ошибка проверки подписки: {str(e)}')
        return False


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

        if family_id:
            has_subscription = check_subscription(family_id)
            if not has_subscription:
                return {
                    'statusCode': 403,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'subscription_required', 'message': 'Для использования AI-помощника требуется подписка'})
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
