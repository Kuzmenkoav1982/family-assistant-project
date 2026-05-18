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