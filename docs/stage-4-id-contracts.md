# Stage 4 — ID Contracts Inventory

## Purpose / Status

- **Stage:** `stage-4-contract-convergence`
- **Sub-stage:** 4.2 — adapter-layer + portfolio/health migration (in progress)
- **Status:** 4.1 done; 4.2 — `src/lib/identity.ts` создан, portfolio + health переведены.
- **Owner:** Юра / личный разработчик
- **Goal:** убрать системную причину класса багов `user_id` vs `member_id` vs `family_member.id` — зафиксировать единый контракт идентичности между frontend / backend / storage.
- **Living doc:** обновлять по мере 4.2 (adapter-layer), 4.3 (rename), 4.6 (cleanup).

### Stage 4.2 changelog

- ✅ `src/lib/identity.ts` — единая точка identity (`readActorUserId`, `readActorMemberId`, `readActorFamilyId`, `readAuthToken`, `readNormalizedIdentity`). Поддерживает legacy-ключи `userData`/`user_data`/`user` и `authToken`/`auth_token`.
- ✅ `src/services/portfolioApi.ts` переведён на `readActorUserId()`. `pickActorUserIdFromStorage` оставлен как тонкий re-export для regression-runner — теперь делегирует identity adapter.
- ✅ **Q1 closed:** `health_profiles.user_id` физически хранит `family_members.id` (7 из 8 проверенных строк в БД ссылаются на `family_members`, 0 — на `users`). Health surface — это **KE-health**, такая же legacy-семантика как life-road.
- ✅ `src/services/healthApi.ts` — тонкий wrapper по образу portfolioApi. X-User-Id берётся из `readActorMemberId()`. Никаких fallback на `'1'`.
- ✅ `src/hooks/useHealthAPI.ts` переписан через healthApi wrapper. Локальный `getUserId()` с fallback `'1'` удалён → закрывает **A1, A5**.
- ✅ `src/hooks/useHealthNew.ts`: `handleDeleteMedication` и `handleDeleteRecord` переведены на `healthApi.delete()`. Старый паттерн `X-User-Id: selectedProfile.id` (health_profiles.id вместо actor) удалён → закрывает **A2**.
- ✅ Ручная сборка fetch+headers в health-хуках устранена → закрывает **A6**.
- 🟡 **Life-road** — не трогаем в 4.2 (KE известная, рефакторинг чтения storage пойдёт в 4.3 через `readActorMemberId()`).
- 🟡 **A3, A4** (`localStorage.userId`, дубликаты storage-ключей) — остаются в очереди 4.3 / 4.6.

---

## Canonical ID glossary

| ID | Meaning | DB column | Where it's the actor | Where it's a resource |
|---|---|---|---|---|
| `users.id` | Каноничный аккаунт. Один на физического пользователя. | `users.id` (uuid/int as str) | **portfolio**, любой actor-protected endpoint после stage-3 | — |
| `family_members.id` | Запись участника семьи. Связана с `users.id` через `family_members.user_id` (либо без, если member ещё не активирован). | `family_members.id` | **life-road** (legacy) | везде, где endpoint работает per-member: portfolio `member_id`, health profile owner, и т.п. |
| `family_id` | Семья. | `families.id` | — | portfolio `list/compare`, life-road family-scope, health-doctors family-scope |
| `plan_id` | Development plan портфолио. Привязан к `family_members.id` через `member_id`. | `development_plans.id` | — | portfolio `plan_update/plan_delete` |
| `health_profiles.id` | Карточка здоровья. Owned by `users.id` (поле `user_id`) с возможностью share. | `health_profiles.id` | — | health-records, health-medications, health-vitals и т.п. (`profileId` query/body) |
| `selectedProfile.id` | UI-state в `useHealthNew` — это **`health_profiles.id`**, а не actor. | — | **(ANOMALY — используется как X-User-Id)** | — |

**Источник истины для actor:** `userData.id` из login/register response (`backend/auth/index.py`, строка ~177–283). Это и есть `users.id` в строковом виде.

---

## Contract matrix

### Portfolio (`src/services/portfolioApi.ts` + `backend/portfolio/index.py`)

