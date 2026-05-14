# R2 Wave 2 — Portfolio V1 (Зеркало) · Charter

> Стартовый контракт для Wave 2. Действует с момента принятия решения (2026-05-14, build `d13743f`) до freeze Portfolio V1.
> Документ читается **до** любого тикета. Любое расширение scope — только обновлением этого документа.

---

## 0. Цель

Привести `/portfolio` к такому же законченному состоянию, как Workshop после Goals V1: ясный главный экран («где я сейчас»), детальная страница сферы, прозрачные insights и achievements, видимая связь с Goals, единые состояния (loading / empty / error / mobile), freeze-doc + visual QA + smoke.

Один итоговый эффект для пользователя: «Я открыл Зеркало → за 5 секунд понял, где я нахожусь и куда идти первым шагом».

---

## 1. Scope (что входит в V1)

### 1.1. Hub — `/portfolio` (FamilyPortfolio)
- Карточки членов семьи в едином UX (как Goals Hub карточки): аватар, completeness, top-strength sphere, growth-zone sphere, дата последнего обновления.
- Empty state «Пока нет участников / нет данных» в стиле Goals V1.
- Loading skeleton (не центральный spinner).
- Error + Retry (как `FocusSection.error`).
- Mobile-first (375 px).

### 1.2. Member detail — `/portfolio/:memberId` (MemberPortfolio)
- Hero (PortfolioHeader): фото, имя, completeness, явный CTA «Обновить» с timestamp.
- SpheresRadar: текущий + предыдущий snapshot (уже работает) + единый легендарь.
- KeyHighlights (strengths / growth zones) — без изменения данных, привести вёрстку к Goals-уровню.
- InsightsBlock + ImproveAccuracyBlock — общий язык severity (success / info / warning), такой же tone, как Weekly Review nudges.
- AchievementsWall — лимит 12, остальные «+ ещё N»; единый паттерн с Focus.
- ActiveDevelopmentPlan — карточка плана, кнопки «открыть / завершить» (без редактирования полей в V1, только переход в редактор).
- HistoryChart — 12 точек (уже работает); подпись «обновлено …» из последнего snapshot.

### 1.3. Sphere detail — новая страница `/portfolio/:memberId/sphere/:sphereKey`
- Минимальная вертикаль на одну сферу: текущий score + delta + sources + связанные goals + связанные achievements + plan этой сферы (если есть).
- Прямой обратный переход к MemberPortfolio.
- Без редактирования метрик в V1 (read-only + переходы).

### 1.4. Связи Portfolio ↔ Goals (видимые, не только в БД)
- В `MemberPortfolio` под Achievements — короткий список «Связанные цели Мастерской» (использует `goal_portfolio_links`, уже на бэке).
- На странице sphere detail — секция «Цели по этой сфере» (`life_goals` отфильтрованные по `linked_sphere_ids`).
- Из `WorkshopGoal` (Goals V1) — улучшение **только верстки** существующего `GoalPortfolioLinksCard`, чтобы он соответствовал visual-language Portfolio V1. Логика и API не меняются (контракт frozen Goals).

### 1.5. Snapshot-цикл (видимый)
- Кнопка «Обновить» уже есть → стандартизировать: success toast «Портфолио обновлено» (тот же strict-single-toast паттерн, что в Focus, но локально для Portfolio).
- В Hero — явный label «обновлено N минут назад / сегодня / 3 дня назад» (формат `pluralRu`).
- История — линк «Посмотреть историю» открывает HistoryChart в раскрытом виде (если он сейчас collapsed) или scroll-anchor.

### 1.6. Состояния (единый паттерн с Goals V1)
| Состояние | Что показываем |
|---|---|
| Loading | Skeleton-блоки (Hero / Radar / Table), не центральный spinner |
| Empty (нет участников) | Dashed-блок + CTA «Добавить участника семьи» |
| Empty (нет метрик у участника) | «Портфолио пустое — добавь данные через Health / Tasks / Goals» |
| Error | Inline alert + «Повторить» (не валит остальную страницу) |

### 1.7. Mobile
- Целевой брейкпойнт 375 px.
- Radar и Table — без горизонтального скролла на mobile (Table уже умеет, проверить Radar).
- Toast Portfolio не перекрывает bottom navigation.

### 1.8. Документация и приёмка
- `docs/development/R2_WAVE_2_PORTFOLIO_FREEZE.md` — итоговый документ ограничений и контрактов.
- `docs/development/R2_WAVE_2_PORTFOLIO_VISUAL_QA.md` — секции по аналогии с Goals (Hub / Member / Sphere / Toasts / Mobile / A11y).
- `docs/development/R2_WAVE_2_PORTFOLIO_SIGNOFF.md` — итерация 1 sign-off.
- Smoke-runner: новые модули в `src/lib/portfolio/__smokeTests__/` (минимум: helpers форматирования + sphere-routing + связи Goals↔Portfolio mapping).

---

## 2. Non-goals (чего НЕТ в V1)

