import SlideFrame from './SlideFrame';

const benefits = [
  {
    emoji: '🏠',
    title: 'Личный кабинет',
    desc: 'Своё пространство — не родительский контроль, а собственная территория',
  },
  {
    emoji: '💰',
    title: 'Первые навыки',
    desc: 'Обращение с деньгами: получать, тратить, копить — осознанно',
  },
  {
    emoji: '🏆',
    title: 'Достижения и цели',
    desc: 'Рост виден — привычки, прогресс, маленькие победы',
  },
  {
    emoji: '🛡️',
    title: 'Безопасность в важных ситуациях',
    desc: 'Понятные сценарии: пожар, мошенники, интернет — обучающие тесты и экстренная помощь',
  },
  {
    emoji: '📚',
    title: 'Образовательный контент',
    desc: 'Доступ к книгам, аудиокнигам, подборкам по интересам',
  },
  {
    emoji: '🤝',
    title: 'Связь с семьёй',
    desc: 'Поддержка и сопровождение — рядом, без давления',
  },
];

export default function Slide06() {
  return (
    <SlideFrame
      id="slide-6"
      eyebrow="06. Ценность для ребёнка"
      title="Что получает ребёнок"
      subtitle="Цифровое пространство, которое уважает возраст и помогает расти"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition"
          >
            <span className="text-3xl">{b.emoji}</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{b.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-sm text-emerald-800 font-medium">
        Тон: взрослый и уважительный. Не игровой, не упрощённый — развивающий.
      </div>
    </SlideFrame>
  );
}