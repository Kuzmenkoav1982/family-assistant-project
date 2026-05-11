# ТЗ: Domovoy AI Studio («Мозг Домового»)

> Продвинутый кабинет управления ИИ-Домовым в админ-зоне «Наша Семья».
> Документ собран по решениям из обсуждения 11.05.2026.

---

## 0. Версия и решения, зафиксированные на входе

| # | Вопрос | Решение |
|---|--------|---------|
| 1 | Trace-политика | Краткий trace всегда (PostgreSQL). Полный trace (S3) — в debug + sandbox + errors/retry/timeout + low feedback + post-release window. Ручные включатели по семье/роли/времени. Ретеншн: краткий 180д, полный 30д (90д для ошибок и sandbox). |
| 2 | Публикация | Draft → Sandbox test → Publish. Версионирование. Rollback в 1 клик. Statuses: `draft \| published \| archived`. Одна активная published-версия на (entity, environment). |
| 3 | Среды | env-flag `stage \| prod` во всех ключевых сущностях (versions, configs, traces, tests, flags). Один контур инфраструктурно, но разделение логическое. Promotion flow `stage → prod`. |
| 4 | Формат ТЗ | Полная целевая архитектура + roadmap V1→V3 + детальный Stage 1 «бери и делай». V2/V3 — рамки и критерии. |

---

## 1. Цель и принципы

### 1.1 Цель
Создать в админке продвинутый кабинет управления ИИ Домовым, который позволяет:
- понимать архитектуру его работы (а не только редактировать поля),
- управлять ролями, prompt-ами и параметрами модели,
- видеть, какие данные и изображения участвуют в каждом сценарии,
- тестировать поведение в песочнице,
- отслеживать trace каждого ответа,
- безопасно вносить изменения через draft → publish, версии, diff и rollback.

### 1.2 Главный принцип
> Кабинет показывает не только **что можно изменить**, но и **почему ИИ работает именно так**.

Для каждой настройки — блок «что делает / где влияет / какие риски / где используется / как проверить изменение».

### 1.3 Что НЕ делаем
- Не ломаем существующую `/admin/domovoy` (донаты, платежи) — расширяем рядом.
- Не показываем значения секретов (только статус «подключено/нет»).
- Не пишем полный trace бездумно — приватность важнее аналитики.
- Не строим две инфраструктуры — env-разделение логическое.

---

## 2. Текущая реальность (база для миграции)

### 2.1 Что есть в коде сейчас
| Сущность | Где живёт | Кол-во |
|---|---|---|
| 15 ролей Домового | `src/contexts/AIAssistantContext.tsx:29-45` | 15 |
| Системные промпты ролей | `src/components/SectionAIAdvisor.tsx:42-55` | 12 ролей с промптами, 3 без |
| Базовый persona-prompt | `src/components/SectionAIAdvisor.tsx:142-175` (`buildSystemPrompt`) | 2 (domovoy / neutral) |
| Картинки ролей | `src/lib/domovoyRoleImages.ts:8-24` | 15 |
| Фоновые цвета ролей | `src/lib/domovoyRoleImages.ts:50-66` | 15 |
| CSS-zoom ролей | `src/lib/domovoyRoleImages.ts:77-79` | 1 (family-assistant) |
| Параметры YandexGPT | `backend/ai-assistant/index.py:212-218` | model=`yandexgpt-lite`, temp=0.7, maxTokens=3000, folder_id зашит |
| Цена за ответ | `backend/ai-assistant/index.py:158` | 3 ₽ |
| Глубина истории | `backend/ai-assistant/index.py:194` | 10 сообщений |
| Приветствия | `src/components/AIAssistantDialog.tsx:24-33` | 6 фраз |
| Тексты благодарности | `src/pages/DomovoyPage.tsx:60-65` | 4 фразы |
| Уровни 1-10 | `src/pages/DomovoyPage.tsx:124-127` | 4 порога |

### 2.2 Что есть в БД
| Таблица | Назначение |
|---|---|
| `assistant_settings` | Настройки ассистента у пользователя (type, name, role, level) |
| `domovoy_levels` | Уровни Домового по user_id |
| `domovoy_donations` | История донатов |
| `payment_settings` | Конфиг платежей (СБП, карта, ЮMoney) |
| `chat_messages` (схема `t_p5815085_family_assistant_pro`) | История диалога, есть колонка `role` (user/assistant) |

### 2.3 Что есть в админке
- `/admin` — главная (12+ табов).
- `/admin/domovoy` — донаты, платежи, настройки (3 таба). Расширяем именно её.

### 2.4 Что критично перенести из кода в БД на Stage 1
1. 15 ролей + промпты + картинки + цвета → `domovoy_roles` + `domovoy_role_versions` + `domovoy_assets`.
2. Параметры YandexGPT → `domovoy_ai_configs`.
3. `folder_id` `b1gaglg8i7v2i32nvism` — убрать хардкод, читать из конфига.
4. Цена 3₽ и глубина 10 — в конфиг.

---

## 3. Целевая архитектура

### 3.1 Pipeline сборки ответа

