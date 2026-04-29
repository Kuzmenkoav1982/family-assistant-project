import Icon from '@/components/ui/icon';

const streams = [
  {
    icon: 'Wallet',
    color: '#8b5cf6',
    bg: '#ede9fe',
    border: '#c4b5fd',
    title: 'Семейный кошелёк (Pay-per-use)',
    share: '40%',
    desc: 'Единый баланс семьи. Пополнение от 50 ₽ через СБП или карту. Платишь только за то, чем пользуешься.',
    metrics: [
      { label: 'ARPU', value: '~200 ₽/мес' },
      { label: 'CAC', value: '500–800 ₽' },
      { label: 'LTV (3 года)', value: '7 200 ₽' },
    ],
  },
  {
    icon: 'Landmark',
    color: '#10b981',
    bg: '#d1fae5',
    border: '#6ee7b7',
    title: 'Банк-партнёр (комиссия)',
    share: '30%',
    desc: 'Контекстное предложение банковских продуктов. 12 точек входа внутри платформы. Комиссия за каждую конверсию.',
    metrics: [
      { label: 'Ипотека/кредиты', value: '0.5–1.5%' },
      { label: 'Страхование', value: '5–10%' },
      { label: 'Карты/счета', value: 'Fix per lead' },
    ],
  },
  {
    icon: 'ShoppingBag',
    color: '#f97316',
    bg: '#ffedd5',
    border: '#fdba74',
    title: 'Маркетплейсы и партнёры',
    share: '20%',
    desc: 'Реферальные комиссии от WB, Озон, Яндекс Маркет, туристических и образовательных сервисов.',
    metrics: [
      { label: 'Маркетплейсы', value: '2–5%' },
      { label: 'Туризм', value: '3–8%' },
      { label: 'Образование', value: '10–15%' },
    ],
  },
  {
    icon: 'Building2',
    color: '#3b82f6',
    bg: '#dbeafe',
    border: '#93c5fd',
    title: 'B2B — корпоративный пакет',
    share: '10%',
    desc: 'Подписка для HR-департаментов и работодателей. Семейная платформа как бонус сотрудникам.',
    metrics: [
      { label: 'Цена', value: '500 ₽/сотр/мес' },
      { label: 'Минимум', value: '50 сотрудников' },
      { label: 'Целевые', value: 'Крупный бизнес' },
    ],
  },
];

const projections = [
  { families: '10 000', wallet: '24 млн ₽', bank: '5 млн ₽', partners: '3 млн ₽', total: '~32 млн ₽', period: '1-й год' },
  { families: '100 000', wallet: '240 млн ₽', bank: '50 млн ₽', partners: '30 млн ₽', total: '~320 млн ₽', period: '2-й год' },
  { families: '1 000 000', wallet: '2.4 млрд ₽', bank: '500 млн ₽', partners: '300 млн ₽', total: '~3.2 млрд ₽', period: '3-й год' },
];

export function SlideBusinessModel() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-purple-600">
          <Icon name="CircleDollarSign" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Бизнес-модель</h2>
          <p className="text-sm text-gray-500 mt-0.5">4 потока выручки — диверсифицированная монетизация</p>
        </div>
      </div>

      {/* Revenue streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {streams.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 border" style={{ backgroundColor: s.bg, borderColor: s.border }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color }}>
                <Icon name={s.icon} size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: s.color }}>
                    {s.share} выручки
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {s.metrics.map((m, j) => (
                <div key={j} className="bg-white/70 rounded-xl p-2 text-center">
                  <p className="text-xs font-bold" style={{ color: s.color }}>{m.value}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Projections table */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Icon name="TrendingUp" size={16} className="text-emerald-500" />
            Прогноз выручки по годам
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Период</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Семей</th>
                <th className="text-right px-3 py-2 text-purple-600 font-medium">Кошелёк</th>
                <th className="text-right px-3 py-2 text-emerald-600 font-medium">Банк</th>
                <th className="text-right px-3 py-2 text-orange-600 font-medium">Партнёры</th>
                <th className="text-right px-4 py-2 text-gray-800 font-bold">Итого</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-2.5 font-semibold text-gray-700">{p.period}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.families}</td>
                  <td className="px-3 py-2.5 text-right text-purple-600">{p.wallet}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-600">{p.bank}</td>
                  <td className="px-3 py-2.5 text-right text-orange-600">{p.partners}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-800">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-3 text-center border border-purple-100">
          <p className="text-lg font-bold text-purple-600">0 ₽</p>
          <p className="text-[10px] text-gray-500">стоимость входа для пользователя</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3 text-center border border-emerald-100">
          <p className="text-lg font-bold text-emerald-600">Win-Win</p>
          <p className="text-[10px] text-gray-500">модель с каждым партнёром</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-3 text-center border border-orange-100">
          <p className="text-lg font-bold text-orange-600">×9</p>
          <p className="text-[10px] text-gray-500">LTV / CAC — окупаемость</p>
        </div>
      </div>
    </section>
  );
}
