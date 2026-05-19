# SEC-1.1 — Route Access Matrix

> Аудит роутов проекта на предмет защиты доступа.
> Снимок на build `faf8e5c` (2026-05-19).

---

## TL;DR — критические находки

| # | Находка | Severity | Источник |
|---|---|---|---|
| **C1** | Hardcoded admin email/password в `src/pages/AdminLogin.tsx:9-10` | 🔴 **CRITICAL** | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| **C2** | 22+ sensitive routes без `ProtectedRoute` (`/health`, `/finance/*`, `/wallet`, `/settings`, `/location-history`, `/family-tracker`, `/permissions`, `/member/:id`, и др.) | 🔴 **HIGH** | `src/App.tsx` |
| **C3** | Debug endpoints в проде: `/oauth-debug`, `/debug-auth` | 🟠 **HIGH** | `src/App.tsx` |
| **C4** | Admin-routes `/admin/domovoy`, `/admin/domovoy/studio`, `/admin/dev-agent` без `AdminRoute` | 🟠 **HIGH** | `src/App.tsx` |
| **C5** | Admin token = static string `'admin_authenticated'` без expiration / rotation | 🟠 **HIGH** | `RouteGuards.tsx` + backend |
| **C6** | `auth` session TTL = 30 дней без refresh-механизма | 🟡 **MEDIUM** | `backend/auth/index.py` |

---

## Полная таблица роутов

### Public (намеренно без auth)

| Path | Назначение | Статус |
|---|---|---|
| `/welcome`, `/login`, `/register`, `/reset-password`, `/reset-password/confirm` | Auth flow | OK |
| `/onboarding`, `/join`, `/activate/:token`, `/activate-callback` | Onboarding | OK |
| `/demo` | Demo mode | OK (требует только демо-флаг) |
| `/admin/login` | Admin auth | ⚠️ см. C1 (hardcoded creds) |
| `/articles/*`, `/blog/*`, `/strategy/*`, `/presentation`, `/investor-deck`, `/matryoshka` | Контент / decks | OK |
| `/privacy-policy`, `/terms-of-service`, `/offer`, `/refund-policy` | Legal | OK |
| `/portfolio/about` | Лендинг portfolio | OK |
| `/shared/event/:token` | Share-link для события | OK (защищён токеном в URL) |

### Защищены (ProtectedRoute) — корректно

| Path | Защита |
|---|---|
| `/` | ✅ ProtectedRoute |
| `/dashboard` | ✅ ProtectedRoute |
| `/referral` | ✅ ProtectedRoute |
| `/memory` | ✅ ProtectedRoute |
| `/portfolio`, `/portfolio/:memberId`, `/portfolio/compare`, `/portfolio/:memberId/sphere/:sphereKey` | ✅ ProtectedRoute |

### Sensitive — БЕЗ защиты (нужно закрыть в SEC-1.2)

| Path | Чувствительность | Должно быть |
|---|---|---|
| `/health`, `/health-hub` | PHI (медицинские данные) | ProtectedRoute |
| `/finance`, `/finance/budget`, `/finance/debts`, `/finance/accounts`, `/finance/goals`, `/finance/literacy`, `/finance/recurring`, `/finance/assets`, `/finance/loyalty`, `/finance/antiscam`, `/finance/analytics`, `/finance/strategy`, `/finance/cashflow` | Финансы | ProtectedRoute |
| `/wallet` | Финансы / транзакции | ProtectedRoute |
| `/nutrition`, `/nutrition/*` | Личные пищевые привычки | ProtectedRoute |
| `/settings` | Профиль | ProtectedRoute |
| `/notifications` | Личные уведомления | ProtectedRoute |
| `/permissions` | Управление правами семьи | ProtectedRoute |
| `/member/:memberId` | Профиль участника | ProtectedRoute |
| `/location-history` | Геолокация | ProtectedRoute |
| `/family-tracker` | Геолокация семьи | ProtectedRoute |
| `/analytics` | Личная аналитика | ProtectedRoute |
| `/family-management` | Управление семьёй | ProtectedRoute |
| `/chat`, `/family-chat` | Личная переписка | ProtectedRoute |
| `/calendar` | Личный календарь | ProtectedRoute |
| `/trips`, `/trips/:id`, `/trips/wishlist` | Личные поездки | ProtectedRoute |
| `/events`, `/events/create`, `/events/:id`, `/events/edit/:id` | События семьи | ProtectedRoute |
| `/life-road`, `/workshop`, `/workshop/goal/:id` | Личное развитие / цели | ProtectedRoute |
| `/tasks`, `/planning-hub` | Личные задачи | ProtectedRoute |
| `/garage`, `/pets` | Личное имущество / питомцы | ProtectedRoute |
| `/family-hub`, `/values-hub`, `/home-hub`, `/household-hub`, `/development-hub`, `/state-hub`, `/leisure-hub` | Hubs с личным содержимым | ProtectedRoute |
| `/voting`, `/feedback`, `/suggestions`, `/support` | Семейные действия | ProtectedRoute |
| `/family-news`, `/tree` | Семейный контент | ProtectedRoute |
| `/ai-assistant`, `/domovoy`, `/psychologist`, `/alice` | AI-ассистенты с контекстом юзера | ProtectedRoute |

