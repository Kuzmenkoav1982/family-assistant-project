# Stage 4 — ID Contracts Inventory

## Purpose / Status

- **Stage:** `stage-4-contract-convergence`
- **Sub-stage:** 4.6 — cleanup (done). 4.6.1 part A (helper) + part B (callsite migration) done. 4.6.2 done. 4.6.3 done с safe verdict для orphan.
- **Status:** 4.1 / 4.2 / 4.3 / 4.4 / 4.5 / 4.6 — done по коду. Финальные блокеры sign-off — runtime: `node scripts/test-actor-user-id.mjs` + browser smoke S1–S10.
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

### Stage 4.3 changelog

- ✅ `src/components/life-road/api.ts` — старый `getUserId()` (`localStorage.familyMemberId || localStorage.userId || JSON.parse(userData).member_id || .id`) удалён. Введён `getActorMemberId()` поверх `readActorMemberId()`. Никаких fallback на `users.id` — если member_id нет, бросаем явную ошибку. Закрывает **A3**.
- ✅ `src/components/life-road/useLifeEvents.ts` — аналогично переведён на `readActorMemberId()`. Локальный `getUserId()` удалён.
- ✅ `src/components/life-road/LifeEventDialog.tsx` — `handleFile` photo upload теперь читает actor через identity adapter (`readActorMemberId()`), а не через `localStorage.familyMemberId || localStorage.userId`. Закрывает последний raw localStorage read в life-road зоне.
- ✅ `src/lib/goals/tasksBridge.ts` — auth token читается через `readAuthToken()` вместо ручной `localStorage.getItem('auth_token') || localStorage.getItem('authToken')`. Bridge-код использует только доменные имена ресурсов (`goalId`, `taskId`, `milestoneId`, `keyResultId`).
- ✅ `src/services/medicationNotifications.ts` — `loadMedications()` переведён на `healthApi.get('medications')`. Удалён старый паттерн `userData.member_id || '1'` и ручная сборка fetch + headers. Это **второй очаг A1**, найденный в 4.3 и закрытый.
- ✅ **KE-life-road не сломан:** backend-контракт не менялся, `X-User-Id` по-прежнему = `family_members.id`, имя HTTP-заголовка осталось прежним. Изменилось только то, ОТКУДА на frontend этот id берётся.

### Rename map (4.3)

| Old (ambiguous) | New (domain-explicit) | Where |
|---|---|---|
| `getUserId()` (life-road) | `getActorMemberId()` → `readActorMemberId()` | `src/components/life-road/api.ts` |
| `getUserId()` (life-events hook) | inline `readActorMemberId()` | `src/components/life-road/useLifeEvents.ts` |
| `userId` (life-road dialog photo upload) | `actorMemberId` | `src/components/life-road/LifeEventDialog.tsx` |
| `getAuthToken()` (tasksBridge) | `readAuthToken()` | `src/lib/goals/tasksBridge.ts` |
| `userId` в `medicationNotifications` | удалён (заменён `healthApi`) | `src/services/medicationNotifications.ts` |

Имена `memberId`, `familyId`, `planId`, `profileId`, `goalId`, `taskId`, `milestoneId`, `keyResultId`, `linkId`, `itemId`, `entityId` уже доменные и в правильных местах — на 4.3 их не трогаем.

### Что осталось на 4.6 (cleanup)

- **A4** Дубликаты storage-ключей: `authToken` vs `auth_token`, `userData` vs `user_data` vs `user` — записи всё ещё идут в оба ключа в `AuthPage.tsx` / `AuthForm.tsx`. identity adapter их прозрачно читает, но **запись** надо унифицировать.
- `localStorage.getItem('userId')` / `'familyMemberId'` всё ещё встречается ВНЕ life-road / health: `pages/PermissionsManagement.tsx`, `hooks/useUploadMedicalFile.ts`, `components/pets/PetsAI.tsx`, `lib/devAgent/api.ts`. Эти места не в scope 4.3 (это не life-road / health surfaces), но они кандидаты на rename через identity adapter в 4.6.
- `useUploadMedicalFile`: специально оставлен на 4.6 — там перемешаны три identity (X-User-Id для upload endpoint, family_id как resource в body, uploaded_by как actor в children-data). Нужен отдельный mini-discovery: какой endpoint что ждёт. Не критичный baseline риск, потому что upload отдельной кнопкой не вызывается без явного контекста.
- Прямое чтение `localStorage.authToken` / `userData` в auth-context.tsx, AuthGuard.tsx — оставлено: контекст-провайдер сам формирует state из storage; identity helpers свою задачу делают параллельно.

