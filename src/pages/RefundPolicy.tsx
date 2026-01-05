import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={18} />
          Назад
        </Button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Политика возврата средств</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Общие положения</h2>
            <p>
              Настоящая Политика возврата средств (далее — «Политика») устанавливает порядок возврата денежных средств 
              за оплаченную подписку Premium на сервис «Наша семья» (далее — «Сервис»).
            </p>
            <p className="mt-3">
              <strong>Исполнитель:</strong> ИП Кузьменко А.В.<br />
              <strong>ОГРНИП:</strong> 325774600908955<br />
              <strong>ИНН:</strong> 231805728780
            </p>
            <p className="mt-3">
              Политика разработана в соответствии с Законом РФ «О защите прав потребителей» и Гражданским кодексом РФ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Условия возврата Premium-подписки</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="font-semibold text-blue-900">Возврат возможен в течение 14 дней с момента оплаты при соблюдении следующих условий:</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Отсутствие использования платных функций:</strong> Пользователь не использовал возможности, доступные только в Premium-тарифе 
                (AI-рекомендации, библиотеку традиций, расширенную аналитику, экспорт данных и т.д.)
              </li>
              <li>
                <strong>Обращение в течение 14 дней:</strong> Запрос на возврат подан не позднее 14 календарных дней с момента оплаты
              </li>
              <li>
                <strong>Наличие платёжных данных:</strong> Пользователь предоставляет информацию для идентификации платежа 
                (дата, сумма, последние 4 цифры карты или email)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Случаи, когда возврат невозможен</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="font-semibold text-red-900">Возврат НЕ производится в следующих ситуациях:</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>Прошло более 14 дней с момента оплаты</li>
              <li>Пользователь воспользовался функциями Premium-тарифа (хотя бы один раз)</li>
              <li>Запрос на возврат не содержит достаточных данных для идентификации платежа</li>
              <li>Подписка была активирована по промокоду или получена бесплатно</li>
              <li>Причина возврата: "Передумал", "Не понравилось" после активного использования Сервиса</li>
              <li>Нарушение Пользовательского соглашения (блокировка аккаунта за нарушения)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Порядок оформления возврата</h2>
            <p className="mb-3">Для возврата средств выполните следующие шаги:</p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Отправьте заявку на email:</strong> payment@nasha-semiya.ru<br />
                <span className="text-sm text-gray-600">Тема письма: "Возврат средств за Premium-подписку"</span>
              </li>
              <li>
                <strong>Укажите в письме:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>ФИО (как при регистрации)</li>
                  <li>Email, использованный при регистрации</li>
                  <li>Дата оплаты</li>
                  <li>Сумма платежа (2400 рублей)</li>
                  <li>Последние 4 цифры карты, с которой была оплата (или номер транзакции)</li>
                  <li>Причина возврата</li>
                  <li>Реквизиты для возврата (номер карты или банковский счёт)</li>
                </ul>
              </li>
              <li>
                <strong>Дождитесь ответа:</strong> Мы рассмотрим заявку в течение 3 рабочих дней и отправим решение на ваш email
              </li>
              <li>
                <strong>Получите возврат:</strong> При одобрении заявки средства вернутся на вашу карту/счёт в течение 5-10 рабочих дней 
                (срок зависит от банка)
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Сроки возврата средств</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Рассмотрение заявки:</strong> до 3 рабочих дней с момента получения</li>
              <li><strong>Возврат на карту/счёт:</strong> 5-10 рабочих дней после одобрения (зависит от банка-эмитента)</li>
              <li><strong>Полный цикл:</strong> обычно не более 14 календарных дней от подачи заявки до зачисления средств</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              ⚠️ Обратите внимание: Исполнитель инициирует возврат в течение 3 рабочих дней после одобрения, 
              но фактическое зачисление средств зависит от вашего банка и платёжной системы (ЮKassa).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Возврат донатов ("Поддержать Домового")</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p>
                <strong>Донаты не подлежат возврату.</strong> Функция "Поддержать Домового" — это добровольное пожертвование 
                на поддержку проекта, а не оплата услуг. Средства, переведённые в качестве доната, не возвращаются 
                в соответствии со ст. 582 ГК РФ (дарение).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Технические ошибки при оплате</h2>
            <p className="mb-3">
              Если произошла техническая ошибка (двойное списание, списание средств без активации Premium), 
              обратитесь на email <strong>support@nasha-semiya.ru</strong> в течение 30 дней:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Опишите проблему</li>
              <li>Приложите скриншот подтверждения оплаты из банка</li>
              <li>Укажите email, использованный при регистрации</li>
            </ul>
            <p className="mt-3">
              Мы проверим информацию и, если ошибка подтвердится, вернём средства или активируем подписку в течение 5 рабочих дней.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Отказ в возврате</h2>
            <p className="mb-3">
              Если ваша заявка на возврат не соответствует условиям настоящей Политики, мы отправим мотивированный отказ на email. 
              В случае несогласия с решением вы вправе:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Обратиться в Роспотребнадзор (ваше право как потребителя)</li>
              <li>Подать претензию в письменном виде на email info@nasha-semiya.ru</li>
              <li>Обратиться в суд в соответствии с законодательством РФ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Изменения в Политике</h2>
            <p>
              Исполнитель вправе вносить изменения в настоящую Политику. Актуальная версия всегда доступна на сайте. 
              Дата последнего обновления указана в начале документа. Изменения вступают в силу с момента публикации.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Контактная информация</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><strong>ИП Кузьменко А.В.</strong></p>
              <p><strong>ОГРНИП:</strong> 325774600908955</p>
              <p><strong>ИНН:</strong> 231805728780</p>
              <p className="mt-3"><strong>Email для вопросов по возврату:</strong> payment@nasha-semiya.ru</p>
              <p className="text-sm text-gray-600 mt-2">Среднее время ответа: 1-3 рабочих дня</p>
            </div>
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