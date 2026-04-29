import Icon from '@/components/ui/icon';

const stages = [
  {
    quarter: 'Q3 2025',
    period: 'Июль — Сентябрь',
    color: '#10b981',
    bg: '#d1fae5',
    border: '#6ee7b7',
    icon: 'Rocket',
    title: 'Публичный запуск',
    items: [
      'Регистрация в реестре российского ПО',
      'Публичный запуск платформы',
      'Первые 10 000 семей',
      'Партнёрство с 1 банком',
    ],
    metric: '10 000 семей',
    revenue: 'Pre-revenue',
  },
  {
    quarter: 'Q4 2025',
    period: 'Октябрь — Декабрь',
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#fcd34d',
    icon: 'TrendingUp',
    title: 'Первая выручка',
    items: [
      'Монетизация — подписка 299 ₽/мес',
      'Интеграция Яндекс Алисы',
      'Маркетинговая кампания',
      '50 000 семей',
    ],
    metric: '50 000 семей',
    revenue: '~15 млн ₽/год',
  },
  {
    quarter: 'Q1 2026',
    period: 'Январь — Март',
    color: '#3b82f6',
    bg: '#dbeafe',
    border: '#93c5fd',
    icon: 'Smartphone',
    title: 'Мобильное приложение',
    items: [
      'iOS + Android приложения',
      'B2B-версия для HR-департаментов',
      'Push-уведомления и офлайн-режим',
      '150 000 семей',
    ],
    metric: '150 000 семей',
    revenue: '~50 млн ₽/год',
  },
  {
    quarter: 'Q2 2026',
    period: 'Апрель — Июнь',
    color: '#8b5cf6',
    bg: '#ede9fe',
    border: '#c4b5fd',
    icon: 'Landmark',
    title: 'Синергия с банком',
    items: [
      'Витрина банковских продуктов live',
      'Масштабирование с банком-партнёром',
      'Реферальная программа',
      '500 000 семей',
    ],
    metric: '500 000 семей',
    revenue: '~300 млн ₽/год',
  },
  {
    quarter: 'Q3–Q4 2026',
    period: 'Июль — Декабрь',
    color: '#e11d48',
    bg: '#ffe4e6',
    border: '#fda4af',
    icon: 'Building',
    title: 'Национальная платформа',
    items: [
      'Региональный пилот с госпрограммой',
      'API для партнёров',
      'Интеграция с порталом Госуслуг',
      '1 000 000 семей',
    ],
    metric: '1 000 000 семей',
    revenue: '~1 млрд ₽/год',
  },
  {
    quarter: '2027+',
    period: 'Перспектива',
    color: '#0d9488',
    bg: '#ccfbf1',
    border: '#5eead4',
    icon: 'Globe',
    title: 'Экосистема №1',
    items: [
      'Выход в страны СНГ',
      'Стратегический инвестор / M&A',
      'Платформа для гос. программ',
      'IPO или стратегическая сделка',
    ],
    metric: '5 000 000+ семей',
    revenue: 'Экосистема',
  },
];

export function SlideRoadmap() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <Icon name="Map" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Роадмап развития</h2>
          <p className="text-sm text-gray-500 mt-0.5">От публичного запуска до национальной экосистемы</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="hidden md:block absolute left-[116px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 to-teal-300" />

        <div className="space-y-4">
          {stages.map((stage, i) => (
            <div key={i} className="flex gap-4 md:gap-6 items-start">
              {/* Quarter label */}
              <div className="hidden md:flex flex-col items-end w-[100px] flex-shrink-0 pt-3">
                <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.quarter}</span>
                <span className="text-[10px] text-gray-400 text-right leading-tight mt-0.5">{stage.period}</span>
              </div>

              {/* Dot */}
              <div className="hidden md:flex flex-col items-center flex-shrink-0 pt-3">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-md z-10" style={{ backgroundColor: stage.color }} />
              </div>

              {/* Card */}
              <div
                className="flex-1 rounded-2xl p-4 border"
                style={{ backgroundColor: stage.bg, borderColor: stage.border }}
              >
                {/* Mobile header */}
                <div className="md:hidden flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: stage.color }}>
                    {stage.quarter}
                  </span>
                  <span className="text-xs text-gray-500">{stage.period}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stage.color }}>
                    <Icon name={stage.icon} size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-2">{stage.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {stage.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0" style={{ color: stage.color }} />
                          <span className="text-xs text-gray-600 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right hidden sm:block">
                    <div className="text-xs font-bold" style={{ color: stage.color }}>{stage.metric}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{stage.revenue}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth metrics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Старт', value: '10К', sub: 'семей', color: '#10b981' },
          { label: '1 год', value: '150К', sub: 'семей', color: '#3b82f6' },
          { label: '2 года', value: '1 млн', sub: 'семей', color: '#8b5cf6' },
          { label: '3+ года', value: '5 млн+', sub: 'семей', color: '#0d9488' },
        ].map((m, i) => (
          <div key={i} className="rounded-2xl p-4 text-center border border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 font-medium mb-1">{m.label}</p>
            <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[10px] text-gray-500">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white text-center">
        <p className="font-bold text-base mb-1">MVP готов. Нужны ресурсы для масштабирования.</p>
        <p className="text-sm text-white/80">
          Платформа работает в production на nasha-semiya.ru — мы не продаём идею, мы продаём готовый продукт
        </p>
      </div>
    </section>
  );
}
