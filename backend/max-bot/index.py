"""
MAX Bot API — приём вебхуков и отправка уведомлений через platform-api.max.ru
Args: event с httpMethod, body
Returns: JSON с результатом
"""

import json
import os
from typing import Dict, Any
import requests
import psycopg2
from psycopg2.extras import RealDictCursor

MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN')
MAX_API_BASE = 'https://platform-api.max.ru'
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}


def max_api_request(method: str, endpoint: str, payload: dict = None) -> Dict[str, Any]:
    if not MAX_BOT_TOKEN:
        return {'ok': False, 'error': 'MAX_BOT_TOKEN не настроен'}
    separator = '&' if '?' in endpoint else '?'
    url = f'{MAX_API_BASE}{endpoint}{separator}access_token={MAX_BOT_TOKEN}'
    try:
        headers = {'Content-Type': 'application/json'}
        if method == 'GET':
            resp = requests.get(url, headers=headers, timeout=10)
        else:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
        data = resp.json()
        print(f"[DEBUG] MAX API {method} {endpoint}: status={resp.status_code}")
        return {'ok': resp.status_code == 200, 'data': data, 'status': resp.status_code}
    except Exception as e:
        return {'ok': False, 'error': str(e)}


def send_message(chat_id: int, text: str) -> Dict[str, Any]:
    return max_api_request('POST', f'/messages?chat_id={chat_id}', {
        'text': text
    })


def handle_webhook(body: dict) -> Dict[str, Any]:
    update_type = body.get('update_type')

    if update_type == 'bot_started':
        chat_id = body.get('chat_id')
        user = body.get('user', {})
        payload = body.get('payload')

        if payload and chat_id:
            linked = link_max_account(payload, chat_id)
            if linked:
                send_message(chat_id, 'Аккаунт привязан! Теперь вы будете получать уведомления от «Наша Семья» здесь в MAX.')
                return {'ok': True, 'action': 'linked'}
            else:
                send_message(chat_id, 'Не удалось привязать аккаунт. Попробуйте ещё раз через приложение.')
                return {'ok': True, 'action': 'link_failed'}

        send_message(chat_id, 'Привет! Я бот «Наша Семья».\n\nЧтобы получать уведомления, привяжите аккаунт в приложении:\nНастройки → Уведомления → Подключить MAX')
        return {'ok': True, 'action': 'welcome'}

    if update_type == 'message_created':
        message = body.get('message', {})
        sender = message.get('sender', {})
        chat_id = message.get('recipient', {}).get('chat_id')
        text = (message.get('body', {}).get('text', '') or '').strip().lower()

        if text in ['/stop', 'стоп', 'отписаться']:
            if chat_id:
                unlink_max_account(chat_id)
                send_message(chat_id, 'Уведомления отключены. Нажмите «Начать» чтобы подключить снова.')
            return {'ok': True, 'action': 'unlinked'}

        if text in ['/help', 'помощь']:
            send_message(chat_id, 'Я отправляю уведомления из приложения «Наша Семья»:\n- Напоминания о событиях\n- Лекарства\n- Питание и диета\n- Задачи и покупки\n\nКоманды:\n/stop — отключить уведомления\n/help — эта справка')
            return {'ok': True, 'action': 'help'}

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
    MAX Bot — приём вебхуков и управление уведомлениями через мессенджер MAX.
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
            print(f"[ERROR] Webhook processing: {e}")
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
        if not text or not chat_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'chat_id и text обязательны'}),
                'isBase64Encoded': False
            }
        result = send_message(int(chat_id), text)
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