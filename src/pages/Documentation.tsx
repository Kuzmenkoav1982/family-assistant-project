import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function Documentation() {
  const navigate = useNavigate();

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
            >
              <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
              На главную
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="print:hidden"
            >
              <Icon name="Download" className="w-4 h-4 mr-2" />
              Экспорт в PDF
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/e75f76ea-1ecd-40ba-8c4b-9bec18c6513f.jpeg" 
              alt="Наша Семья логотип" 
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Документация Наша Семья</h1>
              <p className="text-lg text-gray-600">Руководство по установке и эксплуатации</p>
            </div>
          </div>
        </div>

        {/* Оглавление */}
        <Card className="p-6 mb-8 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="List" className="w-6 h-6 text-purple-600" />
            Содержание
          </h2>
          <nav className="space-y-2">
            <a href="#about" className="block text-purple-600 hover:text-purple-800 transition-colors">
              1. О программном обеспечении
            </a>
            <a href="#requirements" className="block text-purple-600 hover:text-purple-800 transition-colors">
              2. Системные требования
            </a>
            <a href="#installation" className="block text-purple-600 hover:text-purple-800 transition-colors">
              3. Установка и запуск
            </a>
            <a href="#features" className="block text-purple-600 hover:text-purple-800 transition-colors">
              4. Основные функции
            </a>
            <a href="#usage" className="block text-purple-600 hover:text-purple-800 transition-colors">
              5. Руководство пользователя
            </a>
            <a href="#technical" className="block text-purple-600 hover:text-purple-800 transition-colors">
              6. Техническая документация
            </a>
            <a href="#support" className="block text-purple-600 hover:text-purple-800 transition-colors">
              7. Техническая поддержка
            </a>
          </nav>
        </Card>

        {/* 1. О ПО */}
        <Card id="about" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="Info" className="w-8 h-8 text-blue-600" />
            1. О программном обеспечении
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-lg">
              <strong>Наша Семья</strong> — это комплексное веб-приложение для управления семейной жизнью,
              объединяющее инструменты планирования, коммуникации и организации быта.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-2">Основная информация:</h3>
              <ul className="space-y-2">
                <li><strong>Наименование:</strong> Наша Семья</li>
                <li><strong>Правообладатель:</strong> ИП Кузьменко А.В.</li>
                <li><strong>Версия:</strong> 2.0</li>
                <li><strong>Тип ПО:</strong> Веб-приложение (Progressive Web Application)</li>
                <li><strong>Платформа:</strong> Кроссплатформенное (работает в браузере)</li>
                <li><strong>Лицензия:</strong> Проприетарное ПО</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Назначение</h3>
            <p>
              Программное обеспечение предназначено для автоматизации управления семейными процессами:
              планирование событий, ведение общего календаря, управление семейным бюджетом,
              организация питания, координация задач между членами семьи, отслеживание здоровья
              и многое другое.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Целевая аудитория</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Семьи с детьми</li>
              <li>Многопоколенные семьи</li>
              <li>Семьи, ведущие активный образ жизни</li>
              <li>Пользователи, желающие улучшить организацию семейного быта</li>
            </ul>
          </div>
        </Card>

        {/* 2. Системные требования */}
        <Card id="requirements" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="Monitor" className="w-8 h-8 text-green-600" />
            2. Системные требования
          </h2>
          <div className="space-y-6 text-gray-700">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Минимальные требования</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Для веб-версии (через браузер):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Любое устройство с доступом в интернет</li>
                    <li>Современный веб-браузер (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)</li>
                    <li>Минимальное разрешение экрана: 320×568 пикселей</li>
                    <li>Подключение к интернету: от 1 Мбит/с</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Для мобильных устройств:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Android:</strong> версия 7.0 и выше, Chrome браузер</li>
                    <li><strong>iOS:</strong> версия 12.0 и выше, Safari браузер</li>
                    <li>Свободное место на устройстве: минимум 50 МБ для кэша</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Для настольных компьютеров:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Windows:</strong> Windows 10 и выше</li>
                    <li><strong>macOS:</strong> macOS 10.14 Mojave и выше</li>
                    <li><strong>Linux:</strong> любой дистрибутив с современным браузером</li>
                    <li>Оперативная память: минимум 2 ГБ</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Рекомендуемые требования</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Стабильное интернет-соединение от 5 Мбит/с</li>
                <li>Оперативная память: от 4 ГБ</li>
                <li>Включенные cookies и localStorage в браузере</li>
                <li>Разрешение геолокации (для функций отслеживания местоположения)</li>
                <li>Разрешение уведомлений (для напоминаний и оповещений)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 3. Установка и запуск */}
        <Card id="installation" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="Download" className="w-8 h-8 text-purple-600" />
            3. Установка и запуск
          </h2>
          <div className="space-y-6 text-gray-700">
            <p className="text-lg">
              Наша Семья — это веб-приложение, которое не требует традиционной установки.
              Приложение работает через браузер и может быть установлено как PWA (Progressive Web App).
            </p>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Способ 1: Использование через браузер (без установки)
              </h3>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong>Откройте браузер</strong> на любом устройстве (компьютер, планшет, смартфон)
                </li>
                <li>
                  <strong>Перейдите по адресу:</strong>{' '}
                  <a href="https://nasha-semiya.ru" className="text-purple-600 hover:underline font-mono">
                    https://nasha-semiya.ru
                  </a>
                </li>
                <li>
                  <strong>Зарегистрируйтесь</strong> или войдите в систему, если у вас уже есть аккаунт
                </li>
                <li>
                  Приложение готово к использованию
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Способ 2: Установка PWA на мобильное устройство
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Icon name="Smartphone" className="w-5 h-5" />
                    Для Android (Chrome):
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Откройте Chrome и перейдите на https://nasha-semiya.ru</li>
                    <li>Нажмите на меню (⋮) в правом верхнем углу</li>
                    <li>Выберите "Установить приложение" или "Добавить на главный экран"</li>
                    <li>Подтвердите установку</li>
                    <li>Приложение появится на главном экране как обычное приложение</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Icon name="Smartphone" className="w-5 h-5" />
                    Для iOS (Safari):
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Откройте Safari и перейдите на https://nasha-semiya.ru</li>
                    <li>Нажмите кнопку "Поделиться" (квадрат со стрелкой вверх)</li>
                    <li>Прокрутите вниз и выберите "На экран Домой"</li>
                    <li>Введите название (по умолчанию "Наша Семья")</li>
                    <li>Нажмите "Добавить"</li>
                    <li>Приложение появится на главном экране</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Способ 3: Установка PWA на настольный компьютер
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Windows/Linux (Chrome/Edge):</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Откройте браузер и перейдите на https://nasha-semiya.ru</li>
                    <li>В адресной строке справа появится значок установки (⊕ или компьютер)</li>
                    <li>Нажмите на значок и выберите "Установить"</li>
                    <li>Приложение откроется в отдельном окне и добавится в меню Пуск</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold mb-2">macOS (Chrome/Edge):</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Откройте браузер и перейдите на https://nasha-semiya.ru</li>
                    <li>Нажмите меню браузера → "Установить Наша Семья..."</li>
                    <li>Подтвердите установку</li>
                    <li>Приложение появится в Dock и Launchpad</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="AlertCircle" className="w-6 h-6 text-orange-600" />
                Первый запуск
              </h3>
              <p className="mb-3">После установки и первого запуска приложения:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>При первом входе вам будет предложено пройти регистрацию</li>
                <li>Подтвердите email (если используете регистрацию через email)</li>
                <li>Заполните базовую информацию о семье</li>
                <li>Добавьте членов семьи и настройте профили</li>
                <li>Ознакомьтесь с интерактивным туром по функциям (рекомендуется)</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Обновление приложения</h3>
              <p>
                Приложение обновляется автоматически. При наличии новой версии вы увидите
                уведомление с предложением обновить приложение. Просто перезагрузите страницу
                или перезапустите приложение, чтобы получить последнюю версию.
              </p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Trash2" className="w-6 h-6 text-red-600" />
                Удаление приложения
              </h3>
              <div className="space-y-3">
                <p><strong>Для мобильных устройств:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Android: Удерживайте значок приложения → "Удалить"</li>
                  <li>iOS: Удерживайте значок → нажмите "−" или "Удалить приложение"</li>
                </ul>
                <p className="mt-3"><strong>Для настольных компьютеров:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Откройте меню приложения (⋮) → "Удалить" или "Деинсталлировать"</li>
                </ul>
                <p className="mt-3 text-sm italic">
                  Примечание: удаление PWA не удаляет ваши данные с серверов. Для полного удаления
                  аккаунта обратитесь в службу поддержки.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Основные функции */}
        <Card id="features" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="Sparkles" className="w-8 h-8 text-yellow-600" />
            4. Основные функции
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: 'Users', title: 'Управление семьей', desc: 'Профили членов семьи, роли и права доступа' },
                { icon: 'Calendar', title: 'Общий календарь', desc: 'События, напоминания, дни рождения' },
                { icon: 'CheckSquare', title: 'Задачи и поручения', desc: 'Распределение обязанностей между членами семьи' },
                { icon: 'ShoppingCart', title: 'Список покупок', desc: 'Совместные покупки с категориями' },
                { icon: 'Utensils', title: 'Планирование питания', desc: 'Рецепты, меню на неделю, список ингредиентов' },
                { icon: 'Wallet', title: 'Семейный бюджет', desc: 'Доходы, расходы, планирование трат' },
                { icon: 'Heart', title: 'Здоровье семьи', desc: 'Медицинские записи, напоминания о приеме лекарств' },
                { icon: 'GraduationCap', title: 'Образование детей', desc: 'Расписание занятий, успеваемость, домашние задания' },
                { icon: 'Plane', title: 'Путешествия', desc: 'Планирование поездок, бюджет, маршруты' },
                { icon: 'Vote', title: 'Семейные голосования', desc: 'Совместное принятие решений' },
                { icon: 'MessageSquare', title: 'Новости семьи', desc: 'Общая лента событий и достижений' },
                { icon: 'Bot', title: 'AI-ассистент', desc: 'Умный помощник для планирования и советов' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 5. Руководство пользователя */}
        <Card id="usage" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="BookOpen" className="w-8 h-8 text-indigo-600" />
            5. Руководство пользователя
          </h2>
          <div className="space-y-6 text-gray-700">
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Быстрый старт</h3>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong>Регистрация и вход</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Зарегистрируйтесь через email или Яндекс</li>
                    <li>Подтвердите email (если используете регистрацию через email)</li>
                  </ul>
                </li>
                <li>
                  <strong>Создание семьи</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Заполните информацию о семье</li>
                    <li>Добавьте членов семьи с фотографиями и данными</li>
                    <li>Настройте роли и права доступа</li>
                  </ul>
                </li>
                <li>
                  <strong>Настройка интерфейса</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Выберите виджеты для главного экрана</li>
                    <li>Настройте уведомления</li>
                    <li>Активируйте нужные модули</li>
                  </ul>
                </li>
                <li>
                  <strong>Начало работы</strong>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Создайте первое событие в календаре</li>
                    <li>Добавьте задачи и распределите их между членами семьи</li>
                    <li>Начните вести список покупок</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Основные операции</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Работа с календарем:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Нажмите "+" для создания события</li>
                    <li>Укажите название, дату, время и участников</li>
                    <li>Настройте напоминания</li>
                    <li>События синхронизируются между всеми устройствами</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Управление задачами:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Создавайте задачи с описанием и сроками</li>
                    <li>Назначайте ответственных</li>
                    <li>Отмечайте выполненные задачи</li>
                    <li>Просматривайте статистику выполнения</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Список покупок:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Добавляйте товары вручную или из рецептов</li>
                    <li>Группируйте по категориям</li>
                    <li>Отмечайте купленное</li>
                    <li>Используйте общий список для совместных покупок</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Планирование питания:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Создавайте и сохраняйте семейные рецепты</li>
                    <li>Планируйте меню на неделю</li>
                    <li>Автоматически генерируйте список покупок из рецептов</li>
                    <li>Получайте рекомендации от AI-ассистента</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Совместная работа</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Приглашение членов семьи:</strong> Отправьте ссылку-приглашение или
                  семейный код для присоединения к вашей семье
                </li>
                <li>
                  <strong>Права доступа:</strong> Настройте, какие разделы доступны каждому
                  члену семьи (например, дети могут не видеть финансы)
                </li>
                <li>
                  <strong>Уведомления:</strong> Получайте оповещения о новых задачах,
                  событиях и изменениях в режиме реального времени
                </li>
                <li>
                  <strong>Синхронизация:</strong> Все изменения мгновенно отображаются
                  на всех устройствах членов семьи
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-ассистент "Домовой"</h3>
              <p className="mb-3">
                Умный помощник помогает с планированием и организацией:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Рекомендации рецептов на основе предпочтений семьи</li>
                <li>Советы по оптимизации бюджета</li>
                <li>Идеи для семейного досуга</li>
                <li>Напоминания о важных событиях</li>
                <li>Анализ активности и предложения по улучшению организации</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 6. Техническая документация */}
        <Card id="technical" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="Code" className="w-8 h-8 text-gray-600" />
            6. Техническая документация
          </h2>
          <div className="space-y-6 text-gray-700">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Архитектура системы</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Тип приложения:</strong> Progressive Web Application (PWA)
                </li>
                <li>
                  <strong>Frontend:</strong> React 18, TypeScript, Vite
                </li>
                <li>
                  <strong>UI Framework:</strong> Tailwind CSS, shadcn/ui
                </li>
                <li>
                  <strong>State Management:</strong> React Context API, TanStack Query
                </li>
                <li>
                  <strong>Backend:</strong> Python (FastAPI), PostgreSQL
                </li>
                <li>
                  <strong>Hosting:</strong> Yandex Cloud (Cloud Functions, Object Storage)
                </li>
                <li>
                  <strong>CDN:</strong> Yandex Cloud CDN
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Безопасность и конфиденциальность</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Шифрование данных:</strong> HTTPS/TLS для всех соединений
                </li>
                <li>
                  <strong>Аутентификация:</strong> JWT-токены, OAuth 2.0 (Telegram)
                </li>
                <li>
                  <strong>Хранение паролей:</strong> bcrypt хеширование
                </li>
                <li>
                  <strong>Защита данных:</strong> Изолированные пространства для каждой семьи
                </li>
                <li>
                  <strong>Соответствие:</strong> GDPR, 152-ФЗ о персональных данных
                </li>
                <li>
                  <strong>Резервное копирование:</strong> Автоматическое, ежедневное
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">API и интеграции</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>RESTful API для мобильных приложений (в разработке)</li>
                <li>Интеграция с Telegram Bot для уведомлений</li>
                <li>Webhook для внешних систем</li>
                <li>Export/Import данных в JSON, CSV форматах</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Производительность</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Размер приложения:</strong> ~2-3 МБ (начальная загрузка)
                </li>
                <li>
                  <strong>Время загрузки:</strong> {'<'} 2 секунд на 4G
                </li>
                <li>
                  <strong>Offline режим:</strong> Базовые функции доступны без интернета
                </li>
                <li>
                  <strong>Кэширование:</strong> Service Worker для быстрой загрузки
                </li>
                <li>
                  <strong>Оптимизация:</strong> Lazy loading, code splitting
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Требования к браузеру</h3>
              <p className="mb-3">Приложение использует современные веб-технологии:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Service Workers (для PWA и offline режима)</li>
                <li>IndexedDB (для локального хранения)</li>
                <li>Web Push API (для уведомлений)</li>
                <li>Geolocation API (для функций геолокации)</li>
                <li>WebSocket (для real-time обновлений)</li>
                <li>LocalStorage и SessionStorage</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 7. Техническая поддержка */}
        <Card id="support" className="p-8 mb-6 scroll-mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Icon name="HeadphonesIcon" className="w-8 h-8 text-orange-600" />
            7. Техническая поддержка
          </h2>
          <div className="space-y-6 text-gray-700">
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Контакты службы поддержки</h3>
              <div className="space-y-3">
                <p className="flex items-center gap-3">
                  <Icon name="Mail" className="w-5 h-5 text-orange-600" />
                  <strong>Email:</strong> support@nasha-semiya.ru
                </p>
                <p className="flex items-center gap-3">
                  <Icon name="Send" className="w-5 h-5 text-orange-600" />
                  <strong>Telegram:</strong>{' '}
                  <a href="https://t.me/Nasha7iya" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                    https://t.me/Nasha7iya
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <Icon name="Globe" className="w-5 h-5 text-orange-600" />
                  <strong>Сайт:</strong>{' '}
                  <a href="https://nasha-semiya.ru" className="text-orange-600 hover:underline">
                    https://nasha-semiya.ru
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <Icon name="Clock" className="w-5 h-5 text-orange-600" />
                  <strong>Время работы:</strong> Пн-Пт 9:00-18:00 (МСК)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы (FAQ)</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold mb-1">Как восстановить пароль?</p>
                  <p className="text-sm">
                    На странице входа нажмите "Забыли пароль?", введите email и следуйте инструкциям
                    в письме.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Можно ли использовать приложение без интернета?</p>
                  <p className="text-sm">
                    Да, базовые функции доступны offline. Синхронизация произойдет при
                    восстановлении соединения.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Сколько членов семьи можно добавить?</p>
                  <p className="text-sm">
                    В бесплатной версии до 5 человек, в Premium — без ограничений.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Как экспортировать данные?</p>
                  <p className="text-sm">
                    В разделе "Настройки" → "Данные" → "Экспорт" можно скачать все данные в
                    формате JSON или CSV.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Безопасны ли мои данные?</p>
                  <p className="text-sm">
                    Да, все данные шифруются при передаче и хранении. Доступ имеют только члены
                    вашей семьи.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Известные проблемы и решения</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-bold mb-1">Проблема: Приложение не загружается</p>
                  <p className="text-sm">
                    <strong>Решение:</strong> Очистите кэш браузера, проверьте интернет-соединение,
                    попробуйте другой браузер.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Проблема: Не приходят уведомления</p>
                  <p className="text-sm">
                    <strong>Решение:</strong> Проверьте разрешения браузера для уведомлений,
                    настройки уведомлений в приложении.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Проблема: Данные не синхронизируются</p>
                  <p className="text-sm">
                    <strong>Решение:</strong> Проверьте интернет-соединение, выйдите и войдите
                    заново, обновите приложение.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Обновления и новые функции</h3>
              <p className="mb-3">
                Мы регулярно выпускаем обновления с новыми функциями и улучшениями.
                Следите за новостями:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>В разделе "Новости" приложения</li>
                <li>На нашем сайте nasha-semiya.ru</li>
                <li>В Telegram-канале https://t.me/Nasha7iya</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600 py-8">
          <p className="mb-2">© 2025-2026 Наша Семья. Все права защищены.</p>
          <p className="text-sm">
            ИП Кузьменко А.В.
          </p>
          <p className="text-sm mt-2">
            Документация версии 2.0 от 11.02.2026
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <Button variant="outline" onClick={() => navigate('/privacy-policy')}>
              Политика конфиденциальности
            </Button>
            <Button variant="outline" onClick={() => navigate('/terms-of-service')}>
              Условия использования
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}