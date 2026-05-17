import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const columns = [
  {
    title: 'Уже собрано',
    color: 'emerald',
    icon: 'CheckCircle2' as const,
    items: [
      'Ядро платформы',
      '12 продуктовых хабов',
      'Модель данных',
      'Контур ИИ-оркестрации',
    ],
  },
  {
    title: 'Достраиваем под банк',
    color: 'amber',
    icon: 'Hammer' as const,
    items: [
      'Банковские сценарии',
      'Партнёрская витрина',
      'Навигация мер поддержки',
      'Связки с продуктами банка',
      { text: 'Партнёрская витрина и интеграционный слой', highlight: true },
    ],
  },
  {
    title: 'Результат на 6–12 месяцев',
    color: 'indigo',
    icon: 'Trophy' as const,
    items: [
      'Готовый пилотный продукт',
      'Работающий контур интеграции',
      'Измеримые показатели пилота',
      'Основа для расширения формата',
    ],
  },
];

const highlights = [
  'Навигатор мер поддержки и льгот',
  'Сложные жизненные маршруты семьи',
  'Партнёрская витрина / банковские сценарии / интеграционный слой',
];

const colorMap: Record<string, { bg: string; border: string; text: string; chip: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    chip: 'bg-emerald-100 text-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    chip: 'bg-amber-100 text-amber-800',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    chip: 'bg-indigo-100 text-indigo-800',
  },
};

export default function Slide09Roadmap() {
  return (
    <SlideFrame
      id="slide-9"
      eyebrow="Путь к пилоту"
      title="Банк входит не в идею, а в уже собранный фундамент"
      subtitle="До пилота нам нужно не строить всё с нуля, а достроить банковский слой поверх собранного ядра"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, i) => {
          const c = colorMap[col.color];
          return (
            <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-5 sm:p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-9 h-9 rounded-lg bg-white border ${c.border} flex items-center justify-center`}>
                  <Icon name={col.icon} size={18} className={c.text} />
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${c.text}`}>
                  {col.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {col.items.map((item, j) => {
                  const isObj = typeof item === 'object';
                  const text = isObj ? item.text : item;
                  const isHighlight = isObj && item.highlight;
                  return (
                    <li
                      key={j}
                      className={`text-sm leading-snug px-3 py-2 rounded-lg ${
                        isHighlight
                          ? `${c.chip} font-semibold`
                          : 'bg-white/60 text-slate-800'
                      }`}
                    >
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
          Важно для банка
        </div>
        <div className="flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <span
              key={i}
              className="bg-white border border-indigo-200 text-indigo-800 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
