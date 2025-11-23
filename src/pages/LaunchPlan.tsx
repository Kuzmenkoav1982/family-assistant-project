import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function LaunchPlan() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const downloadAsWord = () => {
    const content = document.getElementById('launch-plan-content')?.innerHTML || '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>План запуска Семейного Органайзера</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
          h1 { color: #7c3aed; font-size: 24pt; margin-bottom: 20px; }
          h2 { color: #6366f1; font-size: 18pt; margin-top: 30px; margin-bottom: 15px; }
          h3 { color: #8b5cf6; font-size: 14pt; margin-top: 20px; margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .budget { background-color: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .timeline { background-color: #dbeafe; padding: 15px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .warning { background-color: #fee2e2; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444; }
          ul { margin-left: 20px; }
          li { margin: 5px 0; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'План_запуска_Семейный_Органайзер.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTechnicalSpec = () => {
    const techSpec = `# ТЕХНИЧЕСКОЕ ЗАДАНИЕ
# Семейный Органайзер

**Версия документа:** 1.0  
**Дата создания:** ${new Date().toLocaleDateString('ru-RU')}

---

## 1. ОБЩЕЕ ОПИСАНИЕ ПРОЕКТА

### 1.1 Название проекта
**Семейный Органайзер** — веб-приложение для организации семейной жизни

### 1.2 Цель проекта
Создание единой платформы для координации задач, планирования событий, управления финансами и укрепления семейных связей через цифровые инструменты.

### 1.3 Целевая аудитория
- Семьи с детьми (основная аудитория)
- Многопоколенные семьи
- Пары, планирующие совместную жизнь
- Возрастная группа: 25-55 лет

### 1.4 Бизнес-модель
- Freemium модель
- Базовый функционал бесплатно
- Premium подписка: 299₽/мес или 2990₽/год
- Корпоративные тарифы для семейных центров

---

## 2. ТЕХНИЧЕСКИЙ СТЕК

### 2.1 Frontend
- **Framework:** React 18+ с TypeScript
- **Роутинг:** React Router v6
- **Стейт-менеджмент:** React Context API + React Query
- **UI библиотека:** shadcn/ui + Tailwind CSS
- **Формы:** React Hook Form + Zod валидация
- **Графики:** Recharts
- **Иконки:** Lucide React
- **PWA:** Service Workers для офлайн режима

### 2.2 Backend
- **Framework:** Node.js + Express.js или Fastify
- **Язык:** TypeScript
- **API:** RESTful + WebSockets (Socket.io)
- **Аутентификация:** JWT + Refresh tokens
- **Валидация:** Joi или Zod

### 2.3 База данных
- **Primary DB:** PostgreSQL 15+
- **ORM:** Prisma или TypeORM
- **Кэширование:** Redis
- **Файлы:** S3-совместимое хранилище (Yandex Object Storage)

### 2.4 Инфраструктура
- **Хостинг:** Yandex Cloud
- **Compute:** Compute Cloud (2 vCPU, 4 GB RAM)
- **БД:** Managed PostgreSQL
- **CDN:** Yandex CDN
- **CI/CD:** GitHub Actions
- **Мониторинг:** Sentry + Yandex Monitoring
- **Email:** SendGrid
- **Push-уведомления:** Firebase Cloud Messaging

### 2.5 Внешние API
- **ИИ-ассистент:** OpenAI GPT-4 или GPT-3.5
- **Чат:** Stream Chat API
- **Платежи:** ЮKassa
- **Карты:** Yandex Maps API
- **Календари:** Google Calendar API (синхронизация)
- **Голосовой ассистент:** Yandex SpeechKit (Алиса)

---

## 3. ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ

### 3.1 МОДУЛЬ АУТЕНТИФИКАЦИИ

#### 3.1.1 Регистрация
\`\`\`
POST /api/auth/register
Body: {
  email: string,
  password: string (min 8 символов),
  name: string,
  phone?: string
}
Response: {
  user: User,
  tokens: { access: string, refresh: string }
}
\`\`\`

**Требования:**
- Email валидация и уникальность
- Хеширование паролей (bcrypt, rounds=10)
- Email верификация через код
- Капча при регистрации (hCaptcha)

#### 3.1.2 Вход
\`\`\`
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: User, tokens: Tokens }
\`\`\`

#### 3.1.3 OAuth авторизация
- Google OAuth 2.0
- Yandex ID
- VK ID

#### 3.1.4 Восстановление пароля
\`\`\`
POST /api/auth/forgot-password
Body: { email: string }

POST /api/auth/reset-password
Body: { token: string, newPassword: string }
\`\`\`

#### 3.1.5 2FA (опционально, Premium)
- TOTP через Google Authenticator
- SMS коды

---

### 3.2 МОДУЛЬ СЕМЬИ

#### 3.2.1 Создание семьи
\`\`\`
POST /api/families
Body: {
  name: string,
  description?: string,
  avatar?: file
}
Response: Family
\`\`\`

#### 3.2.2 Приглашение членов
\`\`\`
POST /api/families/:familyId/invites
Body: {
  email: string,
  role: 'admin' | 'member' | 'child'
}
\`\`\`

**Роли:**
- **Owner** — создатель семьи (1 на семью)
- **Admin** — полные права управления
- **Member** — обычный участник
- **Child** — ограниченные права, родительский контроль

#### 3.2.3 Профили участников
\`\`\`typescript
interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: Role;
  name: string;
  avatar?: string;
  birthday?: Date;
  relationship: string; // 'папа', 'мама', 'сын', 'дочь', ...
  points: number; // gamification баллы
  level: number;
  preferences: {
    favoriteFood: string[];
    allergies: string[];
    hobbies: string[];
  };
  createdAt: Date;
}
\`\`\`

---

### 3.3 МОДУЛЬ ЗАДАЧ (TODO)

#### 3.3.1 CRUD задач
\`\`\`
GET    /api/tasks?familyId=:id&status=pending
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/complete
\`\`\`

\`\`\`typescript
interface Task {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assigneeId?: string; // кому назначено
  creatorId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  reminderTime?: Date;
  points: number; // баллы за выполнение (5-50)
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  category: 'household' | 'shopping' | 'kids' | 'finance' | 'other';
  tags: string[];
  attachments?: string[];
  completedAt?: Date;
  createdAt: Date;
}
\`\`\`

#### 3.3.2 Gamification
- Начисление баллов за выполнение задач
- Система уровней (1-20)
- Достижения (ачивки)
- Еженедельный топ участников
- Награды за стрики (выполнение задач N дней подряд)

---

### 3.4 МОДУЛЬ КАЛЕНДАРЯ

#### 3.4.1 События
\`\`\`typescript
interface CalendarEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  type: 'birthday' | 'meeting' | 'vacation' | 'doctor' | 'school' | 'other';
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  location?: string;
  participants: string[]; // member IDs
  reminders: {
    type: 'push' | 'email' | 'sms';
    minutesBefore: number;
  }[];
  recurring?: RecurringPattern;
  color: string;
  createdBy: string;
}
\`\`\`

#### 3.4.2 Интеграции
- Импорт из Google Calendar
- Экспорт в .ics формат
- Синхронизация с внешними календарями

#### 3.4.3 Уведомления
- Push-уведомления за 15 мин / 1 час / 1 день до события
- Email дайджесты (ежедневно утром)
- SMS для критичных событий (Premium)

---

### 3.5 МОДУЛЬ ЧАТ

#### 3.5.1 Семейный чат
- Реал-тайм обмен сообщениями (WebSockets)
- Поддержка текста, изображений, файлов
- Голосовые сообщения (до 2 мин)
- Реакции на сообщения (эмодзи)
- Ответы (reply)
- Редактирование и удаление сообщений (5 мин)

#### 3.5.2 Технические требования
\`\`\`typescript
interface ChatMessage {
  id: string;
  familyId: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'system';
  content: string;
  attachments?: {
    url: string;
    type: string;
    size: number;
    name: string;
  }[];
  replyTo?: string; // message ID
  reactions: {
    emoji: string;
    userIds: string[];
  }[];
  edited: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
\`\`\`

#### 3.5.3 Альтернативное решение
Использовать **Stream Chat API** вместо самописного чата:
- Готовая инфраструктура
- Стоимость: ~10,000₽/мес (до 1000 пользователей)
- Все фичи из коробки

---

### 3.6 МОДУЛЬ ИИ-АССИСТЕНТ

#### 3.6.1 Возможности
- Советы по распределению задач
- Предложения рецептов на основе предпочтений семьи
- Напоминания о важных событиях
- Анализ семейных паттернов и рекомендации
- Помощь в планировании бюджета
- Идеи для семейного досуга

#### 3.6.2 Интеграция OpenAI
\`\`\`typescript
interface AIRequest {
  familyId: string;
  userId: string;
  prompt: string;
  context?: {
    familyMembers: FamilyMember[];
    recentTasks: Task[];
    preferences: Preferences;
  };
}
\`\`\`

**Промпты (примеры):**
- "Предложи 3 рецепта на ужин для семьи из 4 человек"
- "Как распределить задачи на неделю справедливо?"
- "Подбери активности на выходные для детей 7 и 10 лет"

**Стоимость:**
- GPT-3.5-turbo: ~$0.002 за 1К токенов → ~10,000₽/мес
- GPT-4: ~$0.03 за 1К токенов → ~100,000₽/мес

---

### 3.7 МОДУЛЬ ФАЙЛОВОГО ХРАНИЛИЩА

#### 3.7.1 Требования
- Лимит на файл: 50 MB (бесплатно), 500 MB (Premium)
- Общий лимит: 1 GB (бесплатно), 50 GB (Premium)
- Форматы: изображения, PDF, Word, Excel, видео

#### 3.7.2 Организация
\`\`\`typescript
interface File {
  id: string;
  familyId: string;
  uploadedBy: string;
  name: string;
  type: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  category: 'documents' | 'photos' | 'videos' | 'other';
  tags: string[];
  sharedWith: string[]; // member IDs
  createdAt: Date;
}
\`\`\`

#### 3.7.3 S3 структура
\`\`\`
bucket-name/
  families/
    {familyId}/
      avatars/
      documents/
      photos/
        {year}/
          {month}/
      videos/
\`\`\`

---

### 3.8 МОДУЛЬ ГОЛОСОВОЙ АССИСТЕНТ (опционально)

#### 3.8.1 Интеграция Yandex Алиса
- Голосовые команды для управления задачами
- Добавление событий в календарь
- Чтение напоминаний
- Навык "Семейный Органайзер" для Яндекс.Станции

**Примеры команд:**
- "Алиса, добавь задачу купить молоко"
- "Алиса, что у нас на завтра?"
- "Алиса, напомни завтра в 10 утра о встрече"

---

### 3.9 МОДУЛЬ СООБЩЕСТВО (Social)

#### 3.9.1 Публичные посты
\`\`\`typescript
interface CommunityPost {
  id: string;
  authorId: string;
  type: 'article' | 'question' | 'story';
  title: string;
  content: string;
  images?: string[];
  category: 'parenting' | 'recipes' | 'travel' | 'finance' | 'other';
  likes: number;
  commentsCount: number;
  isPublic: boolean;
  createdAt: Date;
}
\`\`\`

#### 3.9.2 Комментарии и лайки
- Система модерации (AI + ручная проверка)
- Защита от спама
- Рейтинг пользователей

---

### 3.10 PWA И МОБИЛЬНАЯ ВЕРСИЯ

#### 3.10.1 Требования PWA
- Работа офлайн (Service Workers)
- Установка на главный экран
- Push-уведомления
- Responsive дизайн (Mobile-first)

#### 3.10.2 Манифест
\`\`\`json
{
  "name": "Семейный Органайзер",
  "short_name": "СемОрг",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#7c3aed",
  "icons": [...]
}
\`\`\`

---

### 3.11 ПЛАТЁЖНАЯ СИСТЕМА

#### 3.11.1 ЮKassa интеграция
\`\`\`
POST /api/payments/create-subscription
Body: {
  planType: 'premium_monthly' | 'premium_yearly',
  returnUrl: string
}
Response: {
  paymentUrl: string,
  paymentId: string
}
\`\`\`

#### 3.11.2 Тарифы
**Бесплатный:**
- 1 семья
- До 10 участников
- 1 GB хранилища
- Базовый ИИ (лимит 20 запросов/день)

**Premium (299₽/мес или 2990₽/год):**
- Неограниченно семей
- Неограниченно участников
- 50 GB хранилища
- Полный доступ к ИИ
- Приоритетная поддержка
- Экспорт данных

---

## 4. НЕФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ

### 4.1 Производительность
- Время загрузки главной страницы: < 2 сек
- Время ответа API: < 200ms (p95)
- Поддержка 1000+ одновременных пользователей
- Uptime: 99.5%

### 4.2 Безопасность
- HTTPS везде (TLS 1.3)
- CSRF protection
- XSS protection (санитизация ввода)
- SQL injection защита (параметризованные запросы)
- Rate limiting: 100 req/min на IP
- Логирование всех критичных операций
- Регулярные бэкапы БД (ежедневно)
- GDPR/RGPD compliance

### 4.3 Масштабируемость
- Горизонтальное масштабирование API
- Database sharding при росте (>1M пользователей)
- CDN для статики
- Оптимизация изображений (WebP, lazy loading)

### 4.4 Доступность (Accessibility)
- WCAG 2.1 Level AA
- Поддержка скринридеров
- Контрастность цветов 4.5:1
- Клавиатурная навигация

### 4.5 Локализация
- Русский (основной)
- Английский
- Возможность добавления языков

---

## 5. АРХИТЕКТУРА СИСТЕМЫ

### 5.1 Диаграмма компонентов
\`\`\`
[Frontend React]
      |
      | HTTPS
      v
[Nginx (Reverse Proxy)]
      |
      ├─> [API Server (Node.js)]
      |         |
      |         ├─> [PostgreSQL]
      |         ├─> [Redis Cache]
      |         └─> [S3 Storage]
      |
      └─> [WebSocket Server]
\`\`\`

### 5.2 База данных (схема)

**Таблицы:**
- \`users\` — пользователи
- \`families\` — семьи
- \`family_members\` — связь пользователь-семья
- \`invites\` — приглашения
- \`tasks\` — задачи
- \`calendar_events\` — события
- \`chat_messages\` — сообщения чата
- \`files\` — файлы
- \`posts\` — публикации сообщества
- \`payments\` — платежи
- \`subscriptions\` — подписки

**Индексы:**
- \`family_members(family_id, user_id)\`
- \`tasks(family_id, status, due_date)\`
- \`calendar_events(family_id, start_date)\`
- \`chat_messages(family_id, created_at DESC)\`

---

## 6. ЭТАПЫ РАЗРАБОТКИ

### Фаза 1: MVP (3-4 месяца)
1. **Неделя 1-2:** Настройка инфраструктуры, CI/CD
2. **Неделя 3-6:** Аутентификация + система семей
3. **Неделя 7-10:** Задачи + gamification
4. **Неделя 11-14:** Календарь
5. **Неделя 15-16:** PWA, тестирование, бета-запуск

### Фаза 2: Расширенная версия (+3 месяца)
1. Чат (Stream Chat)
2. ИИ-ассистент (GPT-3.5)
3. Файловое хранилище
4. Платёжная система
5. Публичный запуск

### Фаза 3: Дополнительные фичи (+2 месяца)
1. Голосовой помощник (Алиса)
2. Сообщество
3. Расширенная аналитика
4. Мобильные приложения (React Native)

---

## 7. КОМАНДА РАЗРАБОТКИ

### Минимальный состав (MVP):
- **1x Fullstack разработчик** (React + Node.js)
- **1x UI/UX дизайнер** (контракт)
- **1x QA Engineer** (part-time)
- **1x DevOps** (консультант)

### Расширенная команда:
- **2x Frontend** (React)
- **2x Backend** (Node.js)
- **1x Mobile** (React Native)
- **1x DevOps**
- **1x UI/UX**
- **1x QA**
- **1x Product Manager**

---

## 8. БЮДЖЕТ И СРОКИ

### Затраты на разработку (MVP):
- Backend разработчик: 150,000₽/мес × 4 = 600,000₽
- UI/UX дизайнер: 50,000₽ (контракт)
- QA Engineer: 60,000₽/мес × 2 = 120,000₽

**Итого MVP:** ~770,000₽

### Инфраструктура (месяц):
- Yandex Cloud: 6,600₽
- Stream Chat: 10,000₽
- OpenAI API: 10,000₽ (GPT-3.5)
- Домен + SSL: ~200₽/год
- SendGrid: Бесплатно (до 40k писем)

**Итого инфраструктура:** ~27,000₽/мес

### Общий бюджет на запуск:
- Разработка: 770,000₽
- Инфра (3 мес): 81,000₽
- Тестирование + маркетинг: 190,000₽
- Юридика: 40,000₽

**ИТОГО: ~1,081,000₽**

---

## 9. РИСКИ И МИТИГАЦИЯ

| Риск | Вероятность | Последствия | Митигация |
|------|-------------|-------------|-----------|
| Отставание от графика | Высокая | Задержка запуска | Agile методология, еженедельные ревью |
| Превышение бюджета | Средняя | Нехватка средств | Резерв 15%, приоритизация фич |
| Проблемы с масштабированием | Низкая | Падения сервиса | Нагрузочное тестирование, кэширование |
| Низкая конверсия в Premium | Средняя | Потеря выручки | A/B тесты, улучшение предложения |
| Утечка данных | Низкая | Репутационный урон | Аудит безопасности, пентесты |

---

## 10. МЕТРИКИ УСПЕХА

### KPI для MVP:
- **100 тестовых пользователей** за первый месяц
- **Retention Rate** > 40% (7-day)
- **Average Session Duration** > 5 минут
- **Crash-free Rate** > 99%

### KPI для публичного запуска:
- **1,000 регистраций** в первые 3 месяца
- **Конверсия в Premium** > 5%
- **NPS (Net Promoter Score)** > 30
- **DAU/MAU** > 0.2

---

## 11. ЮРИДИЧЕСКИЕ АСПЕКТЫ

### 11.1 Документы
- Пользовательское соглашение (Terms of Service)
- Политика конфиденциальности (Privacy Policy)
- Договор оферты для Premium
- Согласие на обработку персональных данных

### 11.2 Регистрация
- ИП или самозанятый для начала
- ООО при масштабировании
- Регистрация в ФНС РФ

### 11.3 Compliance
- Закон о персональных данных (152-ФЗ)
- Роскомнадзор (уведомление об обработке данных)
- GDPR для европейских пользователей

---

## 12. ПОДДЕРЖКА И ОБСЛУЖИВАНИЕ

### 12.1 Каналы поддержки
- Email: support@familyorganizer.ru
- Telegram бот
- FAQ на сайте
- Видео-инструкции (YouTube)

### 12.2 SLA
- Ответ на запрос: < 24 часа
- Критичные баги: исправление < 4 часа
- Плановые обновления: раз в 2 недели
- Техническое обслуживание: воскресенье 02:00-04:00

---

## 13. ROADMAP (12 месяцев)

**Q1 (месяцы 1-3):** MVP разработка  
**Q2 (месяцы 4-6):** Бета-тест, доработки, запуск  
**Q3 (месяцы 7-9):** Расширенные фичи (ИИ, чат, файлы)  
**Q4 (месяцы 10-12):** Мобильные приложения, маркетинг  

---

## 14. КОНТАКТЫ

**Автор ТЗ:** Семейный Органайзер Team  
**Email:** tech@familyorganizer.ru  
**Дата создания:** ${new Date().toLocaleDateString('ru-RU')}  
**Версия:** 1.0

---

*Данное техническое задание является живым документом и может обновляться по мере развития проекта.*
`;

    const blob = new Blob(['\ufeff', techSpec], {
      type: 'text/markdown;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TECHNICAL_SPECIFICATION.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sections = [
    {
      id: 'infrastructure',
      icon: 'Server',
      title: '1. Техническая инфраструктура',
      color: 'blue',
      budget: '6,600₽/мес',
      time: '2-3 дня',
      content: {
        description: 'Хостинг, серверы, домен, SSL, email-сервис',
        items: [
          { name: 'Яндекс.Облако (серверы)', cost: '6,600₽/мес', details: 'Compute Cloud, PostgreSQL, Object Storage, CDN' },
          { name: 'Домен .ru', cost: '200₽/год', details: 'Регистрация и настройка DNS' },
          { name: 'SSL-сертификат', cost: 'Бесплатно', details: 'Let\'s Encrypt, автопродление' },
          { name: 'Email-сервис SendGrid', cost: 'Бесплатно', details: 'До 40,000 писем/мес' },
        ],
        steps: [
          'Зарегистрироваться на cloud.yandex.ru',
          'Создать billing account',
          'Развернуть Compute Cloud и PostgreSQL',
          'Настроить Object Storage для файлов',
          'Купить домен и настроить DNS',
          'Выпустить SSL-сертификат',
          'Подключить SendGrid для email',
        ]
      }
    },
    {
      id: 'development',
      icon: 'Code',
      title: '2. Разработка функционала',
      color: 'purple',
      budget: '770,000₽',
      time: '4-5 месяцев',
      content: {
        description: 'Основной функционал приложения',
        items: [
          { name: 'Аутентификация', cost: '60,000₽', details: 'Регистрация, вход, OAuth, JWT токены' },
          { name: 'Система семей', cost: '80,000₽', details: 'Создание семей, приглашения, роли' },
          { name: 'Задачи и баллы', cost: '100,000₽', details: 'CRUD задач, gamification, уровни' },
          { name: 'Календарь', cost: '60,000₽', details: 'События, напоминания, интеграции' },
          { name: 'Чат (интеграция)', cost: '20,000₽', details: 'Stream Chat API' },
          { name: 'ИИ-ассистент', cost: '150,000₽', details: 'OpenAI интеграция, промпты' },
          { name: 'Файловое хранилище', cost: '40,000₽', details: 'S3, оптимизация изображений' },
          { name: 'Голосовой помощник', cost: '80,000₽', details: 'Алиса, Маруся' },
          { name: 'Сообщество', cost: '80,000₽', details: 'Посты, лайки, комментарии' },
          { name: 'PWA приложение', cost: '40,000₽', details: 'Мобильная версия' },
          { name: 'Платёжная система', cost: '60,000₽', details: 'ЮKassa интеграция' },
        ]
      }
    },
    {
      id: 'integrations',
      icon: 'Plug',
      title: '3. Интеграции и API',
      color: 'green',
      budget: '110,000₽/мес',
      time: '2-3 недели',
      content: {
        description: 'Сторонние сервисы и API',
        items: [
          { name: 'OpenAI GPT-4 API', cost: '100,000₽/мес', details: 'ИИ-ассистент (можно использовать GPT-3.5 — 10,000₽/мес)' },
          { name: 'Stream Chat', cost: '10,000₽/мес', details: 'Семейный чат' },
          { name: 'ЮKassa', cost: '2.8% от платежей', details: 'Приём платежей' },
          { name: 'Google Analytics', cost: 'Бесплатно', details: 'Аналитика пользователей' },
          { name: 'Sentry', cost: 'Бесплатно', details: 'Отслеживание ошибок' },
        ]
      }
    },
    {
      id: 'security',
      icon: 'Shield',
      title: '4. Безопасность и юридика',
      color: 'red',
      budget: '40,000₽',
      time: '1-2 недели',
      content: {
        description: 'Защита данных и юридические документы',
        items: [
          { name: 'SSL/TLS', cost: 'Включено', details: 'Шифрование соединений' },
          { name: 'Защита от атак', cost: 'Включено', details: 'CSRF, XSS, SQL injection, Rate limiting' },
          { name: 'Ежедневные бэкапы', cost: 'Включено', details: 'Автоматическое резервное копирование' },
          { name: 'Юридические документы', cost: '30,000₽', details: 'Политика конфиденциальности, пользовательское соглашение' },
          { name: 'Регистрация ИП', cost: '10,000₽', details: 'Опционально, для официального запуска' },
        ],
        security: [
          'SSL/TLS для всех соединений',
          'Защита от CSRF, XSS атак',
          'SQL injection защита через ORM',
          'Rate limiting (защита от DDoS)',
          'Шифрование паролей (bcrypt)',
          '2FA аутентификация',
          'Ежедневные автоматические бэкапы',
        ]
      }
    },
    {
      id: 'testing',
      icon: 'TestTube',
      title: '5. Тестирование',
      color: 'yellow',
      budget: '190,000₽',
      time: '4-5 недель',
      content: {
        description: 'QA и бета-тестирование',
        items: [
          { name: 'QA Engineer', cost: '80,000₽', details: 'Unit, Integration, E2E тесты' },
          { name: 'Бета-тестирование', cost: '15,000₽', details: 'Привлечение 100 тестеров' },
          { name: 'Контент и лендинг', cost: '70,000₽', details: 'Копирайтинг, дизайн, видео' },
          { name: 'Маркетинг', cost: '25,000₽', details: 'Таргет, соцсети, SEO' },
        ],
        testTypes: [
          'Unit тесты (Jest, PyTest) - покрытие 70%+',
          'Integration тесты - API endpoints',
          'E2E тесты (Playwright) - критические сценарии',
          'Performance тесты - нагрузка 100 пользователей',
          'Security тесты - OWASP Top 10',
          'Бета-тест с реальными пользователями',
        ]
      }
    },
    {
      id: 'support',
      icon: 'Headphones',
      title: '6. Запуск и поддержка',
      color: 'indigo',
      budget: '334,800₽ (3 мес)',
      time: 'Постоянно',
      content: {
        description: 'Техподдержка и развитие',
        items: [
          { name: 'Backend разработчик', cost: '60,000₽/мес', details: 'Part-time, исправления и доработки' },
          { name: 'DevOps/Admin', cost: '20,000₽/мес', details: 'По запросу, консультации' },
          { name: 'Инфраструктура', cost: '31,600₽/мес', details: 'Хостинг, API, сервисы' },
        ],
        channels: [
          'Email: support@familyorganizer.ru',
          'Telegram бот для вопросов',
          'FAQ на сайте',
          'Видео-инструкции на YouTube',
          'База знаний с решениями',
        ]
      }
    }
  ];

  const totalBudget = {
    development: 770000,
    testing: 190000,
    legal: 40000,
    support: 334800,
    total: 1334800
  };

  const timeline = [
    { phase: 'Подготовка', weeks: '1-2', tasks: 'Регистрация, настройка инфраструктуры' },
    { phase: 'Разработка MVP', weeks: '3-10', tasks: 'Аутентификация, семьи, задачи, календарь' },
    { phase: 'Расширенный функционал', weeks: '11-16', tasks: 'Чат, ИИ-ассистент, файлы' },
    { phase: 'Дополнительные фичи', weeks: '17-20', tasks: 'PWA, голосовой помощник, сообщество' },
    { phase: 'Тестирование', weeks: '21-24', tasks: 'QA, исправление багов' },
    { phase: 'Бета-тест', weeks: '25-28', tasks: '100 тестовых пользователей' },
    { phase: 'Запуск', weeks: '29', tasks: 'Публикация и маркетинг' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Шапка */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              План запуска Семейного Органайзера
            </h1>
            <p className="text-gray-600 text-lg">
              Полный план для запуска проекта с 100 тестовыми пользователями
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadAsWord} className="bg-blue-600 hover:bg-blue-700">
              <Icon name="Download" className="mr-2" size={18} />
              Скачать Word
            </Button>
            <Button onClick={downloadTechnicalSpec} className="bg-green-600 hover:bg-green-700">
              <Icon name="FileCode" className="mr-2" size={18} />
              Скачать ТЗ
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              <Icon name="Home" className="mr-2" size={16} />
              На главную
            </Button>
          </div>
        </div>

        {/* Итоговый бюджет */}
        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="DollarSign" className="text-amber-600" size={28} />
              Итоговый бюджет
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-sm text-gray-600 mb-1">Разработка</div>
                <div className="text-2xl font-bold text-purple-600">{totalBudget.development.toLocaleString()}₽</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-sm text-gray-600 mb-1">Тестирование</div>
                <div className="text-2xl font-bold text-blue-600">{totalBudget.testing.toLocaleString()}₽</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-sm text-gray-600 mb-1">Юридика</div>
                <div className="text-2xl font-bold text-green-600">{totalBudget.legal.toLocaleString()}₽</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-sm text-gray-600 mb-1">Поддержка (3 мес)</div>
                <div className="text-2xl font-bold text-indigo-600">{totalBudget.support.toLocaleString()}₽</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
              <div className="text-sm opacity-90 mb-2">ИТОГО НА ЗАПУСК</div>
              <div className="text-4xl font-bold mb-2">{totalBudget.total.toLocaleString()}₽</div>
              <div className="text-sm opacity-90">≈ 1.35 миллиона рублей</div>
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Icon name="Lightbulb" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-green-800">
                  <strong>Оптимизированный бюджет:</strong> ~700,000₽ (использование GPT-3.5 вместо GPT-4, без некоторых дополнительных функций на старте)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* График работ */}
        <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Calendar" className="text-blue-600" size={28} />
              График работ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex-shrink-0">
                    <Badge className="bg-blue-600 text-white">{item.weeks}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 mb-1">{item.phase}</div>
                    <div className="text-sm text-gray-600">{item.tasks}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-100 border border-blue-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Icon name="Clock" size={18} />
                <span className="font-bold">Общая длительность: ~7 месяцев</span>
              </div>
              <div className="text-sm text-blue-700 mt-2">
                Быстрый вариант (MVP): 3-4 месяца (базовые функции: семьи, задачи, календарь, чат)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Разделы плана */}
        <div className="space-y-4">
          {sections.map((section) => (
            <Card 
              key={section.id} 
              className={`border-2 border-${section.color}-300 hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => toggleSection(section.id)}
            >
              <CardHeader className={`bg-gradient-to-r from-${section.color}-50 to-${section.color}-100`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className={`w-12 h-12 bg-${section.color}-600 rounded-lg flex items-center justify-center`}>
                      <Icon name={section.icon} className="text-white" size={24} />
                    </div>
                    <span>{section.title}</span>
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white">
                      <Icon name="DollarSign" size={14} className="mr-1" />
                      {section.budget}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <Icon name="Clock" size={14} className="mr-1" />
                      {section.time}
                    </Badge>
                    <Icon 
                      name={expandedSection === section.id ? "ChevronUp" : "ChevronDown"} 
                      size={20} 
                      className="text-gray-600"
                    />
                  </div>
                </div>
              </CardHeader>
              {expandedSection === section.id && (
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4 text-lg">{section.content.description}</p>
                  
                  {section.content.items && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icon name="List" size={18} />
                        Состав работ и бюджет
                      </h4>
                      <div className="space-y-2">
                        {section.content.items.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start justify-between mb-1">
                              <span className="font-semibold text-gray-800">{item.name}</span>
                              <Badge className="bg-green-600 text-white">{item.cost}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.content.steps && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icon name="CheckCircle2" size={18} />
                        Этапы реализации
                      </h4>
                      <ul className="space-y-2">
                        {section.content.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="ArrowRight" size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.content.testTypes && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icon name="TestTube" size={18} />
                        Виды тестирования
                      </h4>
                      <ul className="space-y-2">
                        {section.content.testTypes.map((type, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="CheckSquare" size={16} className="text-green-600 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.content.security && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icon name="Shield" size={18} />
                        Меры безопасности
                      </h4>
                      <ul className="space-y-2">
                        {section.content.security.map((measure, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="Lock" size={16} className="text-red-600 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.content.channels && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icon name="MessageCircle" size={18} />
                        Каналы поддержки
                      </h4>
                      <ul className="space-y-2">
                        {section.content.channels.map((channel, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="Send" size={16} className="text-indigo-600 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{channel}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Скрытый контент для экспорта в Word */}
        <div id="launch-plan-content" style={{ display: 'none' }}>
          <h1>План запуска Семейного Органайзера</h1>
          <p><strong>Для 100 тестовых пользователей с полным функционалом</strong></p>
          
          <div className="budget">
            <h2>💰 Итоговый бюджет</h2>
            <table>
              <tbody>
                <tr>
                  <th>Категория</th>
                  <th>Сумма</th>
                </tr>
                <tr>
                  <td>Разработка (единоразово)</td>
                  <td>{totalBudget.development.toLocaleString()}₽</td>
                </tr>
                <tr>
                  <td>Тестирование и контент</td>
                  <td>{totalBudget.testing.toLocaleString()}₽</td>
                </tr>
                <tr>
                  <td>Юридические вопросы</td>
                  <td>{totalBudget.legal.toLocaleString()}₽</td>
                </tr>
                <tr>
                  <td>Поддержка (3 месяца)</td>
                  <td>{totalBudget.support.toLocaleString()}₽</td>
                </tr>
                <tr>
                  <td><strong>ИТОГО</strong></td>
                  <td><strong>{totalBudget.total.toLocaleString()}₽</strong></td>
                </tr>
              </tbody>
            </table>
            <p><strong>Оптимизированный бюджет (минимум):</strong> ~700,000₽</p>
          </div>

          <div className="timeline">
            <h2>📅 График работ</h2>
            <table>
              <tbody>
                <tr>
                  <th>Фаза</th>
                  <th>Недели</th>
                  <th>Задачи</th>
                </tr>
                {timeline.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.phase}</td>
                    <td>{item.weeks}</td>
                    <td>{item.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p><strong>Общая длительность:</strong> ~7 месяцев (от старта до публичного запуска)</p>
            <p><strong>Быстрый вариант (MVP):</strong> ~3-4 месяца (базовые функции)</p>
          </div>

          {sections.map((section) => (
            <div key={section.id}>
              <h2>{section.title}</h2>
              <p><strong>Бюджет:</strong> {section.budget}</p>
              <p><strong>Время:</strong> {section.time}</p>
              <p>{section.content.description}</p>
              
              {section.content.items && (
                <>
                  <h3>Состав работ и бюджет</h3>
                  <table>
                    <tbody>
                      <tr>
                        <th>Название</th>
                        <th>Стоимость</th>
                        <th>Описание</th>
                      </tr>
                      {section.content.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.cost}</td>
                          <td>{item.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {section.content.steps && (
                <>
                  <h3>Этапы реализации</h3>
                  <ul>
                    {section.content.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.content.testTypes && (
                <>
                  <h3>Виды тестирования</h3>
                  <ul>
                    {section.content.testTypes.map((type, idx) => (
                      <li key={idx}>{type}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.content.security && (
                <>
                  <h3>Меры безопасности</h3>
                  <ul>
                    {section.content.security.map((measure, idx) => (
                      <li key={idx}>{measure}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.content.channels && (
                <>
                  <h3>Каналы поддержки</h3>
                  <ul>
                    {section.content.channels.map((channel, idx) => (
                      <li key={idx}>{channel}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}

          <div className="warning">
            <h2>⚠️ Рекомендации</h2>
            <h3>Фаза 1: MVP (3-4 месяца, 700k₽)</h3>
            <p><strong>Минимальный функционал для тестирования:</strong></p>
            <ul>
              <li>Регистрация / Вход</li>
              <li>Создание семьи, приглашения</li>
              <li>Задачи и баллы (базовые)</li>
              <li>Календарь событий</li>
              <li>Профили участников</li>
              <li>PWA (мобильная версия)</li>
            </ul>
            <p><strong>Цель:</strong> Собрать 100 тестовых пользователей, получить обратную связь</p>

            <h3>Фаза 2: Расширенная версия (7 месяцев, 1.35M₽)</h3>
            <p><strong>Добавляем:</strong></p>
            <ul>
              <li>Чат</li>
              <li>ИИ-ассистент (GPT-3.5)</li>
              <li>Голосовой помощник</li>
              <li>Сообщество</li>
              <li>Файловое хранилище</li>
            </ul>
            <p><strong>Цель:</strong> Полноценный продукт для публичного запуска</p>
          </div>

          <h2>📞 Следующие шаги</h2>
          <ol>
            <li>Утвердить бюджет и сроки</li>
            <li>Собрать команду разработки</li>
            <li>Зарегистрировать юр.лицо (ИП или Самозанятый)</li>
            <li>Арендовать инфраструктуру (Yandex Cloud)</li>
            <li>Начать разработку MVP</li>
          </ol>

          <h3>Где искать разработчиков:</h3>
          <ul>
            <li><strong>FL.ru, Kwork.ru</strong> - фрилансеры</li>
            <li><strong>HH.ru, Habr Career</strong> - постоянная команда</li>
            <li><strong>Upwork</strong> - зарубежные специалисты</li>
            <li><strong>Telegram каналы</strong> (@freelancehunt, @remote_job_russia)</li>
          </ul>

          <h3>Средняя ставка разработчика:</h3>
          <ul>
            <li>Junior: 80,000₽/мес</li>
            <li>Middle: 150,000₽/мес</li>
            <li>Senior: 250,000₽/мес</li>
          </ul>

          <p style={{ marginTop: '40px', fontStyle: 'italic', color: '#666' }}>
            Документ создан: {new Date().toLocaleDateString('ru-RU')}<br />
            Семейный Органайзер © 2024
          </p>
        </div>

        {/* Рекомендации */}
        <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Lightbulb" className="text-green-600" size={28} />
              Рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                <h3 className="font-bold text-lg mb-2">Фаза 1: MVP (3-4 месяца, 700k₽)</h3>
                <p className="text-gray-700 mb-3">Минимальный функционал для тестирования:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Регистрация / Вход</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Создание семьи, приглашения</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Задачи и баллы (базовые)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Календарь событий</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Профили участников</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>PWA (мобильная версия)</span>
                  </li>
                </ul>
                <p className="text-sm text-green-700 mt-3 font-medium">
                  🎯 Цель: Собрать 100 тестовых пользователей, получить обратную связь
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-600">
                <h3 className="font-bold text-lg mb-2">Фаза 2: Расширенная версия (7 месяцев, 1.35M₽)</h3>
                <p className="text-gray-700 mb-3">Добавляем полный функционал:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Icon name="Plus" size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Чат</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Plus" size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>ИИ-ассистент (GPT-3.5)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Plus" size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Голосовой помощник</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Plus" size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Сообщество</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Plus" size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Файловое хранилище</span>
                  </li>
                </ul>
                <p className="text-sm text-purple-700 mt-3 font-medium">
                  🚀 Цель: Полноценный продукт для публичного запуска
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Следующие шаги */}
        <Card className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Rocket" className="text-indigo-600" size={28} />
              Следующие шаги
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <strong className="text-gray-800">Утвердить бюджет и сроки</strong>
                  <p className="text-sm text-gray-600">Выбрать между MVP (700k₽) и полной версией (1.35M₽)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <strong className="text-gray-800">Собрать команду разработки</strong>
                  <p className="text-sm text-gray-600">Backend, Frontend разработчики, UI/UX дизайнер, QA Engineer</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <strong className="text-gray-800">Зарегистрировать юр.лицо</strong>
                  <p className="text-sm text-gray-600">ИП или Самозанятый (для начала)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <strong className="text-gray-800">Арендовать инфраструктуру</strong>
                  <p className="text-sm text-gray-600">Yandex Cloud - серверы, база данных, хранилище</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <strong className="text-gray-800">Начать разработку MVP</strong>
                  <p className="text-sm text-gray-600">Фокус на ключевых функциях: аутентификация, семьи, задачи, календарь</p>
                </div>
              </li>
            </ol>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Icon name="Users" size={18} />
                Где искать разработчиков:
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>FL.ru, Kwork.ru</strong> - фрилансеры</li>
                <li>• <strong>HH.ru, Habr Career</strong> - постоянная команда</li>
                <li>• <strong>Upwork</strong> - зарубежные специалисты</li>
                <li>• <strong>Telegram</strong> - @freelancehunt, @remote_job_russia</li>
              </ul>
            </div>

            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">Средняя ставка разработчика:</h4>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-600">Junior: 80,000₽/мес</Badge>
                <Badge className="bg-blue-600">Middle: 150,000₽/мес</Badge>
                <Badge className="bg-purple-600">Senior: 250,000₽/мес</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}