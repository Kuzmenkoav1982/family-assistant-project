import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface WelcomeFooterProps {
  openTelegramSupport: () => void;
}

export default function WelcomeFooter({ openTelegramSupport }: WelcomeFooterProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-16">
      {/* Тарифы */}
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-12 py-6 font-bold shadow-xl"
          >
            <Icon name="Zap" size={22} className="mr-3" />
            Выбрать тариф
          </Button>
        </div>
      </div>

      {/* PWA */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 text-lg">
            Мобильное приложение
          </Badge>
          <h3 className="text-3xl font-bold mb-4">Установите PWA-версию</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Работает как обычное мобильное приложение с офлайн-режимом и push-уведомлениями
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon name="Smartphone" className="text-blue-600" size={24} />
                </div>
                <h4 className="text-xl font-bold">iPhone / iPad</h4>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                  <span>Откройте сайт в Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                  <span>Нажмите кнопку "Поделиться" внизу экрана</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                  <span>Выберите "На экран Домой"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                  <span>Нажмите "Добавить"</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon name="Smartphone" className="text-green-600" size={24} />
                </div>
                <h4 className="text-xl font-bold">Android</h4>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">1</span>
                  <span>Откройте сайт в Chrome</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">2</span>
                  <span>Нажмите меню (три точки) вверху справа</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">3</span>
                  <span>Выберите "Добавить на главный экран"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">4</span>
                  <span>Подтвердите установку</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 rounded-3xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Наша Семья</h4>
              <p className="text-gray-400 text-sm">
                Платформа для управления семейной жизнью — здоровье, задачи, путешествия и многое другое в одном приложении.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Контакты</h4>
              <div className="space-y-2 text-sm">
                <button
                  onClick={openTelegramSupport}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Icon name="Send" size={16} />
                  <span>Telegram</span>
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Документы</h4>
              <div className="space-y-2 text-sm">
                <a href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Политика конфиденциальности
                </a>
                <a href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Пользовательское соглашение
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            © 2025 Наша Семья. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
