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
3. **Sprint B.1 — Member detail (Hero + Refresh + visual-language)**: единый page-shell (loading/error), карточный action-bar, success/error toast. ✅ **dev-done**
4. **Sprint B.2 — Member detail (нижние блоки visual-language)**: PortfolioSection-wrapper, якоря, единый skeleton/error в Insights+History. ✅ **dev-done**
5. **Sprint C — Sphere detail**: новая страница + видимые связи Goals↔Portfolio.
6. **Sprint D — Polish & A11y**: единые state-паттерны, keyboard, aria, mobile финал.
7. **Smoke + freeze doc + visual QA pack** одновременно с Sprint D.
8. **Human visual pass** (как с Goals V1).
9. **Sign-off → FROZEN**.

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

### Sprint B.1 — итог (что сделано)

- Полностью переделан page-shell `MemberPortfolio`:
  - **loading** — skeleton Hero + 3 карточки-блока вместо центрального спиннера, gradient-фон в стиле Hub.
  - **error** — inline rose-alert с **двумя** действиями: «Повторить» (новый — переиспользует `load()`, единый код первичной загрузки и retry) и «Назад». Раньше был только «Вернуться».
- Над `PortfolioHeader` появился новый **карточный action-bar Hero**:
  - Слева — `LineChart`-эмблема (pulse при refresh) + лейбл «Паспорт развития» + строка статуса с aria-live: «Обновлено N минут/дней/… назад» / «Собираем свежие данные…» / fallback «Данных об обновлении пока нет».
  - Справа — основной CTA «Обновить» (gradient purple→pink, primary-стиль из Workshop), вторичные `SourcesDrawer`, «В чат семьи», «Скачать PDF» в ровную линию.
- Старый плоский action-row ниже `KeyHighlights` удалён — он мигрировал в Hero.
- Обновлён фон страницы на `from-purple-50 via-pink-50 to-orange-50` (как Hub и Workshop).
- Контейнер уменьшен с `max-w-6xl` → `max-w-5xl`, padding по mobile приведён к `px-3 sm:px-4 py-4 sm:py-6` — единый ритм с Hub.
- Кнопки PDF и Share получили `hidden sm:inline` для ярлыков на mobile.
- Refresh flow теперь даёт обратную связь:
  - **success** → `toast({ title: 'Портфолио обновлено', description: 'Свежий снимок данных для <Имя>' })`.
  - **error** → `toast({ variant: 'destructive', title: 'Не удалось обновить', description: <короткое одно-строчное сообщение или fallback> })`.
  - Inline-error при refresh **не выводится** (старый `setError` после успешной первичной загрузки больше не ломает экран): на странице остаётся последний успешный snapshot, ошибка только в toast.
- Тексты тостов вынесены в `src/lib/portfolio/portfolioMemberHelpers.ts`:
  - `buildRefreshToast(kind, ctx)` — детерминированный форматтер (success/error, with/without name, multiline → одна строка, обрезка до 140 с многоточием).
  - `trimOneLine(value, max)` — общий хелпер.
- Smoke: новый модуль `portfolioMemberHelpers.smoke.ts` (10 групп: trim, success-with/without/empty name, error-with/without message, длинное сообщение → обрезка, multiline → flatten). Подключён в Portfolio runner.
- **Контракт `useSingleToast` пересмотрен**: в проекте уже есть `@/hooks/use-toast` с `TOAST_LIMIT = 1`. Это и есть «один toast за раз», поэтому отдельный хук строить не пришлось. Использован существующий `useToast()` — никаких глобальных изменений.
- **Не тронуто**: PortfolioHeader, TrustBlock, KeyHighlights, SpheresRadar, ImproveAccuracyBlock, InsightsBlock, HistoryChart, DevelopmentTable, ActiveDevelopmentPlan, AchievementsWall, нижний info-card. Goals — без единой строки изменений.

### Sprint B.1 — required screenshots (для будущего visual QA pack)

| # | Файл | Сцена |
|---|---|---|
| B1 | `portfolio-member-loading-desktop.png` | Slow 3G на `/portfolio/:id` — Hero skeleton + 3 блока |
| B2 | `portfolio-member-error-desktop.png` | Backend упал — inline rose-alert с «Повторить» и «Назад» |
| B3 | `portfolio-member-hero-actionbar-desktop.png` | Готовый Hero action-bar: эмблема, статус, CTA «Обновить» + secondary |
| B4 | `portfolio-member-refreshing-state.png` | Кнопка показывает «Обновляю…», статус-строка «Собираем свежие данные…» |
| B5 | `portfolio-member-toast-success.png` | Success toast «Портфолио обновлено · Свежий снимок данных для …» |
| B6 | `portfolio-member-toast-error.png` | Destructive toast «Не удалось обновить · …» (любое сообщение) |
| B7 | `portfolio-member-mobile-375px.png` | Mobile: action-bar свернулся в 2 строки, статус выше, кнопки ниже |

### Sprint B.2 — итог (что сделано)

