# Развитие R2 — Section Masterplan

> **Phase R2** запущена после freeze Goals V1 (commit `2135101`, 2026-05-14).
> Назначение документа: единая карта раздела «Развитие», статус каждой подсистемы, выбор следующей вертикали и правила перехода между волнами.
>
> Документ обновляется только когда меняется Program Board или статус блока.

---

## 0. Триада «Развитие» — система координат

| Часть триады | Вопрос | Где живёт сейчас |
|---|---|---|
| **Зеркало** | Где я сейчас | Portfolio (`/portfolio`, `/portfolio/:memberId`, `/portfolio/about`, `/portfolio/compare`) |
| **Компас** | Куда и зачем я иду | Workshop (`/workshop`) + WorkshopGoal (`/workshop/goal/:id`) + LifeRoad (`/life-road`) |
| **Двигатель** | Что делаю сейчас | PlanningHub (`/planning-hub`) + Tasks (`/tasks`) + Calendar |

Вход в раздел: `/development-hub` (мета-хаб, точка входа во все 4 слоя).
Дополнительные слои за пределами триады: **Практика** (тесты Development), **Диалог** (психолог), **Рефлексия** (PARI).

---

## 1. Inventory — что уже есть в коде (snapshot 2026-05-14)

### 1.1. Маршруты (user-facing)

| Маршрут | Часть триады | Страница | Статус |
|---|---|---|---|
| `/development-hub` | Мета-хаб | `DevelopmentHub.tsx` | живой |
| `/development` | Практика | `Development.tsx` | живой |
| `/workshop` | Компас | `Workshop.tsx` | 🔒 **Goals V1 frozen** |
| `/workshop/goal/:id` | Компас | `WorkshopGoal.tsx` | 🔒 **Goals V1 frozen** |
| `/life-road` | Компас | `LifeRoad.tsx` | живой, новый (5 табов) |
| `/portfolio` | Зеркало | `FamilyPortfolio.tsx` | живой |
| `/portfolio/:memberId` | Зеркало | `MemberPortfolio.tsx` | живой |
| `/portfolio/about` | Зеркало | `PortfolioAbout.tsx` | живой |
| `/portfolio/compare` | Зеркало | `PortfolioCompare.tsx` | живой |
| `/planning-hub` | Двигатель | `PlanningHub.tsx` | живой |
| `/tasks` | Двигатель | `Tasks.tsx` | живой (базовый) |
| `/goals` | Двигатель (legacy) | `Goals.tsx` | ⚠️ **legacy V0** (localStorage, не связан с life_goals) |
| `/pari-test`, `/pari-results/:id` | Рефлексия | `PariTest.tsx`, `PariResults.tsx` | живой |
| `/dev/goals-qa` | dev-only | `DevGoalsQa.tsx` | dev-only |

### 1.2. Подсистемы — статус

| Подсистема | Статус | Папка | Заметки |
|---|---|---|---|
| Goals (SMART/OKR/Wheel) | 🔒 **frozen V1** | `components/goals/` | См. `docs/goals/GOALS_V1_FREEZE.md` |
| LifeRoad | 🟢 живой, новый | `components/life-road/` | События, цели, баланс, frameworks lib, coach |
| Portfolio | 🟢 живой | `components/portfolio/` | Радар 8 сфер, achievements, insights, plans |
| Development plans | 🟢 живой | (внутри portfolio) | Active plan по сфере |
| Insights | 🟢 живой | (внутри portfolio) | Rule-based + AI |
| Achievements | 🟢 живой | (внутри portfolio) | Стена + linked goals |
| Spheres (8 сфер) | 🟢 живой | model | Метрики, sources, snapshots |
| Tasks | 🟡 базовый | (нет своей папки) | Tasks_v2, базовое распределение |
| Development tests (PARI и др.) | 🟢 живой | `components/development/` | Тесты сохраняются в profile |
| Habits | ❌ отсутствует | — | DB/UI/API нет |
| Rituals | ❌ отсутствует | — | Только упоминание в PlanningHub |
| Reflections (полноценный модуль) | ❌ отсутствует | — | Сейчас только PARI + insights |
| Weekly/Daily review (вне Goals) | ❌ отсутствует | — | Есть только Goals Weekly Review |

