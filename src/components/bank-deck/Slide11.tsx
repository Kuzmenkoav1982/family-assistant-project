import SlideFrame from './SlideFrame';

const rows = [
  {
    feature: 'Детская карта',
    market: { has: true, label: '✓' },
    ours: { has: true, label: '✓' },
  },
  {
    feature: 'Контроль расходов + лимиты',
    market: { has: true, label: '✓' },
    ours: { has: true, label: '✓' },
  },
  {
    feature: 'Задания / накопления / цели',
    market: { has: 'partial', label: 'частично' },
    ours: { has: true, label: '✓' },
  },
  {
    feature: 'Развитие ребёнка как модуль',
    market: { has: false, label: '—' },
    ours: { has: true, label: '✓' },
  },
  {
    feature: 'Семейный цифровой контур',
    market: { has: false, label: '—' },
    ours: { has: true, label: '✓' },
  },
  {
    feature: 'Библиотека / аудиокниги / контент',
    market: { has: false, label: '—' },
    ours: { has: 'stage2', label: '✓ (этап 2)' },
  },
  {
    feature: 'Региональная семейная программа',
    market: { has: false, label: '—' },
    ours: { has: true, label: '✓' },
  },
];

function Cell({ value }: { value: { has: boolean | string; label: string } }) {
  if (value.has === true) {
    return (
      <span className="inline-flex items-center justify-center w-full">
        <span className="bg-emerald-100 text-emerald-700 font-bold text-sm px-3 py-1 rounded-full">
          {value.label}
        </span>
      </span>
    );
  }
  if (value.has === 'stage2') {
    return (
      <span className="inline-flex items-center justify-center w-full">
        <span className="bg-amber-100 text-amber-700 font-semibold text-xs px-3 py-1 rounded-full">
          {value.label}
        </span>
      </span>
    );
  }
  if (value.has === 'partial') {
    return (
      <span className="inline-flex items-center justify-center w-full">
        <span className="bg-slate-100 text-slate-500 font-medium text-xs px-3 py-1 rounded-full">
          {value.label}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-full">
      <span className="text-slate-300 font-light text-lg">{value.label}</span>
    </span>
  );
}

export default function Slide11() {
  return (
    <SlideFrame
      id="slide-11"
      eyebrow="11. Наше отличие"
      title="На рынке — карта и контроль. Мы предлагаем больше."
    >
      <p className="text-xs text-slate-400 mb-6">
        По предварительной рыночной рамке большинство детских банковских продуктов
        ограничены финансовыми функциями
      </p>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto] bg-slate-900 text-white">
          <div className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            Функция
          </div>
          <div className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 text-center w-36 sm:w-44">
            Стандартный рынок
          </div>
          <div className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-indigo-300 text-center w-40 sm:w-52">
            Наш совместный формат
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={row.feature}
            className={`grid grid-cols-[1fr_auto_auto] items-center border-t border-slate-100 ${
              i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
            }`}
          >
            <div className="px-5 py-3.5 text-sm text-slate-800 font-medium">{row.feature}</div>
            <div className="px-5 py-3.5 w-36 sm:w-44">
              <Cell value={row.market} />
            </div>
            <div className="px-5 py-3.5 w-40 sm:w-52 bg-indigo-50/40">
              <Cell value={row.ours} />
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
