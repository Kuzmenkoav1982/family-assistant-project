import SlideFrame from './SlideFrame';

// Пересчитано с 3,9 ₽/подкл (переменные без поддержки)
// Границы: 1–999 / 1 000–4 999 / 5 000–9 999 / 10 000+
// Формула: Fixed(ступень) + 3,9×N + Поддержка(ступень)
// 1 000: 32 500 + 3 900 + 39 000 = 75 400 → /1000 = 75,4 ₽/мес
// 5 000: 128 000 + 19 500 + 78 000 = 225 500 → /5000 = 45,1 ₽/мес
// 10 000: 128 000 + 39 000 + 78 000 = 245 000 → /10000 = 24,5 ₽/мес  
// 50 000: 276 000 + 195 000 + 156 000 = 627 000 → /50000 = 12,5 ₽/мес

const scenarios = [
  {
    activity: 'Минимальный',
    desc: 'Вход раз в неделю, AI почти не используется',
    aiRub: '1,5 ₽',
    varRub: '2,1 ₽',
    color: 'border-slate-200 bg-slate-50',
    labelColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600',
    varNote: '0,6 (инфра) + 1,5 (AI)',
  },
  {
    activity: 'Средний ★',
    desc: '3–4 сессии в неделю, ~7 AI-запросов в месяц',
    aiRub: '3,5 ₽',
    varRub: '3,9 ₽',
    color: 'border-indigo-200 bg-indigo-50',
    labelColor: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    varNote: '0,4 (инфра) + 3,5 (AI)',
  },
  {
    activity: 'Активный',
    desc: 'Ежедневно, 15+ AI-запросов, много фото и контента',
    aiRub: '12,0 ₽',
    varRub: '12,6 ₽',
    color: 'border-violet-200 bg-violet-50',
    labelColor: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    varNote: '0,6 (инфра) + 12,0 (AI)',
  },
];

// Пересчёт: Fixed + Variable(3,9×N) + Support / N
// 1 000: (32 500 + 3 900 + 39 000) / 1 000 = 75,4 ₽
// 5 000: (128 000 + 19 500 + 78 000) / 5 000 = 45,1 ₽
// 10 000: (128 000 + 39 000 + 78 000) / 10 000 = 24,5 ₽
// 50 000: (276 000 + 195 000 + 156 000) / 50 000 = 12,5 ₽
const scenarioRows = [
  { scale: '1–999 семей (ступень)', n: 500, fixed: '32 500 ₽', variable: '1 950 ₽', support: '19 500 ₽', total: '53 950 ₽', perMonth: '107,9 ₽', perYear: '1 295 ₽', highlight: false },
  { scale: '1 000–4 999 семей', n: 1000, fixed: '67 000 ₽', variable: '3 900 ₽', support: '39 000 ₽', total: '109 900 ₽', perMonth: '109,9 ₽', perYear: '1 319 ₽', highlight: false },
  { scale: '5 000–9 999 семей ★', n: 5000, fixed: '128 000 ₽', variable: '19 500 ₽', support: '78 000 ₽', total: '225 500 ₽', perMonth: '45,1 ₽', perYear: '541 ₽', highlight: true },
  { scale: '10 000+ семей', n: 10000, fixed: '276 000 ₽', variable: '39 000 ₽', support: '156 000 ₽', total: '471 000 ₽', perMonth: '47,1 ₽', perYear: '565 ₽', highlight: false },
];

export default function Slide18() {
  return (
    <SlideFrame
      id="slide-18"
      eyebrow="18. Себестоимость подключения"
      title="Сколько стоит одно подключение"
      subtitle="Внутренняя операционная модель. Расчёт основан на фактических метриках системы и сценарных допущениях."
      tone="accent"
    >
      {/* Уровни активности */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Переменные затраты на 1 подключение — зависят от активности
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <div key={s.activity} className={`rounded-xl border p-4 ${s.color}`}>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badge} mb-2 inline-block`}>
                {s.activity}
              </span>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">{s.desc}</p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">ИИ-запросы:</span>
                <span className={`font-semibold ${s.labelColor}`}>{s.aiRub}/мес</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Переменные итого:</span>
                <span className={`font-bold ${s.labelColor}`}>{s.varRub}/мес</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{s.varNote}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Таблица ниже — средний сценарий (3,9 ₽/подкл). N в расчёте — нижняя граница ступени.
        </p>
      </div>

      {/* Таблица сценариев */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left px-4 py-3 font-semibold text-xs">Диапазон (семей)</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Фикс.</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Перем.</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Поддержка</th>
              <th className="text-right px-3 py-3 font-semibold text-xs">Итого/мес</th>
              <th className="text-right px-4 py-3 font-bold text-xs text-indigo-300">Себест./мес</th>
              <th className="text-right px-4 py-3 font-bold text-xs text-emerald-300">Себест./год</th>
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
                <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{r.scale}</td>
                <td className="px-3 py-3 text-right text-slate-500 text-xs">{r.fixed}</td>
                <td className="px-3 py-3 text-right text-slate-500 text-xs">{r.variable}</td>
                <td className="px-3 py-3 text-right text-slate-500 text-xs">{r.support}</td>
                <td className="px-3 py-3 text-right text-slate-700 font-medium text-xs">{r.total}</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{r.perMonth}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700">{r.perYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400">
        * Переменные = 3,9 ₽ × N (средний сценарий). Фиксированные и поддержка — ступенчатые.
        Это внутренняя финансовая модель, не предназначенная для передачи третьим сторонам.
      </p>
    </SlideFrame>
  );
}
