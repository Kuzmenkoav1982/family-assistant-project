import SlideFrame from './SlideFrame';

// FTE × 78 000 ₽/мес: 0,25→19 500, 0,5→39 000, 1,0→78 000, 2,0→156 000
// Переменные по строкам: 0,01+0,03+0,20+3,50+0,15 = 3,89 → округлено до 3,9 ₽

const fixedItems = [
  {
    scale: '1–999 семей',
    infra: '13 000 ₽',
    devops: '19 500 ₽',
    fteNote: '0,25 FTE',
    total: '32 500 ₽',
    color: 'bg-slate-50 border-slate-200',
    labelColor: 'text-slate-700',
  },
  {
    scale: '1 000–4 999',
    infra: '28 000 ₽',
    devops: '39 000 ₽',
    fteNote: '0,5 FTE',
    total: '67 000 ₽',
    color: 'bg-indigo-50 border-indigo-200',
    labelColor: 'text-indigo-700',
  },
  {
    scale: '5 000–9 999',
    infra: '50 000 ₽',
    devops: '78 000 ₽',
    fteNote: '1,0 FTE',
    total: '128 000 ₽',
    color: 'bg-violet-50 border-violet-200',
    labelColor: 'text-violet-700',
  },
  {
    scale: '10 000+',
    infra: '120 000 ₽',
    devops: '156 000 ₽',
    fteNote: '2,0 FTE',
    total: '276 000 ₽',
    color: 'bg-purple-50 border-purple-200',
    labelColor: 'text-purple-700',
  },
];

const varItems = [
  { label: 'Рост БД (хранилище)', value: '0,01 ₽', pct: 0.3 },
  { label: 'S3 / фото и файлы', value: '0,03 ₽', pct: 0.8 },
  { label: 'CDN-трафик', value: '0,20 ₽', pct: 5.1 },
  { label: 'ИИ-запросы (YandexGPT)', value: '3,50 ₽', pct: 89.7 },
  { label: 'Email и push-уведомления', value: '0,15 ₽', pct: 3.8 },
];

const supportItems = [
  { scale: '1–999 семей', fte: '0,25 FTE', rub: '19 500 ₽/мес' },
  { scale: '1 000–4 999', fte: '0,5 FTE', rub: '39 000 ₽/мес' },
  { scale: '5 000–9 999', fte: '1,0 FTE', rub: '78 000 ₽/мес' },
  { scale: '10 000+', fte: '2,0 FTE', rub: '156 000 ₽/мес' },
];

export default function Slide17() {
  return (
    <SlideFrame
      id="slide-17"
      eyebrow="17. Структура себестоимости"
      title="Из чего складываются затраты"
      tone="default"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Фиксированные — ступенчато */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Фиксированные затраты (ступенчато)
          </div>
          <div className="space-y-2">
            {fixedItems.map((item) => (
              <div key={item.scale} className={`rounded-xl border p-3 ${item.color}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${item.labelColor}`}>{item.scale}</span>
                  <span className={`text-sm font-bold ${item.labelColor}`}>{item.total}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Инфра: {item.infra}</span>
                  <span>DevOps ({item.fteNote}): {item.devops}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            DevOps: 78 000 ₽/мес × FTE по ступени масштаба.
            Инфра: PostgreSQL, 128 Cloud Functions, S3, CDN, DNS, бэкапы, мониторинг.
          </p>
        </div>

        {/* Переменные + Поддержка */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Переменные затраты на 1 подключение/мес
            </div>
            <div className="space-y-2">
              {varItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-20 shrink-0">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-indigo-400"
                        style={{ width: `${Math.max(item.pct, 2)}%` }}
                      />
                    </div>
                  </div>
                  <span className="flex-1 text-xs text-slate-600">{item.label}</span>
                  <span className="text-xs font-bold text-slate-700 shrink-0">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
                <span className="text-xs font-semibold text-slate-600">Итого переменных</span>
                <span className="text-sm font-bold text-indigo-700">3,9 ₽/мес</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Сумма по строкам: 3,89 ₽, округлено до 3,9 ₽ (разница — погрешность округления).
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              Техподдержка пользователей (ступенчато)
            </div>
            <div className="space-y-1">
              {supportItems.map((r) => (
                <div key={r.scale} className="flex justify-between text-xs text-emerald-800">
                  <span>{r.scale}</span>
                  <span>{r.fte} → <strong>{r.rub}</strong></span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-emerald-600 mt-2">
              Ставка: 78 000 ₽/мес. Масштабируется ступенчато, не линейно.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-start gap-4">
        <span className="text-xl mt-0.5 shrink-0">💡</span>
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-indigo-300">Самая крупная статья — поддержка пользователей</span>,
          а не инфраструктура. При росте аудитории её доля снижается: поддержка масштабируется
          медленнее, чем число подключений.
        </p>
      </div>

      <p className="text-[11px] text-slate-400 mt-3">
        * Расчёт основан на фактических метриках системы и сценарных допущениях по масштабированию.
        Это внутренняя операционная модель, не предназначенная для передачи третьим сторонам.
      </p>
    </SlideFrame>
  );
}
