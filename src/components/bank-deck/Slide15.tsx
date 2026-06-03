const actions = [
  {
    num: '1',
    title: 'Согласовать пилотную рамку',
    desc: 'Определить объём, регион, сроки и состав первого пилота',
    color: 'bg-indigo-600',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
  },
  {
    num: '2',
    title: 'Определить формат точки входа',
    desc: 'Банковское приложение, онбординг при выпуске карты или QR / deep link',
    color: 'bg-indigo-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
  },
  {
    num: '3',
    title: 'Зафиксировать первый состав модуля',
    desc: 'Минимальный MVP: финконтроль, цели, привычки — без контентного слоя',
    color: 'bg-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  {
    num: '4',
    title: 'Перейти к пилотному плану работ',
    desc: 'Roadmap, роли, даты, первые артефакты',
    color: 'bg-amber-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
];

export default function Slide15() {
  return (
    <section
      id="slide-15"
      data-pdf-slide
      data-slide-title="Следующий шаг"
      className="scroll-mt-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative">
        <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-indigo-300 mb-4">
          15. Следующий шаг
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold leading-tight mb-8">
          Что предлагаем сделать сейчас
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {actions.map((action) => (
            <div
              key={action.num}
              className="bg-white/8 border border-white/12 backdrop-blur rounded-2xl p-5 flex gap-4"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${action.color}`}>
                {action.num}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base mb-1">{action.title}</h3>
                <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">{action.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <div className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Контакт</div>
            <div className="text-white font-semibold text-base sm:text-lg">Платформа «Наша семья»</div>
            <div className="text-indigo-200 text-sm mt-0.5">Ярославская область · 2026</div>
          </div>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-white font-semibold text-sm sm:text-base hover:bg-white/15 transition cursor-pointer">
            <span>Готовы начать</span>
            <span className="text-lg">→</span>
          </div>
        </div>
      </div>
    </section>
  );
}
