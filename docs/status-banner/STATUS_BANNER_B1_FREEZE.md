# Status Banner B1 — Freeze

> Domain model + selection helper + viewer-aware public read.
> Commit после `579eee7`, 2026-05-20.

---

## Статус: 🔒 FROZEN

---

## Что входит в B1

### 1. БД — таблица `status_banners`

Миграции применены (V0309 → V0320):

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID PK | gen_random_uuid() |
| `type` | TEXT | info / maintenance / warning / critical / update |
| `title` | TEXT | |
| `message` | TEXT | |
| `cta_label` | TEXT NULL | |
| `cta_href` | TEXT NULL | |
| `enabled` | BOOLEAN | false по умолчанию |
| `dismissible` | BOOLEAN | true по умолчанию |
| `starts_at` | TIMESTAMPTZ NULL | |
| `ends_at` | TIMESTAMPTZ NULL | |
| `audience` | TEXT | public / authenticated / admin |
| `segment` | TEXT NULL | registered_last_7d \| NULL |
| `route_scope` | JSONB | [] = global |
| `priority` | INTEGER | |
| `created_by` | TEXT NULL | |
| `updated_by` | TEXT NULL | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `published_at` | TIMESTAMPTZ NULL | |
| `unpublished_at` | TIMESTAMPTZ NULL | |

### 2. Backend — `status-banners-public`

- URL: `func2url["status-banners-public"]`
- SEC-1.5: `_resolve_viewer_and_created_at()` — серверная верификация токенов
- SEG-1.6: `_matches_segment()` — сегментная фильтрация (`registered_last_7d`)
- `audience_policy: "server_resolved_v2"` — клиентский spoofing игнорируется
- Возвращает: `{ banners, server_time, viewer, audience_policy }`
- Cache-Control: `private, no-store`

### 3. Backend — `admin-status-banners`

- CRUD: GET (list) / POST (create) / PUT (update) / DELETE
- Требует: `X-Admin-Session-Token` (верифицируется в `admin_sessions`)
- `actor` берётся из сессии, не принимается от клиента

### 4. Frontend — типы (`src/lib/statusBanner/types.ts`)

```typescript
type BannerType = 'info' | 'maintenance' | 'warning' | 'critical' | 'update'
type BannerAudience = 'public' | 'authenticated' | 'admin'
type BannerSegment = 'registered_last_7d' | null
type ViewerKind = 'public' | 'authenticated' | 'admin'
interface StatusBanner { ... }
interface StatusBannerDraft { ... }
```

### 5. Frontend — selection helper (`resolveActiveBanner.ts`)

Pure-функция, детерминированный выбор одного баннера:
1. `enabled` ✓
2. `startsAt` window ✓
3. `endsAt` window ✓
4. audience match ✓
5. route match (routeScope) ✓
6. not dismissed locally ✓
7. sort: `priority DESC`, freshness DESC
8. → return first или null

### 6. Frontend — viewer-aware public read (FU-1 закрыт)

`statusBannerApi.fetchPublicBanners()` теперь отправляет:
- `X-Admin-Session-Token` — если есть admin-сессия
- `X-Auth-Token` — если есть user-сессия
- пустые headers — для anonymous

Backend сам определяет viewer и фильтрует `audience`.

### 7. Data — seed баннер

```
id: 9aec9f8f-fc85-450a-a3c2-2e16bde454ad
type: info, title: "Добро пожаловать!"
audience: authenticated, segment: registered_last_7d
enabled: true, priority: 50
```

---

## Контракты (не трогаем без P0/P1)

- Таблица `status_banners` — схема frozen; расширения через новые миграции
- `resolveActiveBanner(candidates, context)` — сигнатура и возвращаемый тип
- Public endpoint response shape: `{ banners, server_time, viewer, audience_policy }`
- Admin endpoint: URL pattern `?id=&action=`

---

## Что идёт дальше

| Шаг | Что |
|---|---|
| B2 | GlobalStatusBanner уже встроен в App.tsx (строка 337) — работает |
| checkpoint | Проверка end-to-end по сценариям |
| B3 | Admin control panel `/admin/status-banners` — уже реализован |
| B5 | Smoke + docs update |
| B4 | AI suggestions (последним) |
