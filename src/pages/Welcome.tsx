import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { openJivoChat } from '@/lib/jivo';

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

const screenshots = [
  {
    title: 'Профили семьи',
    description: 'Создайте профили для всех членов семьи с фото, достижениями и статистикой',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Users',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'AI-ассистент Домовой',
    description: 'Умный помощник с 8 ролями: повар, психолог, финансист, педагог и другие',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Bot',
    color: 'from-violet-500 to-purple-600'
  },
  {
    title: 'Задачи и поручения',
    description: 'Распределяйте задачи между членами семьи, отслеживайте прогресс и начисляйте баллы',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'CheckSquare',
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Развитие детей с ИИ',
    description: 'ИИ-оценка развития ребёнка, персональные планы и рекомендации на основе возраста',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Brain',
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'Календарь с экспортом',
    description: 'Планируйте события и экспортируйте их в Google Calendar, Apple Calendar, Outlook',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Calendar',
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Push-уведомления',
    description: 'Получайте мгновенные уведомления о задачах, событиях и достижениях',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Bell',
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'Семейные ценности',
    description: 'Храните и передавайте традиции, ценности и историю вашей семьи',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Heart',
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Аналитика и отчёты',
    description: 'Следите за статистикой семьи, прогрессом задач и достижениями',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'BarChart',
    color: 'from-indigo-500 to-blue-500'
  }
];

const features = [
  { icon: 'Users', title: 'Профили семьи', description: 'Индивидуальные профили с фото и достижениями' },
  { icon: 'Bot', title: 'AI-ассистент Домовой', description: '8 ролей: повар, психолог, финансист, педагог' },
  { icon: 'CheckSquare', title: 'Задачи', description: 'Система задач с баллами и уровнями' },
  { icon: 'Brain', title: 'ИИ-оценка развития', description: 'Персональные планы для детей 0-7 лет' },
  { icon: 'Calendar', title: 'Календарь + Экспорт', description: 'События с экспортом в iCal формат' },
  { icon: 'Bell', title: 'Push-уведомления', description: 'Мгновенные оповещения о важных событиях' },
  { icon: 'Heart', title: 'Ценности', description: 'Семейные традиции и история' },
  { icon: 'ShoppingCart', title: 'Покупки и питание', description: 'Списки покупок, рецепты, планирование меню' },
  { icon: 'Activity', title: 'Здоровье', description: 'Медицинские карты, прививки, врачи' },
  { icon: 'DollarSign', title: 'Финансы', description: 'Бюджет семьи и контроль расходов' },
  { icon: 'Plane', title: 'Поездки', description: 'Планирование путешествий' },
  { icon: 'BarChart', title: 'Аналитика', description: 'Статистика и отчёты' }
];

