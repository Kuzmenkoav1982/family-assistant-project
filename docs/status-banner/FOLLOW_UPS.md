# Status Banner — follow-ups (post v1)

> Backlog задач, **намеренно отложенных** из v1 (commit `faf8e5c`).
> Берутся отдельными тикетами, после соответствующих платформенных треков.

---

## FU-1 · Verified auth для `authenticated` / `admins` баннеров

**Что:** снять `audience_policy: "all_only_v1"`, вернуть viewer-aware фильтрацию в `status-banners-public`.

**Зависит от:** SEC-1.5 (Auth verification foundation в Security Mini-Sprint).

**Как:**
1. Backend научится **верифицировать** auth-token серверно (JWT verify или session introspection — будет решено в SEC-1.5).
2. В `status-banners-public/index.py` восстановить функцию `_resolve_viewer()` из git-истории (commit B3.5).
3. Заменить `WHERE audience = 'all'` на `WHERE audience IN (whitelist)` + Python defense-in-depth (whitelist по viewer).
4. Cache-Control обратно на `private, max-age=15` + `Vary` на auth-headers.
5. Frontend `statusBannerApi.publicReadHeaders()` восстановить из git-истории.
6. Tests: фейковый токен → `viewer: "public"` (gracefully rejected), валидный auth → `authenticated`.
7. В админке убрать «(gated v1)» из Select и warning-баннер; обновить `ADMIN_RUNBOOK.md`.

**Приоритет:** высокий (закрывает один из ключевых «known limitations»).

---

## FU-2 · Realtime delivery (WebSocket / SSE)

**Что:** заменить 60s поллинг на push-based доставку обновлений.

**Зависит от:** наличие WebSocket / SSE инфраструктуры в проекте (отдельный платформенный трек).

**Как:** канал `banners:changed` → клиент дёргает `fetchPublicBanners()` без поллинга.

**Приоритет:** средний (поллинг 60s достаточно для большинства кейсов).

---

## FU-3 · Banner analytics

**Что:** impressions / clicks по CTA / dismissals.

**Как:** новая таблица `status_banner_events` + endpoint POST event (rate-limited) + аналитический dashboard в `/admin/dashboard`.

**Зависит от:** ничего (можно делать когда угодно).

**Приоритет:** средний (нужно для оценки эффективности коммуникаций).

---

## FU-4 · External status page

**Что:** публичный URL вида `/status` с архивом баннеров и uptime-историей.

**Зависит от:** FU-3 (analytics) для истории.

**Приоритет:** низкий.

---

## FU-5 · Email / SMS / push notifications

**Что:** при `critical`-баннере дублировать в внешние каналы (опционально через админский toggle).

**Зависит от:** инфраструктуры рассылок (отдельный трек).

**Приоритет:** низкий-средний.

---

## FU-6 · Approval workflow (двойной аппрув)

**Что:** опубликовать `critical`-баннер может только через подтверждение второго админа.

**Как:** новое поле `requires_approval`, отдельный action `?action=approve`, аудит-таблица `status_banner_approvals`.

**Зависит от:** наличие нескольких админов в системе (сейчас admin auth = один localStorage flag).

**Приоритет:** низкий (важно для масштаба).

---

## FU-7 · ML-based AI suggestion engine

**Что:** заменить rule-based engine на интеграцию с ИИ-моделью, которая анализирует логи / метрики / тренды и предлагает баннеры.

**Зависит от:** ничего (seam готов в `src/lib/statusBanner/suggestions/`).

**Как:** новый `useSuggestions` источник через backend-функцию `ai-banner-suggestions`, тот же contract `BannerSuggestion[]`. Текущий rule-based остаётся как fallback.

**Контракт:** **`draft.enabled === false`** должно соблюдаться. Smoke `NO AUTOPUBLISH` обязан проходить.

**Приоритет:** низкий-средний.

---

## FU-8 · `dismissible` nullable в БД

**Что:** научиться отличать «явно `true`» от «дефолт по типу».

**Как:** миграция `ALTER TABLE status_banners ALTER COLUMN dismissible DROP NOT NULL; ALTER TABLE status_banners ALTER COLUMN dismissible DROP DEFAULT;` — потом hellper `resolveDismissible()` уже учитывает null.

**Зависит от:** ничего.

**Приоритет:** низкий (косметика).

---

## FU-9 · Shareable preview

**Что:** превратить preview из локального override в shareable URL (e.g. `?preview_banner_id=...`), чтобы можно было показать другому человеку «вот так выглядит».

**Зависит от:** ничего.

**Приоритет:** низкий.
