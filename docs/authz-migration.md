# Серверная авторизация: состояние и план

Документ ведётся по мере миграции. Источник истины по правам —
`backend/_shared/auth_guard.py` (`ROLE_POLICY`, `POLICY_VERSION`).

## Принцип

```
require_session      → кто выполняет запрос (только sessions.token)
require_permission   → может ли роль в принципе (RBAC)
require_same_family  → объект относится к моей семье (IDOR/BOLA)
require_subject_access → доступ к данным именно этого человека (ABAC)
```

Default deny. `X-User-Id` больше не identity: допустим только как
requested member через `resolve_requested_member()`, всегда проверяется.

Владение семьёй отделено от роли: `families.owner_user_id`. Только владелец
удаляет семью, передаёт владение и запрашивает полный экспорт. Обычный
`admin` этого не может, и `admin` НЕ получает автоматического доступа
к здоровью и финансам участников — нужна явная связь `member_guardianships`
или родительство над ребёнком.

## Волна 1 — сделано

Переведены на серверную сессию (10 функций):

| Функция | Что было |
|---|---|
| `auth-me` | новый эндпоинт: role + capabilities |
| `health-profiles` | actor = `X-User-Id`; любой UUID открывал профиль |
| `health-medications` | PUT/DELETE по `med_id` без проверки владения |
| `medication-intakes` | GET по любому `medicationId`; POST/PUT без проверок |
| `health-records` | PUT/DELETE без проверки принадлежности |
| `health-vitals` | то же |
| `health-vaccinations` | то же |
| `health-insurance` | то же |
| `health-telemedicine` | сеанс можно было привязать к чужому врачу |
| `health-doctors` | владелец справочника = предъявитель заголовка |

Фронт: `src/lib/apiHeaders.ts` (единая сборка заголовков),
`src/hooks/useCapabilities.ts` (права от сервера). Из health-компонентов
удалён `X-User-Id` (19 файлов) и захардкоженный fallback `return '1'`.

Проверки: `python3 backend/_shared/test_auth_guard.py` (45 сценариев,
в основном негативных), `python3 backend/_shared/check_no_header_identity.py`
(CI: запрещает читать identity из заголовка в мигрированных функциях),
`tests.json` каждой функции — 6 негативных проверок против прода.

## Волна 2 — приоритет

**Критично, аутентификации нет вообще:**

- `child-calendar` — `familyId` берётся из body, никаких проверок:
  календарь ребёнка любой семьи доступен по подбору id.
- `health-medication-reminders` — напоминания о лекарствах.
- `portfolio-worker` — обрабатывает `member_id` из очереди.
- `payment-sbp` — платежи.

**Доверяют `X-User-Id` без проверки сессии (10):**
`events`, `event-expenses`, `event-guests`, `event-ideas`, `event-share`,
`event-tasks`, `event-wishlist`, `guest-gifts`, `memory`, `purchases`.

`memory` содержит личные воспоминания — по чувствительности идёт первой.

## Волна 3

- 12 функций читают `X-User-Id`, но проверяют токен (`header+token`) —
  нужно убрать заголовок как источник identity.
- 78 функций проверяют токен, но требуют аудита на `same_family`
  и доступ к субъекту: наличие сессии не означает право на объект.
- 18 функций без проверок — в основном служебные (cron, генераторы,
  публичные страницы). Нужно подтвердить, что они не отдают персональные данные.

## Волна 4 — удаление legacy

Когда фронт перестанет отправлять `X-User-Id`:
удалить `resolve_requested_member()`, убрать заголовок из CORS,
добавить в CI запрет на любое упоминание заголовка.

## Аудит

Таблица `authz_audit_log`. Пишутся: кто, семья, роль, модуль, действие,
тип и id ресурса, результат, `reason_code`, статус, хеш IP, семейство UA.
НЕ пишутся: диагнозы, тексты, показатели, номера документов, реквизиты,
токены, тела запросов.

Отдельная от `security_audit_log`, потому что там `user_id INTEGER`,
а `users.id` — UUID.

Не забыть установить: срок хранения, круг доступа, защиту от изменения,
регламент выгрузки инцидентов. Есть заготовка `authz_denial_counters`
для схлопывания одинаковых отказов, чтобы журнал нельзя было переполнить.

## Известная аномалия KE-health

`health_profiles.user_id` и `doctors.user_id` физически хранят
`family_members.id`, а не `users.id`. На аутентификацию это больше не влияет
(сервер сам сопоставляет сессию с `member_id`), но при любых JOIN учитывать.