```
[User input] 
   ↓
[1. Role Resolver]    ← entry_point (хаб/страница) → role_code → active role_version
   ↓
[2. Context Builder]  ← вызывает domovoy-context: финансы, дом, задачи, дети, питомцы…
   ↓                    (по разрешённым для роли источникам и приоритетам)
[3. Memory Layer]     ← chat_messages: последние N сообщений (N из ai_config)
   ↓
[4. Prompt Builder]   ← persona + role_prompt + safety + memory + context + formatting
   ↓                    Создаёт final_prompt, считает токены, prompt_checksum
[5. LLM Engine]       ← YandexGPT (model, temperature, maxTokens из ai_config)
   ↓                    Retry policy, fallback model, timeout
[6. Post-processing]  ← фильтры, обрезка, форматирование, safety check ответа
   ↓
[7. Trace & Audit]    ← short trace в PostgreSQL, full trace в S3 по правилам
   ↓
[8. Visual Layer]     ← возврат на фронт с метаданными (role image, color, version)
   ↓
[Response to user]
```

Каждый из 8 слоёв — отдельная сущность в Studio, отдельный inspector, отдельный chunk в trace.

### 3.2 Слои (first-class entities)

| Сущность | Назначение |
|---|---|
| **Persona** | Базовый «характер» Домового (domovoy / neutral). Глобальный для всех ролей. |
| **Role** | «Кем притворяется» Домовой (повар, психолог…). 15 базовых + расширяемо. |
| **RoleVersion** | Конкретная редакция роли. Содержит prompt, greeting, examples, safety, tone. Версионируется. |
| **AIConfig** | Параметры движка LLM. По умолчанию глобальный + override по роли. |
| **ContextSource** | Источник данных для prompt (финансы, дом, дети…). Каждый — со своим лимитом и приоритетом. |
| **Asset** | Картинка/медиа Домового. С usage map. |
| **AssetUsage** | Где конкретно используется asset (страница, компонент, роль). |
| **Trace (short)** | Краткий «паспорт ответа». PostgreSQL. На каждый ответ. |
| **TraceFull** | JSON-блоб полного следа сборки. S3. По правилам Trace Policy. |
| **TestCase** | Эталон проверки поведения роли. |
| **TestRun** | Прогон теста с результатом. |
| **AuditEvent** | Кто что и когда изменил. |
| **FeatureFlag** | Включатели/выключатели экспериментов. |

### 3.3 Environment model
- Каждая ключевая сущность (`role_versions`, `ai_configs`, `texts`, `feature_flags`) имеет поле `environment ENUM('stage','prod')`.
- Песочница и тестовые семьи по умолчанию работают со `stage`-версиями.
- Боевой трафик — `prod`.
- Promotion: `stage → prod` через явное действие «Promote to production» с подтверждением и audit event.
- Промо не копирует, а помечает stage-версию как «промотированную» и создаёт parallel prod-published.

### 3.4 Trace Policy (детально)

**Краткий trace (всегда, PostgreSQL `domovoy_prompt_traces`):**
```
trace_id, created_at, family_id, user_id, session_id,
role_code, role_version_id, environment,
entry_point, model, temperature, max_tokens, history_depth,
input_tokens, output_tokens, latency_ms,
status (ok/error/retry/fallback/timeout), error_code,
feedback_score, prompt_checksum,
context_summary (jsonb: какие источники подмешались),
full_trace_available (bool), full_trace_s3_key (text|null),
full_trace_reason (debug/sandbox/error/feedback/post_release|null)
```

**Полный trace (S3 `domovoy/traces/{yyyy}/{mm}/{dd}/{trace_id}.json`):**
```json
{
  "trace_id": "...",
  "persona_block": "...",
  "role_block": "...",
  "safety_block": "...",
  "memory_block": [...],
  "context_block": { "finance": {...}, "household": {...}, ... },
  "formatting_block": "...",
  "final_prompt": "...",
  "model_request": {...},
  "model_response_raw": {...},
  "postprocessed_response": "...",
  "timings": {"resolver_ms":..,"context_ms":..,"prompt_ms":..,"llm_ms":..,"post_ms":..},
  "flags": {...},
  "decisions": {"resolved_role":..,"version_id":..,"fallback_used":..}
}
```

**Триггеры полного trace:**
1. `debug_mode = true` в запросе (только админ).
2. Запрос из песочницы Studio.
3. Любой не-200 статус (error/retry/timeout/empty response).
4. Пользовательский feedback ≤ 2 из 5.
5. Post-release window: 24ч после publish роли/конфига — для затронутых ролей.
6. Ручные включатели в `domovoy_debug_targets` (по family_id / role_code, TTL).

**Ретеншн (jobs):**
- `domovoy_prompt_traces` — DELETE WHERE created_at < NOW() - 180 days.
- Full trace S3 — lifecycle policy:
  - default → 30 days
  - reason in (`error`,`sandbox`) → 90 days
  - reason = `manual` → до отключения флага.

**Приватность:**
- PII-маскинг (телефоны, паспорта, адреса) в `context_snapshot` перед записью в S3.
- Право `domovoy_debug_read` для просмотра полного trace.
- Открытие полного trace в Studio → audit event `trace_full_viewed`.
- Удаление trace по family/user (GDPR-кнопка) — каскадно из БД и S3.

---

## 4. Структура Studio (10 разделов)

Studio открывается по адресу `/admin/domovoy/studio`. Layout: **left nav + center + right inspector**. Глобальный переключатель сред `[Stage | Prod]` в шапке. Глобальный переключатель режима `[Базовый | Экспертный]`.

### 4.1 Обзор (Overview)
Быстрая карточная панель. KPI и «что изменилось за 7 дней».

