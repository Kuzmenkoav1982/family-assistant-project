import AppendixSlideFrame from './AppendixSlideFrame';

const blocks = [
  {
    title: 'Управление доступом',
    items: [
      'Ролевая модель доступа',
      'Принцип минимально необходимого доступа',
      'Разделение личного и семейного контура',
    ],
  },
  {
    title: 'Границы контура',
    items: [
      'Разделение тестового и рабочего контуров',
      'Ограничение доступа партнёров через интеграционный слой',
      'Контролируемые точки входа',
    ],
  },
  {
    title: 'Управляемость',
    items: [
      'Журналирование действий',
      'Контроль изменений',
      'Аудитируемость операций',
    ],
  },
];

export default function Apx3Security() {
  return (
    <AppendixSlideFrame
      id="apx-3"
      code="А3"
      title="Безопасность и границы контура"
      subtitle="Безопасность строится вокруг границ доступа и управляемости, а не вокруг общих обещаний."
      footnote="Конкретные требования информационной безопасности согласуются совместно с банком до запуска пилота."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {blocks.map((b, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-slate-900 mb-2">
              {b.title}
            </div>
            <ul className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="text-sm text-slate-700 leading-snug">
                  — {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AppendixSlideFrame>
  );
}
