"""
Вспомогательный модуль для шифрования чувствительных данных

Использует AES-256-GCM для шифрования медицинских записей детей
Ключ шифрования хранится в переменных окружения
"""

import os
import json
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from typing import Dict, Any

# Получение ключа шифрования из environment
def get_encryption_key() -> bytes:
    """
    Получить ключ шифрования из переменных окружения
    Ключ должен быть 32 байта (256 бит) в base64
    """
    key_b64 = os.environ.get('ENCRYPTION_KEY')
    
    if not key_b64:
        # Генерация нового ключа (только для первого запуска)
        key = AESGCM.generate_key(bit_length=256)
        key_b64 = base64.b64encode(key).decode('utf-8')
        print(f"ВНИМАНИЕ: Создан новый ключ шифрования: {key_b64}")
        print("Сохраните его в секретах проекта как ENCRYPTION_KEY")
        return key
    
    return base64.b64decode(key_b64)

def encrypt_data(plaintext: str) -> str:
    """
    Шифрование данных с использованием AES-256-GCM
    
    Args:
        plaintext: Исходные данные (строка)
    
    Returns:
        Зашифрованные данные в формате: nonce:ciphertext (base64)
    """
    if not plaintext:
        return ""
    
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    
    # Генерация уникального nonce (96 бит)
    nonce = os.urandom(12)
    
    # Шифрование
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    
    # Кодирование в base64 для хранения в БД
    nonce_b64 = base64.b64encode(nonce).decode('utf-8')
    ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
    
    return f"{nonce_b64}:{ciphertext_b64}"

def decrypt_data(encrypted: str) -> str:
    """
    Расшифровка данных
    
    Args:
        encrypted: Зашифрованные данные в формате nonce:ciphertext (base64)
    
    Returns:
        Расшифрованные данные (строка)
    """
    if not encrypted or ':' not in encrypted:
        return encrypted  # Если данные не зашифрованы, вернуть как есть
    
    try:
        nonce_b64, ciphertext_b64 = encrypted.split(':', 1)
        
        key = get_encryption_key()
        aesgcm = AESGCM(key)
        
        nonce = base64.b64decode(nonce_b64)
        ciphertext = base64.b64decode(ciphertext_b64)
        
        # Расшифровка
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        
        return plaintext.decode('utf-8')
    except Exception as e:
        print(f"Ошибка расшифровки: {e}")
        return encrypted  # В случае ошибки вернуть исходные данные

def encrypt_medical_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Шифрование медицинской записи ребенка
    
    Шифруются поля:
    - diagnosis (диагноз)
    - prescription (назначения)
    - notes (примечания врача)
    """
    encrypted_record = record.copy()
    
    sensitive_fields = ['diagnosis', 'prescription', 'notes', 'doctor_name', 'clinic_name']
    
    for field in sensitive_fields:
        if field in encrypted_record and encrypted_record[field]:
            encrypted_record[field] = encrypt_data(str(encrypted_record[field]))
    
    return encrypted_record

def decrypt_medical_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Расшифровка медицинской записи"""
    decrypted_record = record.copy()
    
    sensitive_fields = ['diagnosis', 'prescription', 'notes', 'doctor_name', 'clinic_name']
    
    for field in sensitive_fields:
        if field in decrypted_record and decrypted_record[field]:
            decrypted_record[field] = decrypt_data(str(decrypted_record[field]))
    
    return decrypted_record

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для тестирования шифрования/расшифровки
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'encrypt')
        data = body.get('data', '')
        
        if action == 'encrypt':
            result = encrypt_data(data)
        elif action == 'decrypt':
            result = decrypt_data(data)
        elif action == 'encrypt_record':
            result = encrypt_medical_record(body.get('record', {}))
        elif action == 'decrypt_record':
            result = decrypt_medical_record(body.get('record', {}))
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'result': result
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Encryption error: {str(e)}'}),
            'isBase64Encoded': False
        }
