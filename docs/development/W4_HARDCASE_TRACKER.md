# Wave 4 — Hardcase Enablement & Decomposition

> Цель: снизить размер и связность тяжёлых экранов, подготовить к точечной миграции.
> Не "закрыть всё", а убрать боль из самых вязких файлов.
> Начало: commit c8d2224

---

## Контекст

W3 core rollout complete. Остаток (31 файл с SectionHero) разделён на:
- **W3-tail-medium** (4 файла, Batch 9): быстрые миграции без декомпозиции
- **W3-hardcases** (27 файлов): требуют аудита и/или декомпозиции до миграции

W4 работает с W3-hardcases через паттерн:
1. Audit → понять реальную сложность
2. Decompose (если нужно) → orchestrator + child components
3. Migrate → SectionPageFrame hero/light
4. Smoke

---

## Audit Results (commit c8d2224)

| Файл | Строк | Dialog | useState | Charts | Map | Категория |
|---|---|---|---|---|---|---|
| Garage.tsx | 832 | 1 | 3 | — | — | 🔴 heavy |
| FinanceCashflow.tsx | 557 | 0 | 3 | ✅ | — | 🔴 heavy+chart |
| FinanceRecurring.tsx | 547 | 1 | 3 | — | — | 🔴 heavy |
| AntiScam.tsx | 513 | 0 | 1 | — | — | 🟡 medium |
| Recipes.tsx | 483 | 2 | 8 | — | — | 🔴 heavy+dialogs |
| FinanceLiteracy.tsx | 419 | 1 | 8 | — | — | 🟡 medium |
| StateSupport.tsx | 413 | 0 | 1 | — | — | 🟡 medium |
| Purchases.tsx | 410 | 1 | 8 | — | — | 🟡 medium |
| FamilyPolicy.tsx | 359 | 0 | 1 | — | — | 🟢 simple |
| PariResults.tsx | 348 | 0 | 4 | ✅ | — | 🟡 medium+chart |
| DietProgress.tsx | 322 | 4 | 11 | ✅ | — | 🔴 heavy+dialogs+chart |
| FinanceLoyalty.tsx | 320 | 2 | 4 | — | — | 🟡 medium |
| Meals.tsx | 309 | 1 | 6 | — | — | 🟡 medium |
| EventsPage.tsx | 280 | 0 | 2 | — | — | 🟢 simple |
| FinanceGoals.tsx | 280 | 1 | 5 | — | — | 🟡 medium |
| FinanceAssets.tsx | 270 | 1 | 4 | — | — | 🟡 medium |
| FinanceAccounts.tsx | 268 | 1 | 6 | — | — | 🟡 medium |
| PariTest.tsx | 249 | 0 | 3 | — | — | 🟢 simple |
| Leisure.tsx | 225 | 0 | 11 | — | ✅ | 🔴 map+state |
| FinanceStrategy.tsx | 201 | 0 | 0 | ✅ | — | 🟢 simple+chart |
| Culture.tsx | 193 | 0 | 1 | — | — | 🟢 simple |
| FamilyCode.tsx | 182 | 0 | 3 | — | — | 🟢 simple |
| DietQuiz.tsx | 139 | 0 | 0 | — | — | 🟢 simple |
| FinanceAnalytics.tsx | 150 | 0 | 0 | — | — | 🟢 simple |
| FamilyTracker.tsx | 109 | 0 | 4 | — | ✅ | 🟡 map |
| Nutrition.tsx | 97 | 0 | 1 | — | — | 🟢 simple |
| FamilyChat.tsx | 92 | 0 | 0 | — | — | 🟢 simple |

---

## Пересмотр категорий после audit

**Ошиблись в оценке сложности:**
Следующие файлы оказались проще ожидаемого и можно мигрировать без декомпозиции:

| Файл | Строк | Почему проще |
|---|---|---|
| FamilyChat.tsx | 92 | Нет dialogs, нет state |
| Nutrition.tsx | 97 | Минимальный wrapper |
| FamilyTracker.tsx | 109 | Небольшой, map в отдельном компоненте |
| DietQuiz.tsx | 139 | Нет dialogs, нет charts |
| FinanceAnalytics.tsx | 150 | Нет dialogs, нет charts |
| Culture.tsx | 193 | Минимальная логика |
| FamilyCode.tsx | 182 | Простой |
| FamilyPolicy.tsx | 359 | Нет dialogs, 1 useState |
| EventsPage.tsx | 280 | Нет dialogs, 2 useState |
| PariTest.tsx | 249 | Нет dialogs |
| StateSupport.tsx | 413 | Нет dialogs, 1 useState |
| AntiScam.tsx | 513 | Нет dialogs, 1 useState |
| FinanceStrategy.tsx | 201 | Нет dialogs, нет useState |

**→ Эти 13 файлов можно миграционно закрыть в Batch 9b/10 без W4 декомпозиции**

**Настоящие W4 target (декомпозиция нужна):**

| Файл | Строк | Сложность | W4 паттерн |
|---|---|---|---|
| Garage.tsx | 832 | 5 sub-компонентов | orchestrator + GarageVehicleCard + GarageServiceCard + dialogs |
| DietProgress.tsx | 322 | 4 dialogs, 11 state | orchestrator + ProgressChart + DietDialogs |
| Recipes.tsx | 483 | 2 dialogs, 8 state | orchestrator + RecipeCard + RecipeDialogs |
| FinanceCashflow.tsx | 557 | chart, 3 state | orchestrator + CashflowChart + CashflowFilters |
| FinanceRecurring.tsx | 547 | 1 dialog, 3 state | orchestrator + RecurringList + RecurringDialog |
| FinanceLiteracy.tsx | 419 | 1 dialog, 8 state | orchestrator + LessonCard + ProgressTracker |
| Leisure.tsx | 225 | map, 11 state | map уже в отдельном компоненте — audit нужен |
| PariResults.tsx | 348 | chart, 4 state | audit нужен |

---

## W4 Pilot Plan

### Phase 1 — Quick wins (migrate without decompose)
**Цель:** сократить SectionHero count с 31 до ~18
**Батч:** FamilyChat, Nutrition, DietQuiz, FinanceAnalytics, Culture, FamilyCode, EventsPage, PariTest, FinanceStrategy

### Phase 2 — Pilot decomposition
**Цель:** паттерн работает → масштабируем
**Pilot файл:** Garage.tsx (самый большой, 832 строки, самый очевидный для разрезания)

### Phase 3 — Finance cluster
**После pilot:** FinanceCashflow, FinanceRecurring, FinanceLiteracy

### Phase 4 — остаток
**DietProgress, Recipes, Leisure, PariResults**

---

## Progress

| Phase | Файлов | Статус |
|---|---|---|
| Phase 1 — quick wins | 13 | — |
| Phase 2 — Garage pilot | 1 | — |
| Phase 3 — Finance cluster | 3 | — |
| Phase 4 — остаток | 4 | — |
| **W3-tail-medium (Batch 9)** | 4 | фоновая очередь |