### Stage 4.4 changelog

- ✅ `scripts/test-actor-user-id.mjs` расширен с 23 до 47 кейсов:
  - Блок 3 добавлено 7 кейсов (битый JSON, fallback на user_data, legacy `user` key, alias `familyId`/`memberId`/`user_id`, пустая строка для `id`).
  - **Блок 4 (новый)** — identity helpers (`readActorUserId / readActorMemberId / readActorFamilyId / readAuthToken`): 4 happy-path кейса + 2 критических инварианта (member_id не подменяет user_id и наоборот).
  - **Блок 5 (новый)** — portfolio transport contract: X-User-Id строго == users.id, нет fallback на member_id, пустой storage → нет fake header.
  - **Блок 6 (новый)** — health transport contract (KE-health): X-User-Id == family_members.id; нет fallback на users.id / `'1'`; token идёт через `Authorization: Bearer`.
  - **Блок 7 (новый)** — life-road actor contract (KE-life-road): при отсутствии member_id explicit `throw`, не silent fall-back; битый JSON тоже даёт throw.
- ✅ Шапка runner-а перепиcана: список блоков, пример ожидаемого вывода, ссылки на source-of-truth файлы в проде.
- ✅ Все блоки self-contained, без внешних зависимостей. Запуск — обычный `node`, без ts-node / vitest / jest.

### How to run regression checks

```bash
node scripts/test-actor-user-id.mjs
```

Exit code 0 — всё OK, 1 — найден FAIL (тогда ниже в выводе будет блок `Провалы:` с диффом ожидание/факт).

**Что подтверждает прогон (47 кейсов в 7 блоках):**

| Зона | Блоки | Кол-во | Что закреплено |
|---|---|---|---|
| Identity adapter | 3, 4 | 22 | `readActorUserId`/`MemberId`/`FamilyId`/`AuthToken` различают разные сущности; нет fallback `'1'`; legacy ключи `user_data`/`user`/`auth_token` работают; битый JSON безопасен. |
| Portfolio | 1, 2, 5 | 17 | X-User-Id всегда == `users.id`. Нет подмены `member_id` на `users.id` ни при каких комбинациях storage. |
| Health | 6 | 4 | X-User-Id всегда == `family_members.id` (KE-health). Нет fallback `'1'`. Token идёт отдельно через `Authorization: Bearer`. |
| Life-road | 7 | 4 | X-User-Id всегда == `family_members.id` (KE-life-road). При отсутствии member_id — explicit throw. |

**Что НЕ подтверждает прогон (blind spots):**

- Не симулирует реальный HTTP — backend контракт проверяется отдельно (backend regression `backend/portfolio/tests.json`, 20/20).
- Не симулирует браузер — DOM-эффекты `useEffect`, sessionStorage, `useState` не покрываются (это закрыто manual checklist в Stage 4.5 ниже).
- Не проверяет `useUploadMedicalFile` (отложено на 4.6 — там mini-discovery, 3 семантики ID перемешаны).
- Не проверяет auth write-path (`saveAuth`, `localStorage.setItem` дубликаты в `AuthPage.tsx` / `AuthForm.tsx` — это A4, отложено на 4.6).
- Не проверяет полную типизацию (TS compile — это работа линтера/vite, не runner-а).

**Когда обновлять runner:**

- Поменялся `src/lib/identity.ts` → синхронизируй Блок 3 (локальная копия adapter-а).
- Поменялся `src/services/portfolioApi.ts` → синхронизируй Блок 5.
- Поменялся `src/services/healthApi.ts` → синхронизируй Блок 6.
- Поменялся life-road actor selection → синхронизируй Блок 7.