**Карточки:**
- Всего ролей / активных / в draft.
- Диалогов за 24ч / 7д / 30д.
- Средняя длина ответа (символов).
- Средняя стоимость ответа (₽).
- Средняя задержка (мс).
- Топ-5 ролей по использованию.
- Худший фидбек (роли с feedback < 3).
- Ошибки / retries / timeouts за сутки.

**Блок «Что изменилось»:** последние 10 audit events с короткими описаниями и кнопками «Открыть» / «Откатить».

### 4.2 Архитектура (Architecture Map)
Интерактивная схема pipeline из §3.1. Каждый блок кликабелен — открывает inspector с описанием слоя и текущими параметрами.

Узлы: Persona Core → Role Resolver → Context Builder → Memory Layer → Prompt Builder → LLM Engine → Post-processing → Visual Layer → Logs & Trace.

Каждый узел в inspector показывает: что делает, на что влияет, риски, где используется, кнопка «как проверить изменение».

### 4.3 Роли и персоны (Roles)
**Список ролей** (таблица + фильтры: статус, среда, хаб, версия).

**Карточка роли** (раскрытие):
- Шапка: эмодзи / иконка / название / код / цвет / статус-бейдж / sort_order.
- Привязки: хабы (multi-select), страницы (multi-select), entry_points.
- Tabs внутри карточки:
  1. **Поведение** — цель, что должна делать, что не должна, тон, длина ответа, CTA.
  2. **Prompt** — persona-блок (read-only из Persona Core), role prompt (textarea), safety rules, formatting template, переменные.
  3. **Контекст** — какие `ContextSource` разрешены этой роли (toggle + приоритет).
  4. **Модель** — override AIConfig (или «использовать глобальный»).
  5. **Медиа** — основная картинка, фон, zoom, дополнительные ассеты.
  6. **Версии** — таблица версий (draft/published/archived per env), diff, rollback, promote.
  7. **Статистика** — использование, фидбек, ошибки, средняя стоимость.

**Действия:** New version (draft), Save draft, Test in sandbox, Publish to stage, Promote to prod, Rollback, Duplicate, Archive.

### 4.4 Prompt Builder
Отдельный визуальный конструктор для одной версии роли.

**Слои (drag & drop порядок, on/off):**
- persona
- role prompt
- safety
- formatting rules
- context (jinja-плейсхолдеры `{{context.finance.balance}}` и т.п.)
- memory
- footer / CTA

**Правая панель — Preview:**
- Финальный собранный prompt (текстом).
- Оценка токенов.
- Какие переменные подставились (имя семьи, баланс…).
- Кнопка «Сравнить с published v.X» — side-by-side diff.

### 4.5 Движок AI (Engine)
Глобальный AIConfig + список override-ов по ролям.

**Поля:**
- Провайдер: YandexGPT (на будущее — селект).
- Модель: `yandexgpt-lite` / `yandexgpt` / `yandexgpt-pro` / custom uri.
- Fallback-модель.
- Temperature (0–1).
- Max tokens.
- History depth.
- Timeout (сек).
- Retry policy (count, backoff).
- Цена за ответ (₽).
- Лимиты: на семью/сутки, на пользователя/час.
- Debug log level.
- Environment: stage / prod (раздельные конфиги).

**Секреты (read-only статусы):**
- `YANDEX_GPT_API_KEY` — подключён ✓ / не настроен ✗, кто и когда последний раз менял (из audit).
- `YANDEX_FOLDER_ID` — подключён ✓ / не настроен ✗.
- Кнопка «Тест подключения» — пробный запрос с пустым промптом.

### 4.6 Контекст и память (Context)
Список `ContextSource` (источников). По каждому:

| Поле | Значения |
|---|---|
| code | `finance`, `household`, `calendar`, `tasks`, `shopping`, `nutrition`, `pets`, `notes`, `values`, `members`, `children`, `astrology`, `history` |
| name | человекочитаемое |
| is_enabled_global | bool |
| token_limit | int |
| priority | int |
| roles_whitelist | array |
| description | text |
| example_payload | jsonb (демо как это выглядит в prompt) |

**Память:**
- History depth (общий и override per role).
- Кнопка «Очистить память» (по family_id / role).
- «Заморозить память» (не подмешивать в N следующих запросов).
- Просмотр «факты, использованные в последнем ответе» — берётся из последнего trace.

### 4.7 Медиа и Usage Map (Media)
Реестр всех изображений Домового.

**Карточка ассета:**
- Превью, имя, alt, тип (avatar / scene / banner / video).
- URL (CDN), размер, дата.
- Кем последний раз заменён (audit).
- **Usage map:** список «где используется» (страница, компонент, роль, состояние).

**Действия:** Upload (S3 через backend), Replace, Delete (с предупреждением о usage).

**Warning UI:** при замене показывать «Это изображение используется в N местах» и список.

### 4.8 Песочница / Лаборатория (Sandbox)
Тестовый чат для исследования поведения.

**Контролы:**
- Среда: stage / prod (только read).
- Семья: тестовая (по умолчанию) / выбрать конкретную (требует разрешения).
- Пользователь: от чьего имени.
- Роль: любая.
- Версия роли: любая published / любой draft.
- AIConfig: глобальный / кастомный override прямо в форме.
- Контекст: per-source toggle.
- Память: глубина / выключить.
- Debug-режим (всегда полный trace).

