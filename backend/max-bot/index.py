"""
MAX Bot API — отправка сообщений пользователям и в канал через MAX Platform API
Args: event с httpMethod, body с action/text/chat_id
Returns: JSON с результатом
"""

import json
import os
from typing import Dict, Any
import requests
import psycopg2
from psycopg2.extras import RealDictCursor

MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN')
MAX_API_BASE = 'https://botapi.max.ru'
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}


def max_api_request(method: str, endpoint: str, payload: dict = None) -> Dict[str, Any]:
    if not MAX_BOT_TOKEN:
        return {'ok': False, 'error': 'MAX_BOT_TOKEN не настроен'}
    url = f'{MAX_API_BASE}{endpoint}?access_token={MAX_BOT_TOKEN}'
    try:
        if method == 'GET':
            resp = requests.get(url, timeout=10)
        else:
            resp = requests.post(url, json=payload, timeout=10)
        data = resp.json()
        return {'ok': resp.status_code == 200, 'data': data, 'status': resp.status_code}
    except Exception as e:
        return {'ok': False, 'error': str(e)}


def send_message(chat_id: int, text: str) -> Dict[str, Any]:
    return max_api_request('POST', '/messages', {
        'chat_id': chat_id,
        'text': text
    })


def send_message_to_channel(text: str) -> Dict[str, Any]:
    if not MAX_BOT_TOKEN:
        return {'ok': False, 'error': 'MAX_BOT_TOKEN не настроен'}
    url = f'{MAX_API_BASE}/messages?access_token={MAX_BOT_TOKEN}'
    try:
        resp = requests.post(url, json={'chat_id': None, 'text': text}, timeout=10)
        return {'ok': resp.status_code == 200, 'data': resp.json()}
    except Exception as e:
        return {'ok': False, 'error': str(e)}


def handle_webhook(body: dict) -> Dict[str, Any]:
    update_type = body.get('update_type')
    
    if update_type == 'message_created':
        message = body.get('message', {})
        sender = message.get('sender', {})
        chat_id = message.get('recipient', {}).get('chat_id')
        user_id_max = sender.get('user_id')
        text = message.get('body', {}).get('text', '')

        if text.strip().lower() in ['/start', 'привет', 'начать']:
            link_code = None
            parts = text.strip().split()
            if len(parts) > 1:
                link_code = parts[1]

            if link_code and chat_id:
                linked = link_max_account(link_code, chat_id)
                if linked:
                    send_message(chat_id, 'Аккаунт привязан! Теперь вы будете получать уведомления от «Наша Семья» здесь.')
                    return {'ok': True, 'action': 'linked'}

            send_message(chat_id, 'Привет! Я бот «Наша Семья». Чтобы получать уведомления, привяжите аккаунт в приложении (Настройки → Уведомления → MAX).')
            return {'ok': True, 'action': 'welcome'}

        if text.strip().lower() in ['/stop', 'стоп', 'отписаться']:
            if chat_id:
                unlink_max_account(chat_id)
                send_message(chat_id, 'Уведомления отключены. Напишите /start чтобы подключить снова.')
            return {'ok': True, 'action': 'unlinked'}

    return {'ok': True, 'action': 'ignored'}


def link_max_account(link_code: str, max_chat_id: int) -> bool:
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return False
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"""
            UPDATE {SCHEMA}.users 
            SET max_chat_id = {int(max_chat_id)} 
            WHERE id = '{link_code.replace("'", "''")}'
        """)
        updated = cur.rowcount > 0
        conn.commit()
        cur.close()
        conn.close()
        return updated
    except Exception as e:
        print(f"[ERROR] link_max_account: {e}")
        return False


def unlink_max_account(max_chat_id: int) -> bool:
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return False
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.users SET max_chat_id = NULL WHERE max_chat_id = {int(max_chat_id)}")
        conn.commit()
        cur.close()
        conn.close()
        return True
    except:
        return False


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    MAX Bot API — приём вебхуков и отправка сообщений.
    POST / — вебхук от MAX
    POST /?action=send — отправить сообщение (admin)
    GET /?action=info — инфо о боте
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')

    if method == 'POST' and not action:
        try:
            body = json.loads(event.get('body', '{}'))
            result = handle_webhook(body)
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }

    if method == 'POST' and action == 'send':
        admin_token = event.get('headers', {}).get('x-admin-token') or \
                     event.get('headers', {}).get('X-Admin-Token')
        if admin_token != os.environ.get('ADMIN_TOKEN', 'admin_authenticated'):
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Требуются права администратора'}),
                'isBase64Encoded': False
            }
        body = json.loads(event.get('body', '{}'))
        chat_id = body.get('chat_id')
        text = body.get('text', '')
        if not text:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Текст обязателен'}),
                'isBase64Encoded': False
            }
        if chat_id:
            result = send_message(int(chat_id), text)
        else:
            result = send_message_to_channel(text)
        return {
            'statusCode': 200 if result.get('ok') else 500,
            'headers': CORS_HEADERS,
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }

    if method == 'GET' and action == 'info':
        result = max_api_request('GET', '/me')
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'ok': True, 'bot': 'Наша Семья MAX Bot'}),
        'isBase64Encoded': False
    }