---

## Stage 4.5 — Golden paths smoke checklist

Назначение: ручной контрольный лист для проверки горячих сценариев в браузере
**после правок identity / auth / transport кода**. Это **manual smoke**, не
автоматизированный E2E — поэтому статусы здесь устанавливаются человеком.

Условные обозначения статусов:
- `pending` — ещё не прогоняли в этой итерации.
- `pass` — прогнали, всё ок.
- `fail` — прогнали, нашли регрессию (фиксировать в Findings).
- `n/a` — поток сейчас недоступен / заблокирован отдельно.

### Чеклист (10 сценариев)

#### S1. Auth bootstrap (login на чистом storage)

| Поле | Значение |
|---|---|
| Preconditions | Storage очищен: `localStorage.clear(); sessionStorage.clear()`. Открыт `/login`. |
| Steps | 1) Залогиниться валидной парой email+password. 2) Дождаться редиректа. 3) Сделать F5 (hard reload). |
| Expected UI | После шага 2 пользователь видит свой dashboard. После reload (шаг 3) state восстанавливается, identity не теряется. |
| Expected network | `POST /auth` 200; в response `user_data.id` присутствует. После reload первые protected запросы шлют `X-User-Id` либо `Authorization: Bearer ...` (а не оба пусто). |
| Status | `pending` |
| Notes | Если после reload запросы летят без identity — проверь, что AuthProvider успел прочитать storage до первого fetch. |

#### S2. Portfolio read path

| Поле | Значение |
|---|---|
| Preconditions | S1 passed. Открыта страница portfolio для активного member. |
| Steps | 1) Открыть portfolio member page. 2) Открыть DevTools → Network → filter `portfolio`. |
| Expected UI | Загружаются `aggregate`/`get`, страница не показывает 401/403. |
| Expected network | Все запросы к portfolio функции содержат `X-User-Id` == `userData.id` (users.id). `member_id` идёт **только в query**, не в header. |
| Status | `pending` |
| Notes | Проверить, что `member_id` в query — это `family_members.id`, не `userData.id`. |

#### S3. Portfolio write path (plan create / achievement create)

| Поле | Значение |
|---|---|
| Preconditions | S2 passed. |
| Steps | 1) Создать development plan ИЛИ ручное achievement. 2) Дождаться refetch. 3) Перезайти на страницу. |
| Expected UI | Plan / achievement появляется в списке. После refetch не пропадает. |
| Expected network | `POST /portfolio?action=plan_create` или `?action=achievement_create` 200/201. `X-User-Id` == `userData.id`. В body — `member_id`, как resource. |
| Status | `pending` |
| Notes | После cd-режима (если стоит `isDemoMode=true`) данные ходят в demo-аккаунт. Чтобы тестировать прод-контракт — снять demo. |

#### S4. Health read path

| Поле | Значение |
|---|---|
| Preconditions | S1 passed. |
| Steps | 1) Открыть `/health-new` или `/children/.../health`. 2) Выбрать профиль. 3) Открыть Network → filter `health-`. |
| Expected UI | Профили подгружаются, выбранный профиль показывает records / medications / vitals. |
| Expected network | Все `health-*` запросы шлют **`X-User-Id` == `userData.member_id`** (family_members.id), плюс `Authorization: Bearer ...`. **Ни одного запроса с `X-User-Id: 1`** (старый fallback) и **ни одного с `X-User-Id == selectedProfile.id`** (старый баг A2). |
| Status | `pending` |
| Notes | Если в profile-list 0 элементов — это не баг auth, это `health_profiles.user_id` не совпал с member_id в БД (см. SQL-проверку в 4.2). |

#### S5. Health destructive action (delete medication / delete record)

