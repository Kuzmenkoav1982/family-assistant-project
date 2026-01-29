# Шифрование медицинских данных в разделе Здоровье

## Защищенные данные

Все чувствительные медицинские данные шифруются с использованием **AES-256-GCM**.

### Зашифрованные поля:

#### health_profiles
- `allergies` - список аллергий (массив → зашифрованный JSON)
- `chronic_diseases` - хронические заболевания (массив → зашифрованный JSON)

#### health_records
- `description` - описание визита/анализа
- `diagnosis` - диагноз врача
- `recommendations` - рекомендации врача

#### medications
- `name` - название лекарства

#### insurance_policies
- `policy_number` - номер страхового полиса

## Технические детали

- **Алгоритм**: AES-256-GCM (Authenticated Encryption)
- **Ключ**: Хранится в секрете проекта `ENCRYPTION_KEY` (256 бит, base64)
- **Формат**: `nonce:ciphertext` (оба в base64)
- **Библиотека**: `cryptography>=41.0.0`

## Функции с шифрованием

1. ✅ `backend/health-profiles` - профили здоровья
2. ✅ `backend/health-records` - медицинские записи
3. ✅ `backend/health-medications` - лекарства
4. ✅ `backend/health-insurance` - страховые полисы

## Процесс

### Шифрование (при записи):
```python
from encryption_utils import encrypt_data, encrypt_list

# Строка
encrypted = encrypt_data("Аллергия на арахис")

# Список → JSON → шифрование
encrypted = encrypt_list(["Аллергия на пыльцу", "Непереносимость лактозы"])
```

### Расшифровка (при чтении):
```python
from encryption_utils import decrypt_data, decrypt_list

# Строка
plaintext = decrypt_data("nonce_base64:ciphertext_base64")

# Зашифрованный JSON → список
items = decrypt_list("nonce_base64:ciphertext_base64")
```

## Безопасность

- ✅ Данные шифруются **до** сохранения в базу
- ✅ Данные расшифровываются **после** чтения из базы
- ✅ Ключ шифрования хранится отдельно от БД (секрет проекта)
- ✅ Каждое шифрование использует уникальный nonce (защита от повторов)
- ✅ Аутентификация данных (GCM mode) предотвращает подделку

## Миграция V0114

Все поля для шифрования изменены на тип `TEXT` для хранения формата `nonce:ciphertext`.

## Совместимость

Функции расшифровки безопасны для незашифрованных данных — если данные не в формате `nonce:ciphertext`, они возвращаются как есть.
