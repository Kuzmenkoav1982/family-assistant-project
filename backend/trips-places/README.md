# trips-places - API для управления местами в поездках

## Статус развёртывания
⚠️ **НЕ РАЗВЁРНУТО** - функция готова, но не может развернуться из-за технических проблем с платформой

## Описание
API для управления Wish List мест внутри поездок. Позволяет:
- Добавлять места для посещения с приоритетами
- Отмечать посещённые места
- Хранить информацию о местах (адрес, описание, стоимость)
- Интеграция с AI-рекомендациями

## Endpoints

### GET /trips/{trip_id}/places
Получить список мест для поездки

**Query параметры:**
- `status` (optional) - фильтр по статусу: planned, visited, skipped

**Response:**
```json
{
  "places": [
    {
      "id": 1,
      "place_name": "Эйфелева башня",
      "place_type": "attraction",
      "address": "Champ de Mars, Paris",
      "description": "Символ Парижа",
      "priority": "high",
      "status": "planned",
      "ai_recommended": false,
      "estimated_cost": 25.0,
      "currency": "EUR"
    }
  ]
}
```

### POST /trips/{trip_id}/places
Добавить новое место

**Body:**
```json
{
  "place_name": "Эйфелева башня",
  "place_type": "attraction",
  "address": "Champ de Mars, Paris",
  "description": "Символ Парижа",
  "priority": "high",
  "estimated_cost": 25.0
}
```

### PUT /places/{place_id}/status
Обновить статус посещения

**Query параметры:**
- `status` - новый статус: visited, skipped
- `visited_date` (optional) - дата посещения

### PUT /places/{place_id}
Обновить информацию о месте

**Body:**
```json
{
  "place_name": "Новое название",
  "description": "Обновлённое описание",
  "priority": "medium"
}
```

### DELETE /places/{place_id}
Удалить место (soft delete - статус skipped)

## Зависимости
- Python 3.11
- psycopg2-binary>=2.9.9

## Как развернуть
1. Убедитесь что файл `.runtime` содержит `python311`
2. Запустите `sync_backend` инструмент
3. После успешного развёртывания URL появится в `backend/func2url.json`
4. Обновите URL в `src/components/trips/TripWishList.tsx`

## Frontend интеграция
После развёртывания замените в файле `src/components/trips/TripWishList.tsx`:

```typescript
const PLACES_API_URL = 'https://functions.poehali.dev/TEMP_PLACES_URL';
```

На актуальный URL из `backend/func2url.json`:

```typescript
const PLACES_API_URL = 'https://functions.poehali.dev/[YOUR_FUNCTION_ID]';
```
