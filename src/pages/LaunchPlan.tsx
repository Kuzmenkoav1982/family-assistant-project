import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LaunchPlanHeader } from '@/components/launch-plan/LaunchPlanHeader';
import { LaunchPlanSections } from '@/components/launch-plan/LaunchPlanSections';
import { LaunchPlanDownloadButtons } from '@/components/launch-plan/LaunchPlanDownloadButtons';

const CORRECT_PASSWORD = '7ya888';

export default function LaunchPlan() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('launchPlanAuth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('launchPlanAuth', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

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

## 3. СОКРАЩЁННОЕ ТЗ

Полное техническое задание содержит детальное описание всех модулей:
- Аутентификация (регистрация, OAuth, 2FA)
- Система семей (роли, профили, приглашения)
- Задачи и gamification (баллы, уровни, достижения)
- Календарь (события, напоминания, интеграции)
- Чат (реал-тайм, файлы, реакции)
- ИИ-ассистент (рекомендации, анализ)
- Файловое хранилище (1GB-50GB)
- Голосовой помощник (Алиса)
- PWA и мобильная версия
- Платёжная система (ЮKassa)

---

## 4. ЭТАПЫ РАЗРАБОТКИ

### Фаза 1: MVP (3-4 месяца)
1. Инфраструктура, CI/CD (1-2 недели)
2. Аутентификация + система семей (3-6 недели)
3. Задачи + gamification (7-10 недели)
4. Календарь (11-14 недели)
5. PWA, тестирование, бета-запуск (15-16 недели)

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

## 5. КОМАНДА РАЗРАБОТКИ

### Минимальный состав (MVP):
- 1x Fullstack разработчик (React + Node.js) - 150,000₽/мес
- 1x UI/UX дизайнер (контракт) - 50,000₽
- 1x QA Engineer (part-time) - 60,000₽/мес
- 1x DevOps (консультант) - по запросу

### Расширенная команда:
- 2x Frontend (React)
- 2x Backend (Node.js)
- 1x Mobile (React Native)
- 1x DevOps
- 1x UI/UX
- 1x QA
- 1x Product Manager

---

## 6. БЮДЖЕТ И СРОКИ

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

## 7. МЕТРИКИ УСПЕХА

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

## 8. ROADMAP (12 месяцев)

**Q1 (месяцы 1-3):** MVP разработка  
**Q2 (месяцы 4-6):** Бета-тест, доработки, запуск  
**Q3 (месяцы 7-9):** Расширенные фичи (ИИ, чат, файлы)  
**Q4 (месяцы 10-12):** Мобильные приложения, маркетинг  

---

## 9. КОНТАКТЫ

**Автор ТЗ:** Семейный Органайзер Team  
**Email:** tech@familyorganizer.ru  
**Дата создания:** ${new Date().toLocaleDateString('ru-RU')}  
**Версия:** 1.0

---

*Данное техническое задание является живым документом и может обновляться по мере развития проекта.*
*Для получения полной версии ТЗ со всеми деталями API, схемами БД и интерфейсами обратитесь к команде разработки.*
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

  return (
    <>
      <LaunchPlanHeader
        isAuthenticated={isAuthenticated}
        passwordInput={passwordInput}
        passwordError={passwordError}
        onPasswordInputChange={setPasswordInput}
        onPasswordSubmit={handlePasswordSubmit}
        onNavigateBack={() => navigate('/admin/dashboard')}
      />
      
      {isAuthenticated && (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 lg:p-8 pb-20">
          <div className="max-w-7xl mx-auto space-y-6">
            <LaunchPlanDownloadButtons
              onDownloadAsWord={downloadAsWord}
              onDownloadTechnicalSpec={downloadTechnicalSpec}
            />
            
            <LaunchPlanSections
              expandedSection={expandedSection}
              onToggleSection={toggleSection}
            />
          </div>
        </div>
      )}
    </>
  );
}
