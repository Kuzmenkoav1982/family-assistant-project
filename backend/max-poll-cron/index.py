"""
Business: Cron-задача — раз в 5 минут опрашивает MAX-канал и зеркалит новые посты в публичный блог.
Args: event с httpMethod (GET/POST/OPTIONS), headers (X-Cron-Token), context.
Returns: HTTP-ответ со статистикой подтянутых сообщений.
"""
import json
import os
from typing import Any, Dict

import requests


CORS_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Token',
}

MAX_BOT_FUNCTION_URL = 'https://functions.poehali.dev/328084f0-b0e7-4354-9199-db44e75811ac'
DEFAULT_CHAT_ID = '-70410824040551'


def _resp(status: int, payload: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'isBase64Encoded': False,
        'body': json.dumps(payload, ensure_ascii=False, default=str),
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    chat_id = os.environ.get('MAX_CHANNEL_CHAT_ID') or DEFAULT_CHAT_ID
    limit = '50'

    qs = event.get('queryStringParameters') or {}
    if qs.get('chat_id'):
        chat_id = qs.get('chat_id')
    if qs.get('limit'):
        limit = qs.get('limit')

    admin_token = os.environ.get('ADMIN_TOKEN') or 'admin_authenticated'

    try:
        url = f"{MAX_BOT_FUNCTION_URL}?action=poll-channel&chat_id={chat_id}&limit={limit}"
        r = requests.post(
            url,
            headers={
                'Content-Type': 'application/json',
                'X-Admin-Token': admin_token,
                'X-Cron': '1',
            },
            timeout=25,
        )
        try:
            data = r.json()
        except Exception:
            data = {'raw': r.text[:500]}
        return _resp(200, {
            'ok': r.status_code == 200,
            'cron': True,
            'status_code': r.status_code,
            'result': data,
        })
    except Exception as e:
        return _resp(500, {'ok': False, 'error': str(e)})