### Admin routes

| Path | Сейчас | Должно быть |
|---|---|---|
| `/admin/login` | без guard (правильно) | без guard (rate-limited) |
| `/admin/dashboard` | ✅ AdminRoute | ✅ |
| `/admin/users`, `/admin/support`, `/admin/blog`, `/admin/traffic`, `/admin/welcome`, `/admin/alice`, `/admin/max`, `/admin/max/help`, `/admin/valuation`, `/admin/panel`, `/admin/portfolio-health`, `/admin/atlas`, `/admin/project-v2`, `/admin/marketing`, `/admin/marketing-sale`, `/admin/status-banner` | ✅ AdminRoute | ✅ |
| `/admin/domovoy` | ❌ без guard | AdminRoute |
| `/admin/domovoy/studio` | ❌ без guard | AdminRoute |
| `/admin/dev-agent` | ❌ без guard | AdminRoute |
| `/admin/subscriptions` | redirect на `/` | redirect ОК |

### Debug / Dev

| Path | Сейчас | Должно быть в SEC-1.4 |
|---|---|---|
| `/oauth-debug` | ❌ доступен публично | удалить или env-flag |
| `/debug-auth` | ❌ доступен публично | удалить или env-flag |
| `/dev/goals-qa` | dev-only build flag | OK (уже за `import.meta.env.DEV`) |

---

## Состояние auth-инфраструктуры

### Frontend

- `src/components/RouteGuards.tsx`:
  - `ProtectedRoute` смотрит на `storage.getItem('authToken')` + `localStorage.getItem('isDemoMode')`.
  - `AdminRoute` смотрит на `localStorage.getItem('adminToken') === 'admin_authenticated'`.
- `src/lib/identity.ts` — идентичный adapter; ProtectedRoute его НЕ использует (legacy).

### Backend

- `backend/auth/index.py`:
  - Token = `secrets.token_urlsafe(32)` (cryptographically strong).
  - Сохраняется в `sessions(user_id, token, expires_at)` с TTL = **30 дней**.
  - Нет refresh-механизма.
- Admin-функции:
  - `admin-status-banners` — проверяет `X-Admin-Token == 'admin_authenticated'` (как backend, так и frontend — одно и то же значение).
  - `admin-users` — нужно подтвердить наличие проверки токена (см. SEC-1.3 followup).

---

## Что входит в Security Mini-Sprint

| Шаг | Что закрывает |
|---|---|
| SEC-1.2 | C2 — добавить ProtectedRoute на sensitive routes |
| SEC-1.3 | C1, C4, C5 — admin auth hardening + AdminRoute на admin/domovoy/dev-agent |
| SEC-1.4 | C3 — Dev/debug route hygiene |
| SEC-1.5 | C6 + foundation для FU-1 Status Banner — auth verification design |
| SEC-1.6 | smoke + регистр обновлён |

---

## Где смотреть

- `docs/security/SECURITY_GAPS_REGISTRY.md` — общий registry (расширим в SEC-1.6)
- `src/App.tsx` — текущие роуты
- `src/components/RouteGuards.tsx` — текущие guards
