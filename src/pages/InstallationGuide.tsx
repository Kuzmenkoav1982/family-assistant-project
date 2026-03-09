import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function InstallationGuide() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handlePrint}>
              <Icon name="Download" className="w-4 h-4 mr-2" />
              Скачать PDF
            </Button>
          </div>
        </div>

        {/* Документ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 print:shadow-none print:p-0">

          {/* Заголовок */}
          <div className="border-b-2 border-purple-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Руководство по установке и развёртыванию программного обеспечения «Наша Семья»
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
              <div><span className="font-semibold">Версия документа:</span> 1.0</div>
              <div><span className="font-semibold">Дата:</span> 09.03.2026</div>
              <div><span className="font-semibold">Правообладатель:</span> ИП Кузьменко А.В.</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">ОГРНИП:</span> 325774600908955 &nbsp;|&nbsp; <span className="font-semibold">ИНН:</span> 231805728780
            </div>
          </div>

          {/* 1. Общие сведения */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Общие сведения</h2>
            <p className="text-gray-700 leading-relaxed">
              Настоящее руководство описывает порядок установки и развёртывания программного обеспечения «Наша Семья» —
              веб-платформы для организации семейной жизни. Руководство предназначено для системных администраторов и
              технических специалистов, осуществляющих развёртывание продукта в производственной среде.
            </p>
          </section>

          {/* 2. Системные требования */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Системные требования</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1. Клиентская часть (браузер пользователя)</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Параметр</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Требование</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Браузер', 'Google Chrome 90+, Mozilla Firefox 88+, Safari 14+, Microsoft Edge 90+'],
                    ['Версия браузера', 'Не ниже 2021 года выпуска'],
                    ['Интернет-соединение', 'Не менее 1 Мбит/с'],
                    ['Разрешение экрана', 'От 360×640 (мобильные) до 1920×1080 (десктоп)'],
                    ['JavaScript', 'Включён'],
                    ['Cookies', 'Разрешены'],
                  ].map(([param, req]) => (
                    <tr key={param} className="even:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{param}</td>
                      <td className="border border-gray-300 px-4 py-2">{req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2. Серверная часть</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Компонент</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Требование</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Облачная платформа', 'Yandex Cloud (Serverless Functions)'],
                    ['Serverless Functions', 'Поддержка Python 3.11'],
                    ['СУБД', 'PostgreSQL 15 или выше'],
                    ['Объектное хранилище', 'S3-совместимое (Yandex Object Storage или аналог)'],
                    ['CDN', 'Поддержка HTTPS, кеширование статических файлов'],
                    ['Node.js (для сборки)', 'Версия 18.0 и выше'],
                    ['npm / bun', 'npm 9+ или bun 1.0+'],
                  ].map(([param, req]) => (
                    <tr key={param} className="even:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{param}</td>
                      <td className="border border-gray-300 px-4 py-2">{req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Архитектура */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Архитектура системы</h2>
            <p className="text-gray-700 mb-3">Приложение «Наша Семья» построено на трёхзвенной архитектуре:</p>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 mb-4">
              <div>[Браузер пользователя]</div>
              <div className="ml-8">↓ HTTPS</div>
              <div>[Статический хостинг / CDN] — Frontend: React SPA</div>
              <div className="ml-8">↓ HTTPS REST API</div>
              <div>[Serverless Functions] — Backend: Python 3.11</div>
              <div className="ml-8">↓ TCP/SSL</div>
              <div>[PostgreSQL БД] &nbsp;&nbsp;&nbsp;&nbsp; [S3 Объектное хранилище]</div>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><span className="font-semibold">Frontend</span> — одностраничное приложение (SPA) на React 18, собирается Vite, раздаётся как статические файлы HTML/CSS/JS</li>
              <li><span className="font-semibold">Backend</span> — набор изолированных функций (Serverless / Cloud Functions) на Python 3.11</li>
              <li><span className="font-semibold">База данных</span> — PostgreSQL 15, управляемый сервис (158 таблиц: семьи, задачи, здоровье, финансы, питание и др.)</li>
              <li><span className="font-semibold">Файловое хранилище</span> — S3-совместимое объектное хранилище для медиафайлов</li>
              <li><span className="font-semibold">CDN</span> — раздача статических ресурсов с кешированием (cdn.poehali.dev)</li>
            </ul>
          </section>

          {/* 4. Установка и развёртывание */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Установка и развёртывание</h2>

            {[
              {
                step: 'Шаг 1. Подготовка исходного кода',
                content: (
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm ml-2">
                    <li>Получите архив с исходным кодом (ZIP-архив, поставляемый правообладателем)</li>
                    <li>Распакуйте архив в рабочую директорию: <code className="bg-gray-100 px-1 rounded">unzip nasha-semya.zip -d nasha-semya</code></li>
                  </ol>
                ),
              },
              {
                step: 'Шаг 2. Установка зависимостей Frontend',
                content: (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>Убедитесь, что установлен Node.js версии 18+:</p>
                    <code className="block bg-gray-100 px-3 py-2 rounded">node --version &nbsp;# должно быть &gt;= 18.0.0</code>
                    <code className="block bg-gray-100 px-3 py-2 rounded">npm install</code>
                  </div>
                ),
              },
              {
                step: 'Шаг 3. Настройка переменных окружения Backend',
                content: (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-left">Переменная</th>
                          <th className="border border-gray-300 px-3 py-2 text-left">Описание</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['DATABASE_URL', 'Строка подключения к PostgreSQL'],
                          ['YANDEX_CLIENT_ID', 'Идентификатор OAuth-приложения Яндекс'],
                          ['YANDEX_CLIENT_SECRET', 'Секрет OAuth-приложения Яндекс'],
                          ['VK_APP_ID', 'Идентификатор OAuth-приложения ВКонтакте'],
                          ['VK_APP_SECRET', 'Секрет OAuth-приложения ВКонтакте'],
                          ['AWS_ACCESS_KEY_ID', 'Ключ доступа к S3-хранилищу'],
                          ['AWS_SECRET_ACCESS_KEY', 'Секретный ключ S3-хранилища'],
                          ['JWT_SECRET', 'Секрет для подписи JWT-токенов (≥32 символа)'],
                        ].map(([k, v]) => (
                          <tr key={k} className="even:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-1.5 font-mono text-xs">{k}</td>
                            <td className="border border-gray-300 px-3 py-1.5">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                step: 'Шаг 4. Развёртывание базы данных',
                content: (
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm ml-2">
                    <li>Создайте управляемый кластер PostgreSQL 15 в Yandex Cloud</li>
                    <li>Создайте базу данных и пользователя с необходимыми правами</li>
                    <li>Примените все 158 миграций из папки <code className="bg-gray-100 px-1 rounded">db_migrations/</code> последовательно (V001 → V158)</li>
                  </ol>
                ),
              },
              {
                step: 'Шаг 5. Развёртывание Backend-функций',
                content: (
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>Для каждой функции из папки <code className="bg-gray-100 px-1 rounded">backend/</code>:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Загрузите содержимое в Yandex Cloud Functions</li>
                      <li>Точка входа: <code className="bg-gray-100 px-1 rounded">index.handler</code>, среда: Python 3.11</li>
                      <li>Таймаут: не менее 30 секунд, память: не менее 256 МБ</li>
                      <li>Задайте переменные окружения (шаг 3)</li>
                    </ul>
                    <p className="mt-2">Группы функций: аутентификация, семья, задачи/события, здоровье, питание, финансы, путешествия, дети, AI, уведомления, администрирование, интеграции (Яндекс.Алиса, MAX-бот, Telegram).</p>
                  </div>
                ),
              },
              {
                step: 'Шаг 6. Сборка Frontend',
                content: (
                  <div className="space-y-2 text-sm text-gray-700">
                    <code className="block bg-gray-100 px-3 py-2 rounded">npm run build</code>
                    <p>Готовые файлы появятся в папке <code className="bg-gray-100 px-1 rounded">dist/</code>: index.html + assets/</p>
                  </div>
                ),
              },
              {
                step: 'Шаг 7. Публикация Frontend',
                content: (
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>Загрузите содержимое папки <code className="bg-gray-100 px-1 rounded">dist/</code> на статический хостинг (Yandex Object Storage, Nginx, CDN).</p>
                    <p>Важно: для SPA необходимо настроить перенаправление всех маршрутов на <code className="bg-gray-100 px-1 rounded">index.html</code>.</p>
                  </div>
                ),
              },
            ].map(({ step, content }) => (
              <div key={step} className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 bg-purple-50 border-l-4 border-purple-500 pl-3 py-1.5 rounded-r mb-3">{step}</h3>
                {content}
              </div>
            ))}
          </section>

          {/* 5. Проверка */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Проверка работоспособности</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Проверка</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Ожидаемый результат</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Открыть https://nasha-semiya.ru/welcome', 'Отображается страница приветствия'],
                    ['Регистрация нового пользователя', 'Успешная регистрация, создание семьи'],
                    ['Авторизация через Яндекс ID', 'Редирект и вход в личный кабинет'],
                    ['Создание задачи', 'Задача отображается в списке'],
                    ['Загрузка изображения', 'Файл сохраняется, URL доступен'],
                    ['Push-уведомления', 'Уведомления приходят в браузер'],
                  ].map(([check, result]) => (
                    <tr key={check} className="even:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{check}</td>
                      <td className="border border-gray-300 px-4 py-2 text-green-700">{result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Частые проблемы */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Часто встречающиеся проблемы</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Проблема</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Причина</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Решение</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Белый экран при открытии', 'Неверный путь в конфигурации Nginx', 'Настроить try_files для SPA'],
                    ['Ошибка 502 при вызове API', 'Функция не развёрнута или таймаут', 'Проверить логи функции, увеличить таймаут'],
                    ['Ошибка подключения к БД', 'Неверная строка DATABASE_URL', 'Проверить переменную окружения'],
                    ['Не работает OAuth Яндекс', 'Неверный redirect_uri', 'Добавить домен в настройки OAuth-приложения'],
                    ['Файлы не загружаются', 'Неверные ключи S3', 'Проверить AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY'],
                  ].map(([prob, cause, fix]) => (
                    <tr key={prob} className="even:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-red-700">{prob}</td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-600">{cause}</td>
                      <td className="border border-gray-300 px-3 py-2 text-green-700">{fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Контакты */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Контактная информация технической поддержки</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><span className="font-semibold">Сайт:</span> <a href="https://nasha-semiya.ru" className="text-purple-600 hover:underline">nasha-semiya.ru</a></li>
              <li><span className="font-semibold">Email:</span> <a href="mailto:support@nasha-semiya.ru" className="text-purple-600 hover:underline">support@nasha-semiya.ru</a></li>
              <li><span className="font-semibold">Канал MAX:</span> <a href="https://max.ru/id231805288780_biz" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">max.ru/id231805288780_biz</a></li>
            </ul>
          </section>

          {/* Подпись */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-xs text-gray-500 italic leading-relaxed">
              Документ составлен в соответствии с требованиями Министерства цифрового развития, связи и массовых коммуникаций РФ
              для включения сведений о программном обеспечении в реестр российского ПО (п. 11 «д» Постановления Правительства
              РФ № 1236 от 16.11.2015).
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
