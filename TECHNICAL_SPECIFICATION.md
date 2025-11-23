# Техническое задание: Семейный Органайзер
## Для разработчиков

---

## 📋 Общая информация

**Название проекта:** Семейный Органайзер  
**Тип:** Web-приложение (SPA) + Backend API + База данных  
**Целевая аудитория:** Семьи с детьми (возраст родителей 25-45 лет)  
**Этап:** MVP (Minimum Viable Product) для 100 тестовых пользователей  
**Срок разработки MVP:** 3-4 месяца  
**Бюджет MVP:** 700,000₽  

---

## 🎯 Цели проекта

**Главная цель:** Создать платформу для организации семейной жизни, которая помогает:
- Справедливо распределять домашние обязанности
- Мотивировать детей через gamification
- Планировать семейные события
- Укреплять семейные связи через общение
- Развивать детей с помощью ИИ-анализа

**Бизнес-цели:**
- Привлечь 100 тестовых пользователей за первый месяц
- Получить метрику NPS > 50
- Средняя сессия пользователя > 10 минут
- Retention Day 7 > 40%

---

## 🛠 Технологический стек

### Frontend
- **Framework:** React 18 (TypeScript)
- **Build tool:** Vite
- **Routing:** React Router v6
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** React Query + Context API
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation

### Backend
- **Language:** Node.js 22 (TypeScript) или Python 3.11
- **Framework:** Express.js (Node) или FastAPI (Python)
- **Authentication:** JWT + Passport.js
- **ORM:** Prisma (Node) или SQLAlchemy (Python)
- **API Style:** REST

### Database
- **СУБД:** PostgreSQL 15+
- **Миграции:** Prisma Migrate / Alembic
- **Backup:** Ежедневные автоматические бэкапы

### Infrastructure
- **Hosting:** Yandex Cloud
  - Compute Cloud (2 vCPU, 4 GB RAM)
  - Managed PostgreSQL (db1.nano)
  - Object Storage (S3-совместимое хранилище)
  - CDN для статики
- **Domain:** .ru домен
- **SSL:** Let's Encrypt (автопродление)
- **Email:** SendGrid (free tier)

### External APIs
- **Chat:** Stream Chat API ($99/мес)
- **AI:** OpenAI GPT-3.5-turbo API (~10,000₽/мес)
- **Analytics:** Google Analytics 4, Яндекс.Метрика
- **Error Tracking:** Sentry (free tier)
- **Monitoring:** Prometheus + Grafana

---

## 📐 Архитектура системы

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                    │
│         React + TypeScript + Tailwind CSS           │
│              (Yandex Cloud CDN)                     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS/WSS
                   │
┌──────────────────▼──────────────────────────────────┐
│              BACKEND API (Node.js/Python)            │
│   ┌──────────┬──────────┬──────────┬─────────────┐  │
│   │   Auth   │  Family  │  Tasks   │   AI API    │  │
│   │  Service │ Service  │ Service  │   Service   │  │
│   └──────────┴──────────┴──────────┴─────────────┘  │
│              (Yandex Compute Cloud)                  │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┼───────────┬──────────────┐
       │           │           │              │
┌──────▼────┐ ┌───▼─────┐ ┌──▼──────┐ ┌────▼─────┐
│PostgreSQL │ │ Object  │ │ Stream  │ │ OpenAI   │
│  Database │ │ Storage │ │  Chat   │ │   API    │
│           │ │   (S3)  │ │   API   │ │          │
└───────────┘ └─────────┘ └─────────┘ └──────────┘
```

---

## 📊 Схема базы данных (основные таблицы)

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP
);
```

### families
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'
);
```

### family_members
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'parent', 'child')),
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);
```

### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  creator_id UUID REFERENCES users(id) NOT NULL,
  category VARCHAR(50),
  points INTEGER DEFAULT 10,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  recurring_pattern JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  event_type VARCHAR(50) CHECK (event_type IN ('birthday', 'holiday', 'appointment', 'other')),
  reminder_time INTERVAL,
  participants JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### chat_messages (если не используем Stream Chat)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  earned_at TIMESTAMP DEFAULT NOW()
);
```

**Индексы (обязательны для производительности):**
```sql
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_tasks_family_id ON tasks(family_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_events_family_id ON events(family_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_chat_messages_family_id ON chat_messages(family_id);
```

---

## 🔑 API Endpoints (MVP)

### Authentication
```
POST   /api/auth/register          - Регистрация нового пользователя
POST   /api/auth/login             - Вход (email + password)
POST   /api/auth/logout            - Выход
POST   /api/auth/refresh           - Обновление JWT токена
POST   /api/auth/forgot-password   - Восстановление пароля
POST   /api/auth/verify-email      - Подтверждение email
GET    /api/auth/me                - Получить текущего пользователя
```

**Пример запроса:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Иван Иванов"
}
```

**Пример ответа:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов"
  },
  "token": "jwt_token_here"
}
```

### Families
```
POST   /api/families               - Создать семью
GET    /api/families/:id           - Получить информацию о семье
PUT    /api/families/:id           - Обновить семью
DELETE /api/families/:id           - Удалить семью
GET    /api/families/:id/members   - Список членов семьи
POST   /api/families/:id/invite    - Пригласить участника
POST   /api/families/:id/join      - Присоединиться по приглашению
DELETE /api/families/:id/members/:userId - Удалить участника
```

### Tasks
```
GET    /api/families/:id/tasks                    - Список задач семьи
POST   /api/families/:id/tasks                    - Создать задачу
GET    /api/families/:id/tasks/:taskId            - Получить задачу
PUT    /api/families/:id/tasks/:taskId            - Обновить задачу
DELETE /api/families/:id/tasks/:taskId            - Удалить задачу
POST   /api/families/:id/tasks/:taskId/complete   - Отметить как выполненную
POST   /api/families/:id/tasks/:taskId/assign     - Назначить исполнителя
```

**Пример запроса:**
```json
POST /api/families/{id}/tasks
{
  "title": "Помыть посуду",
  "description": "После ужина",
  "assignee_id": "user_uuid",
  "category": "household",
  "points": 15,
  "due_date": "2024-11-24T18:00:00Z"
}
```

### Events (Calendar)
```
GET    /api/families/:id/events        - Список событий
POST   /api/families/:id/events        - Создать событие
GET    /api/families/:id/events/:eventId - Получить событие
PUT    /api/families/:id/events/:eventId - Обновить событие
DELETE /api/families/:id/events/:eventId - Удалить событие
```

### AI Assistant (для будущего расширения)
```
POST   /api/ai/analyze-child           - Анализ развития ребёнка
POST   /api/ai/suggest-tasks           - Предложить задачи
POST   /api/ai/resolve-conflict        - Помощь в разрешении конфликта
POST   /api/ai/suggest-menu            - Предложить меню
```

### User Profile
```
GET    /api/users/:id                  - Профиль пользователя
PUT    /api/users/:id                  - Обновить профиль
PUT    /api/users/:id/avatar           - Загрузить аватар
GET    /api/users/:id/achievements     - Достижения пользователя
GET    /api/users/:id/points-history   - История баллов
```

### File Upload
```
POST   /api/upload/avatar              - Загрузить аватар
POST   /api/upload/photo               - Загрузить фото в альбом
POST   /api/upload/document            - Загрузить документ
```

---

## 🔐 Безопасность

### Обязательные меры:

1. **Аутентификация и авторизация:**
   - JWT токены (access token 15 мин, refresh token 7 дней)
   - HttpOnly cookies для refresh токенов
   - Хеширование паролей: bcrypt (rounds=10)
   - Обязательная проверка прав доступа на каждый запрос

2. **Защита от атак:**
   - CSRF токены для state-changing операций
   - Content Security Policy (CSP) headers
   - XSS protection (sanitize user input)
   - SQL injection - использовать prepared statements / ORM
   - Rate limiting: 100 req/min на IP
   - Защита от brute force: блокировка после 5 неудачных попыток входа

3. **HTTPS:**
   - Обязательный SSL/TLS для всех соединений
   - HSTS header (Strict-Transport-Security)
   - Редирект с HTTP на HTTPS

4. **Данные:**
   - Шифрование чувствительных данных в БД
   - Регулярные бэкапы (ежедневно)
   - Retention: хранить бэкапы 30 дней
   - GDPR compliance: право на удаление данных

5. **Мониторинг:**
   - Логирование всех ошибок (Sentry)
   - Алерты при критических ошибках
   - Мониторинг производительности (Prometheus + Grafana)

---

## 🎨 UI/UX требования

### Дизайн-система:
- **Цветовая палитра:**
  - Primary: Purple (#7c3aed)
  - Secondary: Indigo (#6366f1)
  - Success: Green (#10b981)
  - Warning: Amber (#f59e0b)
  - Error: Red (#ef4444)
  
- **Типографика:**
  - Основной шрифт: System font stack (sans-serif)
  - Заголовки: Bold, размеры 24-48px
  - Текст: Regular, 14-16px
  - Мелкий текст: 12px

- **Компоненты:** Использовать shadcn/ui (готовые компоненты на базе Radix UI)

### Адаптивность:
- **Mobile-first:** Дизайн в первую очередь для мобильных устройств
- **Breakpoints:**
  - Mobile: 320-640px
  - Tablet: 641-1024px
  - Desktop: 1025px+
  
### Производительность:
- **Lighthouse Score:**
  - Performance > 90
  - Accessibility > 90
  - Best Practices > 90
  - SEO > 90
  
- **Core Web Vitals:**
  - LCP < 2.5s (Largest Contentful Paint)
  - FID < 100ms (First Input Delay)
  - CLS < 0.1 (Cumulative Layout Shift)

### Пользовательский опыт:
- Loading states для всех асинхронных операций
- Error handling с понятными сообщениями
- Offline support (базовый)
- Push-уведомления (PWA)
- Keyboard navigation
- Screen reader support (ARIA labels)

---

## 📱 PWA требования

### Обязательно:
- `manifest.json` с иконками (192x192, 512x512)
- Service Worker для offline режима
- Кеширование статических ресурсов
- Install prompt (Add to Home Screen)
- Splash screen

### Пример manifest.json:
```json
{
  "name": "Семейный Органайзер",
  "short_name": "FamilyOrg",
  "description": "Организуйте жизнь семьи с любовью",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#7c3aed",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Требования к тестированию

### Unit Tests:
- Покрытие кода: минимум 70%
- Framework: Jest (Node) / Pytest (Python)
- Тестировать: утилиты, хелперы, бизнес-логику

### Integration Tests:
- Тестировать API endpoints
- Framework: Supertest (Node) / pytest-asyncio (Python)
- Проверять: status codes, response structure, error handling

### E2E Tests:
- Framework: Playwright или Cypress
- Критические сценарии:
  - Регистрация → Создание семьи → Приглашение → Добавление задачи
  - Вход → Выполнение задачи → Начисление баллов
  - Создание события → Напоминание
  
### Performance Tests:
- Framework: Artillery или k6
- Сценарий: 100 одновременных пользователей
- Требования:
  - Response time (p95) < 500ms
  - Error rate < 1%
  - Throughput > 100 req/sec

---

## 📦 Deployment процесс

### CI/CD Pipeline:
1. **На каждый commit в main:**
   - Запуск линтеров (ESLint, Prettier)
   - Запуск unit tests
   - Билд приложения
   - Деплой на staging

2. **На создание tag (release):**
   - Все шаги выше
   - Запуск E2E tests
   - Деплой на production
   - Уведомление в Telegram

### Environments:
- **Development:** localhost
- **Staging:** staging.familyorganizer.ru (для тестирования)
- **Production:** familyorganizer.ru

### Rollback стратегия:
- Blue-Green deployment
- Возможность откатиться на предыдущую версию за 5 минут
- Автоматический rollback при критических ошибках

---

## 📈 Метрики и мониторинг

### Бизнес-метрики:
- **DAU/MAU** (Daily/Monthly Active Users)
- **Retention:** Day 1, Day 7, Day 30
- **Session duration:** средняя длительность сессии
- **Task completion rate:** % выполненных задач
- **Invitation conversion:** % принятых приглашений

### Технические метрики:
- **Uptime:** > 99.5%
- **API response time:** p95 < 500ms
- **Error rate:** < 1%
- **Database queries:** < 100ms (p95)
- **CDN cache hit rate:** > 80%

### Инструменты:
- Google Analytics 4 (пользовательское поведение)
- Sentry (ошибки)
- Prometheus + Grafana (система)
- UptimeRobot (доступность)

---

## 🚀 План разработки MVP (12 недель)

### Недели 1-2: Подготовка
- [ ] Настроить инфраструктуру (Yandex Cloud)
- [ ] Развернуть PostgreSQL
- [ ] Настроить CI/CD
- [ ] Создать базовую структуру проекта
- [ ] Настроить линтеры, форматтеры

### Недели 3-4: Аутентификация
- [ ] Регистрация / Вход
- [ ] JWT токены
- [ ] Email-подтверждение
- [ ] Восстановление пароля
- [ ] Unit tests для auth

### Недели 5-7: Система семей
- [ ] CRUD семей
- [ ] Приглашение участников
- [ ] Роли и права доступа
- [ ] Профили участников
- [ ] Integration tests

### Недели 8-10: Задачи и баллы
- [ ] CRUD задач
- [ ] Назначение задач
- [ ] Система баллов
- [ ] Уровни участников
- [ ] Повторяющиеся задачи
- [ ] E2E tests

### Неделя 11: Календарь
- [ ] CRUD событий
- [ ] Календарный UI
- [ ] Напоминания (базовые)
- [ ] Импорт/экспорт iCal

### Неделя 12: Интеграция и финализация
- [ ] Интеграция Stream Chat
- [ ] PWA настройка
- [ ] Performance optimization
- [ ] Bug fixing
- [ ] Подготовка к бета-тесту

---

## 📋 Checklist перед запуском

### Backend:
- [ ] Все endpoints покрыты тестами (coverage > 70%)
- [ ] Rate limiting настроен
- [ ] CORS настроен правильно
- [ ] Environment variables защищены
- [ ] Database migrations работают
- [ ] Backup автоматизирован
- [ ] Error handling реализован везде
- [ ] Logging настроен (structured logs)

### Frontend:
- [ ] Lighthouse score > 90 (все метрики)
- [ ] Адаптивность на всех устройствах
- [ ] PWA manifest и service worker
- [ ] Error boundaries реализованы
- [ ] Loading states везде
- [ ] Accessibility audit пройден
- [ ] SEO meta tags добавлены

### Security:
- [ ] HTTPS enabled
- [ ] CSP headers настроены
- [ ] XSS protection
- [ ] SQL injection защита
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Password hashing (bcrypt)
- [ ] Secrets в environment variables

### DevOps:
- [ ] CI/CD pipeline работает
- [ ] Monitoring настроен (Sentry, Prometheus)
- [ ] Alerts настроены
- [ ] Backup и restore протестированы
- [ ] Rollback стратегия определена
- [ ] Staging environment готов

### Документация:
- [ ] API документация (Swagger/OpenAPI)
- [ ] README.md обновлён
- [ ] Environment variables documented
- [ ] Onboarding guide для новых разработчиков
- [ ] Deployment guide

---

## 📞 Контакты и коммуникация

### Каналы связи:
- **Email:** dev@familyorganizer.ru
- **Telegram:** @family_organizer_dev
- **Git:** GitHub repository (private)
- **Jira:** Трекер задач
- **Confluence:** Документация

### Встречи:
- **Daily standup:** 10:00 (15 минут)
- **Sprint planning:** Понедельник, каждые 2 недели
- **Sprint review:** Пятница, каждые 2 недели
- **Retrospective:** После каждого спринта

### Ожидаемые deliverables:
1. **Код:** Git repository с чистой историей коммитов
2. **Тесты:** Unit + Integration + E2E
3. **Документация:** README, API docs, architecture docs
4. **Деплой:** Staging + Production environments
5. **Monitoring:** Dashboards в Grafana

---

## 💰 Бюджет MVP

| Категория | Сумма |
|-----------|-------|
| Backend разработка (8 недель × 150k) | 300,000₽ |
| Frontend разработка (8 недель × 150k) | 300,000₽ |
| QA тестирование (4 недели × 80k) | 80,000₽ |
| Инфраструктура (3 месяца × 7k) | 21,000₽ |
| **ИТОГО MVP** | **701,000₽** |

---

## ⚠️ Риски и ограничения

### Технические риски:
1. **Производительность под нагрузкой**
   - Митигация: Нагрузочные тесты, кеширование, индексы БД
   
2. **Интеграция со сторонними API**
   - Митигация: Fallback механизмы, rate limiting
   
3. **Безопасность**
   - Митигация: Security audit, penetration testing

### Бизнес-риски:
1. **Низкая вовлечённость пользователей**
   - Митигация: Gamification, push-уведомления, контент-маркетинг
   
2. **Высокая стоимость привлечения**
   - Митигация: Рефералы, вирусный маркетинг

---

**Дата создания:** 23 ноября 2024  
**Версия:** 1.0  
**Автор:** Команда Семейный Органайзер