**Поля результата:**
- Ответ.
- Финальный prompt (collapsible).
- Какие данные подмешались.
- Токены, стоимость, задержка.
- Кнопка «Сохранить как TestCase».

**A/B сравнение:** два панеля рядом, один вопрос, две версии роли.

### 4.9 Логи и Trace
**Список traces:** фильтры (дата, роль, family, status, env, есть ли full trace).

**Открытие trace:**
- Краткий вид: все поля из `domovoy_prompt_traces`.
- Если есть full trace — кнопка «Открыть полный след» (audit event).
- Полный вид: pipeline-визуализация по слоям, JSON в collapsible-блоках, raw model request/response.

**Действия:** Reproduce in sandbox, Mark for review, Export JSON.

### 4.10 Тесты, Публикация, Аудит (Tests & Audit)

**Тесты:**
- Список TestCase: вопрос, роль, ожидаемые элементы (whitelist), запрещённые (blacklist), ручная оценка, автоскоринг.
- Прогоны (TestRun): по одному кейсу / по всем кейсам роли / regression suite перед publish.

**Публикация:**
- Список pending changes (draft versions).
- Кнопка «Publish to stage» / «Promote to prod».
- Обязательная проверка: regression suite зелёный → разрешён publish.

**Аудит:**
- Полный лог `domovoy_audit_log`: кто, когда, что, до/после, IP.
- Фильтры по сущности, по пользователю, по типу события.

---

## 5. Модель данных (DDL)