| Endpoint | Method | Actor ID expected | Resource ID(s) | Frontend source | Transport | Status | Notes |
|---|---|---|---|---|---|---|---|
| `?action=get` | GET | `users.id` | `member_id` (family_members.id) | `userData.id` | header X-User-Id; query | OK | stage-3 |
| `?action=aggregate` | GET | `users.id` | `member_id` | `userData.id` | header; query | OK | assert_member_in_actor_family |
| `?action=list` | GET | `users.id` | `family_id` | `userData.id` | header; query | OK | assert_family_match |
| `?action=insights` | GET | `users.id` | `member_id` | `userData.id` | header; query | OK | |
| `?action=achievements` | GET | `users.id` | `member_id` | `userData.id` | header; query | OK | |
| `?action=snapshot` | GET | `users.id` | `member_id` | `userData.id` | header; query | OK | manual trigger |
| `?action=history` | GET | `users.id` | `member_id` | `userData.id` | header; query | OK | + `limit` |
| `?action=plan_create` | POST | `users.id` | `member_id` (body) | `userData.id` | header; body | OK | stage-3 hardening |
| `?action=plan_update` | POST | `users.id` | `plan_id` (query) | `userData.id` | header; query | OK | assert_plan_in_actor_family |
| `?action=plan_delete` | DELETE | `users.id` | `plan_id` | `userData.id` | header; query | OK | |
| `?action=achievement_create` | POST | `users.id` | `member_id` (query) | `userData.id` | header; query | OK | stage-3 hardening |
| `?action=compare` | GET | `users.id` | `family_id` | `userData.id` | header; query | OK | family-scope |
| `?action=ai_insights` | GET | `users.id` | `member_id` | `userData.id` | header; query | OK | |
| `?action=cron_snapshot` | * | — | — | — | `CRON_SECRET` header | OK | system-only, не пересекается с actor flow |

Adapter-layer уже введён: `pickActorUserIdFromStorage(read)` + `getActorUserId()` + `buildHeaders()` в `src/services/portfolioApi.ts:18-47`.

### Life-Road (`src/components/life-road/api.ts`, `useLifeEvents.ts` + `backend/life-road/index.py`)

| Resource | Method | Actor ID expected | Resource ID(s) | Frontend source | Transport | Status | Notes |
|---|---|---|---|---|---|---|---|
| `events` | GET/POST/PUT/DELETE | **`family_members.id`** | `goalId` (опц.) | `localStorage.familyMemberId` → `userData.member_id` → `userData.id` | header X-User-Id | **KNOWN EXCEPTION** | backend делает `SELECT family_id FROM family_members WHERE id = %s` против X-User-Id (`backend/life-road/index.py:55`) |
| `goals` | GET/POST/PUT/DELETE | `family_members.id` | `goalId` | то же | header | KNOWN EXCEPTION | |
| `milestones` | GET/POST/PUT/DELETE | `family_members.id` | `goalId`, `id` | то же | header; query | KNOWN EXCEPTION | |
| `keyresults` | GET/POST/PUT/DELETE | `family_members.id` | `goalId`, `id` | то же | header; query | KNOWN EXCEPTION | |
| `checkins` | GET/POST | `family_members.id` | `goalId` | то же | header; query | KNOWN EXCEPTION | |
| `links` | GET/POST/DELETE | `family_members.id` | `goalId`, `entityId` | то же | header; body | KNOWN EXCEPTION | goal ↔ task/habit bridge |
| `portfolio-links` | GET/POST/DELETE | `family_members.id` | `goalId`, `itemId` | то же | header; body | KNOWN EXCEPTION | reverse: achievement → goals |
| `balance` | GET/POST | `family_members.id` | — | то же | header | KNOWN EXCEPTION | |
| `coach` | POST | `family_members.id` | — | то же | header | KNOWN EXCEPTION | Domovoy AI |
| `cache-backfill` | * | — | — | — | `X-Admin-Token` header | OK | admin-only |

⚠️ **Семантический конфликт:** заголовок называется `X-User-Id`, но backend трактует его как **member_id**. Имя заголовка вводит в заблуждение. См. Anomalies → A1.

### Workshop / Goals (goal ↔ achievement bridge)

