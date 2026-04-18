import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { initialFamilyMembers, initialTasks } from '@/data/mockData';
import { recipes, shoppingList, calendarEventsExtended, familyGoalsExtended, trips, votingPolls } from '@/data/extendedMockData';

export default function DemoMode() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [demoStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(600); // 10 минут

  useEffect(() => {
    // Устанавливаем флаг демо-режима
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('demoStartTime', demoStartTime.toString());

    // Таймер обратного отсчёта
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - demoStartTime) / 1000);
      const remaining = Math.max(0, 600 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        setShowRegistrationPrompt(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [demoStartTime]);

  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  const stats = {
    members: initialFamilyMembers.length,
    tasks: initialTasks.length,
    recipes: recipes.length,
    shopping: shoppingList.length,
    events: calendarEventsExtended.length,
    goals: familyGoalsExtended.length,
    trips: trips.length,
    polls: votingPolls.length
  };

  const tourSteps = [
    {
      title: 'Главная страница',
      description: `Центр управления семьёй - виджеты задач, календаря, покупок и другие разделы`,
      icon: 'Home',
      color: 'from-blue-500 to-cyan-500',
      path: '/'
    },
    {
      title: 'Профили семьи',
      description: `В демо-режиме уже создана семья из ${stats.members} человек с фотографиями, возрастом и достижениями`,
      icon: 'Users',
      color: 'from-purple-500 to-pink-500',
      path: '/family-management'
    },
    {
      title: 'Рецепты',
      description: `${stats.recipes} семейных рецептов с ингредиентами и пошаговыми инструкциями`,
      icon: 'ChefHat',
      color: 'from-green-500 to-emerald-500',
      path: '/recipes'
    },
    {
      title: 'Список покупок',
      description: `${stats.shopping} товаров с категориями и приоритетами`,
      icon: 'ShoppingCart',
      color: 'from-orange-500 to-amber-500',
      path: '/shopping'
    },
    {
      title: 'Календарь событий',
      description: `${stats.events} запланированных событий с напоминаниями`,
      icon: 'Calendar',
      color: 'from-indigo-500 to-purple-500',
      path: '/calendar'
    },
    {
      title: 'Путешествия',
      description: `${stats.trips} поездок с бюджетом, фотографиями и маршрутами`,
      icon: 'Plane',
      color: 'from-sky-500 to-blue-500',
      path: '/trips'
    },
    {
      title: 'Семейные голосования',
      description: `${stats.polls} активных опросов для принятия совместных решений`,
      icon: 'Vote',
      color: 'from-pink-500 to-rose-500',
      path: '/voting'
    },
    {
      title: 'Аналитика и статистика',
      description: `Отчёты по активности семьи, выполнению задач и достижениям`,
      icon: 'BarChart',
      color: 'from-violet-500 to-purple-500',
      path: '/analytics'
    }
  ];

  const startFreeTour = () => {
    setShowWelcome(false);
    navigate('/');
  };

  const startGuidedTour = () => {
    setShowWelcome(false);
    setShowTour(true);
    setTourStep(0);
  };

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      const nextStep = tourSteps[tourStep + 1];
      setTourStep(tourStep + 1);
      navigate(nextStep.path);
    } else {
      setShowTour(false);
      navigate('/');
    }
  };

  const skipTour = () => {
    setShowTour(false);
    navigate('/');
  };

  const exitDemo = () => {
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoStartTime');
    navigate('/welcome');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showRegistrationPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-4 sm:p-8 border-2 border-orange-200 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon name="Clock" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Время демо-режима истекло! ⏰
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
              Вам понравилось? Зарегистрируйтесь, чтобы сохранить свои данные навсегда 
              и получить доступ ко всем функциям!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="p-4 border-2 border-green-200 bg-green-50">
                <Icon name="Check" className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-bold text-gray-900 mb-1">С регистрацией:</h4>
                <ul className="text-sm text-gray-700 text-left space-y-1">
                  <li>✓ Безлимитное время</li>
                  <li>✓ Облачное хранение данных</li>
                  <li>✓ AI-ассистент Домовой</li>
                  <li>✓ Синхронизация между устройствами</li>
                </ul>
              </Card>
              <Card className="p-4 border-2 border-gray-200">
                <Icon name="X" className="w-6 h-6 text-gray-400 mb-2" />
                <h4 className="font-bold text-gray-900 mb-1">Без регистрации:</h4>
                <ul className="text-sm text-gray-700 text-left space-y-1">
                  <li>✗ Данные удалятся</li>
                  <li>✗ Только демо-данные</li>
                  <li>✗ Нет AI-функций</li>
                  <li>✗ Только на этом устройстве</li>
                </ul>
              </Card>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Icon name="UserPlus" className="w-5 h-5 mr-2" />
                Зарегистрироваться
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  setShowRegistrationPrompt(false);
                  setTimeLeft(600);
                  localStorage.setItem('demoStartTime', Date.now().toString());
                }}
              >
                <Icon name="Clock" className="w-5 h-5 mr-2" />
                Ещё 10 минут
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={exitDemo}
              className="mt-4 text-gray-500"
            >
              Выйти из демо
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 animate-bounce-in">
              <img 
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG" 
                alt="Наша Семья логотип" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shadow-xl"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              🎭 Добро пожаловать в демо-режим!
            </h1>
            <p className="text-base sm:text-xl text-gray-700 max-w-3xl mx-auto mb-2">
              Попробуйте все возможности приложения без регистрации
            </p>
            <Badge className="bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base">
              ⏱️ 10 минут бесплатного доступа
            </Badge>
          </div>

          {/* Выбор режима */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card 
              className="p-8 border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all cursor-pointer group"
              onClick={startGuidedTour}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Icon name="Map" className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🎯 Экскурсия с гидом
                </h3>
                <p className="text-gray-700 mb-4">
                  Пошаговый тур по основным функциям приложения
                </p>
                <Badge className="bg-purple-100 text-purple-700 border-0 mb-4">
                  Рекомендуется для новичков
                </Badge>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>8 ключевых разделов с подсказками</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Займёт 5-7 минут</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Понятное объяснение каждой функции</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                  <Icon name="Play" className="w-5 h-5 mr-2" />
                  Начать экскурсию
                </Button>
              </div>
            </Card>

            <Card 
              className="p-8 border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all cursor-pointer group"
              onClick={startFreeTour}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Icon name="Gamepad2" className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🚀 Свободный режим
                </h3>
                <p className="text-gray-700 mb-4">
                  Полная песочница - исследуйте всё самостоятельно
                </p>
                <Badge className="bg-orange-100 text-orange-700 border-0 mb-4">
                  Для опытных пользователей
                </Badge>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Доступны все разделы сразу</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Можно добавлять и изменять данные</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Нет ограничений по времени</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Icon name="Zap" className="w-5 h-5 mr-2" />
                  Начать исследование
                </Button>
              </div>
            </Card>
          </div>

          {/* Что внутри */}
          <Card className="p-8 border-2 border-gray-200 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📦 Что есть в демо-режиме:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'Users', label: `${stats.members} членов семьи`, color: 'text-blue-600' },
                { icon: 'CheckSquare', label: `${stats.tasks} задач`, color: 'text-orange-600' },
                { icon: 'ChefHat', label: `${stats.recipes} рецептов`, color: 'text-green-600' },
                { icon: 'ShoppingCart', label: `${stats.shopping} покупок`, color: 'text-pink-600' },
                { icon: 'Calendar', label: `${stats.events} событий`, color: 'text-purple-600' },
                { icon: 'Plane', label: `${stats.trips} поездок`, color: 'text-sky-600' },
                { icon: 'Vote', label: `${stats.polls} опросов`, color: 'text-violet-600' },
                { icon: 'Trophy', label: `${stats.goals} целей`, color: 'text-yellow-600' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon name={item.icon as any} className={`w-6 h-6 ${item.color}`} />
                  <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Кнопка выхода */}
          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/welcome')} className="text-gray-500">
              <Icon name="ArrowLeft" className="w-5 h-5 mr-2" />
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tour overlay
  if (showTour) {
    const currentStep = tourSteps[tourStep];
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 border-4 border-purple-300 shadow-2xl">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-500 text-white">
              Шаг {tourStep + 1} из {tourSteps.length}
            </Badge>
            
            <div className={`w-20 h-20 bg-gradient-to-br ${currentStep.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <Icon name={currentStep.icon as any} className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {currentStep.title}
            </h3>
            <p className="text-lg text-gray-700 mb-8">
              {currentStep.description}
            </p>

            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={skipTour}
              >
                Пропустить тур
              </Button>
              <Button 
                onClick={nextTourStep}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {tourStep < tourSteps.length - 1 ? (
                  <>
                    Далее
                    <Icon name="ArrowRight" className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Завершить тур
                    <Icon name="Check" className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}