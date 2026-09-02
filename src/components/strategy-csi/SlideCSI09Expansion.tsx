import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const directions = [
  'методическая библиотека ЦСИ в приложении',
  'программа «30 дней семейной истории»',
  'лаборатория семейного архива',
  'школьный проект «История моей семьи»',
  'тематические коллекции семейных историй Тульской области',
  'добровольная передача отдельных материалов для исследования или выставки',
];

export default function SlideCSI09Expansion() {
  return (
    <CsiSlideFrame
      id="csi-9"
      eyebrow="Приложение 1 · Если гипотеза подтвердится"
      title="Возможное развитие после пилота"
      tone="accent"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {directions.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 bg-white/70 border border-amber-900/10 rounded-xl px-4 py-3"
          >
            <Icon name="Sprout" size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <span className="text-sm text-stone-800 leading-relaxed">{text}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
        <Icon name="Info" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Билеты, афиша и продвижение мероприятий возможны как дополнительный
          слой, но не являются ядром партнёрства.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
