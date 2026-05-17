import Icon from '@/components/ui/icon';

const tracks = [
  {
    label: 'Трек А',
    icon: 'Rocket' as const,
    title: 'Практический',
    color: 'from-emerald-500 to-teal-600',
    points: [
      'Куратор со стороны розницы',
      'Рабочая группа на 2–3 недели',
      'Проработка 1–2 стартовых сценариев',
      'Определение формата запуска пилота',
    ],
  },
  {
    label: 'Трек Б',
    icon: 'Compass' as const,
    title: 'Стратегический',
    color: 'from-indigo-500 to-purple-600',
    points: [
      'Разбор стратегического соответствия',
      'Более глубокий разговор о встраивании платформы в контур банка',
      'При интересе — подключение команды стратегического развития',
    ],
  },
];

export default function Slide13NextStep() {
  return (
    <section
      id="slide-13"
      data-pdf-slide
      data-slide-title="Следующий шаг"
      className="scroll-mt-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative">
        <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-indigo-300 mb-4">
          Следующий шаг
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-10 max-w-4xl">
          Предлагаем определить правильный следующий шаг
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
          {tracks.map((t, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur border border-white/15 rounded-2xl overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${t.color} px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon name={t.icon} size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/80 font-semibold">
                      {t.label}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {t.title}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <ul className="space-y-2.5">
                  {t.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Icon
                        name="ArrowRight"
                        size={16}
                        className="text-amber-300 mt-1 shrink-0"
                      />
                      <span className="text-sm sm:text-base text-indigo-50 leading-relaxed">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-sm sm:text-base text-indigo-200 mb-4 max-w-4xl leading-relaxed">
            И с практической, и с институциональной точки зрения это
            своевременный момент для разговора.
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-white max-w-5xl">
            «Мы предлагаем банку не просто партнёрство в семейном сегменте, а
            возможность получить{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              ранний контроль над новым семейным клиентским слоем
            </span>
            .»
          </p>
        </div>
      </div>
    </section>
  );
}