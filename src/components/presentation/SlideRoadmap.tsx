import Icon from '@/components/ui/icon';

type StageStatus = 'shipped' | 'next' | 'strategic';

const stages: Array<{
  quarter: string;
  period: string;
  status: StageStatus;
  color: string;
  bg: string;
  border: string;
  icon: string;
  title: string;
  items: string[];
  metric?: string;
  revenue?: string;
}> = [
  // ============ УЖЕ РАБОТАЕТ (SHIPPED) ============
  {
    quarter: 'H1 2026',
    period: 'Январь — Июнь',
    status: 'shipped',
    color: '#059669',
    bg: '#d1fae5',
    border: '#6ee7b7',
    icon: 'CheckCircle2',
    title: 'Продукт в production',
    items: [
      '12 хабов · 74 раздела жизни семьи',
      '«Портфолио развития» — карта по 8 сферам',
      '«Альбом поколений» — семейный архив',
      'AI-ассистент «Домовой» + интеграция с Алисой',
    ],
    metric: 'live на nasha-semiya.ru',
  },
  // ============ СЛЕДУЮЩИЕ 2 КВАРТАЛА (NEXT) ============
  {
    quarter: 'Q3 2026',
    period: 'Июль — Сентябрь',
    status: 'next',
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    icon: 'Rocket',
    title: 'Публичный запуск',
    items: [
      'Регистрация в реестре российского ПО',
      'Публичный запуск и маркетинг',
      'Первые 10 000 семей',
      'Партнёрство с 1 банком',
    ],
    metric: '10 000 семей',
    revenue: 'Pre-revenue',
  },
  {
    quarter: 'Q4 2026',
    period: 'Октябрь — Декабрь',
    status: 'next',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: 'TrendingUp',
    title: 'Первая выручка',
    items: [
      'Монетизация: комиссии партнёров и B2G-контракты',
      'Story mode и расширение «Альбома поколений»',
      'Маркетинговая кампания',
      '50 000 семей',
    ],
    metric: '50 000 семей',
    revenue: '~15 млн ₽/год',
  },
  // ============ СТРАТЕГИЧЕСКИЕ РАСШИРЕНИЯ (STRATEGIC) ============
  {
    quarter: 'Q1 2027',
    period: 'Январь — Март',
    status: 'strategic',
    color: '#3b82f6',
    bg: '#eff6ff',
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
    quarter: 'Q2 2027',
    period: 'Апрель — Июнь',
    status: 'strategic',
    color: '#8b5cf6',
    bg: '#f5f3ff',
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
    quarter: 'Q3–Q4 2027',
    period: 'Июль — Декабрь',
    status: 'strategic',
    color: '#e11d48',
    bg: '#fff1f2',
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
    quarter: '2028+',
    period: 'Перспектива',
    status: 'strategic',
    color: '#0d9488',
    bg: '#f0fdfa',
    border: '#5eead4',
    icon: 'Globe',
    title: 'Семейная экосистема',
    items: [
      'Выход в страны СНГ',
      'Стратегический инвестор / M&A',
      'Платформа для государственных программ',
      'IPO или стратегическая сделка',
    ],
    metric: '5 000 000+ семей',
    revenue: 'Экосистема',
  },
];

const STATUS_META: Record<
  StageStatus,
  { label: string; chip: string; chipText: string; description: string }
> = {
  shipped: {
    label: 'Уже работает',
    chip: 'bg-emerald-100 border-emerald-300',
    chipText: 'text-emerald-800',
    description: 'Что уже в production сегодня',
  },
  next: {
    label: 'Следующие 2 квартала',
    chip: 'bg-amber-100 border-amber-300',
    chipText: 'text-amber-800',
    description: 'Ближайший горизонт исполнения',
  },
  strategic: {
    label: 'Стратегические расширения',
    chip: 'bg-violet-100 border-violet-300',
    chipText: 'text-violet-800',
    description: 'Горизонт до 2028+',
  },
};

