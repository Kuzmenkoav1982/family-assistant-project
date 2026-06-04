import SlideFrame from './SlideFrame';

const stages = [
  {
    num: '01',
    title: 'Упаковка предложения',
    duration: 'июль 2026',
    color: 'border-indigo-300 bg-indigo-50',
    numColor: 'bg-indigo-600 text-white',
    accent: 'text-indigo-700',
    items: [
      'Согласование MVP-состава модуля',
      'Точка входа: из банковского приложения',
      'Подписание рамочного соглашения',
    ],
    result: '→ Общее видение зафиксировано',
  },
  {
    num: '02',
    title: 'Пилотная конфигурация',
    duration: 'авг–сент 2026',
    color: 'border-blue-300 bg-blue-50',
    numColor: 'bg-blue-600 text-white',
    accent: 'text-blue-700',
    items: [
      'Интеграция с банковским приложением',
      'Onboarding + активация модуля',
      'Настройка аналитики и KPI',
    ],
    result: '→ Технический и продуктовый MVP',
  },
  {
    num: '03',
    title: 'Пилот в Ярославской обл.',
    duration: 'окт–ноябрь 2026',
    color: 'border-emerald-300 bg-emerald-50',
    numColor: 'bg-emerald-600 text-white',
    accent: 'text-emerald-700',
    items: [
      'Запуск для первых 500–1000 семей',
      'Сбор данных и обратной связи',
      'Итоговый отчёт по KPI пилота',
    ],
    result: '→ Данные для решения о масштабировании',
  },
  {
    num: '04',
    title: 'Масштабирование',
    duration: 'с 2027',
    color: 'border-amber-300 bg-amber-50',
    numColor: 'bg-amber-500 text-white',
    accent: 'text-amber-700',
    items: [
      'Контентный партнёр (библиотека)',
      'Расширение на другие регионы',
      'Полноценная детская экосистема',
    ],
    result: '→ Устойчивый семейный продукт',
  },
];

export default function Slide12() {
  return (
    <SlideFrame
      id="slide-12"
      eyebrow="12. Roadmap запуска"
      title="Как запускать проект"
      subtitle="Ориентировочный план при согласовании пилотного контура"
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
            <ul className="flex flex-col gap-1.5 mt-1 flex-1">
              {stage.items.map((item) => (
                <li key={item} className={`text-xs sm:text-sm flex items-start gap-1.5 ${stage.accent}`}>
                  <span className="mt-0.5 shrink-0">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-slate-500 mt-3 pt-2 border-t border-white/60">
              {stage.result}
            </p>
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