import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const slides = [
  {
    id: 1,
    type: 'cover',
    title: '💎 Наша семья',
    subtitle: 'Семейный органайзер нового поколения',
    content: 'Комплексное приложение для управления всеми аспектами семейной жизни',
    gradient: 'from-purple-500 via-pink-500 to-red-500'
  },
  {
    id: 2,
    type: 'problem',
    title: '🎯 Проблема',
    points: [
      'Семьи используют 5-10 разных приложений для разных задач',
      'Нет единого центра управления семейной жизнью',
      'Информация разбросана: календари, финансы, здоровье детей',
      'Сложно координировать действия всех членов семьи',
      '70% родителей испытывают стресс от хаоса в семейной организации'
    ]
  },
  {
    id: 3,
    type: 'solution',
    title: '✨ Решение',
    subtitle: 'Всё в одном приложении',
    points: [
      '🗓️ Единый семейный календарь с напоминаниями',
      '💰 Финансовый учет и бюджетирование',
      '👶 Дневник здоровья детей и медкарты',
      '🍽️ Планирование меню и списки покупок',
      '📊 Задачи и цели семьи с трекингом',
      '✈️ Планирование путешествий',
      '🤖 ИИ-помощник для семейных решений'
    ]
  },
  {
    id: 4,
    type: 'traction',
    title: '📈 Текущие показатели',
    stats: [
      { label: 'Активных семей', value: '15', icon: 'Users' },
      { label: 'Пользователей', value: '17+', icon: 'UserCheck' },
      { label: 'Функций', value: '50+', icon: 'Zap' },
      { label: 'Таблиц БД', value: '80+', icon: 'Database' },
      { label: 'Компонентов', value: '385+', icon: 'Package' },
      { label: 'Backend API', value: '30', icon: 'Server' }
    ],
    note: 'MVP полностью разработан и работает'
  },
  {
    id: 5,
    type: 'tech',
    title: '🛠️ Технологии',
    subtitle: 'Современный технологический стек',
    tech: [
      { name: 'React + TypeScript', desc: 'Надежный фронтенд' },
      { name: 'Python Backend', desc: '30 облачных функций' },
      { name: 'PostgreSQL', desc: '80+ таблиц данных' },
      { name: 'PWA', desc: 'Работает как приложение' },
      { name: 'Cloud Functions', desc: 'Масштабируемая архитектура' },
      { name: 'ЮKassa', desc: 'Интеграция платежей' }
    ]
  },
  {
    id: 6,
    type: 'market',
    title: '🌍 Рынок',
    data: {
      tam: { value: '50M', desc: 'Семей в России' },
      sam: { value: '15M', desc: 'Городские семьи с детьми' },
      som: { value: '1.5M', desc: 'Целевая аудитория (3 года)' }
    },
    competitors: [
      { name: 'Todoist, Trello', issue: 'Только задачи' },
      { name: 'Календари', issue: 'Только события' },
      { name: 'Банковские приложения', issue: 'Только финансы' },
      { name: 'Наша семья', advantage: 'Всё в одном месте!' }
    ]
  },
  {
    id: 7,
    type: 'business',
    title: '💰 Бизнес-модель',
    plans: [
      { name: 'Базовый', price: '₽299/мес', users: 'до 5 членов' },
      { name: 'Семейный', price: '₽799/3мес', users: 'до 10 членов', popular: true },
      { name: 'Премиум', price: '₽2,499/год', users: 'неограниченно' }
    ],
    revenue: [
      { metric: 'LTV (3 года)', value: '₽10,800' },
      { metric: 'CAC', value: '₽500-800' },
      { metric: 'При 10K пользователей', value: '₽36M/год' },
      { metric: 'При 100K пользователей', value: '₽360M/год' }
    ]
  },
  {
    id: 8,
    type: 'valuation',
    title: '💎 Оценка проекта',
    current: {
      title: 'Текущая стоимость',
      value: '₽15-25M',
      items: [
        'Себестоимость разработки: ₽11.7M',
        'Готовый MVP с реальными пользователями',
        'Полная техническая инфраструктура',
        'База данных с реальными данными'
      ]
    },
    potential: {
      title: 'Потенциал при масштабировании',
      value: '₽500M - ₽1B',
      items: [
        '100K пользователей → ₽360M годовой выручки',
        'B2B: консультанты, психологи, страховые',
        'Международный рынок (300M+ семей)',
        'Уникальная комплексность решения'
      ]
    }
  },
  {
    id: 9,
    type: 'roadmap',
    title: '🗺️ План развития',
    phases: [
      {
        period: 'Q1 2025',
        goals: ['Запуск платных подписок', 'Маркетинг: 1000 семей', 'Мобильные приложения iOS/Android']
      },
      {
        period: 'Q2-Q3 2025',
        goals: ['10,000 активных семей', 'B2B продукт для консультантов', 'ИИ-помощник v2.0']
      },
      {
        period: 'Q4 2025',
        goals: ['50,000 семей', 'Запуск в Казахстане/Беларуси', 'Партнерства со страховыми']
      },
      {
        period: '2026',
        goals: ['100,000+ семей', 'Международная экспансия', 'Series A раунд']
      }
    ]
  },
  {
    id: 10,
    type: 'ask',
    title: '🚀 Инвестиционный раунд',
    ask: '₽5,000,000',
    equity: '15-20% доли',
    use: [
      { item: 'Маркетинг и привлечение пользователей', amount: '₽2,000,000' },
      { item: 'Разработка мобильных приложений', amount: '₽1,500,000' },
      { item: 'Команда (продакт, маркетинг, дизайнер)', amount: '₽1,000,000' },
      { item: 'Инфраструктура и масштабирование', amount: '₽500,000' }
    ],
    milestones: [
      '6 месяцев → 5,000 платящих семей',
      '12 месяцев → 15,000 семей, точка безубыточности',
      '18 месяцев → 50,000 семей, готовность к Series A'
    ]
  }
];

