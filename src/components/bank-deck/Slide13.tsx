import SlideFrame from './SlideFrame';

const columns = [
  {
    title: 'С нашей стороны',
    emoji: '🧑‍💻',
    color: 'bg-indigo-50 border-indigo-200',
    accent: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    items: [
      'Product / PM',
      'Дизайнер интерфейсов',
      'Frontend-разработка',
      'Контент и редакция',
      'Roadmap и приоритизация',
    ],
  },
  {
    title: 'Со стороны банка',
    emoji: '🏦',
    color: 'bg-emerald-50 border-emerald-200',
    accent: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    items: [
      'Product Owner',
      'Digital / Mobile команда',
      'IT-интеграция',
      'Юридическое сопровождение',
      'Маркетинг и коммуникации',
    ],
  },
  {
    title: 'Партнёры',
    emoji: '🤝',
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    optional: true,
    items: [
      'Библиотека / контент-партнёр',
      'Лицензирование материалов',
      'Редакционная рамка',
    ],
  },
];

export default function Slide13() {
  return (
    <SlideFrame
      id="slide-13"
      eyebrow="13. Ресурсы и роли"
      title="Ресурсы и зоны ответственности"
      subtitle="Чёткое разделение ролей между командами на старте"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.title} className={`rounded-2xl border p-5 flex flex-col gap-4 ${col.color}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{col.emoji}</span>
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${col.badge}`}>
                  {col.title}
                </div>
                {col.optional && (
                  <div className="text-xs text-slate-400 mt-0.5">опционально</div>
                )}
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {col.items.map((item) => (
                <li key={item} className={`text-sm flex items-start gap-2 ${col.accent}`}>
                  <span className="mt-0.5 shrink-0 font-bold">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
