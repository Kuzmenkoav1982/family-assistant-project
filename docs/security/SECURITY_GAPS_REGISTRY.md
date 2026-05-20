# Security gaps registry

> Реестр security-находок и их статус.
> Обновлён в Security Mini-Sprint (commit после `72127d5`).

---

## Статусы

| # | Категория | Описание | Серьёзность | Статус |
|---|---|---|---|---|
| S1 | Admin auth weakness | Admin-доступ через `localStorage.adminToken === 'admin_authenticated'` — без серверной проверки, ротации, expiration. | 🔴 high | ✅ **Закрыто в SEC-1.3.** Backend `admin-auth` с bcrypt-хешем в secret. Server-issued session token (TTL 12h), хеш в таблице `admin_sessions`. Frontend `AdminRoute` использует session. Legacy `adminToken` остаётся как grace-period fallback. |
| S2 | Unguarded admin routes | `/admin/domovoy/studio`, `/admin/dev-agent`, `/admin/domovoy` без AdminRoute. | 🔴 high | ✅ **Закрыто в SEC-1.2a.** Все три обёрнуты в `<AdminRoute>`. |
| S3 | Unprotected sensitive pages | `/health`, `/permissions`, `/finance/*`, `/wallet`, `/settings`, `/family-tracker`, `/location-history`, `/analytics`, `/member/:id`, `/family-management`, `/health-hub` | 🔴 high | ✅ **Закрыто в SEC-1.2a (HIGH-risk).** Все обёрнуты в `<ProtectedRoute>`. |
| S4 | Health data exposure | `/health` (PII/PHI) без guard. | 🔴 high | ✅ **Закрыто в SEC-1.2a.** |
| S5 | Debug routes in prod | `/oauth-debug`, `/debug-auth` всегда доступны. | 🟠 medium | ✅ **Закрыто в SEC-1.4.** За `import.meta.env.DEV` — выпиливаются из prod bundle. `/dev/goals-qa` уже был защищён. |
| S6 | Dead pages in repo | 17 неиспользуемых страниц в `src/pages/webapp/`. | 🟡 low | ⏳ Открыто. Закроем в отдельном cleanup-треке. |
| S7 | Hardcoded admin login | `AdminLogin.tsx` хардкодил email/password в исходниках. | 🔴 critical | ✅ **Закрыто в SEC-1.3.** Hardcoded creds полностью удалены из фронта, проверка идёт через backend bcrypt. **Старый пароль утёк в git-историю — админ должен использовать новый.** |
| S8 | localStorage as security boundary | Identity adapter, demo flag, admin session — всё в localStorage. | 🟠 medium | ⏳ Частично смягчено: admin session теперь верифицируется на backend; XSS-аудит — отдельный трек. |
| S9 | Permissions page open to all | `/permissions` без guard. | 🔴 high | ✅ **Закрыто в SEC-1.2a.** |

---

## Открытые пункты (MEDIUM-risk routes, ждут SEC-1.2b)

После checkpoint планируется второй проход для MEDIUM-risk:
- `/chat`, `/family-chat`, `/calendar`, `/notifications`
- `/nutrition`, `/nutrition/*` (личные пищевые привычки)
- `/trips/*`, `/events/*`
- `/tasks`, `/planning-hub`, `/life-road`, `/workshop`, `/workshop/goal/:id`
- `/garage`, `/pets`
- `/family-hub`, `/values-hub`, `/home-hub`, `/household-hub`, `/development-hub`, `/state-hub`, `/leisure-hub`
- `/voting`, `/feedback`, `/suggestions`, `/support`
- `/family-news`, `/tree`
- `/ai-assistant`, `/domovoy`, `/psychologist`, `/alice`
- `/community`, `/purchases`, `/meals`, `/shopping`, `/recipes`
- `/referral` — уже под ProtectedRoute

---

## Технический долг — legacy `X-Admin-Token`

Сейчас все admin backend-функции и многие admin-страницы используют legacy `X-Admin-Token: admin_authenticated`. Это рабочий grace-period:
- backend admin-функций принимают **либо** `X-Admin-Session-Token` (new), **либо** `X-Admin-Token: admin_authenticated` (legacy);
- после SEC-1 checkpoint и массовой замены admin-страниц на session — legacy header убираем из backend.

**Файлы с legacy header'ом** (нужны массовая замена):
- `src/pages/AdminUsers.tsx`
- `src/pages/AdminSubscriptions.tsx`
- `src/pages/AdminPortfolioHealth.tsx`
- `src/pages/AdminTraffic.tsx`
- `src/pages/AdminDomovoy.tsx`
- `src/pages/AdminSupport.tsx`
- `src/pages/AdminMAX.tsx`
- `src/pages/AdminPanel.tsx`
- `src/components/admin/*` (12 файлов)
- backend `admin-users/index.py` — добавить проверку session header (сейчас может не проверяться вообще, см. SEC-1.1)

---

## Что осталось до конца Security Mini-Sprint

- [x] SEC-1.1 — Route access matrix
- [x] SEC-1.2a — HIGH-risk routes
- [x] SEC-1.3 — Admin auth с bcrypt
- [x] SEC-1.4 — Debug routes за DEV
- [x] SEC-1.5 — Auth verification foundation (server-side viewer resolution, аудит в SECURITY_AUDIT.md)
- [x] SEC-1.2b — MEDIUM-risk routes: /chat, /calendar, /nutrition/*, /trips/*, /events/*, /tasks, /notifications, /ai-assistant, /domovoy, /alice, /psychologist, /planning-hub, /life-road, /workshop, /workshop/goal/:id, /garage, /pets, /shopping, /meals, /purchases, /community, /recipes, /voting, /feedback, /suggestions, /support, /family-news, /tree, /leisure, все хабы (/family-hub, /values-hub, /household-hub, /home-hub, /development-hub, /state-hub, /leisure-hub) — все закрыты за ProtectedRoute (commit после `0058550`)
- [x] Legacy X-Admin-Token cleanup — AdminSupport.tsx и PaymentsManagement.tsx переведены на adminFetch() + adminLogout()
- [ ] SEC-1.6 — Security smoke + финальный registry update

---

## Action items для пользователя/админа

1. **Сменить admin-пароль** — старый утёк в git-историю с момента создания репо. Сгенерировать новый bcrypt-хеш и обновить секрет `ADMIN_PASSWORD_HASH`.
2. **Сделать первый login** через `/admin/login` (после смены пароля) — это создаст server-side session и подтвердит, что весь flow работает.
3. **Проверить страницы**, которыми реально пользуешься — теперь sensitive разделы у анонимов покажут Welcome вместо контента. Это правильно.