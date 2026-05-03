import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Документация программного обеспечения «Наша Семья»
          </h1>
          <p className="text-gray-600">
            Правообладатель: ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955
          </p>
        </div>

        {/* Оглавление */}
        <Card className="p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Содержание</h2>
          <nav className="space-y-2 text-gray-700">
            <a href="#about" className="block hover:text-blue-700 transition-colors">
              1. О программном обеспечении
            </a>
            <a href="#access" className="block hover:text-blue-700 transition-colors">
              2. Доступ к программному обеспечению
            </a>
            <a href="#requirements" className="block hover:text-blue-700 transition-colors">
              3. Системные требования
            </a>
            <a href="#features" className="block hover:text-blue-700 transition-colors">
              4. Функциональные характеристики
            </a>
            <a href="#usage" className="block hover:text-blue-700 transition-colors">
              5. Порядок работы с программным обеспечением
            </a>
            <a href="#lifecycle" className="block hover:text-blue-700 transition-colors">
              6. Поддержка жизненного цикла
            </a>
            <a href="#support" className="block hover:text-blue-700 transition-colors">
              7. Техническая поддержка
            </a>
          </nav>
        </Card>

        {/* 1. О ПО */}
        <Card id="about" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            1. О программном обеспечении
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Программное обеспечение <strong>«Наша Семья»</strong> представляет собой
              интернет-сервис, предназначенный для совместного планирования семейных задач,
              ведения календаря событий, управления списками дел и покупок, распределения
              обязанностей, хранения семейной информации и организации взаимодействия
              между членами семьи.
            </p>
            <p>
              Программное обеспечение предоставляется в формате интернет-сервиса (SaaS)
              и доступно через веб-браузер без установки на устройство пользователя.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <ul className="space-y-2">
                <li><strong>Наименование:</strong> Наша Семья</li>
                <li><strong>Правообладатель:</strong> ИП Кузьменко Анастасия Вячеславовна</li>
                <li><strong>ОГРНИП:</strong> 325774600908955</li>
                <li><strong>Версия:</strong> 1.1</li>
                <li><strong>Форма предоставления:</strong> Интернет-сервис (SaaS)</li>
                <li><strong>Лицензия:</strong> Проприетарное программное обеспечение</li>
              </ul>
            </div>
            <p className="mt-4">
              Программное обеспечение предназначено для личного семейного использования.
              Функции, связанные с оказанием медицинских, юридических или финансовых
              консультаций, не предусмотрены.
            </p>
          </div>
        </Card>

        {/* 2. Доступ */}
        <Card id="access" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            2. Доступ к программному обеспечению
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Для доступа к программному обеспечению установка специального программного
              обеспечения на устройство пользователя не требуется.
            </p>
            <p>
              Адрес для доступа: <strong>https://nasha-semiya.ru</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Откройте веб-браузер и перейдите по адресу: <strong>https://nasha-semiya.ru</strong></li>
              <li>В интерфейсе сервиса выберите команду входа в систему.</li>
              <li>Введите учётные данные зарегистрированного пользователя.</li>
              <li>После авторизации обеспечивается доступ к функциональным возможностям сервиса.</li>
            </ol>
            <p>
              Для завершения работы в интерфейсе сервиса выберите команду «Выйти».
            </p>
          </div>
        </Card>

        {/* 3. Системные требования */}
        <Card id="requirements" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            3. Системные требования
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>Для использования программного обеспечения необходимы:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>устройство с доступом в сеть Интернет (компьютер, планшет, смартфон);</li>
              <li>
                веб-браузер актуальной версии (Google Chrome, Яндекс.Браузер,
                Mozilla Firefox, Microsoft Edge);
              </li>
              <li>стабильное интернет-соединение;</li>
              <li>
                рекомендуется использование устройства, обеспечивающего корректное
                отображение веб-интерфейса сервиса.
              </li>
            </ul>
            <p>
              Обработка и хранение данных осуществляются на стороне серверной
              инфраструктуры сервиса.
            </p>
          </div>
        </Card>

        {/* 4. Функциональные характеристики */}
        <Card id="features" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            4. Функциональные характеристики
          </h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.1. Семейный календарь</h3>
              <p>
                Ведение общего календаря событий с возможностью добавления, редактирования
                и просмотра мероприятий участниками семейной группы.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.2. Задачи и поручения</h3>
              <p>
                Постановка задач, назначение ответственных, установка сроков и отслеживание
                статуса выполнения.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.3. Списки покупок и бытовых дел</h3>
              <p>
                Формирование и ведение совместных списков покупок и домашних дел
                с возможностью отметки выполненных пунктов.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.4. Планирование мероприятий</h3>
              <p>
                Планирование семейных поездок, праздников, подарков и иных совместных
                мероприятий с фиксацией деталей и состава участников.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.5. Профили членов семьи</h3>
              <p>
                Создание и ведение профилей членов семьи, назначение ролей, управление
                составом семейной группы.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.6. Детские активности</h3>
              <p>
                Планирование и учёт занятий, кружков, мероприятий и иных активностей
                для детей.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.7. Семейные правила и традиции</h3>
              <p>
                Фиксация семейных договорённостей, правил поведения, традиций
                и значимых дат.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.8. Хранение материалов</h3>
              <p>
                Сохранение заметок, рецептов и иных пользовательских материалов
                в структурированном виде.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.9. Уведомления и напоминания</h3>
              <p>
                Формирование уведомлений и напоминаний о предстоящих событиях,
                задачах и важных датах.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.10. Аналитика</h3>
              <p>
                Просмотр сводной информации об активности пользователей, выполненных
                задачах и предстоящих событиях.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4.11. Рекомендательные механизмы</h3>
              <p>
                Предоставление вспомогательных подсказок и рекомендаций для упрощения
                планирования и организации совместной семейной деятельности.
              </p>
            </div>

          </div>
        </Card>

        {/* 5. Порядок работы */}
        <Card id="usage" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            5. Порядок работы с программным обеспечением
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>Пользователь может выполнять следующие действия:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>просматривать и добавлять события в семейный календарь;</li>
              <li>создавать и назначать задачи;</li>
              <li>вести списки покупок и бытовых дел;</li>
              <li>просматривать и редактировать профили членов семьи;</li>
              <li>работать с заметками, рецептами и иными пользовательскими материалами;</li>
              <li>просматривать уведомления и напоминания.</li>
            </ul>
            <p>
              Пользовательские данные сохраняются штатными средствами сервиса
              при выполнении соответствующих операций.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <p className="font-bold text-gray-900 mb-2">Ограничения:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>для работы с программным обеспечением требуется доступ к сети Интернет;</li>
                <li>
                  не рекомендуется одновременное редактирование одних и тех же данных
                  из нескольких сессий одной учётной записи.
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 6. Жизненный цикл */}
        <Card id="lifecycle" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            6. Поддержка жизненного цикла
          </h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">

            <div>
              <h3 className="font-bold text-gray-900 mb-2">6.1. Общие положения</h3>
              <p>
                Поддержка жизненного цикла программного обеспечения «Наша Семья»
                обеспечивается правообладателем — ИП Кузьменко Анастасия Вячеславовна.
                Поддержка включает исправление ошибок, обновление и развитие
                функциональных возможностей, обеспечение работоспособности сервиса.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">6.2. Исправление ошибок</h3>
              <p>
                Выявленные ошибки классифицируются по степени влияния на
                работоспособность сервиса. Ошибки, влияющие на доступность или
                корректность функционирования, устраняются в приоритетном порядке.
                Прочие ошибки исправляются по мере необходимости.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">6.3. Обновление и совершенствование</h3>
              <p>
                Обновление функциональных возможностей выполняется по мере
                необходимости. Изменения, как правило, вносятся без прерывания
                доступа к сервису; при необходимости могут проводиться регламентные
                работы. Пользователи уведомляются о значимых изменениях
                при необходимости.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">6.4. Резервное копирование данных</h3>
              <p>
                Резервное копирование данных осуществляется в рамках инфраструктуры,
                используемой для размещения сервиса.
              </p>
            </div>

          </div>
        </Card>

        {/* 7. Поддержка */}
        <Card id="support" className="p-8 mb-6 scroll-mt-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            7. Техническая поддержка
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Обращения пользователей принимаются по адресу электронной почты.
              Ответ предоставляется в рабочее время, как правило, в течение
              1 рабочего дня.
            </p>
            <p>
              При необходимости к выполнению отдельных технических работ могут
              привлекаться специалисты на договорной основе.
            </p>
            <p>
              Решение о прекращении поддержки программного обеспечения принимается
              правообладателем. Пользователи уведомляются о таком решении заблаговременно.
            </p>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-400 mt-8 mb-4">
          ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955
        </div>

      </div>
    </div>
  );
}
