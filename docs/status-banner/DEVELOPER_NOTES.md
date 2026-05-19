# Status Banner — developer notes

> Технические заметки для разработчиков. Архитектура, endpoints, edge cases.

---

## Endpoints

### Public read

`https://functions.poehali.dev/386b715a-41ad-4dbc-bfbd-a814d91d23ca` (имя в func2url: **`status-banners-public`**)

```
GET / [+ X-Auth-Token | X-Admin-Token]
→ 200 {
    banners: StatusBanner[],
    server_time: ISO,
    viewer: 'public' | 'authenticated' | 'admin'
  }
```

**Audience-leakage защита (B3.5):** backend сам определяет viewer по заголовкам и фильтрует `audience IN (...)` соответственно. Без токенов → видны только `audience='all'`. С `X-Auth-Token` → +`authenticated`. С `X-Admin-Token=admin_authenticated` → +`admins`.

**Кеш:** `Cache-Control: private, max-age=15` + `Vary: X-Admin-Token, X-Auth-Token, …`. Кеш только в браузере, не на CDN — иначе один viewer мог бы получить ответ другого.

### Admin write

`https://functions.poehali.dev/cdbbdf7d-d94f-46d8-8356-105ff32484e0` (имя в func2url: **`admin-status-banners`**)

```
GET    /                              → 200 { banners: [...] }
GET    /?action=get&id=…              → 200 { banner } | 404
POST   /                              → 201 { banner } | 400
POST   /?action=enable&id=…           → 200 { banner }
POST   /?action=disable&id=…          → 200 { banner }
PUT    /?id=…                         → 200 { banner } | 404 | 400
DELETE /?id=…                         → 200 { ok: true } | 404
```

Все запросы требуют `X-Admin-Token: admin_authenticated`. Опционально `X-Admin-Actor: <name>` → сохраняется в `updated_by`. Серверная валидация дублирует CHECK-констрейнты БД.

---

## Архитектура источника данных

```
DB (status_banners)
   ↑
   │  Simple Query Protocol (psycopg2)
   │
┌──┴────────────────────┐         ┌────────────────────────┐
│ status-banners-public │         │ admin-status-banners   │
│ GET only              │         │ CRUD + enable/disable  │
│ viewer-aware filter   │         │ requires X-Admin-Token │
└──────────┬────────────┘         └────────────┬───────────┘
           │ poll 60s + on focus               │ on user action
           │ + manual refresh                  │
           ▼                                   ▼
   ┌──────────────────────────────────────────────────────┐
   │ statusBannerApi.ts  (тонкий client)                  │
   │ fetchPublicBanners  + admin{List,Create,Update,…}    │
   └──────────────┬───────────────────────────────────────┘
                  │
   ┌──────────────▼────────────┐
   │ useBannerSource (hook)    │  ← override через window.__statusBanner
   │   override > server       │
   └──────────────┬────────────┘
                  │
   ┌──────────────▼─────────────────────────┐
   │ resolveActiveBanner (pure)             │
   │ enabled / dates / audience / route /   │
   │ dismissed / priority                   │
   └──────────────┬─────────────────────────┘
                  │
   ┌──────────────▼─────────────────────────┐
   │ GlobalStatusBanner (UI)                │
   │ + ResizeObserver → CSS var             │
   │ + dismiss(banner.id, banner.endsAt)    │
   └──────────────┬─────────────────────────┘
                  │
   ┌──────────────▼─────────────────────────┐
   │ PageWrapper                            │
   │ padding-top: calc(4rem + var(...))     │
   └────────────────────────────────────────┘
```

---

## Dev override (`window.__statusBanner`)

В browser console:

```js
// Полностью заменить серверный список (preview)
window.__statusBanner.setBanners([{ ...StatusBanner }]);

// Снять override → снова брать с сервера
window.__statusBanner.clear();

// Принудительно дернуть refresh с сервера
window.__statusBanner.refresh();

// Прочитать текущий override (или null)
window.__statusBanner.getOverride();
```

Используется:
- админкой для **«Предпросмотр»** в форме редактирования;
- QA для ручного прогона состояний;
- разработчиками для проверки UI без БД.

