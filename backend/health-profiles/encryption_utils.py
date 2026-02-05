"""
Модуль для шифрования чувствительных данных раздела Здоровье
Использует AES-256-GCM через encryption-helper
"""

import os
import json
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def get_encryption_key() -> bytes:
    """Получение ключа шифрования из переменных окружения"""
    key_b64 = os.environ.get('ENCRYPTION_KEY')
    
    if not key_b64:
        key = AESGCM.generate_key(bit_length=256)
        key_b64 = base64.b64encode(key).decode('utf-8')
        print(f"ВНИМАНИЕ: Создан новый ключ шифрования: {key_b64}")
        print("Сохраните его в секретах проекта как ENCRYPTION_KEY")
        return key
    
    try:
        key = base64.b64decode(key_b64)
        # Проверка длины ключа: должен быть 16, 24 или 32 байта
        if len(key) not in [16, 24, 32]:
            print(f"[ERROR] AESGCM key must be 128, 192, or 256 bits. Current: {len(key)*8} bits")
            # Создаём новый корректный ключ
            key = AESGCM.generate_key(bit_length=256)
            new_key_b64 = base64.b64encode(key).decode('utf-8')
            print(f"[INFO] Generated new 256-bit key: {new_key_b64}")
            print("Please update ENCRYPTION_KEY secret with this value")
        return key
    except Exception as e:
        print(f"[ERROR] Failed to decode ENCRYPTION_KEY: {e}")
        # Генерируем новый ключ при ошибке
        key = AESGCM.generate_key(bit_length=256)
        return key

def encrypt_data(plaintext: str) -> str:
    """Шифрование строки с использованием AES-256-GCM"""
    if not plaintext:
        return ""
    
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    
    nonce_b64 = base64.b64encode(nonce).decode('utf-8')
    ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
    
    return f"{nonce_b64}:{ciphertext_b64}"

def decrypt_data(encrypted: str) -> str:
    """Расшифровка строки"""
    if not encrypted or ':' not in encrypted:
        return encrypted
    
    try:
        nonce_b64, ciphertext_b64 = encrypted.split(':', 1)
        
        key = get_encryption_key()
        aesgcm = AESGCM(key)
        
        nonce = base64.b64decode(nonce_b64)
        ciphertext = base64.b64decode(ciphertext_b64)
        
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode('utf-8')
    except Exception as e:
        print(f"Ошибка расшифровки: {e}")
        return encrypted

def encrypt_list(items: list) -> str:
    """Шифрование списка (JSON)"""
    if not items:
        return ""
    return encrypt_data(json.dumps(items, ensure_ascii=False))

def decrypt_list(encrypted: str) -> list:
    """Расшифровка списка"""
    if not encrypted:
        return []
    try:
        decrypted = decrypt_data(encrypted)
        if not decrypted:
            return []
        result = json.loads(decrypted)
        print(f"[DEBUG] Successfully decrypted list: {result}")
        return result
    except Exception as e:
        print(f"[ERROR] Failed to decrypt list: {e}, encrypted: {encrypted[:50]}...")
        return []