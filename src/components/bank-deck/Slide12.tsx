import SlideFrame from './SlideFrame';

const stages = [
  {
    num: '01',
    title: 'Упаковка',
    duration: '1–2 нед',
    color: 'border-indigo-300 bg-indigo-50',
    numColor: 'bg-indigo-600 text-white',
    accent: 'text-indigo-700',
    items: [
      'Финальная презентация',
      'Продуктовая рамка',
      'Entry point схема',
    ],
  },
  {
    num: '02',
    title: 'Пилотная конфигурация',
    duration: '2–4 нед',
    color: 'border-blue-300 bg-blue-50',
    numColor: 'bg-blue-600 text-white',
    accent: 'text-blue-700',
    items: [
      'Согласование формата',
      'Визуальная интеграция',
      'Привязка к банковскому пути',
    ],
  },
  {
    num: '03',
    title: 'Пилот в Ярославской области',
    duration: '1–2 мес',
    color: 'border-emerald-300 bg-emerald-50',
    numColor: 'bg-emerald-600 text-white',
    accent: 'text-emerald-700',
    items: [
      'Ограниченный запуск',
      'Сбор KPI и метрик',
      'Обратная связь семей',
    ],
  },
  {
    num: '04',
    title: 'Расширение',
    duration: 'далее',
    color: 'border-amber-300 bg-amber-50',
    numColor: 'bg-amber-500 text-white',
    accent: 'text-amber-700',
    items: [
      'Новые сценарии использования',
      'Контентный слой (этап 2)',
      'Масштабирование',
    ],
  },
];

export default function Slide12() {
  return (
    <SlideFrame
      id="slide-12"
      eyebrow="12. Roadmap запуска"
      title="Как запускать проект"
      subtitle="Четыре последовательных этапа от упаковки до масштабирования"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, i) => (
          <div key={stage.num} className={`rounded-2xl border p-5 flex flex-col gap-3 relative ${stage.color}`}>
            <div className="flex items-center justify-between">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${stage.numColor}`}>
                {stage.num}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white border ${stage.accent}`}>
                {stage.duration}
              </span>
            </div>
            <h3 className={`font-bold text-sm sm:text-base text-slate-900`}>{stage.title}</h3>
            <ul className="flex flex-col gap-1.5 mt-1">
              {stage.items.map((item) => (
                <li key={item} className={`text-xs sm:text-sm flex items-start gap-1.5 ${stage.accent}`}>
                  <span className="mt-0.5 shrink-0">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            {i < stages.length - 1 && (
              <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-slate-300 text-xl pointer-events-none">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}