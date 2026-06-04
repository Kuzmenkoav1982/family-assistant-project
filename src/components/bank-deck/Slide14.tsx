import SlideFrame from './SlideFrame';

const kpis = [
  {
    emoji: '📊',
    label: '% подключений модуля',
    desc: 'Доля активаций к числу выпущенных детских карт',
    target: 'Цель пилота: ≥ 30%',
    color: 'border-indigo-200 bg-indigo-50',
    accent: 'text-indigo-700',
    targetColor: 'text-indigo-500',
  },
  {
    emoji: '👨‍👩‍👧',
    label: 'Доля активированных семей',
    desc: 'Прошли онбординг и совершили первое действие',
    target: 'Цель пилота: ≥ 50% от подключившихся',
    color: 'border-blue-200 bg-blue-50',
    accent: 'text-blue-700',
    targetColor: 'text-blue-500',
  },
  {
    emoji: '📅',
    label: 'MAU раздела «Дети»',
    desc: 'Ежемесячно активные пользователи детского модуля',
    target: 'Цель пилота: ≥ 200 семей в мес.',
    color: 'border-emerald-200 bg-emerald-50',
    accent: 'text-emerald-700',
    targetColor: 'text-emerald-500',
  },
  {
    emoji: '🔄',
    label: 'Retention 30 дней',
    desc: 'Доля семей, вернувшихся в сервис через 30 дней',
    target: 'Цель пилота: ≥ 40%',
    color: 'border-violet-200 bg-violet-50',
    accent: 'text-violet-700',
    targetColor: 'text-violet-500',
  },
  {
    emoji: '📱',
    label: 'Глубина сессии',
    desc: 'Среднее число экранов / действий за сессию',
    target: 'Цель пилота: ≥ 4 действия',
    color: 'border-teal-200 bg-teal-50',
    accent: 'text-teal-700',
    targetColor: 'text-teal-500',
  },
  {
    emoji: '👁️',
    label: 'Вовлечённость родителей',
    desc: 'Регулярно проверяют прогресс ребёнка (≥ 2 раза в нед.)',
    target: 'Цель пилота: ≥ 35%',
    color: 'border-amber-200 bg-amber-50',
    accent: 'text-amber-700',
    targetColor: 'text-amber-500',
  },
  {
    emoji: '🎯',
    label: 'Постановка целей ребёнку',
    desc: 'Семьи, создавшие хотя бы 1 цель / копилку мечты',
    target: 'Цель пилота: ≥ 60%',
    color: 'border-orange-200 bg-orange-50',
    accent: 'text-orange-700',
    targetColor: 'text-orange-500',
  },
  {
    emoji: '⭐',
    label: 'NPS / удовлетворённость',
    desc: 'Индекс лояльности по итогу 1-го месяца пилота',
    target: 'Цель пилота: NPS ≥ 45',
    color: 'border-rose-200 bg-rose-50',
    accent: 'text-rose-700',
    targetColor: 'text-rose-500',
  },
];

export default function Slide14() {
  return (
    <SlideFrame
      id="slide-14"
      eyebrow="14. KPI пилота"
      title="Как измерять результат пилота"
      subtitle="Восемь ключевых метрик для оценки первого этапа"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-2xl border p-4 flex flex-col gap-2 ${kpi.color}`}
          >
            <span className="text-2xl">{kpi.emoji}</span>
            <h3 className={`font-bold text-sm leading-snug ${kpi.accent}`}>{kpi.label}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{kpi.desc}</p>
            <p className={`text-xs font-semibold mt-auto pt-1 border-t border-white/60 ${kpi.targetColor}`}>
              {kpi.target}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">
        Целевые значения — ориентиры для пилотного периода, корректируются совместно при запуске
      </p>
    </SlideFrame>
  );
}