| Поле | Значение |
|---|---|
| Preconditions | S4 passed, профиль выбран, есть minimum 1 medication и 1 record. |
| Steps | 1) Удалить medication (любое, кроме напоминания). 2) Удалить health record. 3) Refresh. |
| Expected UI | После каждого удаления — toast "удалено". Список обновляется. |
| Expected network | `DELETE /health-medications` и `DELETE /health-records` — оба со `X-User-Id == userData.member_id`. **`X-User-Id != selectedProfile.id`** (это закрытая A2). В body — `{ id: <recordId|medicationId> }`. |
| Status | `pending` |
| Notes | Самый важный сценарий для верификации stage-4: именно тут жил баг "selectedProfile.id уходит в X-User-Id". |

#### S6. Life-road read path

| Поле | Значение |
|---|---|
| Preconditions | S1 passed. |
| Steps | 1) Открыть Мастерскую жизни / life-road. 2) Network → filter `life-road`. |
| Expected UI | Загружаются events, goals, balance. |
| Expected network | Все life-road запросы шлют `X-User-Id == userData.member_id` (KE-life-road). **Ни одного запроса с `X-User-Id == userData.id`** (это была бы регрессия в обратную сторону). |
| Status | `pending` |
| Notes | Если member_id отсутствует — frontend должен бросить controlled error "Не найден member_id" (это закрепляет Блок 7 регрессии). |

#### S7. Life-road create/update (event + photo)

| Поле | Значение |
|---|---|
| Preconditions | S6 passed. |
| Steps | 1) Создать новое событие через диалог. 2) Прикрепить фото. 3) Сохранить. 4) Открыть это событие на редактирование, поменять текст. 5) Сохранить. |
| Expected UI | Событие появляется на оси, фото отображается, edit сохраняется. |
| Expected network | `POST /life-road?resource=events` 200, `POST /life-road?resource=photo` 200, `PUT /life-road?resource=events&id=...` 200 — все со `X-User-Id == userData.member_id`. **Запрос photo upload больше не использует `localStorage.userId` напрямую** (это закрытая часть A3). |
| Status | `pending` |
| Notes | Если photo upload бросает "Не найден member_id" — значит identity ещё не загрузилось; повторить после полного onboarding. |

#### S8. Workshop ↔ Goals bridge (achievement → goal link, reverse lookup)

| Поле | Значение |
|---|---|
| Preconditions | S2 и S6 passed. В portfolio есть хотя бы 1 achievement; в life-road хотя бы 1 goal. |
| Steps | 1) Из achievement detail → attach к goal (или из goal → attach achievement). 2) Открыть reverse-list: со стороны achievement увидеть привязанные goals. 3) Detach. |
| Expected UI | Attach/detach работают, reverse-list актуален. |
| Expected network | `POST /life-road?resource=portfolio-links` (attach), `GET /life-road?resource=portfolio-links&itemType=achievement&itemId=...` (reverse). Оба со `X-User-Id == userData.member_id`. Доменные resource IDs (`goalId`, `itemId`, `linkId`) в payload. Никакого generic `userId` в body. |
| Status | `pending` |
| Notes | Bridge — самое чувствительное место к семантической путанице, т.к. сразу два сервиса с разной actor-семантикой (portfolio = users.id, life-road = member.id). |

#### S9. Missing identity negative path

| Поле | Значение |
|---|---|
| Preconditions | Залогинены. |
| Steps | 1) Открыть DevTools → Application → Local Storage. 2) Очистить **только** `userData`/`user_data`/`user` (оставив `authToken`, чтобы не считалось logout-ом). 3) Перейти на portfolio / health / life-road. |
| Expected UI | На каждом из трёх экранов — controlled fail: ошибка или 401 от backend. **Никакого** silent-успеха с чужими данными. |
| Expected network | Portfolio: запрос уходит **без** `X-User-Id` → backend 401. Health: то же. Life-road: запрос **не уходит** (throw в `getActorMemberId()`); UI показывает ошибку "Не найден member_id". **Ни одного `X-User-Id: 1` нигде.** |
| Status | `pending` |
| Notes | После прогона восстановить storage (logout + login заново). |

#### S10. Relogin contamination check

