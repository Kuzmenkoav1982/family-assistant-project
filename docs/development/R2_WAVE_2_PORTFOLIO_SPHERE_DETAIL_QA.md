# Sphere Detail · Sprint D — Polish & A11y QA checklist

> Чек-лист ручной приёмки страницы `/portfolio/:memberId/sphere/:sphereKey`
> после Sprint D (visual polish + responsive + accessibility + state robustness).
>
> Запускать **до** sign-off Wave 2.

---

## 1. Visual polish (D1)

- [ ] Все секции имеют одинаковый радиус (`rounded-2xl`) и тень (`shadow-sm`).
- [ ] Вертикальный ритм между секциями ровный (`space-y-4`), нет «дыр».
- [ ] Заголовок сферы — `<h1>`, единственный на странице.
- [ ] Иерархия: h1 (название сферы) → метки секций (через `PortfolioSection`)
      → элементы списков.
- [ ] Delta-чип содержит **иконку** (TrendingUp / TrendingDown / Minus),
      а не только цвет — даже при чёрно-белом просмотре понятно направление.
- [ ] Длинные названия сфер и goal titles не обрезаются жёстким truncate,
      а переносятся (`break-words`).
- [ ] Empty / Error / Invalid / Missing-member состояния визуально согласованы
      (одна и та же карточка с иконкой → h1 → описание → кнопка).

## 2. Responsive (D2)

Проверить на ширинах: **320, 375, 768, 1024, 1280+**.

- [ ] Нет горизонтального скролла на 320 px.
- [ ] Breadcrumbs не вылезают за контейнер: имя участника и название сферы
      ограничены через `max-w-[35%]` / `max-w-[55%]` и `truncate`,
      полное значение доступно через `title=`.
- [ ] Все кнопки (BackBar, footer back, error-Retry, empty-CTA) имеют
      `min-h-[40px]` — комфортный tap target.
- [ ] Hero перестраивается: иконка слева, текст справа, не наезжает на чипы.
- [ ] Чипы (полнота, delta, обновлено) переносятся (`flex-wrap`) и не ломают
      строку при длинных значениях.

## 3. Accessibility (D3)

### Семантика
- [ ] На каждой ветке страницы (loading / error / invalid / empty / success /
      missing-member) присутствует ровно один `<main id="main" role="main">`.
- [ ] Ровно один `<h1>` на каждой ветке.
- [ ] Списки `strengths / growth / sources / goals / achievements / next-steps`
      размечены через `<ul role="list">` + `<li>` (Safari friendly).
- [ ] Breadcrumbs `<nav aria-label="Хлебные крошки">`, текущая страница помечена
      `aria-current="page"`.

### Клавиатура
- [ ] Tab проходит: BackBar → breadcrumbs → ссылки в `KeyHighlights` (если есть)
      → ссылки на goals → footer back. Логично, без сюрпризов.
- [ ] Focus state виден на всех ссылках (`focus-visible:ring-2`).
- [ ] Нет keyboard trap (после footer back tab уходит дальше по странице
      или в браузерный UI).

### Screen reader
- [ ] Loading: SR читает «Загружаем данные сферы развития…».
- [ ] Hero: SR читает «Название сферы → trend → Текущий показатель: N из 100 →
      Полнота X% → Динамика: рост/снижение на ±N → Дата обновления: …».
- [ ] Delta-чип: текстовый смысл передаётся через `aria-label` («Динамика: рост на +5»),
      числовое значение `aria-hidden="true"` чтобы SR не читал дважды.
- [ ] Декоративные иконки (`Icon` внутри списков и hero) помечены `aria-hidden="true"`
      и не зачитываются.
- [ ] Error state: `role="alert" aria-live="assertive"` — баннер озвучивается сразу.
- [ ] Soft-error в «Связанные цели»: `role="status" aria-live="polite"` — не перебивает
      основной поток.

### Цвет
- [ ] Каждое цветовое состояние (success/info/warning/danger) дублируется текстом
      или иконкой — информация не уходит только в цвет.
- [ ] Контраст текста на заливках чипов: emerald-700 на emerald-50, rose-700 на rose-50,
      slate-700 на slate-100 — все ≥ 4.5:1 (WCAG AA).

## 4. State robustness (D4)

Проверить вручную:

- [ ] **loading**: skeleton отображается, `aria-busy="true"`, `aria-live="polite"`.
- [ ] **error** (отключить интернет → открыть страницу): inline alert + Retry
      возвращает на загрузку.
- [ ] **invalid sphereKey** (`/portfolio/:memberId/sphere/bogus`): карточка
      «Эта сфера не найдена» с кнопкой возврата.
- [ ] **empty data** (новый участник без метрик): карточка «Для этой сферы пока
      недостаточно данных».
- [ ] **missing memberId** (`/portfolio//sphere/intellect`): карточка «Не указан
      участник» с CTA «К списку участников».
- [ ] **partial data** (есть `member`, но `scores[sphere] === null`): Hero показывает
      `score = null`, но страница не падает, не показывает «NaN» и т.п.
- [ ] **goals soft fail** (lifeApi.listGoals падает): остальная страница работает,
      в секции «Связанные цели» — amber-баннер «Не удалось загрузить список целей».

## 5. Regression (D5)

- [ ] `runAllPortfolioSmokeTests()` зелёный в DevTools console.
- [ ] В составе runner'а присутствует `sphereDetailA11y.runAll()`.
- [ ] eslint clean, build pass.
- [ ] Goals V1 smoke продолжает проходить зелёным (контракт post-freeze).

---

## Acceptance gate Sprint D

Sprint D закрыт, когда:

1. Все чек-боксы выше отмечены `[x]`.
2. Нет визуально ломких мест на длинных данных.
3. Страницей можно пользоваться только с клавиатуры.
4. Состояния loading / error / empty / invalid / missing-member не ломают UX.
5. Smoke `sphereDetailA11y.runAll()` зелёный.
