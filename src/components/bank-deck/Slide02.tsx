import SlideFrame from './SlideFrame';

const blocks = [
  {
    role: 'Родители',
    emoji: '👨‍👩‍👧',
    color: 'border-indigo-200 bg-indigo-50',
    accent: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    text: 'Нужен не просто контроль расходов, а участие в развитии ребёнка',
  },
  {
    role: 'Дети',
    emoji: '🧒',
    color: 'border-emerald-200 bg-emerald-50',
    accent: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'Нужен понятный, развивающий цифровой опыт — не только «кошелёк»',
  },
  {
    role: 'Банк',
    emoji: '🏦',
    color: 'border-amber-200 bg-amber-50',
    accent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    text: 'Нужен продукт с долгосрочной семейной привязкой, а не разовая карта',
  },
];

export default function Slide02() {
  return (
    <SlideFrame
      id="slide-2"
      eyebrow="02. Почему актуально"
      title="Детская карта — это не только платёжный инструмент"
      tone="accent"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {blocks.map((b) => (
          <div
            key={b.role}
            className={`rounded-2xl border p-6 flex flex-col gap-3 ${b.color}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{b.emoji}</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${b.badge}`}>
                {b.role}
              </span>
            </div>
            <p className={`text-sm sm:text-base font-medium leading-relaxed ${b.accent}`}>
              {b.text}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-2xl px-6 py-5 flex items-start gap-4">
        <span className="text-2xl mt-0.5">💡</span>
        <p className="text-sm sm:text-base leading-relaxed">
          Региональный запуск можно сделать{' '}
          <span className="font-semibold text-indigo-300">социально значимым</span> и{' '}
          <span className="font-semibold text-emerald-300">сильнее стандартного сценария</span>
        </p>
      </div>
    </SlideFrame>
  );
}