| Поле | Значение |
|---|---|
| Preconditions | Доступны два тест-аккаунта (A и B). |
| Steps | 1) Залогиниться как A. 2) Открыть portfolio + health (запомнить какие IDs ушли в headers). 3) Logout. 4) Залогиниться как B. 5) Открыть portfolio + health. 6) Сравнить headers с шага 2. |
| Expected UI | После шага 4 UI показывает данные B, а не A. |
| Expected network | На шаге 5 — все `X-User-Id` соответствуют B (userData.id для portfolio, userData.member_id для health/life-road). **Ни в одном запросе** не приезжает старый ID пользователя A. |
| Status | `pending` |
| Notes | Самый частый класс утечек — кеши в `useState`/`useRef`, которые не сбрасываются на logout. Если что-то протекает — фиксировать в Findings и чинить в отдельном micro-fix. |

### Network invariants (быстрый sanity-чеклист в DevTools)

При любой ручной проверке держать эти инварианты в голове. Любое нарушение — регрессия в stage-4.

- ✅ Portfolio → `X-User-Id` == `userData.id` (users.id). Всегда.
- ✅ Health → `X-User-Id` == `userData.member_id` (family_members.id). Всегда.
- ✅ Life-road → `X-User-Id` == `userData.member_id` (family_members.id). Всегда.
- ✅ `Authorization: Bearer <token>` идёт **в дополнение** к `X-User-Id`, а не **вместо** него.
- ❌ `profileId` НИКОГДА не используется как actor identity — только как resource в query/body.
- ❌ `selectedProfile.id` НИКОГДА не идёт в `X-User-Id`.
- ❌ `'1'` НИКОГДА не используется как fallback identity.
- ❌ `userData.id` НИКОГДА не уходит как `X-User-Id` в health или life-road (там должен быть `member_id`).
- ❌ `userData.member_id` НИКОГДА не уходит как `X-User-Id` в portfolio (там должен быть `userData.id`).

### Findings (заполняется во время прогона)

Здесь фиксируются реальные результаты браузерного smoke. Формат записи:

```
[S<N>] <pass|fail|n/a> <YYYY-MM-DD> <короткое описание>
  URL:              <req URL>
  Status:           <HTTP status>
  X-User-Id:        <value>
  Response body:    <snippet>
  Notes:            <что бросилось в глаза>
```

Текущий статус: **нет ни одного факт-прогона в этом канале** (см. секцию `4.5 execution status` ниже).

### 4.5 execution status

- Checklist составлен (10 сценариев + 9 инвариантов).
- Фактический browser-smoke — `pending`. У меня в этом канале нет shell-runtime и нет браузера, поэтому реальный прогон выполняется на твоей стороне.
- Когда прогоняешь — заполняй колонку `Status` в каждой таблице и добавляй записи в `Findings`.

### 4.5 follow-up: node runner status

- Я **не могу** выполнить `node scripts/test-actor-user-id.mjs` в этом канале — нет shell-tool.
- Что я **могу** обещать со своей стороны:
  - Файл syntactically self-consistent: 47 кейсов, exit 0/1 path, нет dangling braces (визуально проверил последние строки).
  - Source-of-truth для каждого блока (identity adapter, portfolio buildHeaders, health buildHeaders, life-road actor) совпадает с прод-кодом по состоянию на коммит 7a88193.
- Когда у тебя будет реальный вывод — приложи его сюда (полный текст консоли). Если найдётся `FAIL` — поправим точечно.

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

---

## Stage 4.6 — Cleanup (final)

Задача sub-stage 4.6 — закрыть три остаточных хвоста stage-3/4:
- **4.6.1** — унификация auth write-path (writes/removes размазаны по 10+ файлам).
- **4.6.2** — разбор raw `localStorage.getItem('userId')` по семантике.
- **4.6.3** — mini-discovery `useUploadMedicalFile.ts` (orphan endpoint + children-data).

### 4.6.1 — Auth write-path unification

**Discovery (Explore-агент, 22 callsite-а):**

| Категория | Файлов | Callsite-ов | Note |
|---|---|---|---|
| SET pairs `(token, user)` | 10 | 14 | 5 разных shape user-объекта, 3 варианта ключей |
| REMOVE pairs | 7 | 8 | Несимметричные logout-ы: чистят только часть ключей |

