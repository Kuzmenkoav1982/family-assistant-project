import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

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
    const techSpec = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Техническое задание - Семейный Органайзер</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
          h1 { color: #7c3aed; font-size: 24pt; margin-bottom: 20px; text-align: center; }
          h2 { color: #6366f1; font-size: 18pt; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #6366f1; padding-bottom: 5px; }
          h3 { color: #8b5cf6; font-size: 14pt; margin-top: 20px; margin-bottom: 10px; }
          p { margin: 10px 0; }
          ul, ol { margin-left: 20px; }
          li { margin: 5px 0; }
          strong { color: #333; }
          code { background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
          .header-info { text-align: center; color: #666; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</h1>
        <h1 style="font-size: 20pt; color: #8b5cf6;">Семейный Органайзер</h1>
        
        <div class="header-info">
          <p><strong>Версия документа:</strong> 1.0</p>
          <p><strong>Дата создания:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>
        
        <hr style="border: 2px solid #7c3aed; margin: 30px 0;">
        
        <div class="section">
          <h2>1. ОБЩЕЕ ОПИСАНИЕ ПРОЕКТА</h2>

          <h3>1.1 Название проекта</h3>
          <p><strong>Семейный Органайзер</strong> — веб-приложение для организации семейной жизни</p>
          
          <h3>1.2 Цель проекта</h3>
          <p>Создание единой платформы для координации задач, планирования событий, управления финансами и укрепления семейных связей через цифровые инструменты.</p>
          
          <h3>1.3 Целевая аудитория</h3>
          <ul>
            <li>Семьи с детьми (основная аудитория)</li>
            <li>Многопоколенные семьи</li>
            <li>Пары, планирующие совместную жизнь</li>
            <li>Возрастная группа: 25-55 лет</li>
          </ul>
          
          <h3>1.4 Бизнес-модель</h3>
          <ul>
            <li>Freemium модель</li>
            <li>Базовый функционал бесплатно</li>
            <li>Premium подписка: 299₽/мес или 2990₽/год</li>
            <li>Корпоративные тарифы для семейных центров</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>2. ТЕХНИЧЕСКИЙ СТЕК</h2>
          
          <h3>2.1 Frontend</h3>
          <ul>
            <li><strong>Framework:</strong> React 18+ с TypeScript</li>
            <li><strong>Роутинг:</strong> React Router v6</li>
            <li><strong>Стейт-менеджмент:</strong> React Context API + React Query</li>
            <li><strong>UI библиотека:</strong> shadcn/ui + Tailwind CSS</li>
            <li><strong>Формы:</strong> React Hook Form + Zod валидация</li>
            <li><strong>Графики:</strong> Recharts</li>
            <li><strong>Иконки:</strong> Lucide React</li>
            <li><strong>PWA:</strong> Service Workers для офлайн режима</li>
          </ul>
          
          <h3>2.2 Backend</h3>
          <ul>
            <li><strong>Framework:</strong> Node.js + Express.js или Fastify</li>
            <li><strong>Язык:</strong> TypeScript</li>
            <li><strong>API:</strong> RESTful + WebSockets (Socket.io)</li>
            <li><strong>Аутентификация:</strong> JWT + Refresh tokens</li>
            <li><strong>Валидация:</strong> Joi или Zod</li>
          </ul>
          
          <h3>2.3 База данных</h3>
          <ul>
            <li><strong>Primary DB:</strong> PostgreSQL 15+</li>
            <li><strong>ORM:</strong> Prisma или TypeORM</li>
            <li><strong>Кэширование:</strong> Redis</li>
            <li><strong>Файлы:</strong> S3-совместимое хранилище (Yandex Object Storage)</li>
          </ul>
          
          <h3>2.4 Инфраструктура</h3>
          <ul>
            <li><strong>Хостинг:</strong> Yandex Cloud</li>
            <li><strong>Compute:</strong> Compute Cloud (2 vCPU, 4 GB RAM)</li>
            <li><strong>БД:</strong> Managed PostgreSQL</li>
            <li><strong>CDN:</strong> Yandex CDN</li>
            <li><strong>CI/CD:</strong> GitHub Actions</li>
            <li><strong>Мониторинг:</strong> Sentry + Yandex Monitoring</li>
            <li><strong>Email:</strong> SendGrid</li>
            <li><strong>Push-уведомления:</strong> Firebase Cloud Messaging</li>
          </ul>
          
          <h3>2.5 Внешние API</h3>
          <ul>
            <li><strong>ИИ-ассистент:</strong> OpenAI GPT-4 или GPT-3.5</li>
            <li><strong>Чат:</strong> Stream Chat API</li>
            <li><strong>Платежи:</strong> ЮKassa</li>
            <li><strong>Карты:</strong> Yandex Maps API</li>
            <li><strong>Календари:</strong> Google Calendar API (синхронизация)</li>
            <li><strong>Голосовой ассистент:</strong> Yandex SpeechKit (Алиса)</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>3. ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ</h2>
          
          <h3>3.1 МОДУЛЬ АУТЕНТИФИКАЦИИ</h3>
          <p><strong>Основные возможности:</strong></p>
          <ul>
            <li>Регистрация и авторизация пользователей</li>
            <li>OAuth интеграция (Google, Yandex, VK)</li>
            <li>Восстановление пароля через email</li>
            <li>2FA аутентификация (опционально, Premium)</li>
          </ul>
          
          <h3>3.2 МОДУЛЬ СЕМЬИ</h3>
          <p><strong>Управление семейными группами:</strong></p>
          <ul>
            <li>Создание и настройка семьи</li>
            <li>Приглашение членов семьи</li>
            <li>Роли: Owner, Admin, Member, Child</li>
            <li>Профили участников с предпочтениями</li>
          </ul>
          
          <h3>3.3 МОДУЛЬ ЗАДАЧ</h3>
          <p><strong>Система задач и gamification:</strong></p>
          <ul>
            <li>Создание, редактирование, удаление задач</li>
            <li>Назначение задач членам семьи</li>
            <li>Приоритеты и дедлайны</li>
            <li>Начисление баллов и уровни</li>
            <li>Повторяющиеся задачи</li>
          </ul>
          
          <h3>3.4 МОДУЛЬ КАЛЕНДАРЯ</h3>
          <p><strong>Планирование событий:</strong></p>
          <ul>
            <li>Семейные события и напоминания</li>
            <li>Интеграция с Google Calendar</li>
            <li>Push-уведомления</li>
            <li>Синхронизация между устройствами</li>
          </ul>
          
          <h3>3.5 МОДУЛЬ ЧАТ</h3>
          <p><strong>Семейное общение:</strong></p>
          <ul>
            <li>Реал-тайм сообщения (WebSockets)</li>
            <li>Текст, изображения, файлы</li>
            <li>Голосовые сообщения</li>
            <li>Реакции и ответы</li>
          </ul>
          
          <h3>3.6 МОДУЛЬ ИИ-АССИСТЕНТ</h3>
          <p><strong>Умные рекомендации:</strong></p>
          <ul>
            <li>Советы по распределению задач</li>
            <li>Предложения рецептов</li>
            <li>Анализ семейных паттернов</li>
            <li>Идеи для досуга</li>
          </ul>
          
          <h3>3.7 ДОПОЛНИТЕЛЬНЫЕ МОДУЛИ</h3>
          <ul>
            <li>Файловое хранилище (1GB-50GB)</li>
            <li>Голосовой ассистент (Яндекс Алиса)</li>
            <li>Сообщество и публичные посты</li>
            <li>PWA для мобильных устройств</li>
            <li>Платёжная система (ЮKassa)</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>4. НЕФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ</h2>
          
          <h3>4.1 Производительность</h3>
          <ul>
            <li>Загрузка главной страницы: &lt; 2 сек</li>
            <li>Ответ API: &lt; 200ms (p95)</li>
            <li>Поддержка 1000+ одновременных пользователей</li>
            <li>Uptime: 99.5%</li>
          </ul>
          
          <h3>4.2 Безопасность</h3>
          <ul>
            <li>HTTPS везде (TLS 1.3)</li>
            <li>CSRF, XSS, SQL injection защита</li>
            <li>Rate limiting: 100 req/min на IP</li>
            <li>Регулярные бэкапы БД</li>
            <li>GDPR/152-ФЗ compliance</li>
          </ul>
          
          <h3>4.3 Масштабируемость</h3>
          <ul>
            <li>Горизонтальное масштабирование API</li>
            <li>Database sharding при росте</li>
            <li>CDN для статики</li>
            <li>Оптимизация изображений (WebP)</li>
          </ul>
          
          <h3>4.4 Доступность</h3>
          <ul>
            <li>WCAG 2.1 Level AA</li>
            <li>Поддержка скринридеров</li>
            <li>Контрастность цветов 4.5:1</li>
            <li>Клавиатурная навигация</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>5. ЭТАПЫ РАЗРАБОТКИ</h2>
          
          <h3>Фаза 1: MVP (3-4 месяца)</h3>
          <ol>
            <li>Настройка инфраструктуры, CI/CD (1-2 недели)</li>
            <li>Аутентификация + система семей (3-6 недели)</li>
            <li>Задачи + gamification (7-10 недели)</li>
            <li>Календарь (11-14 недели)</li>
            <li>PWA, тестирование, бета-запуск (15-16 недели)</li>
          </ol>
          
          <h3>Фаза 2: Расширенная версия (+3 месяца)</h3>
          <ol>
            <li>Чат (Stream Chat)</li>
            <li>ИИ-ассистент (GPT-3.5)</li>
            <li>Файловое хранилище</li>
            <li>Платёжная система</li>
            <li>Публичный запуск</li>
          </ol>
          
          <h3>Фаза 3: Дополнительные фичи (+2 месяца)</h3>
          <ol>
            <li>Голосовой помощник (Алиса)</li>
            <li>Сообщество</li>
            <li>Расширенная аналитика</li>
            <li>Мобильные приложения (React Native)</li>
          </ol>
        </div>
        
        <div class="section">
          <h2>6. КОМАНДА РАЗРАБОТКИ</h2>
          
          <h3>Минимальный состав (MVP)</h3>
          <table>
            <tr>
              <th>Роль</th>
              <th>Количество</th>
              <th>Стоимость</th>
            </tr>
            <tr>
              <td>Fullstack разработчик</td>
              <td>1</td>
              <td>150,000₽/мес</td>
            </tr>
            <tr>
              <td>UI/UX дизайнер</td>
              <td>1 (контракт)</td>
              <td>50,000₽</td>
            </tr>
            <tr>
              <td>QA Engineer</td>
              <td>1 (part-time)</td>
              <td>60,000₽/мес</td>
            </tr>
            <tr>
              <td>DevOps</td>
              <td>1 (консультант)</td>
              <td>по запросу</td>
            </tr>
          </table>
          
          <h3>Расширенная команда</h3>
          <ul>
            <li>2x Frontend разработчик (React)</li>
            <li>2x Backend разработчик (Node.js)</li>
            <li>1x Mobile разработчик (React Native)</li>
            <li>1x DevOps инженер</li>
            <li>1x UI/UX дизайнер</li>
            <li>1x QA Engineer</li>
            <li>1x Product Manager</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>7. БЮДЖЕТ И СРОКИ</h2>
          
          <h3>Затраты на разработку (MVP)</h3>
          <table>
            <tr>
              <th>Статья расходов</th>
              <th>Сумма</th>
            </tr>
            <tr>
              <td>Backend разработчик (4 мес)</td>
              <td>600,000₽</td>
            </tr>
            <tr>
              <td>UI/UX дизайнер</td>
              <td>50,000₽</td>
            </tr>
            <tr>
              <td>QA Engineer (2 мес)</td>
              <td>120,000₽</td>
            </tr>
            <tr>
              <td><strong>Итого MVP</strong></td>
              <td><strong>770,000₽</strong></td>
            </tr>
          </table>
          
          <h3>Инфраструктура (месяц)</h3>
          <table>
            <tr>
              <th>Сервис</th>
              <th>Стоимость</th>
            </tr>
            <tr>
              <td>Yandex Cloud</td>
              <td>6,600₽</td>
            </tr>
            <tr>
              <td>Stream Chat</td>
              <td>10,000₽</td>
            </tr>
            <tr>
              <td>OpenAI API (GPT-3.5)</td>
              <td>10,000₽</td>
            </tr>
            <tr>
              <td>Домен + SSL</td>
              <td>~200₽/год</td>
            </tr>
            <tr>
              <td>SendGrid</td>
              <td>Бесплатно</td>
            </tr>
            <tr>
              <td><strong>Итого/мес</strong></td>
              <td><strong>~27,000₽</strong></td>
            </tr>
          </table>
          
          <h3>Общий бюджет на запуск</h3>
          <table>
            <tr>
              <th>Категория</th>
              <th>Сумма</th>
            </tr>
            <tr>
              <td>Разработка</td>
              <td>770,000₽</td>
            </tr>
            <tr>
              <td>Инфраструктура (3 мес)</td>
              <td>81,000₽</td>
            </tr>
            <tr>
              <td>Тестирование + маркетинг</td>
              <td>190,000₽</td>
            </tr>
            <tr>
              <td>Юридика</td>
              <td>40,000₽</td>
            </tr>
            <tr>
              <td><strong>ИТОГО</strong></td>
              <td><strong>~1,081,000₽</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h2>8. РИСКИ И МИТИГАЦИЯ</h2>
          <table>
            <tr>
              <th>Риск</th>
              <th>Вероятность</th>
              <th>Последствия</th>
              <th>Митигация</th>
            </tr>
            <tr>
              <td>Отставание от графика</td>
              <td>Высокая</td>
              <td>Задержка запуска</td>
              <td>Agile, еженедельные ревью</td>
            </tr>
            <tr>
              <td>Превышение бюджета</td>
              <td>Средняя</td>
              <td>Нехватка средств</td>
              <td>Резерв 15%, приоритизация</td>
            </tr>
            <tr>
              <td>Проблемы с масштабированием</td>
              <td>Низкая</td>
              <td>Падения сервиса</td>
              <td>Нагрузочное тестирование</td>
            </tr>
            <tr>
              <td>Низкая конверсия в Premium</td>
              <td>Средняя</td>
              <td>Потеря выручки</td>
              <td>A/B тесты</td>
            </tr>
            <tr>
              <td>Утечка данных</td>
              <td>Низкая</td>
              <td>Репутационный урон</td>
              <td>Аудит безопасности, пентесты</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h2>9. МЕТРИКИ УСПЕХА</h2>
          
          <h3>KPI для MVP</h3>
          <ul>
            <li><strong>100 тестовых пользователей</strong> за первый месяц</li>
            <li><strong>Retention Rate</strong> &gt; 40% (7-day)</li>
            <li><strong>Average Session Duration</strong> &gt; 5 минут</li>
            <li><strong>Crash-free Rate</strong> &gt; 99%</li>
          </ul>
          
          <h3>KPI для публичного запуска</h3>
          <ul>
            <li><strong>1,000 регистраций</strong> в первые 3 месяца</li>
            <li><strong>Конверсия в Premium</strong> &gt; 5%</li>
            <li><strong>NPS (Net Promoter Score)</strong> &gt; 30</li>
            <li><strong>DAU/MAU</strong> &gt; 0.2</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>10. ЮРИДИЧЕСКИЕ АСПЕКТЫ</h2>
          
          <h3>10.1 Документы</h3>
          <ul>
            <li>Пользовательское соглашение (Terms of Service)</li>
            <li>Политика конфиденциальности (Privacy Policy)</li>
            <li>Договор оферты для Premium</li>
            <li>Согласие на обработку персональных данных</li>
          </ul>
          
          <h3>10.2 Регистрация</h3>
          <ul>
            <li>ИП или самозанятый для начала</li>
            <li>ООО при масштабировании</li>
            <li>Регистрация в ФНС РФ</li>
          </ul>
          
          <h3>10.3 Compliance</h3>
          <ul>
            <li>Закон о персональных данных (152-ФЗ)</li>
            <li>Роскомнадзор (уведомление об обработке данных)</li>
            <li>GDPR для европейских пользователей</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>11. ПОДДЕРЖКА И ОБСЛУЖИВАНИЕ</h2>
          
          <h3>11.1 Каналы поддержки</h3>
          <ul>
            <li>Email: support@familyorganizer.ru</li>
            <li>Telegram бот</li>
            <li>FAQ на сайте</li>
            <li>Видео-инструкции (YouTube)</li>
          </ul>
          
          <h3>11.2 SLA</h3>
          <ul>
            <li>Ответ на запрос: &lt; 24 часа</li>
            <li>Критичные баги: исправление &lt; 4 часа</li>
            <li>Плановые обновления: раз в 2 недели</li>
            <li>Техническое обслуживание: воскресенье 02:00-04:00</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>12. ROADMAP (12 месяцев)</h2>
          <ul>
            <li><strong>Q1 (месяцы 1-3):</strong> MVP разработка</li>
            <li><strong>Q2 (месяцы 4-6):</strong> Бета-тест, доработки, запуск</li>
            <li><strong>Q3 (месяцы 7-9):</strong> Расширенные фичи (ИИ, чат, файлы)</li>
            <li><strong>Q4 (месяцы 10-12):</strong> Мобильные приложения, маркетинг</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>13. КОНТАКТЫ</h2>
          <p><strong>Автор ТЗ:</strong> Семейный Органайзер Team</p>
          <p><strong>Email:</strong> tech@familyorganizer.ru</p>
          <p><strong>Дата создания:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
          <p><strong>Версия:</strong> 1.0</p>
        </div>
        
        <hr style="border: 2px solid #7c3aed; margin: 30px 0;">
        
        <p style="text-align: center; color: #666; font-style: italic; margin-top: 40px;">
          Данное техническое задание является живым документом и может обновляться по мере развития проекта.
        </p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', techSpec], {
      type: 'application/msword'
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-purple-300 shadow-2xl">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Icon name="Lock" size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              План запуска
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Этот раздел защищён паролем
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Введите пароль"
                  className={`text-center text-lg ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center justify-center gap-1">
                    <Icon name="AlertCircle" size={14} />
                    Неверный пароль
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                <Icon name="Unlock" className="mr-2" size={18} />
                Войти
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/')}
              >
                <Icon name="ArrowLeft" className="mr-2" size={16} />
                Вернуться на главную
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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