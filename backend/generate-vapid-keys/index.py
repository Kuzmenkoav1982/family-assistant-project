"""
Генерация VAPID ключей для Web Push уведомлений
Вызовите эту функцию один раз, чтобы получить ключи
"""
import json
import base64
from typing import Dict, Any
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Генерирует пару VAPID ключей для Web Push
    Returns: PUBLIC и PRIVATE ключи в base64 формате
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    
    public_numbers = public_key.public_numbers()
    x = public_numbers.x.to_bytes(32, byteorder='big')
    y = public_numbers.y.to_bytes(32, byteorder='big')
    uncompressed_point = b'\x04' + x + y
    
    public_key_b64 = base64.urlsafe_b64encode(uncompressed_point).decode('utf-8').rstrip('=')
    private_key_b64 = base64.urlsafe_b64encode(
        private_key.private_numbers().private_value.to_bytes(32, byteorder='big')
    ).decode('utf-8').rstrip('=')
    
    result = {
        'success': True,
        'public_key': public_key_b64,
        'private_key': private_key_b64,
        'instructions': {
            'ru': 'Скопируйте PRIVATE_KEY и добавьте как секрет VAPID_PRIVATE_KEY',
            'public_key_usage': 'PUBLIC_KEY уже используется в frontend коде'
        }
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result, ensure_ascii=False, indent=2),
        'isBase64Encoded': False
    }
