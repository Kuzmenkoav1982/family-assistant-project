import SlideFrame from './SlideFrame';

// Внешний слайд для банка — себестоимость и маржа не раскрываются
// Показываем только: объём, цену, скидку от масштаба, выручку для наглядности

const volumeData = [
  { families: 'до 499', label: 'Пилот', pricePerMonth: 350, priceYear: 4200, barColor: 'bg-slate-500', note: '+ разовый запуск' },
  { families: '1 000–4 999', label: 'Базовый', pricePerMonth: 149, priceYear: 1788, barColor: 'bg-indigo-500', note: 'Годовой контракт' },
  { families: '5 000–9 999', label: 'Расширенный', pricePerMonth: 149, priceYear: 1609, barColor: 'bg-indigo-600', note: 'Скидка 10% при предоплате' },
  { families: '10 000+', label: 'Масштаб', pricePerMonth: 99, priceYear: 1188, barColor: 'bg-violet-600', note: 'Годовой контракт' },
];

const maxPrice = Math.max(...volumeData.map((d) => d.pricePerMonth));

export default function Slide19() {
  return (
    <SlideFrame
      id="slide-19"
      eyebrow="19. Зависимость цены от объёма"
      title="Чем больше подключений — тем ниже цена"
      tone="dark"
    >
      {/* Визуальные колонки — только цена, без себестоимости */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {volumeData.map((d) => {
          const barH = Math.round((d.pricePerMonth / maxPrice) * 140);
          const textColor = d.barColor.replace('bg-', 'text-').replace('-500', '-300').replace('-600', '-300');
          return (
            <div key={d.families} className="flex flex-col items-center gap-1.5">
              <div className="text-xs font-bold text-slate-300 text-center leading-tight">{d.label}</div>
              <div className="text-[11px] text-slate-500 text-center leading-tight">{d.families}<br/>семей</div>

              <div className="flex items-end justify-center" style={{ height: '160px' }}>
                <div
                  className={`w-14 ${d.barColor} rounded-t-xl flex items-end justify-center pb-2 transition-all`}
                  style={{ height: `${barH}px` }}
                >
                  <span className="text-xs text-white font-bold">{d.pricePerMonth}</span>
                </div>
              </div>

              <div className={`text-2xl font-bold ${textColor}`}>{d.pricePerMonth} ₽</div>
              <div className="text-[11px] text-slate-400 text-center">в месяц</div>
              <div className="text-xs text-emerald-400 font-semibold text-center">{d.priceYear.toLocaleString('ru')} ₽/год</div>
              <div className="text-[10px] text-slate-500 text-center leading-tight mt-0.5">{d.note}</div>
            </div>
          );
        })}
      </div>

      {/* Таблица — только внешние данные */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-300 text-xs">
              <th className="text-left px-4 py-2.5">Объём (семей)</th>
              <th className="text-left px-3 py-2.5">Формат</th>
              <th className="text-right px-3 py-2.5">Цена/мес</th>
              <th className="text-right px-3 py-2.5">Цена/год</th>
              <th className="text-right px-4 py-2.5">Годовой бюджет (весь пакет)</th>
            </tr>
          </thead>
          <tbody>
            {volumeData.map((d) => (
              <tr key={d.families} className="border-t border-slate-700 even:bg-slate-800/40">
                <td className="px-4 py-2.5 font-semibold text-white text-xs">{d.families}</td>
                <td className="px-3 py-2.5 text-slate-400 text-xs">{d.label}</td>
                <td className="px-3 py-2.5 text-right font-bold text-indigo-300">{d.pricePerMonth} ₽</td>
                <td className="px-3 py-2.5 text-right text-emerald-300">{d.priceYear.toLocaleString('ru')} ₽</td>
                <td className="px-4 py-2.5 text-right font-bold text-white text-xs">
                  {d.families === 'до 499'
                    ? 'по согласованию'
                    : `от ${(d.priceYear * (d.families === '1 000–4 999' ? 1000 : d.families === '5 000–9 999' ? 5000 : 10000)).toLocaleString('ru')} ₽`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-indigo-900/40 border border-indigo-700/50 rounded-xl px-5 py-3 text-sm text-indigo-100">
        <span className="font-semibold">Вывод:</span> При переходе от пилота к базовому масштабу
        цена за подключение снижается с <span className="font-bold text-white">350 ₽</span> до{' '}
        <span className="font-bold text-white">149 ₽</span> — более чем в <span className="font-bold text-amber-300">2 раза</span>.
        При масштабе 10 000+ — <span className="font-bold text-white">99 ₽/мес</span>.
      </div>
    </SlideFrame>
  );
}
