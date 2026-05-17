import ProofSlideFrame from './ProofSlideFrame';

const assetItems = [
  'Кодовая база платформы',
  'Продуктовая логика семейных сценариев',
  'Семейная модель данных',
  'Оркестрация на базе ИИ',
  '12 хабов и связанные маршруты',
  'Интеграционный контур',
  'Банковские и партнёрские сценарии',
  'Документация и передача знаний',
  'Сопровождение перехода',
];

export default function Proof08Asset() {
  return (
    <ProofSlideFrame
      id="proof-8"
      code="Д8"
      title="Состав глубокого актива"
      subtitle="Если разговор идёт о глубоком формате — предметом интеграции является целостный платформенный актив, а не папка экранов"
      footnote="Вопрос пользовательских данных рассматривается отдельно, строго в правовой рамке"
    >
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-7">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">
          Банк получает
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {assetItems.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 leading-snug"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </ProofSlideFrame>
  );
}