### 1.3. Backend / DB — Развитие

**Backend функции:** `life-road`, `portfolio`, `portfolio-collect`, `portfolio-health`, `development-plan`, `analyze-development`, `tasks`, `member-profile`.

**DB таблицы (жизненный цикл Развития):**
`life_events`, `life_goals`, `life_balance_wheel`, `goal_milestones`, `goal_key_results`, `goal_checkins`, `goal_action_links`, `goal_portfolio_links`, `member_portfolios`, `member_portfolio_snapshots`, `member_portfolio_metrics`, `member_achievements`, `member_development_plans`, `portfolio_insights`, `tasks_v2`.

### 1.4. Дубли / мёртвые зоны

| Объект | Проблема | Действие |
|---|---|---|
| `/goals` (Goals.tsx, V0) | Параллельная подсистема целей на localStorage, не связана с `life_goals` / Workshop | **deprecate → migrate → remove** в волне интеграции |
| Portfolio Compare | Скорее всего мало используется (нет тёплых данных) | Решить: keep / refactor / hide в R2 inventory |
| `/development` vs PARI vs Workshop coach | 3 разных места «работы над собой» без единого языка | Унифицировать на этапе Wave 3 (section UX) |
| Tasks ↔ Goals | Связь есть в БД (`goal_action_links`), но в UI слабо видна | Усилить во время Wave 2 / 3 |

---

## 2. Target Map — целевая архитектура «Развития»

```
┌─────────────────────────────────────────────────────────────────┐
│                    /development-hub (мета-вход)                  │
└─────────────────────────────────────────────────────────────────┘
        │                       │                       │
   ┌────▼────┐           ┌──────▼──────┐         ┌─────▼──────┐
   │ ЗЕРКАЛО │           │   КОМПАС    │         │ ДВИГАТЕЛЬ  │
   │Portfolio│◄─────────►│  Workshop   │◄───────►│PlanningHub │
   └────┬────┘   sphere  │  (Goals 🔒) │  task   └─────┬──────┘
        │       /achievement      │       /habit       │
        │                  ┌──────▼──────┐             │
        │                  │  LifeRoad   │             │
        │                  │ (события,   │             │
        │                  │  баланс,    │             │
        │                  │ frameworks) │             │
        │                  └─────────────┘             │
        │                                              │
        ▼                                              ▼
   Development plans                            Tasks / Habits / Rituals
   Achievements wall                            (часть отсутствует)
   Insights
```

**Принципы целевой архитектуры:**

1. **Один контракт на «единицу действия».** Сейчас в коде живут как минимум 2 источника действий: `goal_action_links` (на стороне Goals) и `tasks_v2` (на стороне PlanningHub). Цель — единый action-граф, в который встраиваются и привычки, и ритуалы.
2. **Связи между блоками — first-class.** Goal ↔ Task, Goal ↔ Achievement, Sphere ↔ Goal, Sphere ↔ Insight, Insight ↔ Goal/Plan. Все связи уже в БД, но в UI почти не подсвечены.
3. **Ежедневный цикл (Двигатель) ↔ еженедельный цикл (Goals Weekly Review) ↔ месячный цикл (Portfolio snapshot).** Сейчас цикл собран только в Goals (Focus + Weekly Review). Нужно вытащить такой же ритм наверх.
4. **Один UX-язык по разделу.** Шапки секций, empty states, loading skeleton, toast-контракт, фильтры/сортировка — единый набор паттернов (часть из них уже отлажена в Goals V1: можно использовать как референс).
5. **Frozen-первое.** Любая перестройка делается так, чтобы не сломать Goals V1. Изменения в Goals — только через P0/P1 трек.

---

## 3. Program Board — Развитие R2

| Wave | Название | Состав | Статус |
|---|---|---|---|
| **Wave 1** | Goals vertical | Goals Core / Hub / Weekly Review / Focus V1·V2·V2.1 | ✅ **Frozen** (commit `2135101`) |
| **Wave 2** | Next vertical | Выбирается (см. §4) | ⏳ candidate selection |
| **Wave 3** | Section integration / unified UX | Единый язык, навигация триады, унификация empty/loading/toast, связи Goal↔Task/Achievement/Insight | ⏳ pending Wave 2 |
| **Wave 4** | Post-freeze scale-up | Telemetry, недельный/месячный циклы на уровне раздела, A/B-готовность, batch-эндпоинты для N+1 | ⏳ pending Wave 3 |

