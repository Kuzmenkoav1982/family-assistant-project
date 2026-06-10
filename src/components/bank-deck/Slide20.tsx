import SlideFrame from './SlideFrame';

const models = [
  {
    id: 'pilot',
    title: 'Модель 1. Пилот',
    subtitle: 'Ярославская область',
    icon: '🚀',
    volume: 'до 500 семей',
    period: '3–6 месяцев',
    priceMonth: '350 ₽',
    priceYear: '4 200 ₽',
    minVolume: '100 семей',
    note: 'Включает запуск, настройку, персональное сопровождение',
    color: 'border-slate-300 bg-white',
    headerColor: 'bg-slate-900 text-white',
    priceColor: 'text-slate-900',
    tag: null,
  },
  {
    id: 'base',
    title: 'Модель 2. Базовое партнёрство',
    subtitle: 'Ярославская область',
    icon: '🤝',
    volume: '1 000–5 000 семей',
    period: '12 месяцев',
    priceMonth: '149 ₽',
    priceYear: '1 788 ₽',
    minVolume: '1 000 семей',
    note: 'Полный функционал, SLA 99%, приоритетная поддержка',
    color: 'border-indigo-300 bg-indigo-50',
    headerColor: 'bg-indigo-600 text-white',
    priceColor: 'text-indigo-700',
    tag: 'Рекомендовано для Ярославля',
  },
  {
    id: 'scale',
    title: 'Модель 3. Масштаб',
    subtitle: 'Тиражирование на регион',
    icon: '📈',
    volume: 'от 10 000 семей',
    period: '12+ месяцев',
    priceMonth: '99 ₽',
    priceYear: '1 188 ₽',
    minVolume: '10 000 семей',
    note: 'Полный функционал + API-интеграция с банком, выделенный менеджер',
    color: 'border-violet-200 bg-violet-50',
    headerColor: 'bg-violet-700 text-white',
    priceColor: 'text-violet-700',
    tag: null,
  },
];

export default function Slide20() {
  return (
    <SlideFrame
      id="slide-20"
      eyebrow="20. Коммерческая модель для банка"
      title="Три варианта партнёрства"
      tone="accent"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {models.map((m) => (
          <div key={m.id} className={`rounded-2xl border overflow-hidden shadow-sm ${m.color}`}>
            {/* Шапка */}
            <div className={`px-5 py-4 ${m.headerColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <div className="font-bold text-sm leading-tight">{m.title}</div>
                  <div className="text-xs opacity-75">{m.subtitle}</div>
                </div>
              </div>
              {m.tag && (
                <div className="mt-2 text-xs bg-white/20 rounded-full px-3 py-0.5 inline-block font-semibold">
                  ★ {m.tag}
                </div>
              )}
            </div>

            {/* Тело */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs text-slate-500">Объём</span>
                <span className="text-sm font-semibold text-slate-800">{m.volume}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs text-slate-500">Период</span>
                <span className="text-sm font-semibold text-slate-800">{m.period}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs text-slate-500">Мин. объём</span>
                <span className="text-sm font-semibold text-slate-800">{m.minVolume}</span>
              </div>

              {/* Цена */}
              <div className="text-center pt-1">
                <div className={`text-3xl font-bold ${m.priceColor}`}>{m.priceMonth}</div>
                <div className="text-xs text-slate-400">за 1 подключение в месяц</div>
                <div className={`text-base font-semibold mt-1 ${m.priceColor}`}>{m.priceYear}</div>
                <div className="text-xs text-slate-400">за 12 месяцев</div>
              </div>

              <div className="bg-white/60 rounded-lg px-3 py-2 text-xs text-slate-600 leading-relaxed border border-slate-100">
                {m.note}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Скидка за год */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">Скидка при годовом контракте</div>
          <div className="text-2xl font-bold text-emerald-700">−10%</div>
          <p className="text-xs text-emerald-600 mt-1">
            Банк получает скидку 10% при оплате на 12 месяцев вперёд.
            Пример: Базовая модель — 149 ₽/мес → <strong>134 ₽/мес</strong> при годовой оплате.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Помесячно или годом?</div>
          <div className="text-2xl font-bold text-amber-700">Годовой пакет</div>
          <p className="text-xs text-amber-700 mt-1">
            Банку — скидка и предсказуемый бюджет.
            Нам — стабильный поток и мотивация к качеству SLA.
            Для пилота допустима помесячная оплата.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 text-sm">
        <span className="font-semibold text-indigo-300">Итоговая позиция для переговоров:</span>{' '}
        Базовая модель, 1 000–5 000 семей, 149 ₽/мес за подключение, годовой контракт.
        При выходе на 5 000+ — переход на тарифный план «Масштаб» (99 ₽/мес) по допсоглашению.
      </div>

      <p className="text-[11px] text-slate-400 mt-3">
        * Предварительная ценовая модель. Финальные условия фиксируются в договоре
        по согласованному объёму подключений. Расчёт основан на фактических метриках
        системы и сценарных допущениях по масштабированию.
      </p>
    </SlideFrame>
  );
}
