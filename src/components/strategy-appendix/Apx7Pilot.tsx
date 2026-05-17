import AppendixSlideFrame from './AppendixSlideFrame';

const steps = [
  {
    title: 'Согласование сценария пилота',
    text: 'Выбор стартовых маршрутов: меры поддержки, ЖКХ → банковский продукт',
  },
  {
    title: 'Определение семейного сегмента и гипотез',
    text: 'Под какой контур семей запускается пилот, какие гипотезы проверяем',
  },
  {
    title: 'Настройка контуров и интеграций',
    text: 'Точки входа, доступы, интеграционные интерфейсы, контур данных',
  },
  {
    title: 'Ограниченный запуск',
    text: 'Контролируемый объём, фиксированный контур ответственности',
  },
  {
    title: 'Замер показателей',
    text: 'Сбор фактических данных по согласованным метрикам',
  },
  {
    title: 'Решение о следующем формате',
    text: 'Масштабирование / углубление / коррекция сценария',
  },
];

export default function Apx7Pilot() {
  return (
    <AppendixSlideFrame
      id="apx-7"
      code="А7"
      title="Контур пилота"
      subtitle="Управляемая последовательность шагов, а не «сразу большая интеграция»."
      footnote="Сроки этапов согласуются совместно с банком и фиксируются до запуска пилота."
    >
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li
            key={i}
            className="border border-slate-200 rounded-md p-3 sm:p-4 flex gap-3 sm:gap-4"
          >
            <div className="text-sm font-semibold text-slate-400 tabular-nums shrink-0 w-6">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-0.5">
                {s.title}
              </div>
              <div className="text-sm text-slate-600 leading-snug">{s.text}</div>
            </div>
          </li>
        ))}
      </ol>
    </AppendixSlideFrame>
  );
}
