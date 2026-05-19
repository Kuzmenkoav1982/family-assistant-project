# Status Banner — гайд для админа и разработчика

> Системный верхний баннер: info / maintenance / warning / critical / update.

## Кто чем управляет

| Роль | Где | Что может |
|---|---|---|
| **Админ** | `/admin/status-banner` | создать / редактировать / включить / выключить / удалить · предпросмотр |
| **Пользователь** | любая страница (кроме `HIDDEN_ROUTES`) | видит баннер, может закрыть (если dismissible) |
| **Разработчик** | DevTools console | preview через `window.__statusBanner` |

## Архитектура (один абзац)

Админка → POST/PUT/DELETE на `admin-status-banners` (требует `X-Admin-Token`).
App shell → GET на `status-banners-public` каждые 60s + on focus.
В обоих случаях итоговый отбор «какой именно баннер показать» происходит на клиенте через `resolveActiveBanner()` (учитывает priority, audience, route scope, локально dismissed).

## Типы и дефолты

| type | приоритет (default) | dismissible (default) | визуал |
|---|---|---|---|
| critical | 100 | ❌ нет | rose, AlertOctagon |
| warning | 50 | ✅ да | orange, AlertTriangle |
| maintenance | 30 | ✅ да | amber, Wrench |
| update | 20 | ✅ да | violet, Sparkles |
| info | 10 | ✅ да | blue, Info |

## Audience

- `all` — все, включая анонимных
- `authenticated` — только залогиненные (или demo)
- `admins` — только админ

## Route scope

- пустой массив → global (на всех страницах)
- `["/portfolio"]` → на `/portfolio` и всех `/portfolio/*`
- граница сегмента: `/portfolio` НЕ матчит `/portfolio-compare`

## HIDDEN_ROUTES

Баннер НЕ показывается на: `/welcome`, `/login`, `/register`, `/reset-password`, `/onboarding`, `/join`, `/activate*`, `/oauth-debug`, `/debug-auth`, `/demo`, `/admin/login`, `/presentation`, `/investor-deck`, `/matryoshka`.

## DevTools API

```js
// Перекрыть локальный список (preview)
window.__statusBanner.setBanners([{ ...StatusBanner }]);

// Снять override → снова с сервера
window.__statusBanner.clear();

// Принудительно дернуть refresh с сервера
window.__statusBanner.refresh();

// Получить текущий override (или null)
window.__statusBanner.getOverride();
```

## Dismiss + TTL

Закрытые баннеры хранятся в `localStorage.dismissedBanners` как `[{id, expiresAt, dismissedAt}]`.

TTL:
- если баннер имеет `endsAt` — запись истекает ровно тогда же,
- иначе — через 90 дней с момента закрытия.

Cleanup происходит на mount компонента, при `storage` event и при window focus. Поэтому новый баннер с тем же смыслом (но другим id) не блокируется мусором в storage.

## Layout offset

`GlobalStatusBanner` через ResizeObserver пишет свою высоту в CSS-переменную `--status-banner-h` на `document.documentElement`. `PageWrapper` учитывает её в `padding-top: calc(4rem + var(--status-banner-h, 0px))`. Когда баннер скрыт — переменная сбрасывается в `0px`, контент возвращается к стандартному offset под TopBar.

## Backend контракт

### Public read

```
GET https://functions.poehali.dev/386b715a-41ad-4dbc-bfbd-a814d91d23ca
→ 200 { banners: StatusBanner[], server_time: ISO }
```

Сервер фильтрует по `enabled=true` и временному окну. Тонкая селекция — клиент.

### Admin write

```
GET    /  + X-Admin-Token  → 200 { banners: [...] }
GET    /?action=get&id=…   → 200 { banner } | 404
POST   /                   → 201 { banner }
POST   /?action=enable&id=…→ 200 { banner }
POST   /?action=disable&id=…→ 200 { banner }
PUT    /?id=…              → 200 { banner }
DELETE /?id=…              → 200 { ok: true }
```

Все ошибки валидации → 400 с `{ error: 'validation', detail: '…' }`. Без `X-Admin-Token: admin_authenticated` → 401.

## Smoke

```js
await window.__smoke.statusBanner();
```

Покрывает: enabled / startsAt / endsAt / audience / routeScope / dismissed / priority+freshness / invalid data / empty input.