| Helper / Call | Goes through | Actor ID transport | Resource IDs | Status | Notes |
|---|---|---|---|---|---|
| `src/lib/goals/tasksBridge.ts` → `lifeApi.createLink()` | life-road | `family_members.id` via life-road | `goalId`, `taskId`, `entityType='task'` | KNOWN EXCEPTION | bridges goal → task |
| `lifeApi.listPortfolioLinksByItem(itemType, itemId)` | life-road | `family_members.id` | `itemType`, `itemId` | KNOWN EXCEPTION | reverse: achievement → goals |
| `lifeApi.attachPortfolioItem(goalId, itemType, itemId)` | life-road | `family_members.id` | `goalId`, `itemType`, `itemId` | KNOWN EXCEPTION | stage 3.3.2 |
| `lifeApi.detachPortfolioItem(linkId)` | life-road | `family_members.id` | `linkId` | KNOWN EXCEPTION | |
| `portfolioApi.achievement_create(memberId)` | portfolio | `users.id` | `member_id` (query) | OK | stage-3 |

> Workshop/Goals не имеет собственного endpoint-семейства. Goal-CRUD идёт через life-road, achievement-CRUD через portfolio. **Acceptance:** обе стороны bridge не пересекают actor-контракт — life-road получает member_id, portfolio получает users.id.

### Health (`useHealthAPI.ts`, `useHealthNew.ts`, `useUploadMedicalFile.ts` + backend/health-*)

| Endpoint | Method | Actor ID expected (backend) | Frontend sends as X-User-Id | Status | Notes |
|---|---|---|---|---|---|
| `/health-profiles` | GET | `users.id` (owner / shared_with) | `userData.member_id || '1'` ⚠️ | **P0 ANOMALY** | `useHealthAPI.ts:15-26` — fallback к строке `'1'`; member_id не равно users.id |
| `/health-profiles` | POST | `users.id` | `userData.member_id || '1'` | P0 ANOMALY | то же |
| `/health-records` | GET | `users.id` (через JOIN на `health_profiles`) | `userData.member_id || '1'` | P0 ANOMALY | |
| `/health-records` | DELETE | `users.id` | **`selectedProfile.id`** (health_profiles.id) ⚠️ | **P0 ANOMALY** | `useHealthNew.ts:111,134` |
| `/health-medications` | GET/DELETE | `users.id` | `userData.member_id || '1'` / `selectedProfile.id` | P0 ANOMALY | |
| `/health-vaccinations` | GET | `users.id` | `userData.member_id || '1'` | P0 ANOMALY | |
| `/health-vitals` | GET | `users.id` | `userData.member_id || '1'` | P0 ANOMALY | |
| `/health-doctors` | GET | `users.id` | `userData.member_id || '1'` | P0 ANOMALY | family-scoped |
| `/health-insurance` | GET | `users.id` | `userData.member_id || '1'` | P0 ANOMALY | |
| `/health-telemedicine` | GET | `users.id` | `userData.member_id || '1'` | P0 ANOMALY | |

⚠️ Health surface — **главный candidate для следующей итерации** (4.2 + 4.3). Подробности — Anomalies → A2, A3.

### Auth + LocalStorage

**Login response shape (`backend/auth/index.py`):**

```python
user_data = {
  'id': str(users.id),         # CANONICAL actor
  'email': ..., 'phone': ...,
  'family_id': str(...),       # optional
  'family_name': ...,
  'member_id': str(family_members.id),  # only when family present
}
```

**Storage keys (в репо реально используются):**

| Key | Source of truth | Shape | Read by |
|---|---|---|---|
| `authToken` | login response | string (token) | auth-context.tsx:21; portfolioApi (через `buildHeaders` — нет, сейчас не читает); useHealthAPI.ts:39; useHealthNew.ts:25,106; useUploadMedicalFile.ts; AuthGuard.tsx |
| `auth_token` | duplicate of authToken | string | AuthPage.tsx:70; tasksBridge.ts:28 |
| `userData` | login response | `{id, email, phone, family_id?, family_name?, member_id?}` | auth-context.tsx:22; portfolioApi.ts:19; life-road/api.ts:21; useHealthAPI.ts:16 |
| `user_data` | duplicate of userData | то же | AuthPage.tsx:71; portfolioApi.ts:19 |
| `user` | legacy alias | то же | portfolioApi.ts:19; life-road/api.ts:21 |
| `familyMemberId` | UI-state | string (family_members.id) | life-road/api.ts:18 |
| `userId` | UI-state legacy | string (ambiguous!) | life-road/api.ts:18 |
| `isDemoMode` | dev flag | `'true'` | useHealthNew.ts:24 |
| `selectedHealthProfile` | sessionStorage | JSON HealthProfile | useHealthNew.ts:32-35 |

