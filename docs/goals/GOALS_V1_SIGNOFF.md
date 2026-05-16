# Goals V1 — Final Visual Sign-off

Заполняется после полного прохождения `docs/goals/GOALS_V1_VISUAL_QA.md`. Один документ = одно решение о freeze. Если потребуется повтор — копируется новая итерация ниже.

---

## Итерация 1 — ✅ FROZEN

**Commit:** `2135101`
**Build hash:** `2135101`
**Reviewer:** Human visual pass (запрошен и подтверждён)
**Date:** 2026-05-14
**Status:** **FROZEN** — Goals V1 принят, ветка закрыта.

---

### A. Detail flows

| Методика | Normal | Success | Validation | Cross-consistency | Reduced-motion |
|----------|--------|---------|------------|-------------------|----------------|
| SMART    | **pass** | **pass** | **pass** | **pass** | **pass** |
| OKR      | **pass** | **pass** | **pass** | **pass** | **pass** |
| Wheel    | **pass** | **pass** | **pass** | **pass** | **pass** |

Заметки по detail:
```
OK. Cross-framework consistency держится по 19 критериям.
```

---

### B. Goals Hub

| Сценарий | Статус |
|----------|--------|
| Normal | **pass** |
| Attention state | **pass** |
| Filter empty | **pass** |
| Empty (нет целей) | **pass** |
| Loading | **pass** |
| Error + Retry | **pass** |
| Mobile (375px) | **pass** |
| Sorting (4 пресета) | **pass** |

Заметки по Hub:
```
OK. Layout не уезжает, attention-state выделяется корректно.
```

---

### BF. Goals Focus V1 (базовая очередь)

| Сценарий | Статус |
|----------|--------|
| Очередь есть (overdue→regressed→stale) | **pass** |
| Empty «Сегодня всё спокойно» | **pass** |
| Empty (нет целей вообще) | **pass** |
| Loading skeleton (Slow 3G) | **pass** |
| Error + Retry, Hub/Review живут | **pass** |
| Дедупликация (одна цель = одна строка) | **pass** |
| Фильтр статусов (done/paused/archived исключены) | **pass** |
| Mobile (375px) | **pass** |

---

### BFV2. Goals Focus V2 (reason-aware actions)

| Сценарий | Статус |
|----------|--------|
| Reason-aware кнопка-тогл | **pass** |
| Single-expand controller | **pass** |
| Quick check-in (stale/regressed) | **pass** |
| Overdue actions: reschedule | **pass** |
| Overdue actions: complete (двухшаговый confirm) | **pass** |
| Контракт «overdue ≠ check-in» | **pass** |
| Главный CTA сохранён | **pass** |
| Reload после успеха перестраивает очередь | **pass** |
| Ошибки inline, Hub/Review не падают | **pass** |

---

### BFV21. Goals Focus V2.1 (strict single-toast)

| Сценарий | Статус |
|----------|--------|
| Toast «Замер сохранён» (3.5s) | **pass** |
| Toast «Срок перенесён на …» с человеческой датой | **pass** |
| Toast «Цель завершена ✨» (зелёный, 4s) | **pass** |
| **Жёсткий контракт: ровно 1 Focus-toast одновременно** | **pass** |
| Toast не остаётся после unmount секции | **pass** |
| Глобальные тосты в остальном приложении не затронуты | **pass** |
| Без undo / без error-toast / без auto-open | **pass** |
| Mobile: toast не перекрывает bottom navigation | **pass** |

---

### C. Weekly Review V1.1

| Сценарий | Статус |
|----------|--------|
| Progress week (positive) | **pass** |
| Mixed week | **pass** |
| Attention week | **pass** |
| Empty week | **pass** |
| No goals at all | **pass** |
| Narrative tone correct | **pass** |
| Nudge priority (overdue > regress > stale > progress) | **pass** |
| Nudge click navigation (goal / tab / route) | **pass** |
| Plural correctness (1 / 2 / 5) | **pass** |
| Mobile layout | **pass** |

Заметки по Review:
```
OK. Narrative детерминированный, nudges не дублируются.
```

---

### D. Accessibility quick smoke

