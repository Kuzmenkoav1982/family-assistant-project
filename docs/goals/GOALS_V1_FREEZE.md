# Goals V1 — Final QA & Freeze

Финальный документ модуля Целей: «Мастерская жизни». Фиксирует объём, проверенные сценарии, известные ограничения, инструкции по приёмке.

---

## Состав модуля

### Поддерживаемые методики

| Методика | Витрина | Быстрый замер | Прогресс |
|----------|---------|---------------|----------|
| **SMART** | `SmartProgressDisplay` | `SmartCheckin` | `computeProgress` → метрика start/current/target |
| **OKR** | `OkrProgressDisplay` | `OkrCheckin` | `computeProgress` → взвешенные KR |
| **Wheel** | `WheelProgressDisplay` | `WheelCheckin` | `computeProgress` → дельты сфер 0..10 |

### Shared-механика (один источник истины)

- `useGoalCheckinFlow` — pulse прогресса + highlight новой строки истории
- `useProgressFlash` — само поведение pulse: запуск при `delta !== 0`, авто-сброс через 2 сек, перезапуск по `nonce`
- `usePendingCheckinHighlight` — id новой строки + `consume` после показа
- `useAnimatedNumber` — tick-up числа процентов с ease-out cubic 700 мс
- `usePrefersReducedMotion` — отключает glow/zoom/tick-up для пользователей с `prefers-reduced-motion`

---

## Cross-framework consistency

По коду (audit от ассистента) **100% совпадение по 19 критериям**:

**ProgressDisplay (A1–A9):** tick-up, reduced-motion, проп flash, key={nonce}, whitespace/leading на бейдже, `role="progressbar"` + `aria-valuenow/min/max`, `aria-live="polite"` + `tabular-nums` на числе процентов, условие `flashActive`, отказ от glow при reduced.

**Checkin (B1–B10):** guard от двойного клика, валидация (пусто/не число/совпадает), запятая как разделитель, Enter сабмитит, фокус на input при ошибке, `aria-invalid` + `aria-describedby`, `role="alert"/"status"`, слот сообщений 52px + `aria-live`, кнопка `aria-busy` + текст «Сохраняем…», success-блок 4s auto-dismiss.

---

## Smoke-runner

```js
// В консоли браузера:
import('@/lib/goals/__smokeTests__').then(m => m.runAllGoalsSmokeTests())
```

Прогоняет: SMART → OKR → Wheel → Shared flow. Печатает суммарный отчёт и время выполнения.

Файлы:
- `src/lib/goals/__smokeTests__/index.ts` — общий runner
- `src/lib/goals/__smokeTests__/smartPolish.smoke.ts` — 6 групп
- `src/lib/goals/__smokeTests__/okrPolish.smoke.ts` — 8 групп
- `src/lib/goals/__smokeTests__/wheelPolish.smoke.ts` — 7 групп
- `src/lib/goals/__smokeTests__/sharedFlow.smoke.ts` — 3 группы

---

## Manual smoke checklist для каждой методики

Шаги одинаковые для SMART / OKR / Wheel:

### Normal state
- [ ] Страница цели открывается без ошибок
- [ ] Прогресс отображается, цифры корректные
- [ ] Layout не скачет на mobile (≤ 375px)
- [ ] Empty-state виден, если нет данных (для Wheel — нет сфер; для OKR — нет KR)

### Success check-in
- [ ] Поле принимает число и число с запятой
- [ ] Нажатие «Записать» (или Enter) сохраняет
- [ ] Кнопка показывает «Сохраняем…» и `disabled` во время запроса
- [ ] Прогресс-бар обновляется с pulse + glow
- [ ] Появляется delta-бейдж `+N% / -N%`
- [ ] Число процентов «докручивается» (tick-up)
- [ ] Появляется success-блок с prev → next
- [ ] Новая строка появляется в истории и подсвечивается зелёным
- [ ] Страница автоматически прокручивается к подсвеченной строке
- [ ] Подсветка гаснет через ~1.8 сек
- [ ] Pulse гаснет через ~2 сек
- [ ] Success-блок гаснет через ~4 сек

### Validation/Error state
- [ ] Пустое поле → «Укажи новое значение…»
- [ ] Не число → «Введи число в корректном формате…»
- [ ] То же значение → «Должно отличаться от предыдущего»
- [ ] Для Wheel: значение вне 0..10 → «Должно быть от 0 до 10»
- [ ] Фокус возвращается в input при ошибке
- [ ] Сетевая ошибка показывает «Не удалось сохранить — проверь интернет…»
- [ ] `role="alert"` озвучивается screen reader

### Cross-framework consistency
- [ ] При одинаковой логике сохранения все три методики ведут себя визуально одинаково
- [ ] `delta = 0` не запускает flash (повторный save с тем же значением → нет pulse)
- [ ] Hard refresh страницы → никаких runtime-эффектов не висит (нет pulse, нет подсветки)
- [ ] Повторный save после первого работает корректно: новый pulse, новая подсветка