**Конфликт shape user-объекта (5 вариантов):**

1. OAuth/Login: `{ id, email, name, family_id, member_id, access_role }`
2. ActivateCallback: `{ id, email, family_id, member_id }`
3. TestSelector: `{ id, member_id, family_id, name, role, avatar, permissions }`
4. Settings (patch): `{ ...existing, family_name, logo_url, banner_url }`
5. JoinFamily (patch): `{ ...existing, family_id, family_name, member_id }`

**Helper создан (`src/lib/authStorage.ts`):**

| Function | Назначение |
|---|---|
| `saveAuthSession({ token, user })` | Full write. Canonical `authToken`+`userData` + legacy mirror в `auth_token`/`user_data`/`user`. |
| `updateAuthUser(patch)` | Partial merge для JoinFamily/Settings. Token не трогает. |
| `clearAuthSession()` | Full clear всех вариантов ключей. |
| `hasAuthSession()` | Sanity-check без валидации token. |

**Парный READ:** `src/lib/identity.ts` (4.2). Семантика не дублируется — это противоположная сторона.

**Status (post-migration):** helper создан + миграция 10 prod-callsite-ов выполнена за один проход. Debug/Test/OAuthDebug — намеренно не тронуты.

**Мигрированные prod-файлы (10/10):**

| # | Файл | Helper-вызовы |
|---|---|---|
| 1 | `src/pages/Login.tsx` | 2× `saveAuthSession` (OAuth callback + email/password) |
| 2 | `src/pages/Register.tsx` | 1× `saveAuthSession` |
| 3 | `src/components/AuthForm.tsx` | 2× `saveAuthSession` (login + register branches) |
| 4 | `src/pages/ActivateCallback.tsx` | 1× `saveAuthSession` (с merge `family_id`/`member_id`) |
| 5 | `src/components/auth/AuthPage.tsx` | 1× `saveAuthSession` (snake_case raw writes сняты — helper зеркалит сам) |
| 6 | `src/pages/JoinFamily.tsx` | 1× `updateAuthUser({ family_id, family_name, member_id })` |
| 7 | `src/hooks/usePermissions.ts` | 1× `updateAuthUser({ access_role })` |
| 8 | `src/pages/Settings.tsx` | 1× `updateAuthUser(userPatch)` |
| 9 | `src/components/AuthGuard.tsx` | 1× `updateAuthUser` (success) + 3× `clearAuthSession` (fail/reset/logout) |
| 10 | `src/App.tsx` | 1× `clearAuthSession` (handleLogout) |

**Итого: 15 helper-вызовов в 10 prod-файлах.**

**Допустимые остатки прямого `localStorage.setItem(<auth-key>, ...)` после миграции:**
- `src/lib/authStorage.ts` — сам helper (canonical + legacy mirror).
- `src/pages/DebugAuth.tsx`, `src/components/TestAccountSelector.tsx`, `src/pages/OAuthDebug.tsx` — debug/test, не тронуты по acceptance.

### 4.6.2 — Raw `localStorage.getItem('userId')` cleanup

Discovery + classification:

| File:Line | Goes To | Backend | Semantic | Verdict | Status |
|---|---|---|---|---|---|
| `pages/PermissionsManagement.tsx:19` | локальная переменная для UI | — (нигде не отправляется) | actorUserId-like comparison | safe as-is — UI-only | left as-is |
| `components/pets/PetsAI.tsx:108` | JSON body `payload.userId` | `ai-assistant` (c0645bee-...) | actorUserId | replace with `readActorUserId()` | **DONE** |
| `lib/devAgent/api.ts:31` | header `X-User-Id` (fallback) | dev-agent-admin / dev-agent-indexer | actorUserId (комментарий в коде явно говорит "users.id, NOT family_members.member_id") | replace with `readActorUserId()` | **DONE** |
| `hooks/useUploadMedicalFile.ts:73` | header `X-User-Id` | **orphan** `2db47477-...` (backend в репо НЕ найден) | unknown — контракт не подтверждён | **leave as-is (orphan)** | left as-is per safe verdict |

