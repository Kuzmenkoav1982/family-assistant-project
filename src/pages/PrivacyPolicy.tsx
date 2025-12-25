import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={18} />
          Назад
        </Button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Политика конфиденциальности</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты 
              персональных данных пользователей сервиса «Наша семья» (далее — «Сервис»).
            </p>
            <p className="mt-3">
              <strong>Оператор персональных данных:</strong> ИП Кузьменко Анастасия Вячеславовна<br />
              <strong>ОГРНИП:</strong> 325774600908955<br />
              <strong>ИНН:</strong> 231805728780
            </p>
            <p className="mt-3">
              Используя Сервис, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны с этими 
              условиями, пожалуйста, не используйте Сервис.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Сбор информации</h2>
            <p className="mb-3">Мы собираем следующие категории информации:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Регистрационные данные:</strong> имя, адрес электронной почты, номер телефона
              </li>
              <li>
                <strong>Профильная информация:</strong> данные о членах семьи, включая имена, даты рождения, 
                фотографии, роли в семье
              </li>
              <li>
                <strong>Контент пользователя:</strong> задачи, события календаря, рецепты, заметки, 
                сообщения в чате, жалобы
              </li>
              <li>
                <strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система, 
                данные об использовании Сервиса
              </li>
              <li>
                <strong>Данные детей:</strong> информация о развитии детей, результаты тестирований, 
                планы развития (только с согласия родителей/опекунов)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Использование информации</h2>
            <p className="mb-3">Мы используем собранную информацию для:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Предоставления и улучшения функциональности Сервиса</li>
              <li>Персонализации пользовательского опыта</li>
              <li>Обработки запросов и технической поддержки</li>
              <li>Анализа использования Сервиса и улучшения его работы</li>
              <li>Предоставления рекомендаций с использованием ИИ-технологий</li>
              <li>Обеспечения безопасности и предотвращения мошенничества</li>
              <li>Соблюдения законодательных требований</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Защита персональных данных</h2>
            <p>
              Мы применяем современные технические и организационные меры для защиты ваших персональных данных:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Шифрование данных при передаче (SSL/TLS)</li>
              <li>Шифрование данных при хранении</li>
              <li>Регулярное резервное копирование</li>
              <li>Ограниченный доступ к данным только для уполномоченных сотрудников</li>
              <li>Регулярные проверки безопасности и аудит систем</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Передача данных третьим лицам</h2>
            <p className="mb-3">
              Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением следующих случаев:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>С вашего явного согласия</li>
              <li>Поставщикам услуг, которые помогают нам в работе Сервиса (хостинг, аналитика, ИИ-сервисы)</li>
              <li>По требованию законодательства или судебных органов</li>
              <li>Для защиты наших прав, собственности или безопасности пользователей</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Права пользователей</h2>
            <p className="mb-3">Вы имеете право:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Получать доступ к своим персональным данным</li>
              <li>Исправлять неточные или неполные данные</li>
              <li>Удалять свои персональные данные («право на забвение»)</li>
              <li>Ограничивать обработку данных</li>
              <li>Возражать против обработки данных</li>
              <li>Получать копию своих данных в структурированном формате</li>
              <li>Отозвать согласие на обработку данных в любое время</li>
            </ul>
            <p className="mt-3">
              Для реализации своих прав обратитесь по адресу: IP.KUZMENKO@YANDEX.RU
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Данные детей</h2>
            <p>
              Мы серьезно относимся к защите данных несовершеннолетних. Обработка данных детей до 18 лет 
              осуществляется только с согласия родителей или законных представителей. Родители имеют право 
              в любое время получить доступ, исправить или удалить данные своих детей.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Файлы cookie</h2>
            <p>
              Мы используем файлы cookie и аналогичные технологии для улучшения работы Сервиса, 
              анализа использования и персонализации контента. Вы можете управлять настройками cookie 
              в своем браузере.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Хранение данных</h2>
            <p>
              Мы храним ваши персональные данные только в течение необходимого срока для достижения 
              целей обработки или в соответствии с требованиями законодательства. После удаления 
              аккаунта ваши данные будут удалены в течение 90 дней.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Изменения в Политике</h2>
            <p>
              Мы можем периодически обновлять настоящую Политику. О существенных изменениях мы уведомим 
              вас по электронной почте или через уведомления в Сервисе. Дата последнего обновления 
              указана в начале документа.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Контактная информация</h2>
            <p className="mb-3">
              По вопросам, связанным с обработкой персональных данных, обращайтесь:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><strong>Оператор ПДн:</strong> ИП Кузьменко Анастасия Вячеславовна</p>
              <p><strong>ОГРНИП:</strong> 325774600908955</p>
              <p><strong>ИНН:</strong> 231805728780</p>
              <p><strong>Email:</strong> IP.KUZMENKO@YANDEX.RU</p>
              <p className="mt-2 text-sm text-gray-600">Юридический адрес указан в ЕГРИП. По вопросам защиты персональных данных обращайтесь на указанный email.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Применимое законодательство</h2>
            <p>
              Настоящая Политика регулируется законодательством Российской Федерации, 
              включая Федеральный закон № 152-ФЗ «О персональных данных».
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Button
            onClick={() => navigate(-1)}
            variant="default"
            size="lg"
            className="w-full md:w-auto"
          >
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Вернуться назад
          </Button>
        </div>
      </div>
    </div>
  );
}