# Wave 3 — Migration Tracker

> Статус миграции страниц на SectionPageFrame / HubLayoutV2 (locked contract).
> Обновлять при каждом Batch.

---

## Contract

| Компонент | Путь | Назначение |
|---|---|---|
| `HubLayoutV2` | `src/components/hub/HubLayoutV2.tsx` | Top-level hub pages |
| `SectionPageFrame` | `src/components/ui/SectionPageFrame.tsx` | Inner section pages |

**Width tokens:** `standard` (5xl) · `narrow` (3xl) · `wide` (7xl)  
**Variants:** `hero` (imageUrl) · `light` (no image)  
**Escape hatches:** `hideTitle` · `backMode="none"`  
**Bottom clearance:** PageWrapper (pb-14) — единственный владелец  

---

## Hub Pages (HubLayoutV2)

| Route | Файл | Width | Migrated | Notes |
|---|---|---|---|---|
| `/family-hub` | FamilyHub.tsx | standard | ✅ Pilot | top-level hub, no backPath |
| `/planning-hub` | PlanningHub.tsx | standard | ✅ Pilot | top-level hub, no backPath |
| `/finance` | FinanceHub.tsx | standard | ✅ auto | already on HubLayoutV2 |
| `/health-hub` | HealthHub.tsx | standard | — | |
| `/nutrition` | NutritionHub.tsx | standard | — | |
| `/development-hub` | DevelopmentHub.tsx | standard | — | |
| `/household-hub` | HouseholdHub.tsx | standard | — | |
| `/values-hub` | ValuesHub.tsx | standard | — | |
| `/leisure-hub` | LeisureHub.tsx | standard | — | |
| `/state-hub` | StateHub.tsx | standard | — | |
| `/family-matrix` | FamilyCodeHub.tsx | standard | — | |

---

## Section Pages (SectionPageFrame)

| Route | Файл | Variant | Width | Escape hatch | Migrated | Notes |
|---|---|---|---|---|---|---|
| `/tasks` | Tasks.tsx | hero | standard | — | ✅ Pilot | backPath=/planning-hub |
| `/workshop` | Workshop.tsx | light | standard | hideTitle | ✅ Pilot+ | WorkshopHero как first child |
| `/notifications` | Notifications.tsx | light | narrow | — | ✅ Batch 1 | canonical light, rightAction |
| `/health` | HealthNew.tsx | hero | standard | — | ✅ Batch 1 | оба state на frame |
| `/finance/budget` | FinanceBudget.tsx | hero | narrow | — | ✅ Batch 1 | BudgetDialogs снаружи frame |
| `/dashboard` | Dashboard.tsx | light | wide | hideTitle | ✅ Batch 2 | domain glassmorphism header |
| `/settings` | Settings.tsx | light | wide | — | ✅ Batch 2 | canonical light, wide |
| `/development` | Development.tsx | hero | standard | — | ✅ Batch 2 | +activeTest state → light |
| `/health` (loading) | HealthNew.tsx | hero | standard | — | ✅ Batch 1 | loading state на том же frame |
| `/calendar` | Calendar.tsx | — | — | — | — | |
| `/events` | EventsPage.tsx | — | — | — | — | |
| `/trips` | Trips.tsx | — | — | — | — | |
| `/nutrition/tracker` | Nutrition.tsx | — | — | — | — | |
| `/nutrition/diet` | DietQuiz.tsx | — | — | — | — | |
| `/finance/debts` | FinanceDebts.tsx | — | — | — | — | |
| `/finance/accounts` | FinanceAccounts.tsx | — | — | — | — | |
| `/finance/goals` | FinanceGoals.tsx | — | — | — | — | |
| `/analytics` | Analytics.tsx | — | — | — | — | |
| `/memory` | Memory.tsx | — | — | — | — | |
| `/tree` | Tree.tsx | — | — | — | — | |
| `/garage` | Garage.tsx | — | — | — | — | |
| `/pets` | Pets.tsx | — | — | — | — | |
| `/chat` / `/family-chat` | FamilyChat.tsx | — | — | — | — | |
| `/shopping` | Shopping.tsx | — | — | — | — | |
| `/meals` | Meals.tsx | — | — | — | — | |
| `/recipes` | Recipes.tsx | — | — | — | — | |
| `/purchases` | Purchases.tsx | — | — | — | — | |
| `/trips/:id` | TripDetails.tsx | — | — | — | — | |
| `/events/:id` | EventDetailsPage.tsx | — | — | — | — | |
| `/voting` | VotingPage.tsx | — | — | — | — | |
| `/feedback` | FeedbackPage.tsx | — | — | — | — | |
| `/family-news` | FamilyNews.tsx | — | — | — | — | |

---

## Batch Progress

| Batch | Страниц | Статус |
|---|---|---|
| Pilot (B0) | Tasks, FamilyHub, PlanningHub | ✅ Done |
| Pilot+ | Workshop | ✅ Done |
| Batch 1 | Notifications, Health, FinanceBudget | ✅ Done |
| Batch 2 | Dashboard, Settings, Development | ✅ Done |
| Batch 3 | TBD | — |

---

## Known patterns (для Batch 3+)

- `navigate(-1)` → заменяем на explicit `backPath` к родительскому hub
- `pb-24` / `pb-20` / `pb-32` → убираем, PageWrapper владеет
- `pt-20` / `pt-16` → убираем, PageWrapper владеет
- `min-h-screen` + кастомный div → SectionPageFrame
- `SectionHero` → SectionPageFrame с `imageUrl`
- Dialogs/Portals снаружи frame — это правильно, не трогаем
