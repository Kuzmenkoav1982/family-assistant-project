import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { openJivoChat } from '@/lib/jivo';

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

const trackSectionClick = async (sectionIndex: number, sectionTitle: string) => {
  try {
    const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random()}`;
    localStorage.setItem('sessionId', sessionId);
    
    await fetch('https://functions.poehali.dev/fe19c08e-4cc1-4aa8-a1af-b03678b7ba22', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'track_click',
        section_index: sectionIndex,
        section_title: sectionTitle,
        session_id: sessionId,
        user_agent: navigator.userAgent
      })
    });
  } catch (error) {
    console.debug('Analytics tracking failed:', error);
  }
};

const sections = [
  {
    title: 'Профили семьи',
    description: 'Индивидуальные профили для всех членов семьи с фото и достижениями',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/de4b03f6-f019-4f65-8f22-7d0d9a4cb5e0.JPG',
    icon: 'Users',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'AI-ассистент Домовой',
    description: '9 ролей: повар, психолог, финансист, педагог и другие эксперты',
    icon: 'Bot',
    color: 'from-violet-500 to-purple-600',
    carousel: [
      'https://cdn.poehali.dev/files/47327121-8534-430d-a7c0-e50690437237.JPG',
      'https://cdn.poehali.dev/files/bb75d02b-10ae-46f9-851d-5f14bf8bdbe5.png',
      'https://cdn.poehali.dev/files/e86bb9d8-5b0d-4075-b1c9-c25d86b7adbf.png',
      'https://cdn.poehali.dev/files/0f6aa830-8e74-443f-844d-29e89f950064.png',
      'https://cdn.poehali.dev/files/94618c5b-23ee-4108-a13f-f281e8a87281.png',
      'https://cdn.poehali.dev/files/98efb2a9-2d25-483d-b481-ac35513004ac.png',
      'https://cdn.poehali.dev/files/0b8c0528-9896-4da5-a4f4-5152c2d7d522.png',
      'https://cdn.poehali.dev/files/ec910c26-11e0-4622-afb3-3bac06cec25b.png',
      'https://cdn.poehali.dev/files/854774af-565e-431e-b48a-77d47c7a9813.png',
      'https://cdn.poehali.dev/files/286d6578-905f-41bd-85f8-d49043ce5566.png',
      'https://cdn.poehali.dev/files/2f7f6221-1d43-40af-8591-3f9ca0750342.png'
    ]
  },
  {
    title: 'Задачи и поручения',
    description: 'Система задач с баллами и уровнями для всей семьи',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/2a975113-b781-4867-a03c-76da41b91083.JPG',
    icon: 'CheckSquare',
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Развитие детей',
    description: 'ИИ-оценка развития, персональные планы для детей 0-12 лет',
    icon: 'Brain',
    color: 'from-orange-500 to-red-500',
    carousel: [
      'https://cdn.poehali.dev/files/f94f9d2a-9c1d-4ede-b479-3c775731f474.JPG',
      'https://cdn.poehali.dev/files/33b7284b-299c-431e-aab0-b93959ce8ebd.JPG',
      'https://cdn.poehali.dev/files/d53f1028-47c2-422c-a051-eb3353c3e845.JPG',
      'https://cdn.poehali.dev/files/dc2a81b0-608f-4c7d-8178-3c9f8e8be7b4.JPG'
    ]
  },
  {
    title: 'Календарь',
    description: 'События с экспортом в Google Calendar, Apple Calendar, Outlook',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/01b848b8-d5d5-448a-8d5a-ff27951a757e.JPG',
    icon: 'Calendar',
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Уведомления',
    description: 'Push, Telegram и Email оповещения о событиях',
    icon: 'Bell',
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'Семейные ценности',
    description: 'Семейные традиции и история вашей семьи',
    icon: 'Heart',
    color: 'from-pink-500 to-rose-500',
    carousel: [
      'https://cdn.poehali.dev/files/0b39376b-a819-48ea-b0be-bc936be55949.JPG',
      'https://cdn.poehali.dev/files/e44ce06d-788f-43c9-887d-8a3ce23fdcce.JPG',
      'https://cdn.poehali.dev/files/dd35f06e-2495-40db-9f32-515915a8d57d.JPG'
    ]
  },
  {
    title: 'Покупки и питание',
    description: 'Списки покупок, рецепты, планирование меню',
    icon: 'ShoppingCart',
    color: 'from-teal-500 to-green-500',
    carousel: [
      'https://cdn.poehali.dev/files/9ca89df6-d1c5-4680-9fc1-c385eed37312.JPG',
      'https://cdn.poehali.dev/files/6acd446c-652a-43e5-95e8-01340a0dcb3e.JPG',
      'https://cdn.poehali.dev/files/3a556238-65cd-4c0c-b450-df642a999a2a.JPG',
      'https://cdn.poehali.dev/files/544080a3-65da-4c22-8365-804463384260.JPG',
      'https://cdn.poehali.dev/files/d26e750a-9082-4baa-95b0-96632d652bb2.JPG'
    ]
  },
  {
    title: 'Здоровье',
    description: 'Медкарты, прививки, врачи, анализы всей семьи',
    icon: 'Activity',
    color: 'from-green-500 to-emerald-500',
    carousel: [
      'https://cdn.poehali.dev/files/c45e38e3-a925-40a1-958b-aee6dec32bc8.JPG',
      'https://cdn.poehali.dev/files/99a1f24b-9e9f-40f1-b3f0-5e26eb258377.JPG',
      'https://cdn.poehali.dev/files/7bbfbb97-7803-4f52-89fe-1a1ed35adafe.JPG',
      'https://cdn.poehali.dev/files/6ffcf860-68b9-4a80-b8a0-98250ec701af.JPG',
      'https://cdn.poehali.dev/files/119d304c-4bc7-4265-85fa-d9d1d11fa9ba.JPG'
    ]
  },
  {
    title: 'Путешествия',
    description: 'Планирование поездок, маршруты, бронирования',
    icon: 'Plane',
    color: 'from-sky-500 to-blue-500'
  },
  {
    title: 'Досуг',
    description: 'Идеи развлечений, мероприятия, хобби',
    icon: 'Sparkles',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    title: 'Праздники',
    description: 'Организация семейных торжеств и событий',
    icon: 'PartyPopper',
    color: 'from-pink-500 to-purple-500'
  },
  {
    title: 'Аналитика',
    description: 'Статистика и отчёты по всем аспектам семейной жизни',
    icon: 'BarChart',
    color: 'from-indigo-500 to-blue-500'
  }
];



export default function Welcome() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [carouselIndexes, setCarouselIndexes] = useState<{ [key: number]: number }>({});
  const carouselRefs = useRef<{ [key: number]: NodeJS.Timeout }>({});

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
          },
          signal: AbortSignal.timeout(8000) // Таймаут 8 секунд
        });

        if (!response.ok) {
          console.debug('Subscription API unavailable');
          return;
        }

        const data = await response.json();
        if (data.has_subscription) {
          setSubscription(data);
        }
      } catch (error) {
        console.debug('Subscription load skipped:', error);
        // Тихо игнорируем ошибку - страница работает без подписки
      }
    };

    loadSubscription();
  }, []);

  useEffect(() => {
    sections.forEach((section, index) => {
      if (section.carousel && section.carousel.length > 1) {
        const interval = setInterval(() => {
          setCarouselIndexes(prev => ({
            ...prev,
            [index]: ((prev[index] || 0) + 1) % section.carousel!.length
          }));
        }, 4000);
        carouselRefs.current[index] = interval;
      }
    });

    return () => {
      Object.values(carouselRefs.current).forEach(interval => clearInterval(interval));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3 md:mb-0">
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
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {isLoggedIn && subscription && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1.5 flex items-center gap-2 text-sm">
                <Icon name="Crown" size={14} />
                {subscription.plan_name}
              </Badge>
            )}

            <Button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                localStorage.removeItem('familyId');
                localStorage.setItem('isDemoMode', 'true');
                localStorage.setItem('demoStartTime', Date.now().toString());
                navigate('/');
              }}
              variant="outline"
              size="sm"
              className="border-orange-300 hover:bg-orange-50 text-orange-600 font-semibold text-xs sm:text-sm"
            >
              <Icon name="Sparkles" size={16} className="mr-1" />
              <span className="hidden sm:inline">Демо-режим</span>
              <span className="sm:hidden">Демо</span>
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={() => navigate('/')}
                size="sm"
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-xs sm:text-sm"
              >
                <Icon name="Home" size={16} className="mr-1" />
                Главная
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg text-xs sm:text-sm"
                >
                  <Icon name="UserPlus" size={16} className="mr-1" />
                  <span className="hidden sm:inline">Создать семью</span>
                  <span className="sm:hidden">Создать</span>
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
                >
                  <Icon name="LogIn" size={16} className="mr-1" />
                  Войти
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-32 md:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 bg-clip-text text-transparent">
              Управляйте семьёй<br />как настоящей командой
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Здоровье, путешествия, праздники, задачи, развитие детей — всё для организации семейной жизни в одном приложении
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isLoggedIn && (
                <Button
                  onClick={() => navigate('/register')}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-10 py-7 font-bold shadow-xl transform hover:scale-105 transition-transform"
                >
                  <Icon name="UserPlus" size={22} className="mr-3" />
                  Создать семью бесплатно
                </Button>
              )}
              <Button
                onClick={() => {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('authUser');
                  localStorage.removeItem('familyId');
                  localStorage.setItem('isDemoMode', 'true');
                  localStorage.setItem('demoStartTime', Date.now().toString());
                  navigate('/');
                }}
                size="lg"
                variant="outline"
                className="border-2 border-orange-400 hover:bg-orange-50 text-orange-600 font-bold text-lg px-8 py-7"
              >
                <Icon name="Sparkles" size={20} className="mr-2" />
                Демо (10 минут)
              </Button>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Основные разделы платформы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <Card
                  key={index}
                  onClick={() => trackSectionClick(index, section.title)}
                  className="overflow-hidden border-2 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 animate-fade-in group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    {section.carousel ? (
                      <div className="relative w-full h-full bg-white">
                        <img
                          src={section.carousel[carouselIndexes[index] || 0]}
                          alt={`${section.title} - Слайд ${(carouselIndexes[index] || 0) + 1}`}
                          className="w-full h-full object-contain transition-opacity duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselIndexes(prev => ({
                              ...prev,
                              [index]: ((prev[index] || 0) - 1 + section.carousel!.length) % section.carousel!.length
                            }));
                            if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                        >
                          <Icon name="ChevronLeft" size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselIndexes(prev => ({
                              ...prev,
                              [index]: ((prev[index] || 0) + 1) % section.carousel!.length
                            }));
                            if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                        >
                          <Icon name="ChevronRight" size={20} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {section.carousel.map((_, dotIndex) => (
                            <button
                              key={dotIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCarouselIndexes(prev => ({ ...prev, [index]: dotIndex }));
                                if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                              }}
                              className={`w-2 h-2 rounded-full transition-all ${
                                (carouselIndexes[index] || 0) === dotIndex ? 'bg-white scale-125' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : section.image ? (
                      <>
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-105"
                        />
                      </>
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${section.color}`}></div>
                        <div className="absolute inset-0 bg-black/5"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon name={section.icon} size={80} className="text-white/90" />
                        </div>
                      </>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h4>
                    <p className="text-gray-700 leading-relaxed">{section.description}</p>
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
                onClick={() => {
                  // Выходим из аккаунта перед входом в демо
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('authUser');
                  localStorage.removeItem('familyId');
                  // Активируем демо-режим
                  localStorage.setItem('isDemoMode', 'true');
                  localStorage.setItem('demoStartTime', Date.now().toString());
                  navigate('/');
                }}
                size="lg"
                variant="outline"
                className="bg-white/10 border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto"
              >
                <Icon name="Sparkles" size={24} className="mr-2" />
                Попробовать демо
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