**После cleanup:**

```
grep "localStorage.getItem.{0,3}userId" src/**
→ 2 совпадения:
   - useUploadMedicalFile.ts:73  (orphan, осознанное исключение)
   - PermissionsManagement.tsx:19 (UI-only, не actor)
```

Оба остатка — задокументированы и обоснованы.

### 4.6.3 — useUploadMedicalFile.ts discovery matrix

| Step | Endpoint | Auth mechanism | Actor semantic | Resource fields | Verified from repo | Verdict |
|---|---|---|---|---|---|---|
| 1 | `2db47477-9dfd-49f9-8f51-7ff388753d82` (orphan upload) | `X-Auth-Token`, `X-User-Id` headers | **unknown** | `file`, `filename`, `fileType`, `documentType`, `childId`, `relatedId`, `relatedType`, `title`, `description` (JSON body) | **no** (orphan — функция отсутствует в `backend/`) | request shape **frozen**: do not change without backend confirmation. Изменён ТОЛЬКО источник токена (raw → `readAuthToken()`). `X-User-Id` оставлен на raw `localStorage.getItem('userId')` как было. |
| 2 | `d6f787e2-2e12-4c83-959c-8220442c6203` (children-data save) | `X-Auth-Token` header only (X-User-Id не используется на backend для authz) | none enforced by backend | `family_id`, `uploaded_by` пишутся as-is в payload | **yes** (backend подтверждён: payload as-is) | **provisional frontend mapping**: `family_id ← readActorFamilyId()` (families.id), `uploaded_by ← readActorUserId()` (users.id). Это допущение, не подтверждённый backend-контракт. |

**Source-of-truth для helper-ов:** `src/lib/identity.ts` (read) + `src/lib/authStorage.ts` (write, после миграции callsite-ов).

### 4.6 grep verification (final state, post-cleanup)

Все grep-проверки выполнены против актуального `src/`:

```
# Raw actor reads
grep -RInE "localStorage\.getItem\(['\"]userId['\"]\)" src
  → 1 hit:
    src/hooks/useUploadMedicalFile.ts:73   (orphan endpoint, осознанно frozen)

grep "(localStorage|storage)\.(setItem|removeItem)\(['\"](authToken|auth_token|userData|user_data|user)['\"]" src
  → допустимые остатки:
    src/lib/authStorage.ts                 (helper, canonical + legacy mirror)
    src/pages/DebugAuth.tsx                (debug)
    src/components/TestAccountSelector.tsx (test)
    src/pages/OAuthDebug.tsx               (debug)
  → prod-нарушители: 0 ✓

grep -RInE "saveAuthSession|updateAuthUser|clearAuthSession" src
  → 15 helper-вызовов в 10 prod-файлах + сам helper.
```

### 4.6 acceptance status (post-migration)

| Acceptance criterion (из плана) | Status |
|---|---|
| Все auth writes идут через одну helper-точку | **done** (10 prod-файлов, 15 вызовов) |
| Дубликаты write-path не размазаны | **done** (`saveAuthSession`/`updateAuthUser`/`clearAuthSession` — единственные prod-write-points) |
| Остаточные raw `userId` reads разобраны по семантике | **done** (4 файла классифицированы; 1 hit оставлен — orphan) |
| Безопасные места переведены на adapter | **done** (PetsAI → `readActorUserId`, devAgent → `readActorUserId`, PermissionsManagement → `readActorMemberId`) |
| `useUploadMedicalFile.ts` прошёл mini-discovery | **done** (matrix зафиксирована, orphan frozen, children-data — provisional mapping) |
| Docs обновлены | **done** |
| Regression-runner актуален | **pending** — фактический прогон на стороне пользователя |

### 4.6 final blockers для sign-off stage 4

1. **node `scripts/test-actor-user-id.mjs`** — фактический прогон + вывод консоли.
2. **Browser smoke S1–S10** (из 4.5) — хотя бы первые 5 закрывают A1/A2/A3.
3. **(Optional)** `npm run lint` + `npm run build` — желательно зелёные.