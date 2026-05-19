# Security gaps registry

> Зафиксированные находки по итогам карты платформы (build `032c5c5`).
> Это **не план работ** текущего трека Status Banner, а отдельный backlog,
> который надо обработать самостоятельной задачей.
>
> Цель документа — чтобы находки не потерялись между спринтами и можно
> было приоритезировать их отдельно от продуктового scope.

---

## Категории

| # | Категория | Описание | Серьёзность |
|---|---|---|---|
| S1 | Admin auth weakness | Admin-доступ определяется флагом `localStorage.adminToken === 'admin_authenticated'`. Нет проверки серверной сессии, нет ротации, нет expiration. | 🔴 high |
| S2 | Unguarded admin routes | `/admin/domovoy/studio` и `/admin/dev-agent` объявлены без `AdminRoute`. Доступны любому, кто знает URL. | 🔴 high |
| S3 | Unprotected sensitive pages | Большинство domain pages не имеют `ProtectedRoute`: `/health`, `/permissions`, `/finance/*`, `/nutrition/*`, `/family-tracker`, `/location-history`, `/analytics`, `/settings`, `/wallet`. Открываются у анонима — UI просто показывает пустоту/ошибку, но логика хождения в API может срабатывать. | 🔴 high |
| S4 | Health data exposure surface | `/health` (медицинские данные) без guard — потенциально PII/PHI. | 🔴 high |
| S5 | Debug routes in prod | `/oauth-debug`, `/debug-auth`, `/dev/goals-qa` всегда доступны. Должны быть feature-flag в проде. | 🟠 medium |
| S6 | Dead pages in repo | 17 неиспользуемых страниц в `src/pages/webapp/` (включая `Index.tsx.backup`). Поверхность атаки шире, чем должна быть; повышает риск случайной регистрации в App.tsx. | 🟡 low |
| S7 | Hardcoded admin login | `AdminLogin.tsx` — emailpassword hardcoded в исходнике (проверить). | 🔴 high (если подтвердится) |
| S8 | localStorage as security boundary | Identity adapter, demo flag, admin flag — всё в `localStorage`. Доступно для XSS. CSP / sanitization — отдельная проверка. | 🟠 medium |
| S9 | Permissions page open to all | `/permissions` (`PermissionsManagement`) без guard. Управление правами членов семьи доступно любому посетителю. | 🔴 high |

---

## Не закрываем в треке Status Banner

Этот документ зафиксирован, чтобы:
- security-задачи **не смешивались** с продуктовой работой над Status Banner;
- при следующем планировании можно было выделить отдельный security-sprint.

Рекомендация: после закрытия Wave 2 (Portfolio V1) запустить **«Security Sweep» как отдельный трек**, не дожидаясь Wave 3.

---

## Минимальный план security-sprint (когда возьмёмся отдельно)

1. **Шаг 1.** Audit `AdminLogin` + перевести admin auth с localStorage flag на backend session с expiration + refresh (S1, S7, S8).
2. **Шаг 2.** Добавить `AdminRoute` к `/admin/domovoy/studio`, `/admin/dev-agent` (S2).
3. **Шаг 3.** Обернуть в `ProtectedRoute` все sensitive pages: `/health`, `/permissions`, `/finance/*`, `/nutrition/*`, `/family-tracker`, `/location-history`, `/settings`, `/wallet`, `/analytics` (S3, S4, S9).
4. **Шаг 4.** Спрятать `/oauth-debug`, `/debug-auth`, `/dev/goals-qa` за environment-flag (S5).
5. **Шаг 5.** Удалить мёртвые pages из `src/pages/webapp/` (S6).
6. **Шаг 6.** CSP-аудит + XSS surface review (S8).

Каждый шаг — отдельный коммит, отдельный smoke на guard'ы.
