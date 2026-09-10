# Скрипты проекта

## smoke-browser.mjs — K1 Browser Smoke Automation

Автоматизированный запуск `window.__smoke.report()` в headless Chrome.

### Установка Playwright (один раз)
```bash
npx playwright install chromium --with-deps
```

### Запуск
```bash
# Против production (после деплоя)
SMOKE_BASE_URL=https://your-app.poehali.dev node scripts/smoke-browser.mjs

# Против локального dev-сервера
SMOKE_BASE_URL=http://localhost:5173 node scripts/smoke-browser.mjs

# Debug с визуальным браузером
SMOKE_HEADLESS=false SMOKE_BASE_URL=http://localhost:5173 node scripts/smoke-browser.mjs
```

### Переменные

| Переменная | Дефолт | Описание |
|---|---|---|
| `SMOKE_BASE_URL` | `http://localhost:5173` | URL приложения |
| `SMOKE_TIMEOUT_MS` | `30000` | Таймаут ожидания инициализации |
| `SMOKE_HEADLESS` | `true` | `false` для визуального запуска |

### Exit codes
- `0` — все тесты прошли
- `1` — есть упавшие тесты или ошибка

### CI пример
```yaml
- run: npx playwright install chromium --with-deps
- run: SMOKE_BASE_URL=${{ env.DEPLOY_URL }} node scripts/smoke-browser.mjs
```

### Canary прямо в браузере (F12)
```js
await window.__smoke.release()   // release checklist
await window.__smoke.report()    // machine-readable JSON
await window.__smoke.all()       // полный прогон с логами
```

---

## check-functions.ts

Автоматическая проверка актуальности URL бэкенд-функций.

### Что делает:
1. Сканирует все файлы в `src/` на предмет использования `functions.poehali.dev/[uuid]`
2. Сравнивает найденные UUID с актуальными из `backend/func2url.json`
3. Выводит список устаревших функций, если они найдены

### Как запустить вручную:
```bash
bun run scripts/check-functions.ts
```

### Автоматический запуск:
- При коммите (через `.husky/pre-commit`)
- Предотвращает коммит кода с устаревшими функциями

### Пример вывода:
```
✓ Загружено 58 валидных функций из func2url.json
🔍 Сканирование файлов...
✓ Проверено файлов: 142
✅ Все функции актуальны! Устаревших URL не найдено.
```

Или при ошибке:
```
❌ Найдено 1 устаревших URL функций:

UUID: bd04c5da-ca21-42cd-a2fc-3eb949fa2ed5
Файл: src/components/leisure/ParticipantsPicker.tsx:30

💡 Проверьте backend/func2url.json и обновите URL в коде.
```
## typecheck-baseline.mjs — храповик по ошибкам TypeScript

В проекте ~969 накопленных ошибок типов. Пока их столько, `tsc --noEmit`
не работает как сигнал: новая ошибка теряется в старом шуме, и аргумент
«тут и раньше было столько ошибок» превращается в разрешение добавлять ещё.
Чинить всё разом внутри задач по авторизации — неверный размен, поэтому
введён храповик.

Правила:
1. Общее число ошибок **не имеет права расти**.
2. В security-критичных файлах ошибок не должно быть **вообще**
   (список `STRICT_PATHS` в скрипте: apiHeaders, identity, authStorage,
   auth-context, permissions, useCapabilities, healthApi, payment).
   Здесь «примерно типизировано» означает «неизвестно, кто и что получит».
3. Baseline двигается только вниз и обновляется явной командой.

### Запуск
```bash
node scripts/typecheck-baseline.mjs          # проверка (CI)
node scripts/typecheck-baseline.mjs --update # зафиксировать прогресс
```

Baseline хранится в `scripts/typecheck-baseline.json`.
Обновление отклоняется, если есть ошибки в security-файлах.

### Полная проверка авторизации перед релизом
```bash
node scripts/test-actor-user-id.mjs        # identity не берётся из клиента
node scripts/typecheck-baseline.mjs        # типы: без регресса, security чисто
python3 backend/_shared/sync_auth_guard.py --check   # копии auth_guard совпадают
```

## authz-matrix.py — интеграционная матрица авторизации (прод)

Проверяет не только «без токена → 401», но и то, что **легитимный доступ
работает**. Отказ на всё — это не безопасность, а сломанный продукт;
поэтому в матрице есть и позитивные, и негативные сценарии.

```bash
python3 scripts/authz-matrix.py
```

Покрытие:

| Сценарий | Ожидание |
|---|---|
| своя семья, свой субъект (чтение календаря) | 200 |
| список без указания ребёнка (только доступные субъекты) | 200 |
| ребёнок из чужой семьи | 403 |
| подмена familyId в теле запроса | 404 |
| без сессии | 401 |
| только подменённый X-User-Id | 401 |
| DELETE чужого объекта по подобранному id | 404 |
| children-data: свой ребёнок | 200 |
| children-data: чужая семья | 404 |
| children-data: недействительный токен | 401 |

Чужой объект даёт 404, а не 403: 403 подтверждал бы, что объект существует.

Тестовая сессия — постоянный QA-токен семьи `00000000-...-000000000001`.
