import AppendixSlideFrame from './AppendixSlideFrame';

const ourSide = [
  'Продукт',
  'Архитектура',
  'Дизайн',
  'Разработка',
  'Интеграции',
  'Методология и сценарии',
  'Сопровождение пилота',
];

const bankSide = [
  'Владелец направления со стороны розницы',
  'Интеграционный контур',
  'Юридический контур / ИБ / данные',
  'Пилотная рабочая группа',
];

export default function Apx6Team() {
  return (
    <AppendixSlideFrame
      id="apx-6"
      code="А6"
      title="Команда и контур исполнения"
      subtitle="Это собираемый рабочий контур, а не одиночная инициатива. Состав ролей фиксирован — конкретные имена обсуждаются отдельно."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
            Наша сторона
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ourSide.map((r, i) => (
              <li
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
            Банковская сторона (формируется)
          </div>
          <ul className="space-y-1.5">
            {bankSide.map((r, i) => (
              <li
                key={i}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 leading-snug"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppendixSlideFrame>
  );
}
