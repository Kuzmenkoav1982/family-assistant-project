# Wave 5 — SectionHero Remaining Migration Backlog

> Аудит: 8da7e49 (после W4 complete)
> Цель: довести оставшиеся файлы с SectionHero до SectionPageFrame
> Начало: следующий после W4 complete

---

## Summary

```
Remaining SectionHero files: 19
  Quick wins:     2
  Medium:         8
  Hard/decompose: 9
  Exempt:         0 (intentional exceptions не обнаружены)

Top 5 W5-B1 candidates:   FamilyPolicy, EmptyChildrenState, FinanceGoals, PariTest, StateSupport
Top 3 hardcases / pilot:  FinanceStrategy, FinanceAnalytics, LifeRoad
Special attention:        FamilyTracker (Map), FinanceDebts (2× SectionHero)
```

---

## Таблица файлов

| # | Файл | Строк | backPath | Width | SH× | Charts | Dialog | Upload | Map | Early Returns | Heavy State | Класс |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FamilyPolicy.tsx | ~360 | /state-hub | wide | 1 | — | — | — | — | — | 1 useState | quick |
| 2 | EmptyChildrenState.tsx | ~48 | /family-hub | standard | 1 | — | 1× | — | — | — | — | quick |
| 3 | FinanceGoals.tsx | ~310 | /finance | narrow | 1 | — | 2× | — | — | — | 5 useState | medium |
| 4 | PariTest.tsx | ~240 | /family-matrix | narrow | 1 | — | 1× | — | — | 2× | 5 useState | medium |
| 5 | FinanceAssets.tsx | ~280 | /finance | narrow | 1 | — | 2× | — | — | 1× | 6 useState | medium |
| 6 | FinanceAccounts.tsx | ~330 | /finance | narrow | 1 | — | 2× | — | — | 1× | 6 useState | medium |
| 7 | EventsPage.tsx | ~300 | /leisure-hub | standard | 2 | — | — | — | — | 1× | 4 useState | medium |
| 8 | StateSupport.tsx | ~380 | /state-hub | wide | 1 | — | — | — | — | — | 2 useState | medium |
| 9 | Shopping.tsx | ~380 | /household-hub | standard | 1 | — | 3× | — | — | 1× | 7 useState | hard |
| 10 | Meals.tsx | ~310 | /household-hub | standard | 1 | — | 1× | — | — | — | 7 useState | hard |
| 11 | Purchases.tsx | ~400 | /planning-hub | standard | 1 | — | 1× | — | — | — | 7 useState | hard |
| 12 | AntiScam.tsx | ~410 | /support-hub | wide | 1 | — | — | — | — | 3× | 7 useState | hard |
| 13 | FinanceLoyalty.tsx | ~280 | /finance-hub | standard | 1 | — | 2× | — | — | 2× | 8 useState | hard |
| 14 | RecipeFromProducts.tsx | ~350 | ? | standard | 1 | — | 2× | — | — | 2× | 9 useState | hard |
| 15 | FinanceDebts.tsx | ~138 | /finance | narrow | **2** | — | 2× | — | — | 2× | 5+ useState | hard |
| 16 | FamilyTracker.tsx | ~109 | /family-hub | wide | 1 | — | — | — | **да** | — | — | hard |
| 17 | FinanceStrategy.tsx | ~210 | /finance | standard | **3** | **Recharts** | — | — | — | 4× | 5+ useState | hard |
| 18 | FinanceAnalytics.tsx | ~150 | /finance | standard | **2** | **Recharts** | — | — | — | 3× | hook state | hard |
| 19 | LifeRoad.tsx | ~260 | /development-hub | standard | 1 | — | 4× | — | — | 5+ | 10+ useState | hard |

---

## Классификация

### Quick Wins (2 файла) — W5-B1 часть 1
Прямая замена SectionHero → SectionPageFrame, нет рисков.

| Файл | Комментарий |
|---|---|
| FamilyPolicy.tsx | Инфо-страница, 1 useState, wide layout |
| EmptyChildrenState.tsx | Empty state overlay, компонент а не страница, минимальная правка |

### Medium (8 файлов) — W5-B1 часть 2 + W5-B2
Требуют минимальной подготовки: ранние returns → SectionPageFrame, явный backPath.

| Файл | Причина medium | Action |
|---|---|---|
| FinanceGoals.tsx | 5 useState + 2 dialogs, 1 clear return path | direct migrate |
| PariTest.tsx | 2 early returns (intro/test/saving), очевидный backPath | direct migrate |
| FinanceAssets.tsx | 1 access check guard, 6 useState | direct migrate |
| FinanceAccounts.tsx | 1 access check guard, 6 useState, аналог Assets | direct migrate |
| EventsPage.tsx | 2× SectionHero (loading + main), нужно объединить returns | migrate + minor cleanup |
| StateSupport.tsx | Tabs, 2 useState, широкий контейнер | direct migrate |

