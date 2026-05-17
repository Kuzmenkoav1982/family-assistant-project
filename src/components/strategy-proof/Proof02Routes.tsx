import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const routes = [
  {
    title: 'Меры поддержки и льготы',
    steps: [
      'Жизненная ситуация семьи',
      'Подбор мер поддержки',
      'Документы и сроки',
      'Маршрут действий',
    ],
  },
  {
    title: 'Семейные расходы и ЖКХ',
    steps: [
      'Регулярные расходы',
      'Признак нагрузки',
      'Контекст семейного бюджета',
      'Релевантное предложение банка',
    ],
  },
  {
    title: 'Цели и планирование',
    steps: [
      'Семейные цели',
      'План на горизонт',
      'Напоминания и задачи',
      'Финансовые сервисы вокруг целей',
    ],
  },
];

export default function Proof02Routes() {
  return (
    <ProofSlideFrame
      id="proof-2"
      code="Д2"
      title="Сквозные семейные маршруты"
      subtitle="Платформа не каталог разделов, а маршруты — от жизненной ситуации до конкретного действия"
    >
      <div className="space-y-4">
        {routes.map((r, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-5"
          >
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Маршрут {i + 1}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
              {r.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {r.steps.map((s, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs sm:text-sm text-slate-700">
                    {s}
                  </span>
                  {j < r.steps.length - 1 && (
                    <Icon name="ChevronRight" size={16} className="text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProofSlideFrame>
  );
}