```sql
-- ============================================================
-- DOMOVOY AI STUDIO — миграция Stage 1
-- ============================================================

-- 5.1 Roles
CREATE TABLE domovoy_roles (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(64) UNIQUE NOT NULL,        -- 'cook', 'psychologist'
  name         VARCHAR(128) NOT NULL,
  emoji        VARCHAR(16),
  icon         VARCHAR(64),                        -- lucide icon name
  color        VARCHAR(16),                        -- hex
  sort_order   INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   INT,
  updated_by   INT
);
CREATE INDEX idx_domovoy_roles_active ON domovoy_roles(is_active, sort_order);

-- 5.2 Role versions (главная таблица контента ролей)
CREATE TABLE domovoy_role_versions (
  id                BIGSERIAL PRIMARY KEY,
  role_id           INT NOT NULL REFERENCES domovoy_roles(id) ON DELETE CASCADE,
  environment       VARCHAR(8) NOT NULL CHECK (environment IN ('stage','prod')),
  version_number    INT NOT NULL,                  -- автоинкремент per (role,env)
  status            VARCHAR(16) NOT NULL CHECK (status IN ('draft','published','archived')),

  -- Поведение
  goal              TEXT,
  do_rules          TEXT,
  dont_rules        TEXT,
  tone              VARCHAR(64),
  response_length   VARCHAR(32),                   -- 'short' | 'medium' | 'long'
  cta_template      TEXT,
  greeting          TEXT,
  examples          JSONB,                         -- [{q,a}]

  -- Prompt
  role_prompt       TEXT NOT NULL,
  safety_rules      TEXT,
  formatting_rules  TEXT,
  variables_schema  JSONB,                         -- описание используемых переменных

  -- Связи
  hubs              JSONB,                         -- ['nutrition','health',...]
  pages             JSONB,                         -- ['/family-hub', ...]
  entry_points      JSONB,                         -- 'widget','dialog','section_advisor',...

  -- AI override
  ai_config_override JSONB,                        -- {model, temperature, max_tokens, ...}

  -- Контекст override
  context_sources_override JSONB,                  -- [{code, enabled, priority, limit}]

  -- Медиа
  asset_id          BIGINT,                        -- основная картинка
  bg_class          VARCHAR(64),                   -- 'bg-stone-100'
  image_css         TEXT,                          -- custom zoom/scale

  -- Метаданные
  published_at      TIMESTAMPTZ,
  published_by      INT,
  archived_at       TIMESTAMPTZ,
  prompt_checksum   VARCHAR(64),                   -- sha256 финального промпта-шаблона
  notes             TEXT,                          -- changelog для версии
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        INT,
  UNIQUE (role_id, environment, version_number)
);
CREATE INDEX idx_drv_role_env_status ON domovoy_role_versions(role_id, environment, status);
CREATE UNIQUE INDEX uq_drv_one_published
  ON domovoy_role_versions(role_id, environment)
  WHERE status = 'published';

-- 5.3 AI configs
CREATE TABLE domovoy_ai_configs (
  id              SERIAL PRIMARY KEY,
  environment     VARCHAR(8) NOT NULL CHECK (environment IN ('stage','prod')),
  status          VARCHAR(16) NOT NULL CHECK (status IN ('draft','published','archived')),
  version_number  INT NOT NULL,
  provider        VARCHAR(32) NOT NULL DEFAULT 'yandexgpt',
  model_uri       VARCHAR(128) NOT NULL,            -- 'gpt://{folder}/yandexgpt-lite'
  fallback_model_uri VARCHAR(128),
  temperature     NUMERIC(3,2) DEFAULT 0.7,
  max_tokens      INT DEFAULT 3000,
  history_depth   INT DEFAULT 10,
  timeout_sec     INT DEFAULT 30,
  retry_count     INT DEFAULT 1,
  retry_backoff_ms INT DEFAULT 500,
  price_rub       NUMERIC(8,2) DEFAULT 3.00,
  limit_family_day INT DEFAULT 1000,
  limit_user_hour INT DEFAULT 60,
  debug_log_level VARCHAR(16) DEFAULT 'info',
  persona_domovoy TEXT,                              -- базовый «характер»
  persona_neutral TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INT,
  published_at    TIMESTAMPTZ,
  published_by    INT,
  UNIQUE (environment, version_number)
);
CREATE UNIQUE INDEX uq_aic_one_published
  ON domovoy_ai_configs(environment)
  WHERE status = 'published';

-- 5.4 Context sources
CREATE TABLE domovoy_context_sources (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(64) UNIQUE NOT NULL,
  name            VARCHAR(128) NOT NULL,
  description     TEXT,
  is_enabled_global BOOLEAN DEFAULT TRUE,
  token_limit     INT DEFAULT 500,
  priority        INT DEFAULT 0,
  roles_whitelist JSONB,                            -- null = всем разрешено
  example_payload JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5.5 Assets and usages
CREATE TABLE domovoy_assets (
  id              BIGSERIAL PRIMARY KEY,
  kind            VARCHAR(32) NOT NULL,             -- 'avatar','scene','banner','video'
  name            VARCHAR(255),
  alt             TEXT,
  url             TEXT NOT NULL,
  s3_key          TEXT,
  width           INT,
  height          INT,
  size_bytes      BIGINT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      INT
);

CREATE TABLE domovoy_asset_usages (
  id              BIGSERIAL PRIMARY KEY,
  asset_id        BIGINT NOT NULL REFERENCES domovoy_assets(id) ON DELETE CASCADE,
  usage_type      VARCHAR(32) NOT NULL,             -- 'role_avatar','page_hero','onboarding',...
  ref_role_id     INT REFERENCES domovoy_roles(id),
  ref_page        VARCHAR(255),
  ref_component   VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_dau_asset ON domovoy_asset_usages(asset_id);

-- 5.6 Prompt traces (short)
CREATE TABLE domovoy_prompt_traces (
  id                  BIGSERIAL PRIMARY KEY,
  trace_uuid          UUID NOT NULL UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  family_id           INT,
  user_id             INT,
  session_id          VARCHAR(64),
  environment         VARCHAR(8) NOT NULL,
  role_code           VARCHAR(64),
  role_version_id     BIGINT REFERENCES domovoy_role_versions(id) ON DELETE SET NULL,
  ai_config_id        INT REFERENCES domovoy_ai_configs(id) ON DELETE SET NULL,
  entry_point         VARCHAR(64),
  model               VARCHAR(128),
  temperature         NUMERIC(3,2),
  max_tokens          INT,
  history_depth       INT,
  input_tokens        INT,
  output_tokens       INT,
  latency_ms          INT,
  status              VARCHAR(16) NOT NULL,         -- ok/error/retry/fallback/timeout
  error_code          VARCHAR(64),
  feedback_score      SMALLINT,
  prompt_checksum     VARCHAR(64),
  context_summary     JSONB,
  full_trace_available BOOLEAN DEFAULT FALSE,
  full_trace_s3_key   TEXT,
  full_trace_reason   VARCHAR(32)                   -- debug/sandbox/error/feedback/post_release/manual
);
CREATE INDEX idx_dpt_family_created ON domovoy_prompt_traces(family_id, created_at DESC);
CREATE INDEX idx_dpt_role_created ON domovoy_prompt_traces(role_code, created_at DESC);
CREATE INDEX idx_dpt_status ON domovoy_prompt_traces(status, created_at DESC);
CREATE INDEX idx_dpt_full ON domovoy_prompt_traces(full_trace_available) WHERE full_trace_available;

-- 5.7 Debug targets (ручные включатели полного trace)
CREATE TABLE domovoy_debug_targets (
  id              BIGSERIAL PRIMARY KEY,
  scope           VARCHAR(16) NOT NULL,             -- 'family','role','global'
  family_id       INT,
  role_code       VARCHAR(64),
  enabled_until   TIMESTAMPTZ NOT NULL,
  reason          TEXT,
  created_by      INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ddt_active ON domovoy_debug_targets(enabled_until) WHERE enabled_until > NOW();

-- 5.8 Test cases & runs
CREATE TABLE domovoy_test_cases (
  id              BIGSERIAL PRIMARY KEY,
  role_id         INT NOT NULL REFERENCES domovoy_roles(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  question        TEXT NOT NULL,
  must_contain    JSONB,                            -- ['слово1','фраза2']
  must_not_contain JSONB,
  expected_style  TEXT,
  is_critical     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INT
);

CREATE TABLE domovoy_test_runs (
  id              BIGSERIAL PRIMARY KEY,
  test_case_id    BIGINT NOT NULL REFERENCES domovoy_test_cases(id) ON DELETE CASCADE,
  role_version_id BIGINT REFERENCES domovoy_role_versions(id) ON DELETE SET NULL,
  environment     VARCHAR(8) NOT NULL,
  response        TEXT,
  passed          BOOLEAN,
  score           NUMERIC(3,2),
  trace_uuid      UUID,
  notes           TEXT,
  ran_at          TIMESTAMPTZ DEFAULT NOW(),
  ran_by          INT
);
CREATE INDEX idx_dtr_case ON domovoy_test_runs(test_case_id, ran_at DESC);

-- 5.9 Audit log
CREATE TABLE domovoy_audit_log (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  actor_user_id   INT,
  actor_ip        VARCHAR(64),
  event_type      VARCHAR(64) NOT NULL,             -- role_created, version_published, trace_full_viewed,...
  entity_type     VARCHAR(64),                      -- role, role_version, ai_config, asset,...
  entity_id       BIGINT,
  environment     VARCHAR(8),
  before_data     JSONB,
  after_data      JSONB,
  notes           TEXT
);
CREATE INDEX idx_dal_entity ON domovoy_audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_dal_actor ON domovoy_audit_log(actor_user_id, created_at DESC);

-- 5.10 Feature flags
CREATE TABLE domovoy_feature_flags (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(64) UNIQUE NOT NULL,
  description     TEXT,
  environment     VARCHAR(8) NOT NULL,
  is_enabled      BOOLEAN DEFAULT FALSE,
  payload         JSONB,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      INT
);
```