### Accessibility smoke
- [ ] Tab проходит по элементам в логичном порядке: select → input → button
- [ ] Enter в input сабмитит форму
- [ ] `prefers-reduced-motion` отключает glow/zoom/tick-up (проверить в DevTools → Rendering)
- [ ] Screen reader озвучивает изменение прогресса (aria-live)
- [ ] При ошибке атрибут `aria-invalid="true"` на input
- [ ] Прогресс-бары имеют `role="progressbar"` + `aria-valuenow`

### Sanity на shared-flow
- [ ] После подсветки строки `pendingHighlightCheckinId` сбрасывается (повторно та же строка не зажигается без нового save)
- [ ] `consumePendingHighlight` вызывается → следующий save снова работает с подсветкой

---

## Known limitations V1

Это нормально, осознанно, переезжает на V2/будущие итерации:

1. **Тест-инфраструктура — облегчённая.** Vitest не подключён. Smoke-tests реализованы как чистые TS-функции с консольным runner'ом. Для CI/regression тестов на пайплайне потребуется отдельное решение.
2. **Wheel-радар не интерактивен.** SVG — read-only. Редактирование значений делается через `WheelCheckin` и `WheelPanel`. Drag-and-drop точек на круге не предусмотрен в V1.
3. **Wheel-чарт скрыт при <3 сфер.** Радар для треугольника-двойки нечитаем, поэтому показываем placeholder с подсказкой.
4. **OKR быстрый замер — один KR за раз.** Множественный замер (batch update нескольких KR) не реализован — это делается через `OkrPanel`.
5. **Wheel-шкала не унифицирована между модулями.** В `BalanceWheel.tsx` (standalone) шкала 1..10, в Wheel-цели — 0..10. Не баг V1, но потенциальная точка унификации.
6. **История check-ins показывает 5 последних.** Полная история — через диалог. Этого достаточно для reflection-сценария.
7. **Pulse прогресса — runtime-only.** Не сохраняется в стейте, не переживает hard refresh. Это by design.
8. **Smoke-tests — без React Testing Library.** Тестируют логику, не сами хуки в реальном React-дереве. Хуки проверены code-audit'ом, поведение зафиксировано в shared-механике.
9. **Backend KR check-in.** `OkrCheckin` делает PUT KR + отдельный refetch goal + POST check-in (best-effort). Атомарность через единый эндпоинт не реализована — возможен короткий рассинхрон progress кеша.
10. **Нет undo для check-in.** Удаление записи доступно только через диалог истории.
11. **N+1 на загрузке Weekly Review / Focus.** Для обзора недели и Focus Workshop делает `Promise.all(listCheckins(goal))` по каждой цели. На текущем количестве целей не проблема. На V2 — заменить на batch-endpoint (например, `listRecentCheckinsByUser` или серверная агрегация), чтобы не упираться в число запросов при росте. Focus переиспользует тот же data-pipeline, поэтому отдельных запросов не добавляет.
12. **Weekly Narrative — детерминированный шаблон.** V1.1 даёт одну фразу-итог и 1–2 nudge без AI. Никакой персональной истории, никакого dismiss/snooze, никаких напоминаний. Эмоциональная окраска намеренно нейтральная.
13. **Focus V1 — переход в detail, без inline/modal check-in.** Один CTA: «Открыть цель» / «Обновить цель». Inline mini-form и модалка — V1.1 polish, не блокер V1.
14. **Focus V1 — узкий набор причин.** Только overdue / regressed / stale. Low-progress <20%, дублирующиеся подзадачи, тематические подсказки — НЕ V1 (намеренный шум-кат). Заходят в V1.1 backlog.
15. **Focus V1 — без пользовательской сортировки.** Жёсткий severity-порядок (overdue → regressed → stale). Селектор сортировки появится только при доказанной пользовательской боли.
16. **Focus V2 — Reason-aware Quick Actions (поверх V1).** В строку Focus добавлена inline-панель с действиями, зависящими от причины:
    - `stale` / `regressed` → inline quick check-in (textarea «что изменилось?» + опциональная самооценка 0..10). Пишется как обычный `GoalCheckin` с `data.kind = 'focus-quick-checkin'`.
    - `overdue` → панель из двух действий: **Перенести срок** (date-input, валидация «не в прошлом», `updateGoal({ deadline })`) и **Завершить цель** с двухшаговым подтверждением (`updateGoal({ status: 'done' })`). Inline check-in для overdue **не показывается** намеренно — он не закрывает причину.
    - Главный CTA «Открыть цель» / «Обновить цель» сохранён всегда: панель не подменяет переход в detail.
