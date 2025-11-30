import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import StatsCounter from '@/components/StatsCounter';
import { openJivoChat } from '@/lib/jivo';

const screenshots = [
  {
    title: 'Профили семьи',
    description: 'Создайте профили для всех членов семьи с фото, достижениями и статистикой',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Users',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Задачи и поручения',
    description: 'Распределяйте задачи между членами семьи, отслеживайте прогресс и начисляйте баллы',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'CheckSquare',
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Календарь событий',
    description: 'Планируйте семейные мероприятия, дни рождения и важные даты',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Calendar',
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Развитие детей',
    description: 'Отслеживайте успехи детей в учёбе, кружках и достижениях',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Baby',
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'Семейные ценности',
    description: 'Храните и передавайте традиции, ценности и историю вашей семьи',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Heart',
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Цели и достижения',
    description: 'Ставьте семейные цели и отмечайте их достижение вместе',
    image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg',
    icon: 'Target',
    color: 'from-indigo-500 to-blue-500'
  }
];

const features = [
  { icon: 'Users', title: 'Профили семьи', description: 'Индивидуальные профили с фото и достижениями' },
  { icon: 'CheckSquare', title: 'Задачи', description: 'Система задач с баллами и уровнями' },
  { icon: 'Calendar', title: 'Календарь', description: 'Семейные события и планирование' },
  { icon: 'Baby', title: 'Дети', description: 'Развитие и образование детей' },
  { icon: 'Heart', title: 'Ценности', description: 'Семейные традиции и история' },
  { icon: 'Target', title: 'Цели', description: 'Совместные достижения' },
  { icon: 'GitBranch', title: 'Древо', description: 'Генеалогическое древо семьи' },
  { icon: 'BookOpen', title: 'Блог', description: 'Семейный дневник и воспоминания' }
];

export default function Welcome() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
                alt="Наша семья"
                className="w-12 h-12 object-contain"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-neutral-600">
                Наша семья
              </h1>
            </div>
            <div className="hidden md:block">
              <StatsCounter />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/presentation')}
              variant="outline"
              className="border-purple-300 hover:bg-purple-50"
            >
              <Icon name="FileText" size={18} className="mr-2" />
              Презентация
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
            >
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-base">
              Современный семейный органайзер
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-cyan-900">
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

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
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
          </div>

          <div className="mt-12 text-center space-y-4">
            <Button
              onClick={openJivoChat}
              variant="outline"
              size="lg"
              className="border-purple-300 hover:bg-purple-50"
            >
              <Icon name="Headphones" size={20} className="mr-2" />
              Техническая поддержка
            </Button>
            <p className="text-sm text-gray-600">
              © 2025 Наша семья. Современный органайзер для семейной жизни
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}