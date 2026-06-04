import SlideFrame from './SlideFrame';

type Has = 'yes' | 'partial' | 'no';

interface BenchmarkRow {
  feature: string;
  sber: Has;
  tinkoff: Has;
  vtb: Has;
  alfa: Has;
  ours: Has;
  oursLabel?: string;
}

const rows: BenchmarkRow[] = [
  {
    feature: 'Детская карта',
    sber: 'yes', tinkoff: 'yes', vtb: 'yes', alfa: 'yes',
    ours: 'yes', oursLabel: 'в связке с банком',
  },
  {
    feature: 'Контроль расходов / лимиты',
    sber: 'yes', tinkoff: 'yes', vtb: 'yes', alfa: 'yes',
    ours: 'partial', oursLabel: 'через банк + аналитика',
  },
  {
    feature: 'Задания / накопления / копилка',
    sber: 'no', tinkoff: 'yes', vtb: 'no', alfa: 'no',
    ours: 'yes', oursLabel: 'с целями и мечтой',
  },
  {
    feature: 'Детский UX / личный кабинет ребёнка',
    sber: 'partial', tinkoff: 'yes', vtb: 'no', alfa: 'partial',
    ours: 'yes', oursLabel: 'полноценный кабинет',
  },
  {
    feature: 'Развитие ребёнка как отдельный модуль',
    sber: 'no', tinkoff: 'no', vtb: 'no', alfa: 'no',
    ours: 'yes', oursLabel: '«Паспорт роста»',
  },
  {
    feature: 'Семейный цифровой контур',
    sber: 'no', tinkoff: 'no', vtb: 'no', alfa: 'no',
    ours: 'yes', oursLabel: '5 сценариев',
  },
  {
    feature: 'Достижения / прогресс ребёнка',
    sber: 'no', tinkoff: 'partial', vtb: 'no', alfa: 'no',
    ours: 'yes', oursLabel: 'дипломы, маленькие победы',
  },
  {
    feature: 'Образовательный контент',
    sber: 'partial', tinkoff: 'partial', vtb: 'no', alfa: 'no',
    ours: 'partial', oursLabel: 'этап 2 (Альпина)',
  },
  {
    feature: 'Региональная / локальная программа',
    sber: 'no', tinkoff: 'no', vtb: 'no', alfa: 'no',
    ours: 'yes', oursLabel: 'Ярославль 2026',
  },
];

type CellType = 'competitor' | 'ours';

function Cell({ has, label, type }: { has: Has; label?: string; type: CellType }) {
  if (has === 'yes') {
    const isOurs = type === 'ours';
    return (
      <span className={`inline-flex items-center justify-center w-full`}>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
          isOurs ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {label || '✓'}
        </span>
      </span>
    );
  }
  if (has === 'partial') {
    return (
      <span className="inline-flex items-center justify-center w-full">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
          type === 'ours' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
        }`}>
          {label || 'частично'}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-full text-slate-200 text-base">—</span>
  );
}

const competitors = [
  { key: 'sber' as const, label: 'СберKids' },
  { key: 'tinkoff' as const, label: 'Т-Джуниор' },
  { key: 'vtb' as const, label: 'ВТБ Дети' },
  { key: 'alfa' as const, label: 'Альфа-детям' },
];

export default function SlideAppD() {
  return (
    <SlideFrame
      id="slide-app-d"
      eyebrow="Приложение D"
      title="Рыночный benchmark детских карт"
      subtitle="Сравнение по открытым материалам продуктов, май–июнь 2026"
    >
      <div className="rounded-2xl border border-slate-200 overflow-hidden text-sm">
        <div className="grid bg-slate-900 text-white" style={{ gridTemplateColumns: '1fr repeat(4, 7rem) 10rem' }}>
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Функция</div>
          {competitors.map(c => (
            <div key={c.key} className="px-2 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-center">{c.label}</div>
          ))}
          <div className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-indigo-300 text-center">Наш подход</div>
        </div>

        {rows.map((row, i) => (
          <div
            key={row.feature}
            className={`grid items-center border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
            style={{ gridTemplateColumns: '1fr repeat(4, 7rem) 10rem' }}
          >
            <div className="px-4 py-3 text-sm text-slate-800 font-medium leading-snug">{row.feature}</div>
            {competitors.map(c => (
              <div key={c.key} className="px-2 py-3">
                <Cell has={row[c.key]} type="competitor" />
              </div>
            ))}
            <div className="px-3 py-3 bg-indigo-50/40">
              <Cell has={row.ours} label={row.oursLabel} type="ours" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Вывод:</span> Большинство решений сильны в финансовой функции (карта, лимиты, копилка).
          Семейный контур, развитие ребёнка как отдельный модуль и региональные программы в публичных продуктах представлены фрагментарно или отсутствуют.
          Наш подход расширяет модель до семейного и развивающего контура — это основа для совместного позиционирования.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Источник: открытые условия и описания продуктов на официальных сайтах банков, май–июнь 2026. Данные носят ориентировочный характер.
        </p>
      </div>
    </SlideFrame>
  );
}
