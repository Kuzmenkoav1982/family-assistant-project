import AppendixSlideFrame from './AppendixSlideFrame';

const entities = [
  'Человек',
  'Семья / домохозяйство',
  'Роли внутри семьи',
  'События и даты',
  'Документы',
  'Задачи и сроки',
  'Маршруты',
  'Меры поддержки',
];

const principles = [
  'Семейный ID как ключ связности',
  'Разграничение личного и семейного контура',
  'Минимально необходимый объём доступа',
  'Явные согласия на чувствительные сценарии',
];

export default function Apx2Data() {
  return (
    <AppendixSlideFrame
      id="apx-2"
      code="А2"
      title="Семейная модель данных и доступ"
      subtitle="151 таблица. Семейный контекст описан системно, а не держится на ручных связках."
      footnote="Вопрос пользовательских данных рассматривается отдельно, строго в правовой рамке."
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
            Базовые сущности
          </div>
          <div className="grid grid-cols-2 gap-2">
            {entities.map((e, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700"
              >
                {e}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
            Принципы доступа
          </div>
          <ul className="space-y-1.5">
            {principles.map((p, i) => (
              <li
                key={i}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 leading-snug"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppendixSlideFrame>
  );
}
