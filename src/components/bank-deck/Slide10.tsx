import SlideFrame from './SlideFrame';

const groups = [
  {
    title: 'Клиентские',
    emoji: '👥',
    color: 'bg-indigo-50 border-indigo-200',
    accent: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    items: [
      'Сильнее ценность детской карты',
      'Рост интереса со стороны семей',
      'Понятный семейный сценарий использования',
    ],
  },
  {
    title: 'Продуктовые',
    emoji: '⚙️',
    color: 'bg-emerald-50 border-emerald-200',
    accent: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    items: [
      'Выше вовлечение в digital-банкинг',
      'Чаще возврат к продукту',
      'Карта = вход в семейную экосистему',
    ],
  },
  {
    title: 'Имиджевые',
    emoji: '🏆',
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    items: [
      'Социально значимый региональный проект',
      'Поддержка семьи и детей: развитие, безопасность, финансовая грамотность',
      'Модуль «Мой край» усиливает локальную привязку пилота и вовлечённость семей',
    ],
  },
  {
    title: 'Долгосрочные',
    emoji: '📈',
    color: 'bg-rose-50 border-rose-200',
    accent: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    items: [
      'Удержание семейной аудитории',
      'Лояльность родителей в горизонте 5–10 лет',
      'Основа для масштабирования',
    ],
  },
];

export default function Slide10() {
  return (
    <SlideFrame
      id="slide-10"
      eyebrow="10. Эффекты для банка"
      title="Что получает банк"
      subtitle="Четыре группы стратегических эффектов от совместного продукта"
      tone="accent"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.title} className={`rounded-2xl border p-5 ${g.color}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{g.emoji}</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${g.badge}`}>
                {g.title}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {g.items.map((item) => (
                <li key={item} className={`text-sm flex items-start gap-2 ${g.accent}`}>
                  <span className="mt-0.5 shrink-0">·</span>
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