# Goals V1 — Final Visual Sign-off

Заполняется после полного прохождения `docs/goals/GOALS_V1_VISUAL_QA.md`. Один документ = одно решение о freeze. Если потребуется повтор — копируется новая итерация ниже.

---

## Итерация 1

**Commit:** `_________`
**Build hash:** `_________`
**Reviewer:** `_________`
**Date:** `_________`

---

### A. Detail flows

| Методика | Normal | Success | Validation | Cross-consistency | Reduced-motion |
|----------|--------|---------|------------|-------------------|----------------|
| SMART    | pass / fail | pass / fail | pass / fail | pass / fail | pass / fail |
| OKR      | pass / fail | pass / fail | pass / fail | pass / fail | pass / fail |
| Wheel    | pass / fail | pass / fail | pass / fail | pass / fail | pass / fail |

Заметки по detail:
```
[пиши сюда: что-то заметил, или OK]
```

---

### B. Goals Hub

| Сценарий | Статус |
|----------|--------|
| Normal | pass / fail |
| Attention state | pass / fail |
| Filter empty | pass / fail |
| Empty (нет целей) | pass / fail |
| Loading | pass / fail |
| Error + Retry | pass / fail |
| Mobile (375px) | pass / fail |
| Sorting (4 пресета) | pass / fail |

Заметки по Hub:
```
[...]
```

---

### C. Weekly Review V1.1

| Сценарий | Статус |
|----------|--------|
| Progress week (positive) | pass / fail |
| Mixed week | pass / fail |
| Attention week | pass / fail |
| Empty week | pass / fail |
| No goals at all | pass / fail |
| Narrative tone correct | pass / fail |
| Nudge priority (overdue > regress > stale > progress) | pass / fail |
| Nudge click navigation (goal / tab / route) | pass / fail |
| Plural correctness (1 / 2 / 5) | pass / fail |
| Mobile layout | pass / fail |

Заметки по Review:
```
[...]
```

---

### D. Accessibility quick smoke

| Аспект | Статус |
|--------|--------|
| Keyboard navigation | pass / fail |
| Enter submit в check-in | pass / fail |
| aria-live озвучивает изменения | pass / fail |
| role="alert" / "status" | pass / fail |
| aria-invalid + aria-describedby на input | pass / fail |
| role="progressbar" + aria-valuenow | pass / fail |
| prefers-reduced-motion отключает анимации | pass / fail |

Заметки по A11y:
```
[...]
```

---

### E. Technical smoke

| Аспект | Статус |
|--------|--------|
| `runAllGoalsSmokeTests()` — все модули прошли | pass / fail |
| eslint clean | pass / fail |
| build pass | pass / fail |

Цифры из консоли smoke-runner:
```
Итого: N прошло, 0 упало
Прогон завершён за NN мс
```

---

### Артефакты

**Required (минимум 15 скриншотов):**

| # | Файл | Загружен |
|---|------|----------|
| 1 | `goals-smart-normal-desktop.png` | [ ] |
| 2 | `goals-smart-success-desktop.png` | [ ] |
| 3 | `goals-smart-validation-desktop.png` | [ ] |
| 4 | `goals-okr-normal-desktop.png` | [ ] |
| 5 | `goals-okr-success-desktop.png` | [ ] |
| 6 | `goals-okr-validation-desktop.png` | [ ] |
| 7 | `goals-wheel-normal-desktop.png` | [ ] |
| 8 | `goals-wheel-success-desktop.png` | [ ] |
| 9 | `goals-wheel-validation-desktop.png` | [ ] |
| 10 | `goals-hub-normal-desktop.png` | [ ] |
| 11 | `goals-hub-attention-desktop.png` | [ ] |
| 12 | `goals-hub-empty-desktop.png` | [ ] |
| 13 | `goals-review-progress-desktop.png` | [ ] |
| 14 | `goals-review-attention-desktop.png` | [ ] |
| 15 | `goals-review-empty-week-desktop.png` | [ ] |

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
1.
2.
```

Cosmetics / nice-to-have (в backlog V1.1.x):
```
1.
2.
```

---

### Решение

- [ ] **Goals V1 frozen — YES**
- [ ] **Goals V1 frozen — NO** (см. список блокеров выше)

Подпись:
```
Reviewer: ______________
Date:     ______________
```

---

## Что после freeze

1. Дальнейшие изменения в SMART / OKR / Wheel / Hub / Weekly Review — **только P0/P1 баги**.
2. Новый scope (новые методики, AI insights, week-to-week сравнение, экспорт, push) — в отдельный **V2** трек.
3. Известные ограничения V1 — см. `docs/goals/GOALS_V1_FREEZE.md`, секция «Known limitations V1».
