import SlideFrame from './SlideFrame';

const blocks = [
  {
    emoji: '🌱',
    title: 'Развитие ребёнка',
    desc: 'Рост, занятия, навыки — фиксируем прогресс',
    color: 'bg-emerald-50 border-emerald-200',
    accent: 'text-emerald-700',
  },
  {
    emoji: '💡',
    title: 'Финансовые цели и навыки',
    desc: 'Копилка, цели, понятные сценарии с деньгами',
    color: 'bg-indigo-50 border-indigo-200',
    accent: 'text-indigo-700',
  },
  {
    emoji: '📚',
    title: 'Финансовая грамотность',
    desc: 'Привычки, объяснения, сценарии',
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-700',
  },
  {
    emoji: '🏆',
    title: 'Цели и достижения',
    desc: 'Маленькие победы, видимый прогресс',
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Семейный контекст',
    desc: 'Истории, традиции, связь с близкими',
    color: 'bg-rose-50 border-rose-200',
    accent: 'text-rose-700',
  },
  {
    emoji: '📖',
    title: 'Контент (этап 2)',
    desc: 'Книги, аудиокниги — партнёрская интеграция после старта пилота',
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-700',
    optional: true,
  },
];

export default function Slide07() {
  return (
    <SlideFrame
      id="slide-7"
      eyebrow="07. Внутри модуля"
      title="Что даёт модуль «Дети» внутри платформы"
      subtitle="Шесть функциональных блоков — от финансов до развития"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((b) => (
          <div
            key={b.title}
            className={`rounded-2xl border p-5 flex flex-col gap-2 ${b.color}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{b.emoji}</span>
              <div>
                <h3 className={`font-bold text-sm sm:text-base ${b.accent}`}>
                  {b.title}
                  {b.optional && (
                    <span className="ml-2 text-xs font-normal opacity-60">(этап 2)</span>
                  )}
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}