import SlideFrame from './SlideFrame';

const costItems = [
  {
    label: 'Инфраструктура',
    desc: 'PostgreSQL, Serverless Functions (128 шт.), S3, CDN, DNS, резервные копии, мониторинг',
    share: 24,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-100',
    rub: '~28 000 ₽/мес',
  },
  {
    label: 'Сопровождение инфраструктуры',
    desc: 'DevOps / системный администратор, 0,5 FTE. Обновления, мониторинг, инциденты',
    share: 24,
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-100',
    rub: '~27 000 ₽/мес',
  },
  {
    label: 'Техподдержка пользователей',
    desc: 'Специалист поддержки, 0,5 FTE при 1 000–5 000 семьях. Обработка обращений, онбординг',
    share: 34,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-100',
    rub: '~39 000 ₽/мес',
  },
  {
    label: 'ИИ-функции (YandexGPT)',
    desc: 'Средний сценарий: 10% семей, ~7 AI-запросов/мес на активную семью, ~3,5 ₽/подкл',
    share: 3,
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-100',
    rub: '~4 200 ₽/мес',
  },
  {
    label: 'Хранение данных, трафик, уведомления',
    desc: 'CDN-трафик, рост БД, хранение фото/файлов, email и push-уведомления',
    share: 4,
    color: 'bg-sky-500',
    textColor: 'text-sky-700',
    bgColor: 'bg-sky-50 border-sky-100',
    rub: '~4 600 ₽/мес',
  },
  {
    label: 'Накладные расходы',
    desc: 'Бухгалтерия, налоги, банковское обслуживание, платёжные комиссии, резерв',
    share: 11,
    color: 'bg-slate-400',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
    rub: '~12 200 ₽/мес',
  },
];

export default function Slide17() {
  return (
    <SlideFrame
      id="slide-17"
      eyebrow="17. Структура себестоимости"
      title="Из чего складывается стоимость подключения"
      tone="default"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {costItems.map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 flex gap-3 ${item.bgColor}`}>
            <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className={`text-xs font-bold ${item.textColor}`}>{item.share}%</span>
            </div>
            <div>
              <div className={`text-sm font-semibold mb-0.5 ${item.textColor}`}>{item.label}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              <div className={`text-xs font-bold mt-1.5 ${item.textColor}`}>{item.rub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Визуальная полоса */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 mb-2 font-medium">Структура затрат при 1 000–5 000 семей (итого ~115 000 ₽/мес)</div>
        <div className="flex rounded-full overflow-hidden h-4">
          {costItems.map((item) => (
            <div
              key={item.label}
              className={`${item.color} h-full`}
              style={{ width: `${item.share}%` }}
              title={`${item.label}: ${item.share}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {costItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-[11px] text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-start gap-4">
        <span className="text-xl mt-0.5 shrink-0">💡</span>
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-indigo-300">Самая крупная статья — поддержка пользователей (34%)</span>, а не инфраструктура.
          При росте аудитории и хорошем онбординге этот показатель снижается: при 10 000 семьях — менее 20%.
        </p>
      </div>
    </SlideFrame>
  );
}
