# trips-photos - API для загрузки фото из поездок

## Статус развёртывания
⚠️ **НЕ РАЗВЁРНУТО** - функция готова, но не может развернуться из-за технических проблем с платформой

## Описание
API для загрузки и управления фотографиями из поездок. Требует подписку "Полный пакет".

Особенности:
- Загрузка фото в S3 (Yandex Object Storage)
- CDN для быстрой загрузки
- Метаданные: название, описание, место, дата
- Проверка подписки перед загрузкой

## Endpoints

### GET /trips/{trip_id}/photos
Получить список фото поездки

**Response:**
```json
{
  "photos": [
    {
      "id": 1,
      "photo_url": "https://cdn.poehali.dev/projects/.../trips/trip_1/20260108_123456_1.jpg",
      "title": "Закат на Эйфелевой башне",
      "description": "Невероятный вид!",
      "location": "Париж, Франция",
      "date_taken": "2026-01-08",
      "user_id": 1,
      "created_at": "2026-01-08T12:34:56"
    }
  ]
}
```

### POST /trips/{trip_id}/photos
Загрузить фото (требуется подписка "Полный пакет")

**Body:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "content_type": "image/jpeg",
  "title": "Закат на Эйфелевой башне",
  "description": "Невероятный вид!",
  "location": "Париж, Франция",
  "date_taken": "2026-01-08"
}
```

**Response (успех):**
```json
{
  "success": true,
  "photo_id": 1,
  "photo_url": "https://cdn.poehali.dev/projects/.../trips/trip_1/20260108_123456_1.jpg"
}
```

**Response (нет подписки):**
```json
{
  "success": false,
  "error": "subscription_required",
  "message": "Для загрузки фото требуется подписка \"Полный пакет\""
}
```

### PUT /photos/{photo_id}
Обновить информацию о фото

**Body:**
```json
{
  "title": "Новое название",
  "description": "Обновлённое описание",
  "location": "Париж, Эйфелева башня",
  "date_taken": "2026-01-08"
}
```

## S3 конфигурация
Функция использует следующие переменные окружения:
- `AWS_ACCESS_KEY_ID` - ключ доступа S3
- `AWS_SECRET_ACCESS_KEY` - секретный ключ S3
- `DATABASE_URL` - подключение к БД

**Bucket:** `files`  
**Endpoint:** `https://bucket.poehali.dev`  
**CDN URL:** `https://cdn.poehali.dev/projects/{AWS_ACCESS_KEY_ID}/bucket/{key}`

## Формат загрузки
⚠️ **ВАЖНО:** Используется base64 в JSON body, НЕ multipart/form-data

Причина: Cloud Functions плохо работают с multipart/form-data

```javascript
// Frontend пример
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target.result; // data:image/jpeg;base64,...
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token
    },
    body: JSON.stringify({
      image_base64: base64,
      content_type: file.type,
      title: 'Фото',
      location: 'Париж'
    })
  });
};
reader.readAsDataURL(file);
```

## Зависимости
- Python 3.11
- psycopg2-binary>=2.9.9
- boto3>=1.34.0

## Как развернуть
1. Убедитесь что файл `.runtime` содержит `python311`
2. Запустите `sync_backend` инструмент
3. После успешного развёртывания URL появится в `backend/func2url.json`
4. Обновите URL в компоненте где используются фото

## Проверка подписки
Функция автоматически проверяет наличие подписки "full" (Полный пакет) у семьи пользователя:

```python
def check_subscription(user_id: int) -> bool:
    # Проверяет наличие активной подписки с планом 'full'
    cur.execute(f"""
        SELECT s.plan_type 
        FROM subscriptions s
        JOIN family_members fm ON fm.family_id = s.family_id
        WHERE fm.user_id = {user_id}
        AND s.status = 'active'
        AND s.end_date > CURRENT_TIMESTAMP
        AND s.plan_type = 'full'
        LIMIT 1
    """)
    return result is not None
```
