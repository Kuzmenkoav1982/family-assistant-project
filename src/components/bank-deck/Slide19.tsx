import SlideFrame from './SlideFrame';

const volumeData = [
  { families: '1 000', costPerMonth: 76.5, pricePerMonth: 350, margin: 357, barHeight: 20, barColor: 'bg-slate-400' },
  { families: '5 000', costPerMonth: 41.8, pricePerMonth: 149, margin: 257, barHeight: 40, barColor: 'bg-indigo-400' },
  { families: '10 000', costPerMonth: 39.7, pricePerMonth: 149, margin: 275, barHeight: 60, barColor: 'bg-indigo-600' },
  { families: '50 000', costPerMonth: 30.0, pricePerMonth: 99, margin: 230, barHeight: 100, barColor: 'bg-violet-600' },
];

export default function Slide19() {
  const maxBar = Math.max(...volumeData.map((d) => d.pricePerMonth));

  return (
    <SlideFrame
      id="slide-19"
      eyebrow="19. Зависимость цены от объёма"
      title="Цена снижается при росте подключений"
      tone="dark"
    >
      {/* Визуальные колонки */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {volumeData.map((d) => {
          const priceBarH = Math.round((d.pricePerMonth / maxBar) * 160);
          const costBarH = Math.round((d.costPerMonth / maxBar) * 160);
          return (
            <div key={d.families} className="flex flex-col items-center gap-2">
              <div className="text-lg font-bold text-white">{d.families}</div>
              <div className="text-xs text-slate-400">семей</div>

              {/* Столбец */}
              <div className="relative flex items-end justify-center gap-1.5" style={{ height: '180px' }}>
                {/* Себестоимость */}
                <div
                  className="w-8 bg-slate-600 rounded-t-md flex items-end justify-center pb-1"
                  style={{ height: `${costBarH}px` }}
                  title={`Себест. ${d.costPerMonth} ₽`}
                >
                  <span className="text-[9px] text-slate-300 font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    {d.costPerMonth} ₽
                  </span>
                </div>
                {/* Цена */}
                <div
                  className={`w-8 ${d.barColor} rounded-t-md flex items-end justify-center pb-1`}
                  style={{ height: `${priceBarH}px` }}
                  title={`Цена ${d.pricePerMonth} ₽`}
                >
                  <span className="text-[9px] text-white font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    {d.pricePerMonth} ₽
                  </span>
                </div>
              </div>

              {/* Цена для банка */}
              <div className={`text-xl font-bold ${d.barColor.replace('bg-', 'text-').replace('-400', '-300').replace('-600', '-300')}`}>
                {d.pricePerMonth} ₽
              </div>
              <div className="text-xs text-slate-400">цена/мес</div>
              <div className="text-xs text-emerald-400 font-semibold">
                {d.pricePerMonth * 12 * parseInt(d.families.replace(' ', ''))} ₽/год
              </div>
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-4 mb-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-600" />
          <span className="text-xs text-slate-400">Себестоимость (ступенчатая)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-500" />
          <span className="text-xs text-slate-400">Цена для банка</span>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-300 text-xs">
              <th className="text-left px-4 py-2.5">Объём (семей)</th>
              <th className="text-right px-3 py-2.5">Себест./мес</th>
              <th className="text-right px-3 py-2.5">Цена/мес</th>
              <th className="text-right px-3 py-2.5">Цена/год</th>
              <th className="text-right px-4 py-2.5">Выручка/год (весь пакет)</th>
            </tr>
          </thead>
          <tbody>
            {volumeData.map((d) => (
              <tr key={d.families} className="border-t border-slate-700 even:bg-slate-800/40">
                <td className="px-4 py-2.5 font-semibold text-white">{d.families}</td>
                <td className="px-3 py-2.5 text-right text-slate-400">{d.costPerMonth} ₽</td>
                <td className="px-3 py-2.5 text-right font-bold text-indigo-300">{d.pricePerMonth} ₽</td>
                <td className="px-3 py-2.5 text-right text-emerald-300">{(d.pricePerMonth * 12).toLocaleString('ru')} ₽</td>
                <td className="px-4 py-2.5 text-right font-bold text-white">
                  {(d.pricePerMonth * 12 * parseInt(d.families.replace(' ', ''))).toLocaleString('ru')} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-indigo-900/40 border border-indigo-700/50 rounded-xl px-5 py-3 text-sm text-indigo-100">
        <span className="font-semibold">Вывод:</span> При переходе от пилота (1 000) к рабочему масштабу (10 000)
        цена для банка снижается с <span className="font-bold text-white">350 ₽</span> до{' '}
        <span className="font-bold text-white">149 ₽</span> за подключение — сокращение в <span className="font-bold text-amber-300">2,35 раза</span>.
      </div>
    </SlideFrame>
  );
}