### Hard / Decompose First (9 файлов) — W5 pilots + cluster
Нужна декомпозиция или существенная подготовка перед миграцией.

| Файл | Причина hard | Recommended action |
|---|---|---|
| FinanceStrategy.tsx | 3× SectionHero + Recharts + 4 early returns + Tabs + 5 child comps | decompose first → migrate |
| FinanceAnalytics.tsx | 2× SectionHero + Recharts + 4 Tabs + 6+ child comps | decompose first → migrate |
| LifeRoad.tsx | 10+ useState + 4+ dialogs + 6+ child comps + Tabs | decompose first → migrate |
| Shopping.tsx | 7 useState + 3 dialogs + loading guard | migrate with prep |
| Meals.tsx | 7 useState + dialog + tabs (week/day) | migrate with prep |
| Purchases.tsx | 7 useState + Tabs + dialog | migrate with prep |
| AntiScam.tsx | 3 early returns (loading/detail/expanded) | 3-return pattern → migrate |
| FinanceLoyalty.tsx | 2 early returns + 8 useState + 2 dialogs | migrate with prep |
| RecipeFromProducts.tsx | 9 useState + 2 dialogs + unclear backPath | audit backPath → migrate |
| FinanceDebts.tsx | 2× SectionHero (loading + detail) — mini pattern | direct migrate |
| FamilyTracker.tsx | MapSection компонент — специальный layout | audit map layout → migrate |

---

## Предлагаемый W5 Sequencing

### W5-B1 — Quick + Medium batch (6 файлов)
```
FamilyPolicy        — quick, wide, plain
EmptyChildrenState  — quick, component level
FinanceGoals        — medium, narrow, 5 useState
PariTest            — medium, narrow, 2 returns
FinanceAssets       — medium, narrow, access guard
FinanceAccounts     — medium, narrow, access guard (аналог Assets)
```
Ожидаемый результат: 6 файлов за один батч, build зелёный.

### W5-B2 — Medium cleanup batch (2 файла)
```
EventsPage     — 2× SectionHero merge
StateSupport   — Tabs + wide layout
```

### W5-B3 — Household cluster (3 файла — аналог Finance cluster)
```
Shopping    — dialog prep + migrate
Meals       — dialog + tabs prep + migrate
Purchases   — tabs + dialog prep + migrate
```

### W5-P1 — Finance hardcase pilot (FinanceStrategy)
```
Самый тяжёлый из finance: 3× SectionHero + Recharts + 4 early returns
Паттерн из W4-F1 (FinanceCashflow) — уже отработан
Ожидаемое: 5 child компонентов, оркестратор ~80 строк
```

### W5-P2 — Finance Analytics pilot (FinanceAnalytics)
```
Recharts + 2× SectionHero + 4 Tabs
После FinanceStrategy пойдёт быстрее
```

### W5-P3 — LifeRoad (самый сложный)
```
10+ useState + 4 dialogs = полноценная декомпозиция
Лучше оставить последним или отдельным batch
```

### W5-Special — Точечные сложные случаи
```
AntiScam        — 3 early returns pattern
FinanceLoyalty  — 2 returns + 8 useState
FinanceDebts    — 2× SectionHero (loading/detail)
FamilyTracker   — Map layout audit
RecipeFromProducts — выяснить backPath
```

---

## Decision Rules W5

**Вверх по приоритету:**
- user-facing core (finance, household, family)
- очевидный backPath
- pattern уже отработан в W4
- нет charts/map

**Вниз по приоритету:**
- RecipeFromProducts (unclear backPath — уточнить)
- FamilyTracker (Map — специальный layout)
- LifeRoad (самый сложный, лучше в конец)

---

## Flags / Special Attention

```
⚠️  FinanceStrategy:    3× SectionHero — нужно объединить все 4 early returns
⚠️  FinanceAnalytics:   2× SectionHero + Recharts — chart decomposition как F1
⚠️  FamilyTracker:      MapSection — проверить layout contract с картой
⚠️  RecipeFromProducts: backPath не очевиден — проверить навигацию в коде
⚠️  FinanceDebts:       2× SectionHero в 138 строках — легко, но pattern нужен
```

---

## W4 Итог (зафиксированный)

| Phase | Файлов | Commit |
|---|---|---|
| W4-B1: 5 quick wins | 5 | 6d43849 |
| W4-P1: Garage pilot | 1 | adba024 |
| W4-F1/F2/F3: Finance cluster | 3 | c2708a7 |
| W4-P4: остаток | 4 | 8da7e49 |
| **W4 total** | **13** | — |

SectionHero было: **31** → после W4: **19** (−12)