const SECTIONS: StageStatus[] = ['shipped', 'next', 'strategic'];

export function SlideRoadmap() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <Icon name="Map" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Роадмап развития</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            От уже работающего продукта — к национальной семейной платформе
          </p>
        </div>
      </div>

      {/* Секции */}
      <div className="space-y-6">
        {SECTIONS.map((sectionStatus) => {
          const sectionStages = stages.filter((s) => s.status === sectionStatus);
          if (sectionStages.length === 0) return null;
          const meta = STATUS_META[sectionStatus];

          return (
            <div key={sectionStatus}>
              {/* Заголовок секции */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${meta.chip} ${meta.chipText} text-[11px] font-bold uppercase tracking-wider`}
                >
                  {sectionStatus === 'shipped' && <Icon name="CheckCircle2" size={11} />}
                  {sectionStatus === 'next' && <Icon name="Zap" size={11} />}
                  {sectionStatus === 'strategic' && <Icon name="Telescope" size={11} />}
                  {meta.label}
                </div>
                <span className="text-xs text-gray-500">{meta.description}</span>
              </div>

              {/* Карточки */}
              <div className="space-y-3">
                {sectionStages.map((stage, i) => (
                  <div key={i} className="flex gap-3 md:gap-4 items-start">
                    {/* Quarter label (desktop) */}
                    <div className="hidden md:flex flex-col items-end w-[100px] flex-shrink-0 pt-3">
                      <span className="text-xs font-bold" style={{ color: stage.color }}>
                        {stage.quarter}
                      </span>
                      <span className="text-[10px] text-gray-400 text-right leading-tight mt-0.5">
                        {stage.period}
                      </span>
                    </div>

                    {/* Dot */}
                    <div className="hidden md:flex flex-col items-center flex-shrink-0 pt-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md z-10"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 rounded-2xl p-4 border"
                      style={{ backgroundColor: stage.bg, borderColor: stage.border }}
                    >
                      <div className="md:hidden flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: stage.color }}
                        >
                          {stage.quarter}
                        </span>
                        <span className="text-xs text-gray-500">{stage.period}</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: stage.color }}
                        >
                          <Icon name={stage.icon} size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-sm mb-2">{stage.title}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {stage.items.map((item, j) => (
                              <div key={j} className="flex items-start gap-1.5">
                                <Icon
                                  name="Check"
                                  size={12}
                                  className="mt-0.5 flex-shrink-0"
                                  style={{ color: stage.color }}
                                />
                                <span className="text-xs text-gray-600 leading-relaxed">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right hidden sm:block">
                          {stage.metric && (
                            <div className="text-xs font-bold" style={{ color: stage.color }}>
                              {stage.metric}
                            </div>
                          )}
                          {stage.revenue && (
                            <div className="text-[10px] text-gray-500 mt-0.5">{stage.revenue}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Метрики роста */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Старт', value: '10К', sub: 'семей · план Q3 2026', color: '#10b981' },
          { label: '1 год', value: '150К', sub: 'семей · план Q1 2027', color: '#3b82f6' },
          { label: '2 года', value: '1 млн', sub: 'семей · план 2027', color: '#8b5cf6' },
          { label: '3+ года', value: '5 млн+', sub: 'семей · 2028+', color: '#0d9488' },
        ].map((m, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 text-center border border-gray-100 bg-gray-50"
          >
            <p className="text-[10px] text-gray-400 font-medium mb-1">{m.label}</p>
            <p className="text-xl font-bold" style={{ color: m.color }}>
              {m.value}
            </p>
            <p className="text-[10px] text-gray-500">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white text-center">
        <p className="font-bold text-base mb-1">
          Продукт работает. Нужны ресурсы для масштабирования.
        </p>
        <p className="text-sm text-white/80">
          Платформа в production на nasha-semiya.ru — мы не продаём идею, мы развиваем работающий
          продукт
        </p>
      </div>
    </section>
  );
}

export default SlideRoadmap;