| Не делаем | Почему |
|---|---|
| Inline-редактирование метрик / scores | Это write-модель ручного ввода, требует отдельной валидационной системы — V2. |
| AI-insights пересборка из UI | Уже есть бэкенд-механика; UI-инициация — отдельный V2 трек. |
| Bulk-create достижений / planning из шаблонов | Templates dialog (`PlanTemplatesDialog`) остаётся как есть, без расширений. |
| Drag&drop / переупорядочивание сфер | Порядок задан `SPHERE_ORDER`, V1 не меняет. |
| Полноценный Compare V2 | `/portfolio/compare` остаётся за feature-flag, V1 его не трогает (только проверим, что не падает). |
| Новые domain-сущности (habits, rituals) | Это Wave 4. |
| Перевод PARI / Development tests в Portfolio | Это Wave 3 (унификация UX) или V2. |
| Изменения в Goals V1 | Контракт freeze. Только verstka-полишинг `GoalPortfolioLinksCard` без изменения логики. |
| Полное удаление legacy `/goals` | Уже скрыт (redirect). Физический remove — Wave 3. |
| Унификация навигации триады (TopBar / BottomBar / GlobalSidebar) | Это Wave 3. |
| Новые backend функции / DB миграции | Минимизировать. Если что-то критически нужно — отдельный пункт в Acceptance, иначе использовать существующее API. |

---

## 3. Acceptance (критерии готовности к freeze)

V1 считается готовым к sign-off, когда **все** пункты ниже зелёные одновременно.

### 3.1. Функциональные
- [ ] `/portfolio` Hub — единый стиль карточек, skeleton-loading, retry-error, empty-state.
- [ ] `/portfolio/:memberId` — все 7 блоков из §1.2 в обновлённом visual-language.
- [ ] `/portfolio/:memberId/sphere/:sphereKey` — рабочий sphere detail с 4 секциями (score + sources + goals + achievements/plan).
- [ ] Видимые связи: «Связанные цели» в Member и Sphere detail; обновлённый `GoalPortfolioLinksCard` в Workshop (только верстка).
- [ ] Кнопка «Обновить» → success toast «Портфолио обновлено» + обновлённый timestamp.
- [ ] Все состояния (loading / empty / error / mobile) на каждой из 3 страниц.

### 3.2. Качественные
- [ ] 21+ required screenshots (по аналогии с Goals V1) — будут перечислены в `R2_WAVE_2_PORTFOLIO_VISUAL_QA.md`.
- [ ] Smoke-runner: ≥ 3 модуля Portfolio (форматтер дат/процентов, sphere mapping, links mapping); общий runner интегрирован.
- [ ] eslint clean, build pass, sync_backend (если потребуется) — без ошибок.
- [ ] Goals V1 smoke-runner продолжает проходить зелёным (контракт post-freeze).
- [ ] A11y quick smoke: keyboard navigation по Hub, aria-live на refresh, role="alert" на ошибках, role="progressbar" у Radar (или альтернатива).

### 3.3. Контрактные
- [ ] Никаких изменений в публичных API Goals (`lifeApi.createCheckin`, `updateGoal`, `listGoals`, `listCheckins`, `listPortfolioLinks*`).
- [ ] Никаких изменений в DB-миграциях Goals.
- [ ] Никаких новых маршрутов **внутри** Goals.
- [ ] Single-toast pattern для Portfolio (по аналогии с `FocusSection`): локальный `lastToastIdRef` + dismiss перед новым; глобальный Sonner не меняем.

---

## 4. QA artifacts (ожидаемая структура)

| Артефакт | Файл |
|---|---|
| Charter (этот документ) | `docs/development/R2_WAVE_2_PORTFOLIO_CHARTER.md` |
| Freeze doc | `docs/development/R2_WAVE_2_PORTFOLIO_FREEZE.md` |
| Visual QA pack | `docs/development/R2_WAVE_2_PORTFOLIO_VISUAL_QA.md` |
| Sign-off doc | `docs/development/R2_WAVE_2_PORTFOLIO_SIGNOFF.md` |
| Smoke-tests | `src/lib/portfolio/__smokeTests__/*.smoke.ts` + регистрация в общем runner |
| Dev QA manifest (опционально) | расширение `/dev/goals-qa` или `/dev/portfolio-qa` |

---

## 5. Freeze path (как доходим до sign-off)

1. **Charter** — этот документ. ✅
2. **Sprint A — Hub `/portfolio`**: карточки, состояния, mobile. ✅ **dev-done**
3. **Sprint B — Member detail**: единый visual-language, 7 блоков, refresh + toast.
4. **Sprint C — Sphere detail**: новая страница + видимые связи Goals↔Portfolio.
5. **Sprint D — Polish & A11y**: единые state-паттерны, keyboard, aria, mobile финал.
6. **Smoke + freeze doc + visual QA pack** одновременно с Sprint D.
7. **Human visual pass** (как с Goals V1).
8. **Sign-off → FROZEN**.

