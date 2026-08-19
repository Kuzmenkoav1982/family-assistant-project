import Icon from '@/components/ui/icon';

const usesOfFunds = ['Стоимость разработки интеграций', 'Информационная безопасность', 'Юридический и комплаенс-контур', 'Команда продукта', 'Маркетинг пилота', 'Поддержка пользователей', 'Облачная инфраструктура', 'Требуемый runway'];

const plan = [
  { period: 'Мес. 1–4', title: 'Юридическая и техническая подготовка', desc: 'Due diligence, API, комплаенс, согласия пользователей' },
  { period: 'Мес. 4–10', title: 'Пилот «А7 Семейные цели»', desc: '3 сценария, сбор воронки и unit-экономики' },
  { period: 'Мес. 10–14', title: 'Оценка результатов', desc: 'Конверсия, экономика, решение по стратегической инвестиции' },
  { period: 'Мес. 14–18', title: 'Масштабирование', desc: 'Инвестиция в финансовый хаб, приоритетное присутствие в категориях' },
];

export default function Slide18() {
  return (
    <section
      id="slide-18"
      data-pdf-slide
      className="scroll-mt-20 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 mb-6 sm:mb-8 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 45%, #f97316 130%)' }}
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative">
        <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-orange-200 mb-4">Предложение А7</div>
        <h2 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">
          Стратегическая инвестиция в развитие семейного финансового хаба и совместный пилот на 12–18 месяцев
        </h2>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
          А7 построила инфраструктуру движения денег. «Наша семья» может создать для неё инфраструктуру
          возникновения, планирования и сопровождения семейного финансового спроса.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-200 mb-3 flex items-center gap-1.5">
              <Icon name="Wallet" size={13} /> Размер запроса рассчитывается от
            </p>
            <div className="space-y-1.5">
              {usesOfFunds.map((u) => (
                <div key={u} className="flex items-center gap-2 text-xs text-slate-200">
                  <Icon name="Dot" size={16} className="text-orange-300 shrink-0" />
                  {u}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 backdrop-blur rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-200 mb-3 flex items-center gap-1.5">
              <Icon name="Calendar" size={13} /> План 12–18 месяцев
            </p>
            <div className="space-y-2.5">
              {plan.map((p) => (
                <div key={p.period} className="flex items-start gap-2.5">
                  <span className="text-[10px] font-bold text-orange-300 shrink-0 w-16">{p.period}</span>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{p.title}</p>
                    <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/20">
          <p className="text-white font-semibold text-sm sm:text-base leading-relaxed">
            «Наша семья» остаётся самостоятельной семейной платформой, а А7 становится её якорным финансовым партнёром —
            с доступом к контексту возникновения финансовой потребности задолго до самой операции.
          </p>
        </div>
      </div>
    </section>
  );
}