17. **Focus V2 — single-expand controller.** В каждый момент времени раскрыт максимум один item. Открытие новой строки автоматически закрывает предыдущую.
18. **Focus V2 — нет modal, нет нового `/focus`, нет bulk-actions, нет dismiss / snooze.** Всё inline в Workshop.
19. **Focus V2 — переиспользует существующий API.** `lifeApi.createCheckin` для quick check-in и `lifeApi.updateGoal` для reschedule/complete. Никаких параллельных flow или дубликатов validation. После успешного действия секция зовёт `onChanged` → Workshop делает `reload()` → очередь пересчитывается, причина у цели может смениться или цель уходит из Focus.
20. **Focus V2 — `completeGoal` не открывает диалог достижений.** Это совместимо с текущей моделью (`status='done'` без побочной публикации Achievement). Полноценный flow «Завершил → создать Achievement» остаётся в detail-экране, как и было.
21. **Focus V2.1 — success toast polish (поверх V2).** После каждого успешного действия в Focus показывается один короткий success toast через глобальный `sonner` (уже подключён в `App.tsx`):
    - `checkin` → «Замер сохранён» + описание «Цель «…»»
    - `reschedule` → «Срок перенесён на 14 мая 2026» (дата форматируется в человеческом виде; невалидная дата → fallback «Срок перенесён»)
    - `complete` → «Цель завершена ✨» + «… — больше не в Focus» (для complete используется `toast.success`, чтобы выделить позитив)
    - **Без undo**: rollback-семантика для check-in / reschedule / complete сейчас вне scope (требует безопасных delete/revert на бэке).
    - **Без error-toast**: ошибки сети остаются inline в самих формах (alert внутри панели), глобальный feedback не плодим.
    - **Без auto-open следующей строки**: пользователь сам решает, что открыть дальше.
    - **Жёсткий контракт «один Focus-toast одновременно»**: глобальный `sonner` сам по себе стэкует до 3-х. Поэтому секция держит локальный `lastToastIdRef` и перед каждым новым тостом делает `toast.dismiss(prevId)`. Гарантия — даже если пользователь быстро подряд сделал несколько действий, видимым останется только последний Focus-toast. Глобальный Toaster не меняли — поведение в остальном приложении сохранено.
    - При размонтировании секции висящий Focus-toast гасится — он не остаётся поверх других экранов.
    - Auto-hide: 3.5s для checkin/reschedule, 4s для complete.

---

## Финальный визуальный QA-набор (артефакты)

**Просьба разработчика/тестировщика для freeze-приёмки:**

По каждой методике 3 скрина (нормальное, успех, ошибка):
- SMART: normal / success / validation
- OKR: normal / success / validation
- Wheel: normal / success / validation

Опционально — 3 видео по 10–15 сек (по одному на методику):
- Запуск check-in → pulse → delta-бейдж → tick-up → подсветка строки в истории

После сбора артефактов и прохождения checklist'а — **Goals V1 = frozen**.

---

## Где что лежит

```
src/
├── components/goals/
│   ├── SmartProgressDisplay.tsx
│   ├── SmartCheckin.tsx
│   ├── OkrProgressDisplay.tsx
│   ├── OkrCheckin.tsx
│   ├── WheelProgressDisplay.tsx
│   ├── WheelCheckin.tsx
│   ├── GoalCheckinsCard.tsx        # история + подсветка строки
│   └── hooks/
│       ├── useProgressAnimations.ts # useAnimatedNumber, usePrefersReducedMotion, ProgressFlash
│       └── useGoalCheckinFlow.ts    # useProgressFlash, usePendingCheckinHighlight, useGoalCheckinFlow
├── lib/goals/
│   ├── progress.ts                  # computeProgress (источник истины)
│   └── __smokeTests__/
│       ├── index.ts                 # runAllGoalsSmokeTests
│       ├── smartPolish.smoke.ts
│       ├── okrPolish.smoke.ts
│       ├── wheelPolish.smoke.ts
│       └── sharedFlow.smoke.ts
└── pages/
    └── WorkshopGoal.tsx             # ветки SMART / OKR / Wheel через shared-flow
```

---

## История ключевых коммитов

| Этап | Описание |
|------|----------|
| SMART V1.1 Final Polish | tick-up, a11y, loading/empty/error, smoke-tests, UI polish |
| OKR V1 | OkrProgressDisplay + OkrCheckin + интеграция + smoke |
| Wheel V1 | WheelProgressDisplay (радар) + WheelCheckin + smoke |
| Shared Flow | useGoalCheckinFlow + рефакторинг WorkshopGoal + общий smoke-runner |
| **Final QA & Freeze** | этот документ |

---

## Решение

После прохождения визуального QA по checklist'у выше и сбора артефактов — **Goals V1 frozen ✅**.

Дальнейшие изменения в SMART / OKR / Wheel — только P0/P1 баги. Новый scope (новые методики, аналитика, AI-инсайты, drag-and-drop wheel) — в отдельный V2 трек.