### Sprint A — итог (что сделано)

- Полностью переписан `src/pages/FamilyPortfolio.tsx` под 4-состоянийный контракт:
  - **loading** — skeleton-карточки (6 шт), не центральный spinner;
  - **error** — inline alert в стиле Focus error, с кнопкой «Повторить»;
  - **empty** (нет участников с портфолио) — dashed-блок с подсказкой;
  - **success** — сетка карточек с summary-чипами в шапке.
- Отдельный кейс «нет семьи» — собственный dashed-блок + CTA «Создать семью».
- Карточка участника — три visual-state (`ready` / `thin` / `empty`), едино со стилем Goals Hub: лёгкая рамка, hover-shadow, ChevronRight, Avatar fallback в градиенте.
- Введён человеческий timestamp «обновлено N минут/часов/дней/недель/месяцев/лет назад» через `formatLastAggregated` (с честным русским склонением).
- Сводка в шапке: total / с активным портфолио / мало данных / без портфолио — четыре цветные плашки.
- Mobile-first: `max-w-5xl`, `gap-3`, `text-xs sm:text-sm`, аватар уменьшен до 12 (с 14), сетка стек→2→3.
- Демо-CTA «песочница» оставлен только когда у пользователя нет портфолио (раньше показывался всегда).
- Helpers вынесены в `src/lib/portfolio/portfolioHubHelpers.ts` (чистые функции — формат, состояния, чипы, summary, sort).
- Smoke: новый модуль `portfolioHubHelpers.smoke.ts` (14 групп: pluralRu, формат timestamp с границами, состояния карточек, дедуп чипов, sort, summary). Запуск через `runAllPortfolioSmokeTests`.
- Создан umbrella runner `src/lib/development/__smokeTests__` для прогона Goals + Portfolio одной командой.
- Goals smoke-runner оставлен **в неизменном виде** (10 модулей) — контракт frozen Goals соблюдён.

### Sprint A — required screenshots (для будущего visual QA pack)

| # | Файл | Сцена |
|---|---|---|
| A1 | `portfolio-hub-loading-desktop.png` | Slow 3G, видны skeleton-карточки |
| A2 | `portfolio-hub-success-desktop.png` | Семья с 3+ участниками, mix состояний |
| A3 | `portfolio-hub-empty-no-members-desktop.png` | Семья есть, участников нет |
| A4 | `portfolio-hub-no-family-desktop.png` | Нет семьи — CTA «Создать семью» |
| A5 | `portfolio-hub-error-desktop.png` | Backend упал, виден alert + «Повторить» |
| A6 | `portfolio-hub-card-ready.png` | Карточка ready (summary, chips, timestamp) |
| A7 | `portfolio-hub-card-thin.png` | Карточка thin (мало данных, янтарная) |
| A8 | `portfolio-hub-card-empty.png` | Карточка empty (dashed, «создать портфолио») |
| A9 | `portfolio-hub-mobile-375px.png` | Mobile, видна сетка в один столбец |

Каждый спринт = атомарный коммит + краткий status (как делали по Goals).

---

## 6. Контракт post-freeze Wave 1 (Goals)

Полностью наследуется (см. R2 Masterplan §5):
- Goals V1 не трогаем за пределами P0/P1 баг-фиксов.
- Любая интеграция Wave 2 → Goals идёт через существующее `lifeApi.*`.
- Smoke-runner Goals остаётся 10 модулей, прогон зелёный после Wave 2.

---

## 7. Известные риски и мьютигейшены

| Риск | Митигейшен |
|---|---|
| Sphere detail может потянуть редизайн данных | Жёстко удержать read-only scope V1. Любая запись — V2. |
| HistoryChart visual может выпасть на mobile | Закладываем mobile-проверку в Sprint D, fallback — линк «открыть на десктопе». |
| Snapshot-агрегация на бэке медленная → плохой UX «Обновить» | На фронте делаем optimistic timestamp + spinner; если backend > 5 сек, показываем «обновляем в фоне». Бэкенд не оптимизируем в V1. |
| Достижения с long-title ломают Wall | Стандартный truncate + tooltip (как у Focus row). |
| Связи Goals↔Portfolio расходятся с реальными данными | Все связи — read-only выборка из текущих API; никакой кэш на фронте. |
| Wave 3 переписывает то, что мы сделаем сейчас | Принципы целевой архитектуры (Masterplan §2) уже учтены в charter; повторных переписываний не должно быть. |

---

## 8. История документа

- **2026-05-14** — создан после фиксации решения «Wave 2 = Portfolio V1». Базируется на инвентаризации Portfolio (snapshot выполнен в этот же день).
- **2026-05-14 (build `01594d2`)** — Sprint A dev-done. `FamilyPortfolio.tsx` полностью переписан под 4-состоянийный контракт; добавлены `portfolioHubHelpers.ts` + smoke-tests + portfolio runner + umbrella runner «Развитие». Goals smoke не тронут. Required screenshots A1–A9 зафиксированы для будущего visual QA pack.