| Аспект | Статус |
|--------|--------|
| Keyboard navigation | **pass** |
| Enter submit в check-in | **pass** |
| aria-live озвучивает изменения | **pass** |
| role="alert" / "status" | **pass** |
| aria-invalid + aria-describedby на input | **pass** |
| role="progressbar" + aria-valuenow | **pass** |
| prefers-reduced-motion отключает анимации | **pass** |
| Focus V2: aria-expanded на toggle, aria-controls на панели | **pass** |

Заметки по A11y:
```
OK. Reduced-motion корректно отключает glow/zoom/tick-up.
```

---

### E. Technical smoke

| Аспект | Статус |
|--------|--------|
| `runAllGoalsSmokeTests()` — все 10 модулей прошли | **pass** |
| eslint clean | **pass** |
| build pass | **pass** (commit `2135101`) |

Модули smoke-runner (10 шт):
1. smartPolish
2. okrPolish
3. wheelPolish
4. sharedFlow
5. hubHelpers
6. weeklyReview
7. weeklyNarrative
8. focusQueue
9. focusActions
10. focusToasts

---

### Артефакты

**Required — 21/21 ✅:**

| # | Файл | Загружен |
|---|------|----------|
| 1 | `goals-smart-normal-desktop.png` | [x] |
| 2 | `goals-smart-success-desktop.png` | [x] |
| 3 | `goals-smart-validation-desktop.png` | [x] |
| 4 | `goals-okr-normal-desktop.png` | [x] |
| 5 | `goals-okr-success-desktop.png` | [x] |
| 6 | `goals-okr-validation-desktop.png` | [x] |
| 7 | `goals-wheel-normal-desktop.png` | [x] |
| 8 | `goals-wheel-success-desktop.png` | [x] |
| 9 | `goals-wheel-validation-desktop.png` | [x] |
| 10 | `goals-hub-normal-desktop.png` | [x] |
| 11 | `goals-hub-attention-desktop.png` | [x] |
| 12 | `goals-hub-empty-desktop.png` | [x] |
| 13 | `goals-review-progress-desktop.png` | [x] |
| 14 | `goals-review-attention-desktop.png` | [x] |
| 15 | `goals-review-empty-week-desktop.png` | [x] |
| 16 | `goals-focus-list-desktop.png` | [x] |
| 17 | `goals-focus-empty-desktop.png` | [x] |
| 18 | `goals-focus-v2-quickcheckin-desktop.png` | [x] |
| 19 | `goals-focus-v2-overdue-actions-desktop.png` | [x] |
| 20 | `goals-focus-v21-toast-reschedule-desktop.png` | [x] |
| 21 | `goals-focus-v21-toast-complete-desktop.png` | [x] |

**Опциональные видео:**

| Файл | Длительность | Загружено |
|------|--------------|-----------|
| `goals-smart-success-flow.webm` | 10–15 сек | [ ] |
| `goals-okr-success-flow.webm` | 10–15 сек | [ ] |
| `goals-wheel-success-flow.webm` | 10–15 сек | [ ] |
| `goals-review-narrative-nudge.webm` | 10–15 сек | [ ] |

**Путь к папке с артефактами:** `_________`

---

### Найденные баги / отклонения

P0/P1 (блокеры — чинить до freeze):
```
— нет —
```

Cosmetics / nice-to-have (в backlog V1.1.x / V2):
```
1. N+1 на загрузке Weekly Review / Focus — заменить на batch-endpoint при росте числа целей.
2. Wheel radar read-only, скрыт при < 3 сфер — расширить отображение в V2.
3. OKR check-in non-atomic (PUT KR + refetch goal + POST checkin) — единый эндпоинт в V2.
4. Нет undo для check-in / reschedule / complete — требует rollback-семантики на бэке.
5. Часть progress-эффектов runtime-only (не переживает hard refresh) — by design.
6. Smoke-tests без RTL/vitest — логика покрыта, поведение зафиксировано.
```

---

### Решение

- [x] **Goals V1 frozen — YES** ✅
- [ ] Goals V1 frozen — NO

Подпись:
```
Reviewer: Human visual pass — green
Date:     2026-05-14
Commit:   2135101
```

---

## Что после freeze

1. Дальнейшие изменения в SMART / OKR / Wheel / Hub / Weekly Review — **только P0/P1 баги**.
2. Новый scope (новые методики, AI insights, week-to-week сравнение, экспорт, push) — в отдельный **V2** трек.
3. Известные ограничения V1 — см. `docs/goals/GOALS_V1_FREEZE.md`, секция «Known limitations V1».