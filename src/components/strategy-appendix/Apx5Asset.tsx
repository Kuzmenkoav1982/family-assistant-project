import AppendixSlideFrame from './AppendixSlideFrame';

const items = [
  'Продуктовая карта платформы',
  '12 продуктовых хабов',
  '146 функциональных модулей',
  '90 интеграционных интерфейсов',
  '151 таблица в модели данных',
  'Сценарный слой и сквозные маршруты',
  'Домовой — оркестратор семейного контекста',
  'Интеграционный контур',
  'Материалы и методика пилота',
];

export default function Apx5Asset() {
  return (
    <AppendixSlideFrame
      id="apx-5"
      code="А5"
      title="Состав глубокого актива"
      subtitle="Глубокий актив — это совокупность продуктового, архитектурного и интеграционного слоя. Не одна часть, а конструкция."
      footnote="Заявка на включение в Реестр российского ПО подана — рассматривается как подтверждение статуса, а не как самостоятельный аргумент."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-md px-3 py-2.5 text-sm text-slate-800 leading-snug"
          >
            <span className="text-slate-400 mr-1.5 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            {it}
          </div>
        ))}
      </div>
    </AppendixSlideFrame>
  );
}
