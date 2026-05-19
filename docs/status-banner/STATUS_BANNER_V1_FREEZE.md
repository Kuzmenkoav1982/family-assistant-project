# Status Banner v1 — FROZEN

> **Status:** 🔒 **Frozen** (commit `faf8e5c`, 2026-05-19)
>
> Этот документ закрывает первую версию трека Status Banner.
> Любые изменения после freeze — только багфиксы и мелкий hardening.
> Новые фичи — только через отдельный follow-up трек.

---

## Состав v1

| Подсистема | Файлы |
|---|---|
| **БД** | `db_migrations/V0309__create_status_banners_table.sql` (+ V0310/V0311 sanity fixtures) |
| **Backend public read** | `backend/status-banners-public/` (audience_policy: `all_only_v1`) |
| **Backend admin write** | `backend/admin-status-banners/` (CRUD + enable/disable, `X-Admin-Token`) |
| **Frontend core** | `src/lib/statusBanner/*` (types, resolver, classify, hooks, api) |
| **Frontend shell** | `src/components/GlobalStatusBanner.tsx`, `src/lib/shellRoutes.ts` |
| **Frontend admin** | `src/pages/AdminStatusBanners.tsx` |
| **Frontend suggestions** | `src/lib/statusBanner/suggestions/*` (rule-based engine, no autopublish) |
| **Smoke** | 5 модулей: resolveActiveBanner / classifyBanner / dismissedTtl / shellRoutes / suggestions |
| **Docs** | `docs/status-banner/`: README, ADMIN_RUNBOOK, DEVELOPER_NOTES, QA_CHECKLIST, FREEZE (этот файл) |

---

## Sanity-check проведён

| Проверка | Результат |
|---|---|
| `audience=all` enabled → виден в public read | ✅ |
| `audience=authenticated` enabled → **НЕ виден** в public read | ✅ |
| Фейковый `X-Auth-Token` → `viewer: "public"` (нет upgrade) | ✅ |
| `audience_policy: "all_only_v1"` в каждом ответе | ✅ |
| Route scope `/portfolio` отдаётся в массиве, клиентский resolver фильтрует | ✅ |
| Поллинг 60s + on-focus работает | ✅ (B2 verified) |
| Layout offset через CSS var | ✅ |
| Dismiss + TTL | ✅ |
| Backend tests | ✅ 13/13 (5 public + 8 admin) |
| Frontend smoke | ✅ `window.__smoke.statusBanner()` все 5 модулей |

---

## Контракты post-freeze

### Не трогать (frozen API)

- Таблица `status_banners` — поля, констрейнты, индексы (можно добавлять колонки в новых миграциях, но не менять/удалять существующие).
- Endpoints:
  - `status-banners-public` (URL: `https://functions.poehali.dev/386b715a-41ad-4dbc-bfbd-a814d91d23ca`)
  - `admin-status-banners` (URL: `https://functions.poehali.dev/cdbbdf7d-d94f-46d8-8356-105ff32484e0`)
- Response shape: `{ banners: StatusBanner[], server_time, viewer, audience_policy }`.
- TS-контракты `StatusBanner`, `StatusBannerDraft`, `ResolveContext`, `BannerType`, `BannerAudience`.
- `audience_policy: "all_only_v1"` — гарантия для public.

### Разрешено в багфикс-режиме

- Опечатки в текстах, тонкие визуальные правки.
- Дополнительные smoke / docs.
- Расширение admin UI без изменения backend API.
- Новые типы сигналов в suggestion engine (с тем же контрактом «no autopublish»).

### Запрещено без отдельного трека

- Снять `audience_policy: "all_only_v1"` — это часть Security Mini-Sprint (SEC-1.5).
- Менять структуру `StatusBanner` (поля, типы).
- Менять формат `dismissedBanners` в localStorage (только migration-friendly расширения).
- Менять SQL-схему без миграции с обратной совместимостью.

---

## Известные ограничения (deferred follow-ups)

| # | Что | Куда вынесено |
|---|---|---|
| 1 | `audience='authenticated'` / `'admins'` доставка | SEC-1.5 (auth verification foundation) |
| 2 | Realtime (WebSocket / SSE) вместо 60s поллинга | Banner v2 follow-up |
| 3 | Analytics: impressions / clicks / dismissals | Banner v2 follow-up |
| 4 | Внешняя status page | Отдельный трек |
| 5 | Email / SMS / push нотификации | Отдельный трек |
| 6 | Approval workflow (двойной аппрув) | Отдельный трек |
| 7 | Полноценный AI suggestion engine (ML) | Banner v2 follow-up — seam готов |
| 8 | `dismissible` nullable в БД (отличать default от явного) | Banner v2 follow-up — helper готов |
| 9 | Preview, который можно показать другому человеку (не локально) | Banner v2 follow-up |

Эти пункты **не входят** в v1 freeze. Они подняты позже в отдельных тикетах.

---

## Где смотреть

- **Гайд админа:** `docs/status-banner/ADMIN_RUNBOOK.md`
- **Технические заметки:** `docs/status-banner/DEVELOPER_NOTES.md`
- **Ручной QA:** `docs/status-banner/QA_CHECKLIST.md`
- **Security registry:** `docs/security/SECURITY_GAPS_REGISTRY.md`
- **Backlog v1+:** `docs/status-banner/FOLLOW_UPS.md`

---

## Sign-off

- Все acceptance criteria v1 ✓
- Все smoke группы зелёные ✓
- Backend tests зелёные ✓
- Staging sanity-check выполнен ✓
- Audience leakage защита подтверждена в проде ✓

Status Banner v1 — **FROZEN**. Любая работа над треком — через follow-up тикеты.
