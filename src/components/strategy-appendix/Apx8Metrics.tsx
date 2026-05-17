import AppendixSlideFrame from './AppendixSlideFrame';

const groups = [
  {
    title: 'Использование',
    items: [
      'Запуск сценариев',
      'Завершение маршрутов',
      'Возвращаемость',
      'Использование Домового',
    ],
  },
  {
    title: 'Банковская ценность',
    items: [
      'Переходы в банковские сценарии',
      'Вовлечение в продукты и сервисы',
      'Качество точки входа',
      'Удержание в семейном контуре',
    ],
  },
  {
    title: 'Управленческая ценность',
    items: [
      'Скорость проверки гипотез',
      'Пригодность к масштабированию',
      'Ясность следующего формата взаимодействия',
    ],
  },
];

export default function Apx8Metrics() {
  return (
    <AppendixSlideFrame
      id="apx-8"
      code="А8"
      title="Показатели и критерии результата"
      subtitle="Результат пилота должен быть измеримым и понятным обеим сторонам."
      footnote="Конкретные целевые значения метрик согласуются в контуре пилота."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {groups.map((g, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
              Группа {i + 1}
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-2">
              {g.title}
            </div>
            <ul className="space-y-1.5">
              {g.items.map((it, j) => (
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