Контракт спринта был «выровнять нижние блоки detail page под единый visual-language **без redesign**». После снимка 9 блоков (Trust/KeyHighlights/Radar/Improve/Insights/History/Table/Plan/Achievements) принят минимально инвазивный путь: **не трогаем внутренний `<Card>` каждого блока** (там tinted-семантика — primary/5 для Trust, amber/5 для ImproveAccuracy и т.п., это часть UX-смысла, переписать = редизайн). Вместо этого:

- Добавлена лёгкая обёртка `src/components/portfolio/PortfolioSection.tsx`:
  - `id` (якорь для будущей навигации: `#trust`, `#radar`, `#insights`, `#history`, `#table`, `#plan-and-achievements`, `#highlights`, `#accuracy`, `#profile`)
  - опциональная sticky-лейбл-шапка `text-[11px] uppercase tracking-wide text-gray-500 font-semibold` + опц. иконка (только при наличии label)
  - `scroll-mt-4` для аккуратного скролла к якорю
  - aria-связь `aria-labelledby` (только при id+label)
- В `MemberPortfolio.tsx` 9 нижних блоков обёрнуты в `<PortfolioSection>`. Лейбл-шапка добавлена **только** для одной секции — «Ключевые акценты» (Sparkles): у остальных блоков уже есть свой `CardTitle` внутри, дублировать заголовок нельзя.
- `gap-6` на финальной grid → `gap-4` (единый ритм со всей страницей).
- Точечные правки skeleton/error **только в 2 блоках**, у которых эти состояния были и стилистически отставали:
  - `InsightsBlock`: skeleton `bg-muted/40 rounded-lg` → `bg-white/60 border border-white/60 rounded-2xl`; aiError (раньше тонкая строка `text-amber-600`) → полноценный rose-alert с кнопкой «Повторить» и Loader2 во время повторного запроса.
  - `HistoryChart`: skeleton — то же приведение `rounded-lg bg-muted/40` → `rounded-2xl bg-white/60 border border-white/60`.
- Внутренние `<Card>` 9 блоков **не тронуты**: ни classes, ни логика, ни графики, ни диалоги.
- Smoke: новый модуль `portfolioSectionContract.smoke.ts` (3 группы инвариантов: header visibility, icon visibility, aria-labelledby link). Подключён в Portfolio runner.

**Не сделано (намеренно, не входит в B.2):**
- Не переписаны корневые `<Card>` в 9 блоках (gradient/tinted фоны сохранены).
- Не унифицированы внутренние radius/border-color/shadow в каждом блоке.
- Не добавлены лейбл-шапки большинству секций — дублирование с `CardTitle` внутри.
- Не тронуты диаграммы, таблицы, диалоги, accordion-логика.

### Sprint B.2 — required screenshots

| # | Файл | Сцена |
|---|---|---|
| B.2.1 | `portfolio-member-section-rhythm-desktop.png` | Всё detail page сверху вниз — единый вертикальный ритм, секции через `space-y-4`, лейбл «Ключевые акценты» виден |
| B.2.2 | `portfolio-member-insights-skeleton.png` | Skeleton Insights (2 светлые карточки в едином стиле) |
| B.2.3 | `portfolio-member-insights-ai-error.png` | aiError → rose-alert + кнопка «Повторить» с Loader2 |
| B.2.4 | `portfolio-member-history-skeleton.png` | Skeleton HistoryChart в едином стиле |
| B.2.5 | `portfolio-member-anchors-desktop.png` | Devtools открыты, видны id-якоря секций (`#radar`, `#insights`, `#history` и т.д.) |
| B.2.6 | `portfolio-member-mobile-375px-full.png` | Detail page на 375px — секции не ломаются, лейбл «Ключевые акценты» читается, grid Plan+Achievements в один столбец |

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
- **2026-05-14 (build `712cae8`)** — Sprint B.1 dev-done. `MemberPortfolio.tsx` получил единый page-shell (loading skeleton + inline error+retry), новый карточный Hero action-bar над PortfolioHeader, refresh с success/destructive toast (используем существующий `useToast()` с `TOAST_LIMIT=1` — отдельный single-toast хук не понадобился). Хелперы `portfolioMemberHelpers.ts` + smoke (10 групп). PortfolioHeader и нижние блоки — без изменений. Required screenshots B1–B7 зафиксированы.
- **2026-05-14 (build `0a12dcb`)** — human visual pass A1–A9 + B1–B7 → зелёный, P0/P1 не найдено.
- **2026-05-14 (Sprint B.2 dev-done)** — добавлена обёртка `PortfolioSection` (id-якорь, опц. лейбл с иконкой, scroll-mt, aria-labelledby). 9 нижних блоков MemberPortfolio обёрнуты, лейбл-шапка добавлена только секции «Ключевые акценты» (у остальных есть свой `CardTitle`). Точечно унифицированы skeleton/error в `InsightsBlock` (skeleton + rose-alert вместо тонкой строки `text-amber-600`) и skeleton в `HistoryChart`. Внутренние `<Card>` 9 блоков и их UX-семантика (gradient/tinted фоны) **не тронуты**. Smoke: новый модуль `portfolioSectionContract.smoke.ts` (3 группы). Required screenshots B.2.1–B.2.6 зафиксированы.