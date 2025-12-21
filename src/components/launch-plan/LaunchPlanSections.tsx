import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SectionContent {
  description: string;
  items?: Array<{ name: string; cost: string; details: string }>;
  steps?: string[];
  security?: string[];
  testTypes?: string[];
  channels?: string[];
}

interface Section {
  id: string;
  icon: string;
  title: string;
  color: string;
  budget: string;
  time: string;
  content: SectionContent;
}

interface LaunchPlanSectionsProps {
  expandedSection: string | null;
  onToggleSection: (id: string) => void;
}

const sections: Section[] = [
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

export function LaunchPlanSections({ expandedSection, onToggleSection }: LaunchPlanSectionsProps) {
  return (
    <>
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
      <div className="space-y-4" id="launch-plan-content">
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className={`border-2 border-${section.color}-300 hover:shadow-lg transition-shadow cursor-pointer`}
            onClick={() => onToggleSection(section.id)}
          >
            <CardHeader className={`bg-gradient-to-r from-${section.color}-50 to-${section.color}-100`}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className={`w-12 h-12 bg-${section.color}-600 rounded-lg flex items-center justify-center`}>
                    <Icon name={section.icon as any} className="text-white" size={24} />
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
                      <Icon name="CheckCircle" size={18} />
                      Пошаговый план
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      {section.content.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {section.content.security && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Icon name="Shield" size={18} />
                      Меры безопасности
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {section.content.security.map((item, idx) => (
                        <li key={idx}>{item}</li>
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
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {section.content.testTypes.map((type, idx) => (
                        <li key={idx}>{type}</li>
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
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {section.content.channels.map((channel, idx) => (
                        <li key={idx}>{channel}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