Каждая волна закрывается своим `R2_WAVE_X_FREEZE.md` и `R2_WAVE_X_SIGNOFF.md` по тому же шаблону, что Goals V1.

---

## 4. Wave 2 — кандидаты на следующую вертикаль

Я выделил 4 продуктово оправданных кандидата по итогам инвентаризации. Финальный выбор — за тобой (см. блок «AskUserQuestion» в чате).

### Кандидат A — **Portfolio V1 (Зеркало)**
- **Что:** Привести `/portfolio` к такому же законченному виду, как Workshop. Полный sign-off Hub-уровня (главная страница), детальный экран сферы, единая система insights/achievements, snapshot-цикл, mobile.
- **Почему сейчас:** уже есть данные (snapshots, metrics, plans, insights). Не хватает UX-каркаса, аналогичного Goals Hub.
- **User value:** «Где я сейчас» — прямая ценность, видна каждый раз при заходе.
- **Зависимость от Goals:** через `goal_portfolio_links` и `member_achievements` — уже есть.
- **Сложность:** средняя (модель есть, нужен Hub-слой).
- **Риск:** объём агрегаций.

### Кандидат B — **PlanningHub V1 (Двигатель)**
- **Что:** Привести `/planning-hub` + `/tasks` к единому Today/Week-flow. Связь Task ↔ Goal через `goal_action_links` сделать видимой. Inline quick-actions (как в Focus).
- **Почему сейчас:** Goals дал «что делать» на стратегическом уровне; Двигатель — «что делать сегодня операционно».
- **User value:** ежедневный поток.
- **Зависимость от Goals:** прямая.
- **Сложность:** средняя.
- **Риск:** Tasks базовые — придётся углублять.

### Кандидат C — **LifeRoad V1 (Компас, продолжение)**
- **Что:** Закрыть LifeRoad как полноценный модуль (5 табов: Дорога / Инсайты / Цели / Баланс / Методики). Stable freeze всех 5 разделов, единый UX, share/story.
- **Почему сейчас:** уже большой модуль, но не на freeze-уровне.
- **User value:** долгосрочное мышление, история.
- **Зависимость от Goals:** «Цели»-таб напрямую.
- **Сложность:** высокая (5 разнородных вкладок).
- **Риск:** scope расползётся.

### Кандидат D — **Habits V1 (новая подсистема)**
- **Что:** Создать с нуля подсистему привычек: DB (`habits`, `habit_logs`), backend, UI (хаб, daily check-off, streak, связь с goal_action_links).
- **Почему сейчас:** Habits — естественный complement к Goals (стратегия → ежедневка). В коде нет.
- **User value:** ежедневный ритм, retention.
- **Зависимость от Goals:** дополняет, не пересекается.
- **Сложность:** высокая (новый домен).
- **Риск:** легко превратиться в самостоятельный продукт.

---

## 5. Контракт post-freeze (Wave 1)

- Goals V1 не трогаем за пределами P0/P1 баг-фиксов.
- Никаких новых фич в Goals до конца Wave 4 (или явного решения «открываем V2»).
- Любая интеграция «извне» с Goals (например Wave 2 пишет linked task в `goal_action_links`) идёт через существующее API без изменения публичных контрактов Goals.
- Smoke-runner Goals остаётся 10 модулей, прогон должен проходить зелёным после каждой волны.

---

## 6. Что обновляется каждой волной

| Артефакт | Где |
|---|---|
| Wave-specific freeze doc | `docs/development/R2_WAVE_X_FREEZE.md` |
| Wave-specific sign-off | `docs/development/R2_WAVE_X_SIGNOFF.md` |
| Visual QA pack | `docs/development/R2_WAVE_X_VISUAL_QA.md` |
| Smoke-runner модуль | `src/lib/<area>/__smokeTests__/...` + регистрация в общем runner |
| Обновление этого Masterplan | секция Program Board + статусы блоков |

---

## 7. История изменений документа

- **2026-05-14** — создан после freeze Goals V1 (commit `2135101`, build `4743b49`). Wave 1 закрыт. Wave 2 — выбор следующей вертикали.