### 5.11 Сидинг (миграция текущих данных)
Отдельная миграция `V0XXX__seed_domovoy_studio.sql`:
1. INSERT 15 ролей из `AIAssistantContext.tsx` → `domovoy_roles`.
2. Для каждой роли — INSERT в `domovoy_assets` (URL из `DOMOVOY_ROLE_IMAGES`).
3. Для каждой роли — INSERT в `domovoy_role_versions` с status=`published`, environment=`prod`, version_number=1, role_prompt из `ROLE_PROMPTS`, bg_class из `ROLE_AVATAR_BG`, image_css из `ROLE_IMAGE_ZOOM`.
4. INSERT в `domovoy_ai_configs` published-prod-v1: model=`yandexgpt-lite`, temperature=0.7, max_tokens=3000, history_depth=10, price=3.
5. INSERT 13 `domovoy_context_sources` (finance, household, calendar, tasks, shopping, nutrition, pets, notes, values, members, children, astrology, history) с разумными дефолтами.
6. Дублирующая копия role_versions и ai_configs со status=`published`, environment=`stage`.

---

## 6. Backend (Cloud Functions)

### 6.1 Новая функция `domovoy-studio`
Главный CRUD-эндпоинт админки. Один handler, маршрутизация по `event.path` или `body.action`.

**Эндпоинты (action-based):**

| action | method | назначение |
|---|---|---|
| `roles.list` | GET | список ролей с фильтрами |
| `roles.get` | GET | роль + список версий |
| `roles.create` | POST | создать роль |
| `roles.update` | PUT | обновить мета (название, иконка…) |
| `roles.archive` | DELETE | архивировать |
| `versions.list` | GET | версии роли |
| `versions.get` | GET | конкретная версия |
| `versions.create_draft` | POST | новый draft из текущей published / from scratch |
| `versions.update_draft` | PUT | сохранение черновика |
| `versions.publish` | POST | опубликовать в среду (stage/prod) с regression check |
| `versions.promote` | POST | stage → prod |
| `versions.rollback` | POST | сделать предыдущую published активной |
| `versions.diff` | GET | diff двух версий |
| `ai_config.get` | GET | текущий config по env |
| `ai_config.update_draft` | PUT | draft |
| `ai_config.publish` | POST | publish |
| `ai_config.test_connection` | POST | пробный запрос в YandexGPT |
| `context_sources.list` / `update` | GET/PUT | управление источниками |
| `assets.list` | GET | реестр |
| `assets.upload` | POST | base64 → S3 → INSERT |
| `assets.usage` | GET | usage map для asset |
| `assets.replace` | POST | замена с предупреждением |
| `traces.list` | GET | фильтры по дате/роли/семье |
| `traces.get` | GET | краткий trace |
| `traces.get_full` | GET | полный из S3, аудитится |
| `traces.reproduce` | POST | повтор в sandbox |
| `sandbox.run` | POST | прогон вопроса с указанными настройками, debug=true |
| `tests.list` / `create` / `update` / `delete` | … | CRUD |
| `tests.run` | POST | прогон кейса (или всех для роли) |
| `audit.list` | GET | фильтры |
| `debug_targets.list` / `create` / `delete` | … | ручные включатели |
| `flags.list` / `update` | … | feature flags |

**Авторизация:** проверка `X-User-Id` + чтение из `admin_roles` (как в существующей `/admin`). RBAC:
- `domovoy_admin` — всё.
- `domovoy_editor` — CRUD ролей/версий/тестов, без promote-to-prod.
- `domovoy_debug_read` — может смотреть полные trace.
- `domovoy_viewer` — read-only.

### 6.2 Рефакторинг `ai-assistant`
Текущий `backend/ai-assistant/index.py` правим:
1. **Resolver:** определяем `role_code` и `environment` (по фиче-флагу `studio_enabled` и заголовку `X-AI-Env`, по умолчанию `prod`).
2. **Загрузка версии:** SELECT из `domovoy_role_versions` WHERE role_code=? AND environment=? AND status='published'.
3. **Загрузка AIConfig:** SELECT из `domovoy_ai_configs` published per env. С учётом `ai_config_override` версии роли.
4. **Сбор контекста:** вызов `domovoy-context` с белым списком источников из версии роли.
5. **Prompt Builder:** persona (из ai_config) + role_prompt + safety + formatting + memory + context. Считаем `prompt_checksum`.
6. **LLM call:** параметры из AIConfig (модель, temp, maxTokens, timeout, retry).
7. **Post-processing.**
8. **Trace write:** INSERT в `domovoy_prompt_traces` (всегда). Если выполнен критерий полного trace — собираем JSON, кладём в S3 (`domovoy/traces/...`), пишем `full_trace_s3_key`.
9. **Backward compatibility:** если в БД нет нужных записей (на переходный период) — фолбэк на старую логику с хардкодом.

