import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const PDF_URL = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/docs/nasha-semiya-pricing-policy.pdf';

const TARIFFS = [
  {
    name: 'Базовый',
    price: 299,
    period: 'месяц',
    unit: '1 лицензия на семейную группу / 1 месяц',
    features: [
      'До 5 членов семьи',
      'Семейный календарь',
      'Задачи и поручения',
      'Списки покупок и дел',
      'Техническая поддержка по электронной почте',
    ],
  },
  {
    name: 'Семейный',
    price: 799,
    period: '3 месяца',
    unit: '1 лицензия на семейную группу / 3 месяца',
    features: [
      'До 10 членов семьи',
      'Все функции тарифа «Базовый»',
      'Рецепты и меню',
      'Голосования',
      'Учёт здоровья детей',
      'Приоритетная техническая поддержка',
    ],
  },
  {
    name: 'Премиум',
    price: 2499,
    period: '12 месяцев',
    unit: '1 лицензия на семейную группу / 12 месяцев',
    features: [
      'Неограниченное число членов семьи',
      'Все функции тарифа «Семейный»',
      'ИИ-помощник «Домовой»',
      'Планирование путешествий',
      'Аналитика и отчёты',
      'Экспорт данных',
      'Семейное древо',
      'Поддержка VIP 24/7',
    ],
  },
];

export default function PricingPolicy() {
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
            Тарифная политика программного обеспечения «Наша Семья»
          </h1>
          <p className="text-gray-600">
            Правообладатель: ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955
          </p>
          <p className="text-gray-500 text-sm mt-1">Редакция от 09.06.2026</p>
        </div>

        {/* Скачать PDF */}
        <Card className="p-6 mb-8 border border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Тарифная политика (PDF)
            </h2>
            <p className="text-sm text-gray-600">
              Официальный документ для скачивания. Версия 1.0 · 09.06.2026
            </p>
          </div>
          <Button asChild>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="Download" className="w-4 h-4 mr-2" />
              Скачать PDF
            </a>
          </Button>
        </Card>

        {/* 1. Общие положения */}
        <Card id="general" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Общие положения</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Настоящий документ определяет тарифную политику программного обеспечения
              «Наша Семья» (далее — ПО), правообладателем которого является
              ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955.
            </p>
            <p>
              ПО предоставляется в формате интернет-сервиса (SaaS) по адресу:{' '}
              <strong>https://nasha-semiya.ru</strong>.
            </p>
            <p>
              Стоимость использования ПО формируется в соответствии с настоящей тарифной
              политикой. Правообладатель вправе в одностороннем порядке изменять тарифы,
              уведомив пользователей не менее чем за 30 дней до вступления изменений в силу.
            </p>
          </div>
        </Card>

        {/* 2. Порядок лицензирования */}
        <Card id="licensing" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Порядок лицензирования</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Лицензия предоставляется на одну семейную группу на срок, соответствующий
              выбранному тарифному плану. Оплата производится единовременно за весь
              период лицензии.
            </p>
            <p>
              Право использования ПО возникает с момента зачисления оплаты и действует
              в течение оплаченного периода. По истечении срока лицензия может быть
              продлена на тех же или изменённых условиях.
            </p>
            <p>
              Передача лицензии третьим лицам не допускается.
            </p>
          </div>
        </Card>

        {/* 3. Тарифные планы */}
        <Card id="plans" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Тарифные планы</h2>
          <div className="space-y-6">
            {TARIFFS.map((tariff) => (
              <div key={tariff.name} className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{tariff.name}</h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-700">
                      {tariff.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-gray-500 text-sm ml-1">/ {tariff.period}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{tariff.unit}</p>
                <ul className="space-y-1">
                  {tariff.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-gray-700 text-sm">
                      <Icon name="Check" className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Итоговая таблица */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700">
                    Наименование тарифицируемой позиции
                  </th>
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700">
                    Единица
                  </th>
                  <th className="border border-gray-200 p-3 text-right font-semibold text-gray-700">
                    Стоимость (руб.)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-3 text-gray-700">
                    Лицензия «Базовый»
                  </td>
                  <td className="border border-gray-200 p-3 text-gray-500">1 семейная группа / 1 месяц</td>
                  <td className="border border-gray-200 p-3 text-right font-medium">299,00</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-700">
                    Лицензия «Семейный»
                  </td>
                  <td className="border border-gray-200 p-3 text-gray-500">1 семейная группа / 3 месяца</td>
                  <td className="border border-gray-200 p-3 text-right font-medium">799,00</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 text-gray-700">
                    Лицензия «Премиум»
                  </td>
                  <td className="border border-gray-200 p-3 text-gray-500">1 семейная группа / 12 месяцев</td>
                  <td className="border border-gray-200 p-3 text-right font-medium">2 499,00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Все цены указаны в рублях Российской Федерации, включая НДС в соответствии
            с применимым налоговым режимом правообладателя.
          </p>
        </Card>

        {/* 4. Порядок оплаты */}
        <Card id="payment" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Порядок оплаты</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Оплата производится в безналичной форме через платёжные сервисы,
              подключённые к сервису «Наша Семья». Доступные способы оплаты отображаются
              в личном кабинете пользователя в разделе «Кошелёк».
            </p>
            <p>
              Возврат денежных средств осуществляется в соответствии с Политикой
              возврата, размещённой по адресу:{' '}
              <strong>https://nasha-semiya.ru/refund-policy</strong>.
            </p>
          </div>
        </Card>

        {/* 5. Изменение тарифов */}
        <Card id="changes" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Порядок изменения тарифов</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Правообладатель вправе изменять тарифы, уведомив пользователей
              по электронной почте и/или через интерфейс сервиса не менее чем за 30
              (тридцать) календарных дней до вступления изменений в силу.
            </p>
            <p>
              Изменение тарифов не распространяется на уже оплаченные периоды.
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
