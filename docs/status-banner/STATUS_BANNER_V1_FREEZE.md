# Status Banner v1 — FROZEN

> **Status:** 🔒 **Frozen** (commit `d65bbf9`, 2026-05-20)
>
> B5 — финальная приёмка. Документ обновлён с учётом всех исправлений после checkpoint.
> Любые изменения после freeze — только P0/P1 багфиксы через отдельный тикет.
> Новые фичи — только через follow-up трек.

---

## Что входит в v1

| Подсистема | Файлы |
|---|---|
| **БД** | `V0309__create_status_banners_table.sql` + V0318 (normalize audience) + V0319 (add segment) + V0320 (welcome seed) + V0321 (fix cta_href) |
| **Backend public read** | `backend/status-banners-public/` — SEC-1.5 `audience_policy: "server_resolved_v2"` |
| **Backend admin write** | `backend/admin-status-banners/` — CRUD + enable/disable, `X-Admin-Session-Token` |
| **Frontend core** | `src/lib/statusBanner/` — types, resolver, classifyBanner, hooks, api |
| **Frontend shell** | `src/components/GlobalStatusBanner.tsx`, `src/lib/shellRoutes.ts` |
| **Frontend admin** | `src/pages/AdminStatusBanners.tsx` (под AdminRoute) |
| **Frontend suggestions** | `src/lib/statusBanner/suggestions/` — rule-based engine, no autopublish |
| **Smoke** | 5 модулей: resolveActiveBanner / classifyBanner / dismissedTtl / shellRoutes / suggestions |
| **Docs** | `docs/status-banner/`: README, ADMIN_RUNBOOK, DEVELOPER_NOTES, QA_CHECKLIST, FOLLOW_UPS |

## Что НЕ входит в v1

- B4 AI suggestions (rule-based seam готов, ML интеграция — follow-up)
- Realtime delivery (WebSocket / SSE) — поллинг 60s достаточен для v1
- Analytics (impressions / clicks / dismissals)
- Approval workflow (двойной аппрув)
- Внешняя status page
- Email / SMS / push при critical-баннере
- `dismissible` nullable в БД
- Shareable preview URL

---

## Как работает targeting

### Audience

| `audience` в БД | Кто видит |
|---|---|
| `public` | все (anonymous + authenticated + admin) |
| `authenticated` | залогиненные пользователи + admin |
| `admin` | только admin |

Backend определяет viewer **серверно** по `X-Auth-Token` / `X-Admin-Session-Token`.
Клиентский spoofing (query params, body, X-Admin-Token, isDemoMode) — игнорируется.
`audience_policy: "server_resolved_v2"`.

### Segment

| `segment` | Логика |
|---|---|
| `null` | без дополнительной фильтрации |
| `registered_last_7d` | `users.created_at >= now() - 7d` — серверно из сессии |

Fail-closed: неизвестный сегмент или отсутствие created_at → не показывается.

### Selection (resolver)

Порядок фильтрации в `resolveActiveBanner()`:
1. `enabled = true`
2. `starts_at IS NULL OR starts_at <= now()`
3. `ends_at IS NULL OR ends_at > now()`
4. audience match (с поддержкой legacy `'all'` / `'admins'`)
5. routeScope match (пустой = global)
6. не в dismissed (localStorage)
7. сортировка: `priority DESC`, freshness DESC
8. → возвращает **максимум 1 баннер**

### Dismiss

- Хранится в localStorage `'dismissedBanners'` с TTL 90 дней
- При dismiss: записывается `{ id, expiresAt, dismissedAt }`
- После `endsAt` — TTL не ломает логику, просто запись устаревает
- `critical` по умолчанию `dismissible=false` (safety-net в resolver)

### Hidden routes

Shell (TopBar / StatusBanner / PageWrapper padding) не показывается на:
`/welcome`, `/login`, `/register`, `/reset-password`, `/onboarding`, `/join`,
`/activate`, `/activate-callback`, `/oauth-debug`, `/debug-auth`, `/demo`,
`/admin/login`, `/presentation`, `/investor-deck`, `/matryoshka`

---

## B5 Release Smoke — результаты

