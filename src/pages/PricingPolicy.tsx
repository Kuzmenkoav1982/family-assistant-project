import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const PDF_URL = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/docs/nasha-semiya-pricing-policy.pdf';

const AI_SERVICES = [
  { name: 'Генерация ИИ-диеты', price: 17 },
  { name: 'Фото блюда от ИИ', price: 7 },
  { name: 'ИИ-открытка', price: 7 },
  { name: 'Рецепт из продуктов', price: 5 },
  { name: 'Маршрут путешествия ИИ', price: 5 },
  { name: 'Рекомендации досуга', price: 4 },
  { name: 'Анализ развития ребёнка', price: 4 },
  { name: 'AI-ассистент (запрос)', price: 3 },
  { name: 'Домовой — наставник Мастерской жизни', price: 3 },
  { name: 'ИИ-ветеринар (запрос)', price: 3 },
  { name: 'Идеи для события ИИ', price: 3 },
  { name: 'Финансовый совет ИИ', price: 3 },
  { name: 'Оценка развития ребёнка', price: 3 },
  { name: 'Рекомендации для поездки', price: 3 },
  { name: 'Рецепт (короткий)', price: 2 },
];

const TOPUP_AMOUNTS = [100, 300, 500, 1000, 3000];

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
              <strong>https://nasha-semiya.ru</strong>. Базовый доступ к ПО
              предоставляется бесплатно. Стоимость формируется исключительно за
              использование ИИ-функций сервиса.
            </p>
            <p>
              Правообладатель вправе в одностороннем порядке изменять тарифы,
              уведомив пользователей не менее чем за 30 дней до вступления
              изменений в силу.
            </p>
          </div>
        </Card>

        {/* 2. Модель оплаты */}
        <Card id="model" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. Модель оплаты — семейный кошелёк
          </h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Оплата ИИ-функций осуществляется через встроенный механизм
              «Семейный кошелёк»: пользователь пополняет баланс кошелька
              на выбранную сумму, после чего каждая выполненная ИИ-операция
              списывает соответствующую стоимость с баланса.
            </p>
            <p>
              Минимальная сумма пополнения — <strong>50 рублей</strong>.
              Максимальная сумма пополнения за одну операцию — <strong>100 000 рублей</strong>.
            </p>
            <p>Рекомендуемые суммы пополнения (быстрый выбор в интерфейсе):</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {TOPUP_AMOUNTS.map((amount) => (
                <span
                  key={amount}
                  className="inline-block border border-gray-300 rounded px-3 py-1 text-sm font-medium text-gray-700"
                >
                  {amount} ₽
                </span>
              ))}
            </div>
            <p className="mt-3">
              Способы пополнения: банковская карта (через ЮКассу),
              Система быстрых платежей (СБП).
            </p>
            <p>
              Неиспользованный остаток баланса сохраняется без ограничений по сроку.
            </p>
          </div>
        </Card>

        {/* 3. Стоимость ИИ-операций */}
        <Card id="services" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            3. Стоимость ИИ-операций
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Стоимость списывается с баланса кошелька за каждый выполненный запрос.
            Цены указаны в рублях за единицу (1 запрос / 1 результат).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700">
                    № п/п
                  </th>
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
                {AI_SERVICES.map((service, index) => (
                  <tr key={service.name} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-200 p-3 text-gray-500 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 p-3 text-gray-700">
                      {service.name}
                    </td>
                    <td className="border border-gray-200 p-3 text-gray-500">
                      1 запрос
                    </td>
                    <td className="border border-gray-200 p-3 text-right font-medium">
                      {service.price},00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Все цены указаны в рублях Российской Федерации. Пополнение кошелька
            и списание за ИИ-операции отражаются в истории транзакций в разделе
            «Семейный кошелёк» личного кабинета.
          </p>
        </Card>

        {/* 4. Возврат средств */}
        <Card id="refund" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Возврат средств</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Возврат неиспользованного баланса кошелька осуществляется
              в соответствии с Политикой возврата, размещённой по адресу:{' '}
              <strong>https://nasha-semiya.ru/refund-policy</strong>.
            </p>
            <p>
              Средства, списанные за выполненные ИИ-операции, возврату не подлежат.
            </p>
          </div>
        </Card>

        {/* 5. Изменение тарифов */}
        <Card id="changes" className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Порядок изменения тарифов</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Правообладатель вправе изменять стоимость ИИ-операций,
              уведомив пользователей по электронной почте и/или через интерфейс
              сервиса не менее чем за 30 (тридцать) календарных дней до вступления
              изменений в силу.
            </p>
            <p>
              Изменение тарифов не затрагивает уже зачисленный баланс кошелька —
              он продолжает использоваться по актуальным на момент расходования ценам.
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
