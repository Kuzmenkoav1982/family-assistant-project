import Icon from '@/components/ui/icon';

/**
 * SlideTheAsk — финальный слайд инвест-деки.
 *
 * Отвечает на 4 вопроса инвестора:
 *   1. Сколько привлекаем
 *   2. На какой горизонт
 *   3. На что пойдут средства (use of funds)
 *   4. Какие milestones закроем после раунда
 *
 * Без оценки (pre-money) — она обсуждается на встрече.
 * Цифры — рабочие гипотезы, готовы корректироваться под структуру сделки.
 */

const useOfFunds = [
  {
    label: 'Продукт и R&D',
    pct: 40,
    icon: 'Boxes',
    color: 'from-indigo-500 to-purple-600',
    bar: 'bg-indigo-500',
    items: [
      'Мобильные приложения (iOS + Android)',
      'AI-слой второго поколения',
      'Story mode «Альбома поколений»',
      'Расширение платёжного слоя',
    ],
  },
  {
    label: 'Рост и каналы',
    pct: 30,
    icon: 'TrendingUp',
    color: 'from-emerald-500 to-teal-600',
    bar: 'bg-emerald-500',
    items: [
      'Маркетинг и привлечение первых 50К семей',
      'Банк-партнёрство и витрина продуктов',
      'B2B2C через работодателей',
      'Дистрибуция через MAX и партнёров',
    ],
  },
  {
    label: 'Ключевые наймы',
    pct: 20,
    icon: 'Users',
    color: 'from-amber-500 to-orange-600',
    bar: 'bg-amber-500',
    items: [
      'Platform / Backend Lead',
      'Growth / Distribution Lead',
      'Product Design / UX',
      'B2G / Регионы',
    ],
  },
  {
    label: 'Инфраструктура и compliance',
    pct: 10,
    icon: 'ShieldCheck',
    color: 'from-slate-500 to-slate-700',
    bar: 'bg-slate-500',
    items: [
      'Реестр российского ПО',
      'СМЭВ/ЕСИА интеграции',
      'Масштабирование инфраструктуры',
      'Безопасность и 152-ФЗ',
    ],
  },
];

const milestones = [
  {
    icon: 'Rocket',
    title: 'Публичный запуск',
    period: 'Q3 2026',
    target: 'Первые 10 000 семей · регистрация в реестре ПО',
    color: '#10b981',
  },
  {
    icon: 'Landmark',
    title: 'Первая выручка',
    period: 'Q4 2026',
    target: '50 000 семей · ~15 млн ₽/год · банк-партнёр live',
    color: '#f59e0b',
  },
  {
    icon: 'Smartphone',
    title: 'Мобильное приложение',
    period: 'Q1 2027',
    target: '150 000 семей · iOS + Android · B2B-версия',
    color: '#3b82f6',
  },
  {
    icon: 'Building',
    title: 'Национальная платформа',
    period: '2027',
    target: '1 000 000 семей · ~1 млрд ₽/год · региональные пилоты',
    color: '#8b5cf6',
  },
];

export function SlideTheAsk() {
  return (
    <section
      data-pdf-slide
      className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl shadow-2xl p-6 sm:p-10 mb-8 text-white relative overflow-hidden"
    >
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Заголовок */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
            <Icon name="Target" size={26} className="text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Icon name="Sparkles" size={11} />
              The Ask
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Что мы привлекаем — и что закрываем после раунда
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              Seed-раунд для перехода из closed beta к публичной платформе на 1 млн+ семей
            </p>
          </div>
        </div>

        {/* Главные цифры раунда */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider mb-1">
              Привлекаем
            </p>
            <p className="text-3xl font-black">100 млн ₽</p>
            <p className="text-[11px] text-white/70 mt-1">Seed-раунд · обсуждается под структуру</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider mb-1">
              Горизонт
            </p>
            <p className="text-3xl font-black">18 мес</p>
            <p className="text-[11px] text-white/70 mt-1">До следующего раунда / break-even</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider mb-1">
              Цель раунда
            </p>
            <p className="text-3xl font-black">1М семей</p>
            <p className="text-[11px] text-white/70 mt-1">Публичный запуск → национальный охват</p>
          </div>
        </div>

        {/* Use of funds */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="PieChart" size={14} className="text-amber-300" />
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Use of funds
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {useOfFunds.map((f) => (
              <div
                key={f.label}
                className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center`}
                    >
                      <Icon name={f.icon} size={16} className="text-white" />
                    </div>
                    <p className="text-sm font-bold">{f.label}</p>
                  </div>
                  <p className="text-2xl font-black text-amber-300">{f.pct}%</p>
                </div>

                {/* Прогресс-бар */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${f.bar} rounded-full`}
                    style={{ width: `${f.pct}%` }}
                  />
                </div>

                <ul className="space-y-1">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <Icon
                        name="ArrowRight"
                        size={11}
                        className="text-amber-300 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-[11px] text-white/85 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones после раунда */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Flag" size={14} className="text-amber-300" />
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Milestones после раунда
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {milestones.map((m) => (
              <div
                key={m.title}
                className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: m.color }}
                >
                  <Icon name={m.icon} size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  {m.period}
                </p>
                <p className="text-sm font-bold text-white mt-0.5 leading-tight">{m.title}</p>
                <p className="text-[11px] text-white/75 mt-1 leading-snug">{m.target}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing line */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 text-center">
          <p className="text-base sm:text-lg font-bold text-slate-900">
            Продукт работает. Закрываем команду и масштабируем то, что уже доказали.
          </p>
        </div>

        {/* Footnote */}
        <p className="text-[10px] text-white/50 mt-3 text-center leading-relaxed">
          Цифры раунда — рабочие гипотезы и обсуждаются индивидуально под структуру сделки.
          Pre-money и условия — на встрече.
        </p>
      </div>
    </section>
  );
}

export default SlideTheAsk;