**Где storage читается напрямую (не через helper):**
- `src/lib/auth-context.tsx:21-22`
- `src/components/auth/AuthPage.tsx:70-71`
- `src/components/AuthGuard.tsx` (20, 38, 40, 41, 46)
- `src/lib/goals/tasksBridge.ts:28-32`
- `src/hooks/useHealthAPI.ts:16, 39`
- `src/hooks/useHealthNew.ts:24, 25, 106, 132`
- `src/components/life-road/api.ts:17-32`
- ещё ~245 файлов используют localStorage.getItem (общий проектный фон, не весь в scope этапа)

---

## Known exceptions (intentional, NOT bugs)

**KE1 — life-road actor = `family_members.id`, не `users.id`.**
- Где: вся семья endpoints в `backend/life-road/index.py`, строки 42–58.
- Почему intentional: ресурсы life-road (events/goals/milestones) — **per-member**, а семья может иметь несколько активных member-аккаунтов под одним users.id. Привязка к member_id даёт правильную грануляцию.
- **Что нужно сделать в 4.2/4.3:** переименовать заголовок в логике — frontend helper `getCurrentMemberId()` и комментарий рядом с fetch. Имя HTTP-заголовка оставить `X-User-Id` (трогать backend не хочется), но **в коде frontend** называть переменную `actorMemberId`.

**KE2 — `cron_snapshot` / `cache-backfill` без actor.**
- Защищены `CRON_SECRET` / `X-Admin-Token`. Не пересекаются с user-flow.

---

## Anomalies (prioritized)

### P0 — баги контракта, приводящие к ложным 401/403 или утечке доступа

**A1 — Health: `userData.member_id || '1'` как X-User-Id.**
- Файл: `src/hooks/useHealthAPI.ts:15-26`.
- Проблема: backend `health-profiles` ожидает `users.id` (поле `health_profiles.user_id`), а frontend шлёт `family_members.id` с hardcoded fallback `'1'`.
- Последствия: после login без активной семьи (member_id отсутствует) пользователь видит данные user_id=1 (демо-аккаунт). Это de-facto утечка доступа.
- Fix: брать `userData.id`, при отсутствии — fail loud (как сделано в portfolio).

**A2 — Health: `selectedProfile.id` (health_profiles.id) уходит как X-User-Id.**
- Файлы: `src/hooks/useHealthNew.ts:111` (DELETE medication), `:134` (DELETE record), и далее по health-диалогам (массово, см. список из 30+ файлов в Grep).
- Проблема: `health_profiles.id` — это **ID карточки здоровья**, а не actor. Backend ожидает `users.id`. То, что сейчас что-то работает — счастливое совпадение в случаях, когда auth ослаблен.
- Fix: разделить два значения — `X-User-Id` = `userData.id`, а profileId передавать в query/body как `profile_id`.

**A3 — life-road frontend читает `localStorage.userId` напрямую.**
- Файл: `src/components/life-road/api.ts:18`, `src/components/life-road/useLifeEvents.ts:8`.
- Проблема: ключ `userId` неоднозначный — где-то хранит users.id, где-то family_members.id. Семантика не зафиксирована.
- Fix: ввести `getCurrentMemberId()` adapter с явным контрактом и удалить чтение `localStorage.userId` из feature-кода.

### P1 — двусмысленность, не утечка

**A4 — Дублирование ключей `authToken` vs `auth_token`, `userData` vs `user_data` vs `user`.**
- Каждая страница login/register пишет по-своему. Каждый feature-сервис читает по-своему.
- Fix (4.2): одна точка записи (`saveAuth(payload)`), одна точка чтения (`readActor()`).

**A5 — `useHealthAPI.getUserId()` имеет hardcoded `'1'` fallback.**
- Дублирует часть A1, но отдельно опасен сам fallback: это de-facto stub из ранней разработки, оставшийся в проде.
- Fix: убрать константу `'1'`, заменить на `null` + явный 401.

