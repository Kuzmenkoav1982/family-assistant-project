# Status Banner — QA checklist (v1)

> Ручной прогон перед freeze v1.

---

## 0. Pre-flight

- [ ] Backend задеплоен: `mcp sync_backend` → `status-banners-public` и `admin-status-banners` в `deployed`, тесты зелёные.
- [ ] Frontend build зелёный.
- [ ] `window.__smoke.statusBanner()` в console — все группы ✓.

---

## 1. Shell / layout

### Высота баннера

- [ ] Создать баннер с коротким текстом → 1 строка. Контент страницы не уезжает под баннер.
- [ ] Создать баннер с длинным текстом → 2-3 строки. Контент сдвигается ровно на высоту баннера.
- [ ] Изменить размер окна с активным баннером → padding пересчитывается.
- [ ] Выключить баннер → контент возвращается к стандартному `pt-16`. CSS-переменная сбрасывается в `0px` (можно проверить в DevTools → Elements → `<html>` → Computed → `--status-banner-h`).

### Mobile / breakpoints

- [ ] **320px** (Galaxy Fold) — нет горизонтального скролла, текст переносится.
- [ ] **375px** (iPhone SE) — кнопка закрытия минимум 32×32.
- [ ] **768px** (iPad portrait) — баннер на всю ширину, не вылезает за контейнер.
- [ ] **1024px+** (desktop) — баннер ограничен `max-w-7xl`.

### Coexistence

- [ ] **GlobalTopBar** — баннер под ним, не перекрывает.
- [ ] **AppUpdateBanner** — поверх StatusBanner (z-100 vs z-40), не блокирует доступ.
- [ ] **DemoModeIndicator** — `fixed top-20 right-4`, не конфликтует визуально.
- [ ] **GlobalSidebar** — открывается поверх баннера, не наезжает.
- [ ] **GlobalBottomBar** — далеко внизу, не пересекается.

---

## 2. Routes

### Hidden routes

Для каждого открыть напрямую и проверить, что баннер НЕ показывается:

- [ ] `/welcome`, `/login`, `/register`, `/reset-password`, `/onboarding`
- [ ] `/join`, `/activate/test-token`, `/activate-callback`
- [ ] `/oauth-debug`, `/debug-auth`
- [ ] `/demo`, `/admin/login`
- [ ] `/presentation`, `/investor-deck`, `/matryoshka`

### Visible routes

Создать `audience=all` баннер, проверить что он показывается на:

- [ ] `/` (Index)
- [ ] `/dashboard`
- [ ] `/portfolio`, `/portfolio/<id>`, `/portfolio/<id>/sphere/intellect`
- [ ] `/workshop`
- [ ] `/family-hub`
- [ ] `/admin/dashboard` (с `audience=admins`)

### Route scope boundary

- [ ] Баннер с `routeScope=["/portfolio"]`:
  - [ ] показывается на `/portfolio` ✓
  - [ ] показывается на `/portfolio/abc/sphere/intellect` ✓
  - [ ] **НЕ** показывается на `/portfolio-compare` ✓
  - [ ] **НЕ** показывается на `/workshop` ✓

---

## 3. States (lifecycle)

| Состояние | Как создать | Что увидеть |
|---|---|---|
| **active** | enabled=true, нет окна | Группа «Активные», цветной чип |
| **scheduled** | enabled=true, startsAt в будущем | Группа «Запланированы», синий чип |
| **disabled** | enabled=false | Группа «Выключены», amber чип. Пользователю НЕ виден. |
| **expired** | enabled=true, endsAt в прошлом | Группа «Завершённые», серый чип, opacity 70%. Пользователю НЕ виден. |
| **empty source** | удалить все баннеры | `/admin/status-banner` пустой, у пользователя — ничего |
| **DB unavailable** | (моделируется в тесте backend) | `/status-banners-public` возвращает 200 с пустым `banners` |

---

## 4. Audience leakage (B3.5 hardening)

Это критичный security-блок. Проверять в **incognito**:

- [ ] Аноним (без login): создать `audience=authenticated` баннер → **incognito видит пусто**. В network tab `status-banners-public` возвращает `banners: []`.
- [ ] Аноним: создать `audience=admins` баннер → incognito пусто.
- [ ] Залогиниться (не admin): `audience=admins` баннер → пусто.
- [ ] Залогиниться (не admin): `audience=authenticated` баннер → видно.
- [ ] Залогиниться как admin → все три (all / authenticated / admins) → видно.

---

## 5. UX / A11y

### Клавиатура

- [ ] Tab проходит: skip-link (если есть) → TopBar → **CTA баннера** → **кнопка закрытия** → дальше Sidebar / контент.
- [ ] Enter на CTA → открывает ссылку.
- [ ] Enter/Space на × → закрывает баннер.
- [ ] Focus visible (purple ring) на CTA и крестике.

