import Icon from '@/components/ui/icon';

/**
 * Слайд: «Живые петли между модулями».
 * Демонстрирует, что у продукта уже есть реальные межмодульные связи —
 * это превращает набор хабов в единый организм.
 *
 * Также показывает, что Домовой реально видит контекст семьи.
 */

const LOOPS = [
  {
    from: 'Дом',
    fromIcon: 'Building',
    fromColor: 'bg-amber-100 text-amber-700',
    to: 'Финансы',
    toIcon: 'Wallet',
    toColor: 'bg-emerald-100 text-emerald-700',
    title: 'Оплатил коммуналку → расход в бюджете',
    desc: 'Отметка «оплачено» атомарно создаёт расход в категории «Жильё и ЖКХ». Снимаешь отметку — расход исчезает.',
    status: 'live',
  },
  {
    from: 'Покупки',
    fromIcon: 'ShoppingCart',
    fromColor: 'bg-orange-100 text-orange-700',
    to: 'Финансы',
    toIcon: 'Wallet',
    toColor: 'bg-emerald-100 text-emerald-700',
    title: 'Купил с указанной ценой → расход в бюджете',
    desc: '«Куплено» с ценой создаёт расход в категории «Продукты». Без цены — товар просто помечается купленным.',
    status: 'live',
  },
  {
    from: 'Поездки',
    fromIcon: 'Plane',
    fromColor: 'bg-sky-100 text-sky-700',
    to: 'Финансы',
    toIcon: 'Wallet',
    toColor: 'bg-emerald-100 text-emerald-700',
    title: 'Бюджет поездки → реальные расходы',
    desc: 'Запланированный бюджет превращается в плановые расходы по категориям, фактические сразу попадают в общий бюджет.',
    status: 'next',
  },
  {
    from: 'Гараж',
    fromIcon: 'Car',
    fromColor: 'bg-slate-100 text-slate-700',
    to: 'Финансы',
    toIcon: 'Wallet',
    toColor: 'bg-emerald-100 text-emerald-700',
    title: 'ТО и заправки → расход в бюджете',
    desc: 'Каждая запись о ТО или заправке автоматически попадает в категорию «Транспорт».',
    status: 'next',
  },
];

export const SlideLiveLoops = () => {
  return (
    <section data-pdf-slide className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-6 border border-emerald-100/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Icon name="Link2" size={12} />
          Живой организм, а не набор страниц
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Межмодульные петли и контекстный ИИ
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Действие в одном модуле автоматически меняет картину в другом. Так появляется ощущение единой системы.
        </p>
      </div>

      {/* Петли */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {LOOPS.map((loop, i) => {
          const isLive = loop.status === 'live';
          return (
            <div
              key={i}
              className={`rounded-xl border-2 ${isLive ? 'border-emerald-200 bg-emerald-50/40' : 'border-dashed border-gray-200 bg-gray-50/30'} p-3`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-2 py-1 rounded-lg ${loop.fromColor} flex items-center gap-1 text-[11px] font-semibold`}>
                  <Icon name={loop.fromIcon} size={11} />
                  {loop.from}
                </div>
                <Icon name="ArrowRight" size={14} className="text-gray-400" />
                <div className={`px-2 py-1 rounded-lg ${loop.toColor} flex items-center gap-1 text-[11px] font-semibold`}>
                  <Icon name={loop.toIcon} size={11} />
                  {loop.to}
                </div>
                <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isLive ? 'LIVE' : 'NEXT'}
                </span>
              </div>
              <div className="text-[13px] font-bold text-gray-900 leading-tight">{loop.title}</div>
              <div className="text-[11px] text-gray-600 leading-snug mt-1">{loop.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Технические гарантии */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/70 p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="ShieldCheck" size={14} className="text-emerald-600" />
          <span className="text-[12px] font-bold text-gray-900">Технические гарантии целостности</span>
        </div>
        <div className="text-[11px] text-gray-600 leading-snug">
          UNIQUE INDEX (source_type, source_id) · CHECK constraint на словарь источников · атомарные транзакции с SELECT FOR UPDATE.
          Параллельная оплата от двух членов семьи не создаёт дубликата.
        </div>
      </div>

      {/* Домовой видит контекст */}
      <div className="rounded-xl bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 border border-violet-200/70 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Brain" size={18} className="text-violet-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[13px] font-bold text-gray-900">Домовой видит вашу семью</span>
              <span className="relative inline-flex flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                <span className="relative block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">LIVE</span>
            </div>
            <p className="text-[12px] text-gray-700 leading-relaxed mb-2">
              Backend-агрегатор <code className="text-[10px] bg-white px-1 py-0.5 rounded border">domovoy-context</code> собирает живой срез семьи (финансы, дом, покупки, задачи, события)
              и передаёт ИИ перед каждым ответом. ИИ называет конкретные суммы, имена, даты — а не абстрактные советы.
            </p>
            <div className="text-[11px] text-violet-700 italic bg-white/60 rounded-lg p-2 border border-violet-100">
              «Алексей, у вас 2 неоплаченных счёта на 4 850 ₽: электричество и вода. Также есть кредит «Ипотека» с остатком 1.8 млн ₽ и платежом 24 000 ₽/мес. Хотите план оптимизации?»
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SlideLiveLoops;