**A6 — `useHealthNew.handleDelete*` дублирует логику fetch.**
- 8+ хэндлеров вручную клеят headers + body. Любая правка контракта (например, переименование заголовка) требует ручного обхода.
- Fix (4.2): вынести в `healthApi` сервис с `buildHeaders()` по образу portfolioApi.

### P2 — стилистика, технический долг

**A7 — Имя HTTP-заголовка `X-User-Id` несёт разную семантику в разных сервисах.**
- Portfolio: users.id. Life-road: family_members.id. Health: должен быть users.id, но фактически member_id.
- Решение: имя HTTP-заголовка не менять (это публичный контракт), но в frontend-helper-ах называть переменные `actorUserId` / `actorMemberId` явно. В backend оставить комментарий в каждом обработчике.

**A8 — `localStorage.getItem('familyMemberId')` встречается напрямую в feature-коде.**
- Тот же класс, что и A3, но без обязательной коннотации с user_id.

---

## Recommended remediation

### Берём в 4.2 (adapter-layer)

Цель — одна точка чтения storage, одно семейство helpers с явными именами.

1. Создать `src/lib/identity.ts` (новый файл):
   - `readActorUserId(): string | null` — возвращает `users.id`, без fallback.
   - `readActorMemberId(): string | null` — возвращает `family_members.id`.
   - `readActorFamilyId(): string | null`.
   - `readAuthToken(): string | null`.
   - Все они читают из единого `userData`/`user_data`/`user`, нормализуя shape.
2. Перевести portfolio на `readActorUserId()` (вместо локального `pickActorUserIdFromStorage`).
3. Перевести life-road на `readActorMemberId()` + переименовать заголовок-сeman­тику в коде.
4. Создать `src/services/healthApi.ts` (тонкий wrapper, аналог portfolioApi) и **полностью** убрать ручной fetch из `useHealthNew` / `useHealthAPI` диалогов. Этот шаг fix-ит A1, A2, A5, A6 одним рефакторингом.
5. Удалить `'1'` fallback. Если actor нет — `throw`/`null`, как уже сделано в portfolio.

### Берём в 4.3 (rename)

- `userId` → `actorUserId` (где это users.id) или `actorMemberId` (где family_members.id).
- В service-слое убрать generic `userId` совсем.
- Поднять явные доменные имена для resource IDs: `profileId`, `planId`, `memberId`, `familyId`.

### Берём в 4.4 (regression)

- `scripts/test-actor-user-id.mjs` уже покрывает portfolio. Добавить второй блок:
  - `readActorUserId` / `readActorMemberId` корректно различают `userData.id` и `userData.member_id`.
  - Health adapter не возвращает `'1'` при отсутствии данных.

### Берём в 4.6 (cleanup)

- Удалить `localStorage.getItem('userId')` из feature-кода (только через identity helper).
- Документировать KE1 (life-road) комментарием в `src/lib/identity.ts` и в `backend/life-road/index.py`.
- Удалить дубликаты `auth_token` / `user_data` (либо записывать только канонические `authToken` / `userData`).

---

## Open questions

- **Q1.** ~~Health backend ожидает users.id или family_members.id?~~ **CLOSED in 4.2:** ответ — `family_members.id`. SQL-проверка на `t_p5815085_family_assistant_pro.health_profiles` показала: 7 из 8 рядов `user_id` матчатся в `family_members`, 0 — в `users`. Это **KE-health**, эквивалентна KE-life-road. Health surface обязан слать `X-User-Id = readActorMemberId()`. Зафиксировано в `src/services/healthApi.ts` (комментарий-шапка).
- **Q2.** Должны ли мы менять имя HTTP-заголовка `X-User-Id` → `X-Actor-Member-Id` в life-road? Сейчас предлагается не менять (риск ломки сторонних интеграций), но фиксируем как открытый вопрос.
- **Q3.** Demo-mode (`isDemoMode`) пересекается с health surface — нужно ли в 4.2 явно ветвить identity helper по demo-mode, или пусть demo живёт отдельной веткой через `DEMO_*` константы (как сейчас)?