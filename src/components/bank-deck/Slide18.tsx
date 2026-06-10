import SlideFrame from './SlideFrame';

const scenarios = [
  {
    activity: 'Минимальный',
    desc: 'Вход раз в неделю, AI почти не используется',
    aiRub: '1,5 ₽',
    varRub: '~14 ₽',
    color: 'border-slate-200 bg-slate-50',
    labelColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600',
  },
  {
    activity: 'Средний ★',
    desc: '3–4 сессии в неделю, ~7 AI-запросов в месяц',
    aiRub: '3,5 ₽',
    varRub: '~23 ₽',
    color: 'border-indigo-200 bg-indigo-50',
    labelColor: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  {
    activity: 'Активный',
    desc: 'Ежедневно, 15+ AI-запросов, много фото и контента',
    aiRub: '12 ₽',
    varRub: '~54 ₽',
    color: 'border-violet-200 bg-violet-50',
    labelColor: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
  },
];

const scenarioRows = [
  { scale: '1 000 семей', fixed: '34 000 ₽', variable: '23 000 ₽', support: '19 500 ₽', total: '76 500 ₽', perMonth: '76,5 ₽', perYear: '918 ₽', highlight: false },
  { scale: '5 000 семей', fixed: '55 000 ₽', variable: '115 000 ₽', support: '39 000 ₽', total: '209 000 ₽', perMonth: '41,8 ₽', perYear: '502 ₽', highlight: false },
  { scale: '10 000 семей', fixed: '89 000 ₽', variable: '230 000 ₽', support: '78 000 ₽', total: '397 000 ₽', perMonth: '39,7 ₽', perYear: '476 ₽', highlight: true },
  { scale: '50 000 семей', fixed: '195 000 ₽', variable: '1 150 000 ₽', support: '156 000 ₽', total: '1 501 000 ₽', perMonth: '30,0 ₽', perYear: '360 ₽', highlight: false },
];

export default function Slide18() {
  return (
    <SlideFrame
      id="slide-18"
      eyebrow="18. Себестоимость подключения"
      title="Сколько стоит одно подключение"
      subtitle="Расчёт основан на фактических метриках системы и сценарных допущениях по масштабированию"
      tone="accent"
    >
      {/* Уровни активности */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Переменные затраты зависят от активности семьи</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <div key={s.activity} className={`rounded-xl border p-4 ${s.color}`}>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badge} mb-2 inline-block`}>{s.activity}</span>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">{s.desc}</p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ИИ:</span>
                <span className={`font-semibold ${s.labelColor}`}>{s.aiRub}/мес</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Переменные итого:</span>
                <span className={`font-bold ${s.labelColor}`}>{s.varRub}/мес</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Таблица сценариев */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left px-4 py-3 font-semibold text-xs">Масштаб</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Фикс.</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Перем.</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Поддержка</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Итого/мес</th>
              <th className="text-right px-4 py-3 font-bold text-xs text-indigo-300">Себест. 1/мес</th>
              <th className="text-right px-4 py-3 font-bold text-xs text-emerald-300">Себест. 1/год</th>
            </tr>
          </thead>
          <tbody>
            {scenarioRows.map((r) => (
              <tr
                key={r.scale}
                className={r.highlight
                  ? 'bg-indigo-50 border-l-4 border-indigo-500'
                  : 'even:bg-slate-50 border-l-4 border-transparent'}
              >
                <td className="px-4 py-3 font-semibold text-slate-800">{r.scale}</td>
                <td className="px-3 py-3 text-right text-slate-500 text-xs">{r.fixed}</td>
                <td className="px-3 py-3 text-right text-slate-500 text-xs">{r.variable}</td>
                <td className="px-3 py-3 text-right text-slate-500 text-xs">{r.support}</td>
                <td className="px-3 py-3 text-right text-slate-700 font-medium">{r.total}</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{r.perMonth}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700">{r.perYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400 mt-3">
        * Переменные считаются по среднему сценарию активности. Фиксированные — ступенчато.
        Поддержка — ступенчатая модель FTE, не линейная. Полный расчёт по запросу.
      </p>
    </SlideFrame>
  );
}