**Новые env-переменные:** не нужны. Используются существующие `DATABASE_URL`, `YANDEX_GPT_API_KEY`, `YANDEX_FOLDER_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

### 6.3 Воркеры (на Stage 2)
- Cleanup job: удаление просроченных trace.
- Post-release window job: автоматическое включение `domovoy_debug_targets` на 24ч после publish.
- Aggregator: денормализованная статистика по ролям (для Overview).

---

## 7. Frontend (карта компонентов Stage 1)

### 7.1 Маршрутизация
```
/admin/domovoy            ← существующая страница (Dashboard / Донаты / Платежи)
/admin/domovoy/studio     ← новая Studio
   /overview              ← 4.1
   /architecture          ← 4.2
   /roles                 ← 4.3 (список)
   /roles/:code           ← карточка роли
   /prompt-builder/:versionId ← 4.4
   /engine                ← 4.5
   /context               ← 4.6
   /media                 ← 4.7
   /sandbox               ← 4.8
   /traces                ← 4.9 (список)
   /traces/:uuid          ← конкретный trace
   /tests                 ← 4.10
   /audit                 ← 4.10
```

В `AdminDomovoy.tsx` — добавить «Открыть Studio» рядом с табами.

### 7.2 Структура файлов
```
src/pages/admin/studio/
  StudioLayout.tsx                   ← left nav + center + right inspector + env switch
  OverviewPage.tsx
  ArchitecturePage.tsx
  RolesListPage.tsx
  RoleDetailPage.tsx
  PromptBuilderPage.tsx
  EnginePage.tsx
  ContextPage.tsx
  MediaPage.tsx
  SandboxPage.tsx
  TracesListPage.tsx
  TraceDetailPage.tsx
  TestsPage.tsx
  AuditPage.tsx

src/components/admin/studio/
  StudioSidebar.tsx
  EnvSwitch.tsx                       ← Stage/Prod toggle
  ModeSwitch.tsx                      ← Basic/Expert toggle
  RoleCard.tsx
  RoleVersionTable.tsx
  PromptLayerEditor.tsx               ← drag&drop слоёв
  PromptPreview.tsx
  VersionDiff.tsx
  AIConfigForm.tsx
  ContextSourceRow.tsx
  AssetGrid.tsx
  AssetUsageBadge.tsx
  SandboxRunner.tsx                   ← переиспользует AIAssistantWidget логику
  ABCompareView.tsx
  TraceTimeline.tsx                   ← визуализация pipeline по слоям
  TraceJsonViewer.tsx
  TestCaseRow.tsx
  AuditTable.tsx

src/lib/studio/
  api.ts                              ← клиент domovoy-studio
  types.ts                            ← TypeScript типы
  pipeline.ts                         ← описание слоёв для Architecture/Trace
