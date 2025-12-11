#!/usr/bin/env python3
"""
Генератор VAPID ключей для Web Push уведомлений
"""
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
import base64

# Генерируем приватный ключ
private_key = ec.generate_private_key(ec.SECP256R1())

# Получаем публичный ключ
public_key = private_key.public_key()

# Сериализуем приватный ключ в PEM формат
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

# Сериализуем публичный ключ в uncompressed point формат
public_numbers = public_key.public_numbers()
x = public_numbers.x.to_bytes(32, byteorder='big')
y = public_numbers.y.to_bytes(32, byteorder='big')
uncompressed_point = b'\x04' + x + y

# Кодируем в base64 URL-safe формат
public_key_b64 = base64.urlsafe_b64encode(uncompressed_point).decode('utf-8').rstrip('=')
private_key_b64 = base64.urlsafe_b64encode(
    private_key.private_numbers().private_value.to_bytes(32, byteorder='big')
).decode('utf-8').rstrip('=')

print("=" * 60)
print("VAPID КЛЮЧИ СГЕНЕРИРОВАНЫ")
print("=" * 60)
print()
print("PUBLIC KEY (для frontend):")
print(public_key_b64)
print()
print("PRIVATE KEY (для backend секрета VAPID_PRIVATE_KEY):")
print(private_key_b64)
print()
print("=" * 60)
