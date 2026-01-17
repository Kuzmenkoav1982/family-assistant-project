"""
Вспомогательный модуль для шифрования медицинских данных детей
Использует AES-256-GCM через encryption-helper функцию
"""

import requests
import os
from typing import Optional, Dict, Any

ENCRYPTION_URL = 'https://functions.poehali.dev/c12d3bd7-9e6c-416b-8b10-d71af7e69a03'

def encrypt_field(plaintext: Optional[str]) -> Optional[str]:
    """
    Шифрование одного поля через encryption-helper
    
    Args:
        plaintext: Исходный текст
    
    Returns:
        Зашифрованный текст или None
    """
    if not plaintext:
        return plaintext
    
    try:
        response = requests.post(
            ENCRYPTION_URL,
            json={'action': 'encrypt', 'data': plaintext},
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('result', plaintext)
        else:
            print(f"[ENCRYPTION ERROR] Status {response.status_code}")
            return plaintext
    except Exception as e:
        print(f"[ENCRYPTION ERROR] {e}")
        return plaintext

def decrypt_field(encrypted: Optional[str]) -> Optional[str]:
    """
    Расшифровка одного поля через encryption-helper
    
    Args:
        encrypted: Зашифрованный текст
    
    Returns:
        Расшифрованный текст или исходный
    """
    if not encrypted or ':' not in str(encrypted):
        return encrypted
    
    try:
        response = requests.post(
            ENCRYPTION_URL,
            json={'action': 'decrypt', 'data': encrypted},
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('result', encrypted)
        else:
            return encrypted
    except:
        return encrypted

def encrypt_medical_fields(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Шифрование чувствительных полей в медицинской записи
    
    Шифруются:
    - diagnosis (диагноз)
    - notes (заметки/назначения/результаты)
    - doctor (имя врача)
    - clinic (название клиники)
    """
    encrypted = record.copy()
    
    sensitive_fields = ['diagnosis', 'notes', 'doctor', 'clinic', 'prescription', 'result']
    
    for field in sensitive_fields:
        if field in encrypted and encrypted[field]:
            encrypted[field] = encrypt_field(str(encrypted[field]))
    
    return encrypted

def decrypt_medical_fields(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Расшифровка чувствительных полей в медицинской записи
    """
    decrypted = record.copy()
    
    sensitive_fields = ['diagnosis', 'notes', 'doctor', 'clinic', 'prescription', 'result']
    
    for field in sensitive_fields:
        if field in decrypted and decrypted[field]:
            decrypted[field] = decrypt_field(str(decrypted[field]))
    
    return decrypted
