import AppendixSlideFrame from './AppendixSlideFrame';

const layers = [
  {
    title: 'Семейный слой',
    items: ['Семейный ID', 'Состав семьи и роли', 'События, документы, задачи'],
  },
  {
    title: 'Продуктовый контур',
    items: ['12 продуктовых хабов', '4 кластера', 'Маршруты между хабами'],
  },
  {
    title: 'Оркестрация сценариев',
    items: ['Домовой как оркестратор', 'Правила переходов', 'Контекст и рекомендации'],
  },
  {
    title: 'Интеграционный контур',
    items: [
      'Интеграционные интерфейсы',
      'Партнёрская витрина',
      'Банковские точки входа',
    ],
  },
];

export default function Apx1Architecture() {
  return (
    <AppendixSlideFrame
      id="apx-1"
      code="А1"
      title="Архитектурный контур платформы"
      subtitle="Это не набор экранов, а собранная конструкция. Банк встраивается поверх готового платформенного ядра."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {layers.map((l, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
              Слой {i + 1}
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-2">{l.title}</div>
            <ul className="space-y-1">
              {l.items.map((it, j) => (
                <li key={j} className="text-sm text-slate-700 leading-snug">
                  — {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-700">
        Место банка — поверх платформенного ядра через интеграционный контур и
        партнёрскую витрину. Не сбоку, не вместо, а поверх.
      </div>
    </AppendixSlideFrame>
  );
}
