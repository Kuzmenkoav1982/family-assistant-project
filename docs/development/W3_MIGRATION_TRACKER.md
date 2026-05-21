# Wave 3 — Migration Tracker

> Статус миграции страниц на SectionPageFrame / HubLayoutV2 (locked contract).
> Обновлять по факту кода, не по памяти.
> Последнее обновление: W3-G1 (commit 967701c)

---

## Contract

| Компонент | Путь |
|---|---|
| `HubLayoutV2` | `src/components/hub/HubLayoutV2.tsx` |
| `SectionPageFrame` | `src/components/ui/SectionPageFrame.tsx` |

**Width tokens:** `standard` (5xl) · `narrow` (3xl) · `wide` (7xl)
**Variants:** `hero` (imageUrl) · `light` (no image)
**Escape hatches:** `hideTitle` · `backMode="none"`
**Bottom clearance:** PageWrapper (pb-14) — единственный владелец

---

## Baseline Metrics (W3-G1, commit 967701c)

| Метрика | Кол-во файлов | Цель |
|---|---|---|
| Прямых `import SectionHero` в pages/ | **56** | → 0 |
| Файлов с `pb-24` в pages/ | **48** | → 0 |
| Файлов с `navigate(-1)` в pages/ | **16** | → 0 в page headers |
| Файлов с `max-w-2xl` / `max-w-7xl` вне token | **58** | → только через width prop |

---

## Hub Pages (HubLayoutV2)

| Route | Файл | Width | Мигрирован | Escape hatch | Notes |
|---|---|---|---|---|---|
| `/family-hub` | FamilyHub.tsx | standard | ✅ Pilot | — | top-level hub, no backPath |
| `/planning-hub` | PlanningHub.tsx | standard | ✅ Pilot | — | top-level hub, no backPath |
| `/finance` | FinanceHub.tsx | standard | ✅ auto | — | already on HubLayoutV2 |
| `/health-hub` | HealthHub.tsx | standard | — | — | |
| `/nutrition` | NutritionHub.tsx | standard | — | — | |
| `/development-hub` | DevelopmentHub.tsx | standard | — | — | |
| `/household-hub` | HouseholdHub.tsx | standard | — | — | |
| `/values-hub` | ValuesHub.tsx | standard | — | — | |
| `/leisure-hub` | LeisureHub.tsx | standard | — | — | |
| `/state-hub` | StateHub.tsx | standard | — | — | |
| `/family-matrix` | FamilyCodeHub.tsx | standard | — | — | |

---

## Section Pages (SectionPageFrame)

| Route | Файл | Variant | Width | Escape hatch | Мигрирован | Notes |
|---|---|---|---|---|---|---|
| `/tasks` | Tasks.tsx | hero | standard | — | ✅ Pilot | backPath=/planning-hub |
| `/workshop` | Workshop.tsx | light | standard | hideTitle | ✅ Pilot+ | WorkshopHero как first child |
| `/notifications` | Notifications.tsx | light | narrow | — | ✅ Batch 1 | canonical light; rightAction=Прочитать все |
| `/health` | HealthNew.tsx | hero | standard | — | ✅ Batch 1 | оба state (loading+main) на одном frame |
| `/finance/budget` | FinanceBudget.tsx | hero | narrow | — | ✅ Batch 1 | BudgetDialogs снаружи frame |
| `/dashboard` | Dashboard.tsx | light | wide | **hideTitle** | ✅ Batch 2 | domain header как first child; backPath=/ |
| `/settings` | Settings.tsx | light | wide | — | ✅ Batch 2 | canonical light; title+subtitle в frame; rightAction |
| `/development` | Development.tsx | hero | standard | — | ✅ Batch 2 | activeTest → отдельный light frame |
| `/calendar` | Calendar.tsx | hero | standard | — | ✅ Batch 3 | backPath=/planning-hub |
| `/trips` | Trips.tsx | hero | standard | — | ✅ Batch 3 | rightAction=WishList; dialogs снаружи frame |
| `/pets` | Pets.tsx | hero | standard | — | ✅ Batch 3 | backPath=/household-hub (исправлен с /); rightAction=+Питомец |
| `/analytics` | Analytics.tsx | hero | standard | — | ✅ Batch 3 | pre-existing any TS debt |
| `/voting` | VotingPage.tsx | hero | standard | — | ✅ Batch 3 | |
| `/events` | EventsPage.tsx | — | — | — | — | |
| `/nutrition/tracker` | Nutrition.tsx | — | — | — | — | |
| `/nutrition/diet` | DietQuiz.tsx | — | — | — | — | |
| `/finance/debts` | FinanceDebts.tsx | — | — | — | — | |
| `/finance/accounts` | FinanceAccounts.tsx | — | — | — | — | |
| `/finance/goals` | FinanceGoals.tsx | — | — | — | — | |
| `/memory` | Memory.tsx | — | — | — | — | |
| `/tree` | Tree.tsx | — | — | — | — | |
| `/garage` | Garage.tsx | — | — | — | — | |
| `/chat` | FamilyChat.tsx | — | — | — | — | |
| `/shopping` | Shopping.tsx | — | — | — | — | |
| `/meals` | Meals.tsx | — | — | — | — | |
| `/recipes` | Recipes.tsx | — | — | — | — | |
| `/purchases` | Purchases.tsx | — | — | — | — | |

---

## Batch Progress

| Batch | Страниц | Статус |
|---|---|---|
| Pilot | Tasks, FamilyHub, PlanningHub | ✅ Done |
| Pilot+ | Workshop | ✅ Done |
| Batch 1 | Notifications, Health, FinanceBudget | ✅ Done |
| Batch 2 | Dashboard, Settings, Development | ✅ Done |
| **W3-G1** | guardrails + baseline | ✅ Done |
| Batch 3 | Calendar, Trips, Pets, Analytics, VotingPage | ✅ Done |
| Batch 4 | FamilyNews, Articles, Values, Memory, Tree | ✅ Done |
| **Tech debt** | Analytics.tsx — 22 pre-existing `any` TS errors | ⏳ Отдельный трек |
| Batch 5 | Wisdom, WhatIsFamily, Goals, Referral, Videos + fix FamilyNews wide→standard | ✅ Done |

---

## Batch 3 — план

### Фаза A: Hero sweep (3 страницы)

| Route | Файл | Домен | backPath |
|---|---|---|---|
| `/calendar` | Calendar.tsx | Planning | /planning-hub |
| `/trips` | Trips.tsx | Leisure | /leisure-hub |
| `/pets` | Pets.tsx | Household | /household-hub |

### Фаза B: Light sweep (2 страницы)

| Route | Файл | Проблемы |
|---|---|---|
| `/analytics` | Analytics.tsx | pb-24, manual header |
| `/voting` | VotingPage.tsx | pb-24, manual header |

---

## Правила rollout

- Не расширять `SectionPageFrame` API без повторяемой причины (2+ страниц)
- Всегда явный `backPath` (не `navigate(-1)`)
- `width` только через token (standard / narrow / wide)
- `pb-*` / `pt-*` global spacing — только PageWrapper
- `hideTitle` — только если страница сама рендерит domain header как first child
- Tracker обновляется по факту кода