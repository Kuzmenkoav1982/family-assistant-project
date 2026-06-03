import SlideFrame from './SlideFrame';

const steps = [
  { num: '1', label: 'Родитель оформляет детскую карту', color: 'bg-indigo-600 text-white' },
  { num: '2', label: 'В банковском пути — предложение активировать детский модуль', color: 'bg-indigo-500 text-white' },
  { num: '3', label: 'Семья получает доступ к разделу «Дети»', color: 'bg-emerald-600 text-white' },
  { num: '4', label: 'Первые сценарии: финконтроль, цели, развитие', color: 'bg-emerald-500 text-white' },
  { num: '5', label: 'Регулярное использование → лояльность → расширение', color: 'bg-amber-500 text-white' },
];

const entryPoints = [
  { emoji: '📱', label: 'Банковское приложение' },
  { emoji: '💳', label: 'При выпуске карты' },
  { emoji: '🔗', label: 'QR / deep link' },
];

export default function Slide04() {
  return (
    <SlideFrame
      id="slide-4"
      eyebrow="04. Точка входа"
      title="Как это входит в проект банка"
    >
      {/* Horizontal stepper */}
      <div className="relative mb-10">
        <div className="hidden sm:block absolute top-6 left-6 right-6 h-0.5 bg-slate-200 z-0" />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 relative z-10">
          {steps.map((step, i) => (
            <div key={step.num} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 shadow ${step.color}`}>
                {step.num}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:text-center font-medium">
                {step.label}
              </p>
              {i < steps.length - 1 && (
                <span className="sm:hidden text-slate-300 text-xl self-start ml-1">↓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Entry points */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">
          Варианты точки входа
        </div>
        <div className="flex flex-wrap gap-3">
          {entryPoints.map((ep) => (
            <div
              key={ep.label}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <span className="text-xl">{ep.emoji}</span>
              <span className="text-sm font-medium text-slate-800">{ep.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