| Сценарий | Результат | Примечания |
|---|---|---|
| **Public viewer** | ✅ PASS | audienceMatches('public') исправлен |
| **Authenticated old user** | ✅ PASS | segment=registered_last_7d не матчится — welcome не показывается |
| **Authenticated new user** | ✅ PASS | backend верифицирует created_at через сессию |
| **Admin panel** | ✅ PASS | AdminRoute + adminFetch + X-Admin-Session-Token |
| **Scheduling / priority** | ✅ PASS | детерминированный resolver |
| **Dismiss behavior** | ✅ PASS | localStorage + 90d TTL |
| **Shell / layout** | ✅ PASS | fixed top-16, --status-banner-h CSS var, PageWrapper |
| **Backend logs** | ✅ PASS | только START/END/REPORT, 95–230ms, ошибок нет |

### Исправления в процессе checkpoint/B5

| # | Что было | Исправление |
|---|---|---|
| 1 | `audienceMatches` проверял `'all'`/`'admins'` вместо `'public'`/`'admin'` | Добавлена поддержка canonical + legacy values |
| 2 | `cta_href: '/profile'` (маршрут не существует) | V0321: исправлено на `/settings` |
| 3 | `fetchPublicBanners` не отправлял токены (all_only_v1) | FU-1 закрыт: `publicReadHeaders()` восстановлена |

### Известное ограничение (не блокер)

`Failed to fetch` для `status-banners-public` при первом рендере anonymous — это CORS/сетевой сбой на стороне холодного старта функции. `fetchPublicBanners` graceful-деградирует на `[]`, баннер просто не показывается. Повторный запрос (60s поллинг) обычно успешен.

---

## Контракты post-freeze

### Frozen (не трогать без трека)

- Схема таблицы `status_banners` (поля, типы, NOT NULL) — расширять только новыми миграциями
- Endpoint URLs в `func2url.json`
- Response shape: `{ banners: StatusBanner[], server_time, viewer, audience_policy }`
- TS-контракты: `StatusBanner`, `StatusBannerDraft`, `BannerType`, `BannerAudience`, `ViewerKind`
- `resolveActiveBanner(candidates, context)` — сигнатура и ResolveResult
- `audience_policy: "server_resolved_v2"` — гарантия SERVER-side viewer resolution

### Разрешено в багфикс-режиме

- Тексты, визуальные правки
- Дополнительные smoke / docs
- Расширение admin UI без изменения backend API
- Новые типы сигналов в suggestion engine (тот же контракт «no autopublish»)

### Запрещено без отдельного трека

- Изменить структуру `StatusBanner` (поля, типы)
- Изменить формат `dismissedBanners` в localStorage (только migration-friendly расширения)
- Изменить SQL-схему без backward-compatible миграции
- Включить autopublish в suggestions engine

---

## Известные follow-ups (не баги v1)

| # | Что | Приоритет |
|---|---|---|
| FU-1 | Verified auth — ✅ ЗАКРЫТ в B1/B5 | — |
| FU-2 | Realtime (WebSocket/SSE) вместо поллинга | средний |
| FU-3 | Analytics: impressions / clicks / dismissals | средний |
| FU-4 | Внешняя status page | низкий |
| FU-5 | Email/SMS/push при critical | низкий-средний |
| FU-6 | Approval workflow (двойной аппрув) | низкий |
| FU-7 | ML-based AI suggestion engine | низкий-средний |
| FU-8 | `dismissible` nullable в БД | низкий |
| FU-9 | Shareable preview URL | низкий |

---

## Где смотреть

- **Гайд админа:** `docs/status-banner/ADMIN_RUNBOOK.md`
- **Технические заметки:** `docs/status-banner/DEVELOPER_NOTES.md`
- **Ручной QA:** `docs/status-banner/QA_CHECKLIST.md`
- **Security registry:** `docs/security/SECURITY_GAPS_REGISTRY.md`
- **B1 freeze:** `docs/status-banner/STATUS_BANNER_B1_FREEZE.md`
- **Backlog v1+:** `docs/status-banner/FOLLOW_UPS.md`

---

## Sign-off B5

- Все acceptance criteria v1 ✅
- Все smoke группы зелёные ✅
- Backend logs: только START/END/REPORT, ошибок нет ✅
- audienceMatches исправлен (public/admin canonical) ✅
- FU-1 (viewer-aware) закрыт ✅
- cta_href исправлен (V0321) ✅
- Deployment state соответствует коду (commit `d65bbf9`) ✅

**Status Banner v1 — FROZEN и SHIPPED.**