---

## Layout offset (CSS var)

`GlobalStatusBanner` пишет свою измеренную высоту в CSS-переменную **`--status-banner-h`** на `document.documentElement` через `ResizeObserver`. `PageWrapper` использует:

```css
padding-top: calc(4rem + var(--status-banner-h, 0px));
```

Когда баннер скрыт/размонтирован → переменная сбрасывается в `0px`, контент возвращается к стандартному offset под `GlobalTopBar` (64px).

Старые браузеры без ResizeObserver → fallback на `window.resize` event.

---

## Shell hidden routes (общий helper)

`src/lib/shellRoutes.ts`:

```ts
export const SHELL_HIDDEN_ROUTES: ReadonlyArray<string>;
export function isShellHiddenRoute(pathname: string | null | undefined): boolean;
```

Используют **все 5 shell-компонентов**:
- `GlobalTopBar`
- `GlobalStatusBanner`
- `GlobalSidebar`
- `GlobalBottomBar`
- `PageWrapper`

До B3.5 каждый держал свой локальный список с расхождениями (включая опечатки `/demo-mode` и `/admin-login`, которые никогда не матчились). Теперь — один источник правды.

Matcher работает на границе сегмента: `/login` матчит `/login`, `/login/oauth`, но НЕ `/login-info`.

---

## Dismiss TTL

Хранение: `localStorage.dismissedBanners = [{id, expiresAt, dismissedAt}]`.

| Источник TTL | Кейс |
|---|---|
| `banner.endsAt` (если задан) | Запись истекает ровно тогда, когда истекает сам баннер |
| `DEFAULT_TTL_MS` (90 дней) | Если у баннера нет `endsAt` |

Cleanup истёкших — на **mount компонента**, на `storage` event (другие вкладки), на `window focus` (возврат в таб).

Legacy формат (массив строк) распознаётся и ремигрируется: `["abc"]` → `[{id:"abc", expiresAt:null, dismissedAt:now}]`.

**Зачем:** если админ удалил баннер или сменил его id, старая запись в storage не блокирует новый баннер с тем же смыслом годами.

---

## Smoke

```js
await window.__smoke.statusBanner();
```

Покрывает:
- `resolveActiveBanner`: enabled / startsAt / endsAt / audience / route / dismissed / priority+freshness / invalid data / empty input
- `classifyBanner`: active/scheduled/disabled/expired + приоритет lifecycle reasons
- `dismissedTtl`: isLiveEntry / legacy migration / filter expired
- `shellRoutes`: exact / segment boundary / real app paths / edge cases / typo regression

Backend tests (`status-banners-public` + `admin-status-banners`): прогоняются автоматически при `mcp__poehali__sync_backend` — 13/13 зелёные.

---

## Known limitations (v1)

| # | Ограничение | Когда чинить |
|---|---|---|
| 1 | `dismissible` в БД — `boolean NOT NULL DEFAULT TRUE`. Сейчас нельзя отличить «явно true» от «дефолт». Helper применяет правило для `critical` со страховкой. | Если потребуется тонкая разница — добавить `dismissible` nullable, helper уже готов учитывать `DEFAULT_DISMISSIBLE_BY_TYPE`. |
| 2 | Поллинг 60s. Изменения админа доезжают до пользователей за минуту. | Если нужен real-time — WebSocket / SSE; для v1 баннер не требует мгновенной доставки. |
| 3 | `X-Auth-Token` принимается **без верификации** (любой непустой). Backend трактует наличие как «authenticated». | Когда будет полноценная JWT-валидация на cloud functions — заменить `if token` на реальную проверку. Это часть security mini-sprint. |
| 4 | Нет аудита (impressions, clicks, dismissals). | После B4. Отдельный аналитический трек. |
| 5 | Preview работает только локально у админа. Невозможно поделиться «вот так это будет выглядеть» с другим человеком. | После B4. |
| 6 | Нет внешнего status page и нет email/SMS/push. | Не входит в трек v1 — сознательно. |
| 7 | Нет approval workflow (двойной аппрув публикации). | Не входит в v1. |