export default function Welcome() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      try {
        const response = await fetch(PAYMENTS_API, {
          method: 'GET',
          headers: {
            'X-Auth-Token': token
          }
        });

        const data = await response.json();
        if (data.has_subscription) {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки подписки:', error);
      }
    };

    loadSubscription();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
              alt="Наша семья"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 bg-clip-text text-transparent">
              Наша семья
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && subscription && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 flex items-center gap-2">
                <Icon name="Crown" size={16} />
                {subscription.plan_name}
              </Badge>
            )}
            <Button
              onClick={() => navigate('/presentation')}
              variant="outline"
              className="border-purple-300 hover:bg-purple-50"
            >
              <Icon name="FileText" size={18} className="mr-2" />
              Презентация
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
              >
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
              >
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-base">
              Современный семейный органайзер
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 bg-clip-text text-transparent">
              Управляйте семьёй<br />как настоящей командой
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Всё что нужно для организации семейной жизни: задачи, календарь, 
              развитие детей, традиции и многое другое в одном приложении
            </p>
          </div>

          <div className="relative mb-16">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
              <div className="relative h-[500px] lg:h-[600px]">
                {screenshots.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ${
                      index === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : index < currentSlide
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
                      <div className={`inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r ${slide.color}`}>
                        <Icon name={slide.icon} size={24} />
                        <span className="font-semibold text-lg">{slide.title}</span>
                      </div>
                      <p className="text-xl lg:text-2xl font-medium max-w-2xl">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
              >
                <Icon name="ChevronLeft" size={24} className="text-gray-800" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
              >
                <Icon name="ChevronRight" size={24} className="text-gray-800" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all ${
                      index === currentSlide
                        ? 'w-12 h-3 bg-white'
                        : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                    } rounded-full`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Все возможности в одном месте
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-purple-300 hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                      <Icon name={feature.icon} size={24} className="text-purple-600" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="from-orange-500 via-pink-500 to-purple-500 rounded-2xl p-8 lg:p-12 text-white text-center bg-slate-500">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Готовы начать?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Войдите через Яндекс ID и начните организовывать свою семью уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/presentation')}
                size="lg"
                variant="outline"
                className="bg-white/10 border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto"
              >
                <Icon name="FileText" size={24} className="mr-2" />
                Подробная презентация
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto"
              >
                <Icon name="LogIn" size={24} className="mr-2" />
                Войти через Яндекс ID
              </Button>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Icon name="Smartphone" size={28} />
                <span className="font-bold text-xl">Установите приложение</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Мобильное приложение для iOS и Android
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Установите наше приложение на свой телефон и получите быстрый доступ к семейному органайзеру
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <Icon name="Apple" size={24} />
                    </div>
                    <h4 className="text-2xl font-bold text-blue-600">iOS (iPhone/iPad)</h4>
                  </div>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                      <span>Откройте сайт в браузере <strong>Safari</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                      <span>Нажмите кнопку <strong>"Поделиться"</strong> <Icon name="Share" size={16} className="inline" /> (внизу экрана)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                      <span>Выберите <strong>"На экран 'Домой'"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                      <span>Нажмите <strong>"Добавить"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">5</span>
                      <span>Готово! Иконка приложения появится на главном экране</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:border-green-400 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
                      <Icon name="Smartphone" size={24} />
                    </div>
                    <h4 className="text-2xl font-bold text-green-600">Android</h4>
                  </div>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">1</span>
                      <span>Откройте сайт в браузере <strong>Chrome</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">2</span>
                      <span>Нажмите кнопку <strong>"Меню"</strong> <Icon name="MoreVertical" size={16} className="inline" /> (три точки вверху справа)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">3</span>
                      <span>Выберите <strong>"Установить приложение"</strong> или <strong>"Добавить на главный экран"</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">4</span>
                      <span>Подтвердите установку</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">5</span>
                      <span>Готово! Приложение установлено на ваш телефон</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Icon name="Sparkles" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-purple-600 mb-2">Преимущества мобильного приложения</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={18} className="text-green-500" />
                      <span>Работает без интернета (офлайн-режим)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={18} className="text-green-500" />
                      <span>Push-уведомления о задачах и событиях</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={18} className="text-green-500" />
                      <span>Быстрый доступ с главного экрана</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={18} className="text-green-500" />
                      <span>Полноэкранный режим (как обычное приложение)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 text-lg">
                  Оставить заявку
                </Badge>
                <h3 className="text-3xl font-bold mb-4">Свяжитесь с нами</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Хотите узнать больше о наших услугах? Оставьте заявку, и мы свяжемся с вами в течение часа!
                </p>
              </div>
              {/* Removed TelegramContactForm - needs implementation */}
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-lg">
                Тарифы и цены
              </Badge>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-800">
                Выберите подходящий тариф
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 border-gray-200 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">Бесплатный</h4>
                    <div className="text-4xl font-bold text-gray-600">0 ₽</div>
                    <p className="text-gray-500">навсегда</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Профили семьи (до 10 человек)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Календарь событий</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Списки покупок и задач</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Хранилище 1 ГБ</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-4 border-purple-500 hover:shadow-2xl transition-all relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    Популярно
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-2xl font-bold text-purple-600 mb-2">AI-Помощник</h4>
                    <div className="text-4xl font-bold text-purple-600">200 ₽</div>
                    <p className="text-gray-500">в месяц</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Умный семейный помощник</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Автоматические напоминания</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Подбор рецептов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Анализ бюджета</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-2xl font-bold text-orange-600 mb-2">Полный пакет</h4>
                    <div className="text-4xl font-bold text-orange-600">500 ₽</div>
                    <p className="text-gray-500">в месяц</p>
                    <Badge className="mt-2 bg-orange-100 text-orange-700">Экономия 35%</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>AI-Помощник "Домовой"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>20 ГБ хранилища</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Приоритетная поддержка</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Ранний доступ к новинкам</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8"
              >
                Начать пользоваться
              </Button>
            </div>
          </div>

          <footer className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <details className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg mb-8 border border-purple-700/50 group">
              <summary className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="Info" size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold flex items-center gap-2 flex-1">
                  О проекте "Наша семья"
                </h3>
                <Icon name="ChevronDown" size={18} className="text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4">
                <div className="pl-11 space-y-3 text-gray-300">
                  <p className="text-base leading-relaxed">
                    <strong className="text-white">Миссия:</strong> Сохранение семейных ценностей и укрепление семейных связей в современном мире.
                  </p>
                  <p className="text-base leading-relaxed">
                    <strong className="text-white">Цель:</strong> Создать единое пространство для организации семейной жизни, где каждый член семьи может внести свой вклад, 
                    делиться воспоминаниями и вместе планировать будущее.
                  </p>
                </div>
              </div>
            </details>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
                    alt="Наша семья"
                    className="h-12 w-12 object-contain rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-lg">Наша семья</h3>
                    <p className="text-sm text-gray-400">Объединяем семьи</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  Сервис для организации семейной жизни, планирования задач и укрепления семейных связей.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg mb-3">Юридическая информация</h4>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="/privacy-policy" 
                      className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                    >
                      <Icon name="Shield" size={16} />
                      Политика конфиденциальности
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/terms-of-service" 
                      className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                    >
                      <Icon name="FileText" size={16} />
                      Пользовательское соглашение
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/terms-of-service" 
                      className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                    >
                      <Icon name="FileCheck" size={16} />
                      Оферта
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/refund-policy" 
                      className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                    >
                      <Icon name="RotateCcw" size={16} />
                      Возврат средств
                    </a>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Кузьменко А.В.</p>
                  <p className="text-xs text-gray-400">ОГРНИП: 325774600908955</p>
                  <p className="text-xs text-gray-400">ИНН: 231805288780</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg mb-3">Контакты</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <Icon name="Mail" size={16} />
                    <a href="mailto:ip.kuzmenkoav@yandex.ru" className="hover:text-white transition-colors">
                      ip.kuzmenkoav@yandex.ru
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <Icon name="HelpCircle" size={16} />
                    <button onClick={openJivoChat} className="hover:text-white transition-colors">
                      Техподдержка
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-6 text-center">
              <p className="text-sm text-gray-400">© 2026 Наша семья. Все права защищены.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}