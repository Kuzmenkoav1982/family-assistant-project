import Icon from '@/components/ui/icon';

const cards = [
  {
    icon: 'Zap' as const,
    title: 'Скорость',
    text: 'Готовая платформа резко сокращает срок вывода на рынок',
  },
  {
    icon: 'ShieldCheck' as const,
    title: 'Снижение риска реализации',
    text: 'Банку не нужно с нуля собирать семейную продуктовую логику, модель данных и оркестрацию',
  },
  {
    icon: 'Crosshair' as const,
    title: 'Контроль клиентского опыта',
    text: 'Если семейный слой влияет на удержание и допродажи — его контроль становится стратегически важным',
  },
  {
    icon: 'Package' as const,
    title: 'Ценность не только в коде',
    text: 'Продуктовая логика, семейная модель данных, оркестрация на базе ИИ, банковские сценарии и команда',
  },
];

export default function Slide10Control() {
  return (
    <section
      id="slide-10"
      data-pdf-slide
      data-slide-title="Почему банку разумно контролировать этот слой"
      className="scroll-mt-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-8 text-white relative overflow-hidden"
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative">
        <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-indigo-300 mb-4">
          Стратегическая логика
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-4xl">
          Банку может быть выгодно не просто использовать этот слой, а
          контролировать его внутри своего контура
        </h2>

        <p className="text-base sm:text-lg text-indigo-200 mb-10 max-w-3xl">
          Если семейный слой становится частью розничного клиентского контура,
          выгоднее не просто стоять в витрине партнёров, а владеть им у себя
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 sm:p-7 hover:bg-white/10 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <Icon name={card.icon} size={22} className="text-slate-900" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-bold mb-1">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 space-y-4 max-w-4xl">
          <p className="text-base sm:text-lg text-white leading-relaxed">
            Поэтому смотреть на «Нашу Семью» можно не только как на партнёрский
            продукт, а как на{' '}
            <span className="text-amber-300 font-semibold">
              возможный стратегический слой для розницы
            </span>
            .
          </p>
          <div className="bg-white/5 border-l-2 border-amber-300/60 pl-4 py-2">
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
              <span className="text-amber-300 font-semibold">Для госбанка:</span>{' '}
              контроль над семейным слоем — это не только коммерческая логика,
              но и возможность встроиться в долгосрочный семейный контур страны
              как системный игрок.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}