### Screen reader

- [ ] `info/update/maintenance/warning` → `role="status"`, читается мягко.
- [ ] `critical` → `role="alert"`, читается сразу при появлении.
- [ ] Тип сообщения озвучен (sr-only «Информация:» / «Критичное сообщение:» и т.п.).
- [ ] Иконка декоративная (`aria-hidden="true"`).

### Цвет ≠ единственный канал

- [ ] Каждый тип имеет уникальную lucide-иконку (Info / Sparkles / Wrench / AlertTriangle / AlertOctagon).
- [ ] В админ-списке lifecycle обозначен и **цветом**, и **текстом** («Активный» / «Запланирован» / «Выключен» / «Завершён»).
- [ ] При просмотре в Grayscale-режиме (DevTools → Rendering → Emulate vision deficiencies → Achromatopsia) — баннер и админ-список остаются читаемыми.

### Длинный контент

- [ ] Заголовок 200 символов → переносится, layout не ломается.
- [ ] Сообщение 500 символов → переносится в 3-5 строк, кнопка закрытия остаётся доступна.
- [ ] CTA-href длинный (e.g. `https://very.long.domain/path?query=…`) — не растягивает баннер.

---

## 6. Admin flow

### Create

- [ ] **«Создать баннер»** → диалог открыт, поля пустые.
- [ ] Выбрать тип `critical` → автоматически dismissible=OFF, priority=100.
- [ ] Выбрать тип `info` → автоматически dismissible=ON, priority=10.
- [ ] Сохранить с пустым title → ошибка «Введите заголовок».
- [ ] Сохранить с CTA-label без href → ошибка «CTA — нужны и текст, и ссылка».
- [ ] Сохранить с endsAt раньше startsAt → ошибка «Дата окончания должна быть позже даты начала».
- [ ] Создать валидный enabled=true → toast «Баннер создан», появился в группе «Активные».
- [ ] Открыть приложение в другой вкладке (не admin) → баннер доезжает в течение 60 секунд.

### Edit

- [ ] Кликнуть на иконку pencil → диалог открыт с заполненными полями.
- [ ] Изменить заголовок → Сохранить → toast «Баннер обновлён», список обновился.
- [ ] В пользовательской вкладке баннер обновляется в течение 60 секунд.

### Enable / disable

- [ ] У активного баннера кнопка **«Выключить»** → toast, переместился в «Выключены».
- [ ] У выключенного кнопка **«Включить»** → toast, появился в «Активные» (или «Запланирован» если startsAt в будущем).
- [ ] В user-вкладке: после disable баннер исчезает в течение 60 секунд.

### Delete

- [ ] Иконка trash → confirm → ОК → toast «Удалено», баннер исчез из списка.
- [ ] В user-вкладке баннер исчезает в течение 60 секунд.

### Preview

- [ ] Открыть форму, заполнить, **«Предпросмотр»** → баннер появился сверху у админа.
- [ ] Открыть приложение в другой вкладке → preview там **не видно** (это локальный override).
- [ ] **«Снять preview»** → баннер исчез у админа.
- [ ] Закрыть диалог без сохранения → preview снимается автоматически.
- [ ] **«Сохранить»** → preview снимается, баннер появляется уже из БД.

### Banner в shell

- [ ] После create+enable баннер появляется в `/`, `/dashboard`, `/portfolio` etc.
- [ ] После disable баннер исчезает.
- [ ] После expire (endsAt в прошлом) баннер исчезает у пользователя без явного действия админа.

### Dismissed not returning before TTL

- [ ] Пользователь закрыл dismissible баннер → баннер исчез.
- [ ] Перезагрузить страницу → баннер всё ещё не показывается.
- [ ] Открыть DevTools → Application → Local Storage → `dismissedBanners` → запись присутствует с `expiresAt` (соответствует `banner.endsAt` или `+90 дней`).
- [ ] Стереть запись → перезагрузить → баннер снова показывается.

---

## 7. Smoke (автоматизированный)

В browser console:

```js
await window.__smoke.statusBanner();
```

- [ ] **resolveActiveBanner** — все группы ✓
- [ ] **classifyBanner** — все группы ✓
- [ ] **dismissedTtl** — все группы ✓
- [ ] **shellRoutes** — все группы ✓ (включая «typo regression»)

---

## 8. Final sign-off

- [ ] Все секции выше отмечены.
- [ ] Build зелёный.
- [ ] Backend tests: 5/5 public + 8/8 admin = 13/13.
- [ ] `git log` содержит коммиты: B3.5 hardening, B5 smoke, B5 docs.

После sign-off — переходим к B4 (AI suggestions, draft assist only).
