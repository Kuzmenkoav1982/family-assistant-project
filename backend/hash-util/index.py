"""
Временная утилита: генерирует bcrypt-хеш пароля из тела запроса.
Удалить после использования.
"""
import json
import bcrypt


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body_raw = event.get('body') or '{}'
    payload = json.loads(body_raw) if isinstance(body_raw, str) else (body_raw or {})
    password = str(payload.get('password') or '')

    if not password:
        return {'statusCode': 400, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'password required'})}

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode()
    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'hash': hashed}),
    }
