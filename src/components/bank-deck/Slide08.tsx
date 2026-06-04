import SlideFrame from './SlideFrame';

const parentFlow = [
  'Оформляет карту',
  'Подключает модуль',
  'Видит активность ребёнка',
  'Помогает с целями',
];

const childFlow = [
  'Получает карту',
  'Первый вход — понятный старт',
  'Ставит цель и отслеживает накопление',
  'Возвращается к следующему шагу',
];

function FlowRow({ steps, color, borderColor }: { steps: string[]; color: string; borderColor: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-medium border ${color} ${borderColor}`}
          >
            {step}
          </div>
          {i < steps.length - 1 && (
            <span className="text-slate-400 text-base font-light">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Slide08() {
  return (
    <SlideFrame
      id="slide-8"
      eyebrow="08. Сценарий семьи"
      title="Как этим пользуется семья"
    >
      <div className="flex flex-col gap-6 mb-8">
        {/* Parent */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👨‍👩‍👧</span>
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-700">Родитель</span>
          </div>
          <FlowRow
            steps={parentFlow}
            color="bg-white text-slate-800"
            borderColor="border-indigo-200"
          />
        </div>

        {/* Child */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🧒</span>
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-700">Ребёнок</span>
          </div>
          <FlowRow
            steps={childFlow}
            color="bg-white text-slate-800"
            borderColor="border-emerald-200"
          />
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl px-6 py-5 text-center">
        <p className="text-sm sm:text-base font-medium leading-relaxed">
          Карта становится частью{' '}
          <span className="text-indigo-300 font-semibold">семейной экосистемы</span>,
          а не разовой услугой
        </p>
      </div>
    </SlideFrame>
  );
}