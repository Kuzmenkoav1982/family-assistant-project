import SlideFrame from './SlideFrame';

const kpis = [
  {
    emoji: '📊',
    label: '% подключений модуля',
    desc: 'Доля активаций к числу выпущенных детских карт',
    color: 'border-indigo-200 bg-indigo-50',
    accent: 'text-indigo-700',
  },
  {
    emoji: '👨‍👩‍👧',
    label: 'Доля активированных семей',
    desc: 'Семьи, прошедшие онбординг и совершившие первое действие',
    color: 'border-blue-200 bg-blue-50',
    accent: 'text-blue-700',
  },
  {
    emoji: '📅',
    label: 'MAU раздела «Дети»',
    desc: 'Ежемесячно активные пользователи детского модуля',
    color: 'border-emerald-200 bg-emerald-50',
    accent: 'text-emerald-700',
  },
  {
    emoji: '📱',
    label: 'Глубина использования',
    desc: 'Среднее число экранов / действий за сессию',
    color: 'border-teal-200 bg-teal-50',
    accent: 'text-teal-700',
  },
  {
    emoji: '🔄',
    label: 'Retention',
    desc: 'Доля семей, вернувшихся в сервис через 7 и 30 дней',
    color: 'border-violet-200 bg-violet-50',
    accent: 'text-violet-700',
  },
  {
    emoji: '👁️',
    label: 'Вовлечённость родителей',
    desc: 'Доля родителей, регулярно проверяющих прогресс ребёнка',
    color: 'border-amber-200 bg-amber-50',
    accent: 'text-amber-700',
  },
  {
    emoji: '📚',
    label: 'Использование контентного слоя',
    desc: 'Открытия книг / аудиокниг в расчёте на активную семью',
    color: 'border-orange-200 bg-orange-50',
    accent: 'text-orange-700',
  },
  {
    emoji: '⭐',
    label: 'NPS / обратная связь',
    desc: 'Индекс лояльности и качественные отзывы семей',
    color: 'border-rose-200 bg-rose-50',
    accent: 'text-rose-700',
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
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
