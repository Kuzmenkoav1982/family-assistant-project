import SlideFrame from './SlideFrame';

const benefits = [
  {
    emoji: '🔍',
    title: 'Прозрачность расходов',
    desc: 'Контроль без конфликтов — видеть, куда идут деньги',
  },
  {
    emoji: '🛡️',
    title: 'Безопасность',
    desc: 'Лимиты, уведомления, категории расходов',
  },
  {
    emoji: '📈',
    title: 'Развитие ребёнка',
    desc: 'Участие в росте ребёнка, а не только контроль',
  },
  {
    emoji: '💡',
    title: 'Финансовые привычки',
    desc: 'Мягкое обучение через реальные сценарии',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Единая семейная точка входа',
    desc: 'Всё в одном месте — карта, модуль, история',
  },
  {
    emoji: '🎯',
    title: 'Цели и достижения',
    desc: 'Видеть прогресс ребёнка, поддерживать его',
  },
  {
    emoji: '🏠',
    title: 'Экосистема «Наша семья»',
    desc: 'Доступ к инструментам семейной платформы: развитие, здоровье, память, финансы семьи',
  },
];

export default function Slide05() {
  return (
    <SlideFrame
      id="slide-5"
      eyebrow="05. Ценность для родителя"
      title="Что получает родитель"
      subtitle="Не просто карта для ребёнка — полноценный инструмент семейного участия"
      tone="accent"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition"
          >
            <span className="text-3xl">{b.emoji}</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{b.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}