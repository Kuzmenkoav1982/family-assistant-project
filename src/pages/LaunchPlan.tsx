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
    // Создаём HTML контент для Word
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
            </table>
            <p><strong>Оптимизированный бюджет (минимум):</strong> ~700,000₽</p>
          </div>

          <div className="timeline">
            <h2>📅 График работ</h2>
            <table>
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

          <p style="margin-top: 40px; font-style: italic; color: #666;">
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