export default function InvestorDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-white border-white">
              Слайд {currentSlide + 1} / {slides.length}
            </Badge>
            {/* n'RIS Certificate Badge */}
            <a
              href="https://nris.ru/deposits/check-certificate/?num=518-830-027"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 transition-all"
              title="Свидетельство о депонировании n'RIS №518-830-027"
            >
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider">Интеллектуальная собственность</span>
                <span className="text-white font-bold text-xs">n'RIS №518-830-027</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-slate-300">Депонировано</span>
                <span className="text-white text-xs font-semibold">04.03.2026</span>
              </div>
              <Icon name="ShieldCheck" size={14} className="text-green-400 ml-1" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              variant="outline"
              size="sm"
              className="text-white border-white"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              variant="outline"
              size="sm"
              className="text-white border-white"
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <Card className="max-w-5xl mx-auto min-h-[600px] bg-white/95 backdrop-blur">
          <CardContent className="p-12">
            {slide.type === 'cover' && (
              <div className={`text-center py-20 rounded-2xl bg-gradient-to-br ${slide.gradient} text-white`}>
                <h1 className="text-6xl font-bold mb-6">{slide.title}</h1>
                <h2 className="text-3xl font-semibold mb-4">{slide.subtitle}</h2>
                <p className="text-xl opacity-90">{slide.content}</p>
              </div>
            )}

            {slide.type === 'problem' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
                <div className="space-y-4">
                  {slide.points?.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <Icon name="AlertCircle" className="text-red-500 mt-1" size={24} />
                      <p className="text-lg text-gray-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === 'solution' && (
              <div>
                <h2 className="text-4xl font-bold mb-2 text-gray-900">{slide.title}</h2>
                <p className="text-xl text-gray-600 mb-8">{slide.subtitle}</p>
                <div className="grid grid-cols-2 gap-4">
                  {slide.points?.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <Icon name="CheckCircle2" className="text-green-500 mt-1" size={20} />
                      <p className="text-gray-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === 'traction' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {slide.stats?.map((stat, idx) => (
                    <div key={idx} className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      <Icon name={stat.icon as string} className="mx-auto mb-3 text-purple-600" size={40} />
                      <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-green-100 border-2 border-green-500 rounded-xl text-center">
                  <p className="text-xl font-semibold text-green-900">{slide.note}</p>
                </div>
              </div>
            )}

            {slide.type === 'tech' && (
              <div>
                <h2 className="text-4xl font-bold mb-2 text-gray-900">{slide.title}</h2>
                <p className="text-xl text-gray-600 mb-8">{slide.subtitle}</p>
                <div className="grid grid-cols-2 gap-6">
                  {slide.tech?.map((tech, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tech.name}</h3>
                      <p className="text-gray-600">{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === 'market' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-blue-50 rounded-xl text-center">
                    <div className="text-sm text-gray-600 mb-2">TAM</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{slide.data?.tam.value}</div>
                    <div className="text-sm text-gray-700">{slide.data?.tam.desc}</div>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-xl text-center">
                    <div className="text-sm text-gray-600 mb-2">SAM</div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{slide.data?.sam.value}</div>
                    <div className="text-sm text-gray-700">{slide.data?.sam.desc}</div>
                  </div>
                  <div className="p-6 bg-green-50 rounded-xl text-center">
                    <div className="text-sm text-gray-600 mb-2">SOM</div>
                    <div className="text-3xl font-bold text-green-600 mb-2">{slide.data?.som.value}</div>
                    <div className="text-sm text-gray-700">{slide.data?.som.desc}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Конкуренты vs Мы</h3>
                <div className="space-y-3">
                  {slide.competitors?.map((comp, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${comp.advantage ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{comp.name}</span>
                        <span className={comp.advantage ? 'text-green-700 font-bold' : 'text-red-600'}>{comp.issue || comp.advantage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === 'business' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {slide.plans?.map((plan, idx) => (
                    <div key={idx} className={`p-6 rounded-xl border-2 ${plan.popular ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500' : 'bg-gray-50 border-gray-300'}`}>
                      {plan.popular && <Badge className="mb-3 bg-purple-500">Популярный</Badge>}
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-purple-600 mb-3">{plan.price}</div>
                      <p className="text-gray-600">{plan.users}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-2xl font-bold mb-4">Unit Economics</h3>
                <div className="grid grid-cols-2 gap-6">
                  {slide.revenue?.map((item, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg">
                      <div className="text-gray-600 mb-1">{item.metric}</div>
                      <div className="text-2xl font-bold text-green-700">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === 'valuation' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-500">
                    <h3 className="text-2xl font-bold mb-3">{slide.current?.title}</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-4">{slide.current?.value}</div>
                    <ul className="space-y-2">
                      {slide.current?.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Icon name="Check" className="text-blue-600 mt-1" size={16} />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-500">
                    <h3 className="text-2xl font-bold mb-3">{slide.potential?.title}</h3>
                    <div className="text-4xl font-bold text-green-600 mb-4">{slide.potential?.value}</div>
                    <ul className="space-y-2">
                      {slide.potential?.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Icon name="TrendingUp" className="text-green-600 mt-1" size={16} />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {slide.type === 'roadmap' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-gray-900">{slide.title}</h2>
                <div className="space-y-6">
                  {slide.phases?.map((phase, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-l-4 border-purple-500">
                      <h3 className="text-2xl font-bold text-purple-700 mb-3">{phase.period}</h3>
                      <ul className="space-y-2">
                        {phase.goals.map((goal, gIdx) => (
                          <li key={gIdx} className="flex items-center gap-3">
                            <Icon name="Target" className="text-purple-600" size={20} />
                            <span className="text-gray-800 text-lg">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === 'ask' && (
              <div>
                <h2 className="text-4xl font-bold mb-8 text-center text-gray-900">{slide.title}</h2>
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-purple-600 mb-2">{slide.ask}</div>
                  <div className="text-2xl text-gray-600">{slide.equity}</div>
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">Использование средств:</h3>
                  <div className="space-y-3">
                    {slide.use?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-800">{item.item}</span>
                        <span className="font-bold text-purple-600">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-500">
                  <h3 className="text-xl font-bold mb-4">Ключевые вехи:</h3>
                  <ul className="space-y-2">
                    {slide.milestones?.map((milestone, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Icon name="Rocket" className="text-green-600 mt-1" size={20} />
                        <span className="text-gray-800">{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}