```

### 7.3 UI-стек
- shadcn/ui: Tabs, Card, Dialog, Sheet, Table, Form, Textarea, Select, Switch, Badge, Tooltip.
- react-hook-form + zod — для форм версии/конфига/теста.
- monaco-editor (опционально) — для редактирования промптов с подсветкой.
- recharts — для Overview.
- @dnd-kit — для drag&drop слоёв в Prompt Builder.
- diff — для Version Diff.

### 7.4 Глобальные элементы
- В шапке Studio: `EnvSwitch` (stage/prod), `ModeSwitch` (basic/expert), индикатор «есть pending drafts: N».
- В каждой форме сохранение draft автосейвом каждые 30 сек.
- Кнопка «Publish» всегда требует подтверждения и регрессионных тестов.

---

## 8. Безопасность и RBAC

### 8.1 Роли админов
| Роль | Может |
|---|---|
| `domovoy_admin` | всё, включая promote-to-prod и delete trace |
| `domovoy_editor` | CRUD ролей/версий/тестов/контекста; publish только в stage |
| `domovoy_debug_read` | смотреть полные traces |
| `domovoy_viewer` | read-only |

### 8.2 Секреты
- Никогда не возвращать значения в API ответах.
- В UI — только статус «подключено / не настроено» + последний `updated_at`.
- Тест подключения — отдельный эндпоинт, возвращает только `{success: bool, error?: string}`.

### 8.3 Audit обязателен для
- любое изменение `domovoy_roles` / `domovoy_role_versions` / `domovoy_ai_configs` / `domovoy_assets` / `domovoy_context_sources` / `domovoy_feature_flags`
- publish / promote / rollback
- открытие полного trace
- удаление trace
- включение `domovoy_debug_targets`

### 8.4 Приватность
- PII-маскинг функция в backend: телефоны, e-mail, паспорта, СНИЛС → `***`.
- Перед записью `context_block` в полный trace — прогон через маску.
- Кнопка «GDPR-delete» для конкретной семьи: удаляет traces (БД + S3), audit-events, тестовые прогоны.

---

## 9. Roadmap V1 → V3

### Stage 1 (V1) — Ядро понимания и управления
**Цель:** перевести Домового с хардкода на БД, дать рабочую Studio для понимания и правки.

**Включено:**
- Все 10 таблиц БД из §5.
- Сидинг текущих 15 ролей и картинок.
- Backend `domovoy-studio` (минимально: roles, versions, ai_config, assets, traces, sandbox, audit).
- Рефакторинг `ai-assistant` на чтение из БД с фолбэком.
- Trace policy полностью реализована.
- Draft → Publish → Rollback.
- Env-flag stage/prod в БД и API. UI-переключатель.
- Frontend разделы: Overview, Architecture, Roles, Prompt Builder, Engine, Sandbox, Traces, Audit, Media (без сложной usage map — только список и базовая привязка к ролям).
- RBAC через `admin_roles`.

**Acceptance criteria:**
- [ ] Изменение role_prompt в Studio → publish → следующее обращение к Домовому идёт с новым промптом (проверка через trace).
- [ ] Изменение temperature в AIConfig stage → запросы из песочницы используют новое значение, prod-запросы — старое.
- [ ] Rollback роли в 1 клик возвращает предыдущую published.
- [ ] При ошибке YandexGPT в trace появляется `status=error` + полный trace в S3.
- [ ] При запросе из песочницы в trace `full_trace_reason=sandbox`.
- [ ] При publish роли все ответы за следующие 24ч получают полный trace.
- [ ] Audit log фиксирует кто/когда сделал publish.
- [ ] Превью финального prompt в Prompt Builder совпадает с тем, что реально уходит в LLM (matching `prompt_checksum`).
- [ ] Картинку роли можно загрузить через Studio в S3 и она появляется на фронте без передеплоя.
- [ ] Старый фронт (`SectionAIAdvisor`, `AIAssistantWidget`) продолжает работать в течение переходного периода.

### Stage 2 (V2) — Управление качеством
**Цель:** Сделать кабинет инструментом ежедневной работы и улучшения качества.

**Включено:**
- Context page полностью: per-source toggle, лимиты, приоритеты, пример payload.
- Memory management: очистить/заморозить per family/role.
- Tests: TestCase + TestRun, regression suite перед publish.
- Media: полная Usage Map (где используется каждая картинка).
- Texts manager: приветствия, благодарности, уровни — в БД с админкой.
- Analytics: топ-вопросы, фидбек по ролям, аномалии стоимости.
- Post-release window — автоматический.

**Acceptance criteria:**
- [ ] Перед publish роли запускается regression suite, при провале critical-кейса publish заблокирован.
- [ ] При замене картинки показывается список из ≥1 места использования.
- [ ] Можно отключить источник `astrology` для роли `mentor` — в trace context_summary этой роли больше нет `astrology`.
- [ ] Очистка памяти семьи: следующий запрос идёт без подмешанной истории.

### Stage 3 (V3) — Продвинутая лаборатория
**Цель:** Превратить Studio в инструмент R&D.

**Включено:**
- A/B-тесты: одинаковый вопрос на двух версиях роли с метриками.
- Сегментация: разные версии роли для разных типов семей.
- Feature flags по сегментам.
- Алерты: рост стоимости / падение feedback / рост latency.
- Автоматический скоринг ответов (вторая LLM как judge).
- Экспорт TestSuite в JSON / импорт.

**Acceptance criteria:**
- [ ] A/B-сравнение двух версий роли по одному и тому же вопросу с side-by-side метриками.
- [ ] Алерт срабатывает при росте средней стоимости ответа >20% за сутки.
- [ ] Можно выкатить роль только семьям с детьми (сегмент).

---

## 10. Риски и ограничения

| Риск | Митигация |
|---|---|
| YandexGPT не возвращает чёткие токены `input/output` | Считаем по символам / приблизительно; в V2 — отдельный токенайзер. |
| Нет нативного fallback-провайдера | В V1 fallback = повтор с тем же провайдером; в V3 — добавить второй (GigaChat). |
| Сидинг текущих ролей потеряет несохранённые правки | Делать сидинг в одной транзакции + бекап существующих `assistant_settings`. |
| Размер таблицы `domovoy_prompt_traces` растёт быстро | Партиционирование по месяцам с V2; cleanup-job с V1. |
| Хардкод `folder_id` в коде | Переносим в `ai_config`, в коде только env-переменная. |
| Существующая `chat_messages` использует другую схему | Не трогаем, только читаем; новые таблицы — в public. |
| Параллельные изменения админами | Optimistic locking по `version_number` в `role_versions`. |
| Полный trace может содержать PII | Маскинг до записи + RBAC + audit на просмотр. |
| Промт-инъекции через user input | Safety-блок в Prompt Builder, тесты на запрещённые элементы. |
| Studio ломает текущий фронт ассистента | Backward-compat фолбэк в `ai-assistant`, переключаемый feature flag `studio_enabled`. |

---

## 11. Что от тебя нужно дальше

1. Утверждение этого ТЗ (или комментарии).
2. После утверждения — старт Stage 1 в порядке:
   - миграция БД (§5),
   - сидинг текущих ролей,
   - backend `domovoy-studio` (CRUD ролей + версий + ai_config + audit),
   - рефакторинг `ai-assistant` с фолбэком,
   - frontend: StudioLayout + Roles + Prompt Builder + Engine + Sandbox + Traces + Audit,
   - подключение Trace Policy.
3. Создать admin-роли `domovoy_admin` / `domovoy_editor` / `domovoy_debug_read` / `domovoy_viewer` и выдать их нужным людям.

---

_Документ собран 11.05.2026. Версия 1.0. Дальнейшие правки — через PR в `docs/domovoy-studio/`._
