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
        if len(key) not in [16, 24, 32]:
            print(f"[ERROR] Invalid key length: {len(key)} bytes. Expected 16, 24, or 32.")
            key = AESGCM.generate_key(bit_length=256)
            print(f"Generated new key: {base64.b64encode(key).decode('utf-8')}")
        return key
    except Exception as e:
        print(f"[ERROR] Failed to decode key: {e}")
        key = AESGCM.generate_key(bit_length=256)
        print(f"Generated new key: {base64.b64encode(key).decode('utf-8')}")
        return key

def encrypt_data(plaintext: str) -> str:
    """Шифрование строки с использованием AES-256-GCM"""
    if not plaintext:
        return ""
    
    try:
        key = get_encryption_key()
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
        
        nonce_b64 = base64.b64encode(nonce).decode('utf-8')
        ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
        
        return f"{nonce_b64}:{ciphertext_b64}"
    except Exception as e:
        print(f"[ERROR] Encryption failed: {e}. Storing unencrypted.")
        return plaintext

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
    decrypted = decrypt_data(encrypted)
    try:
        return json.loads(decrypted) if decrypted else []
    except:
        return []