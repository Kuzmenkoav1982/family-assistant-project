import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const working = [
  'семейные участники и связи',
  'семейное древо',
  'воспоминания и фотографии',
  'история жизни и семейная хронология',
  'традиции',
  'совместная семейная работа',
  'задачи, напоминания и календарь',
];

const toRefine = [
  'музейная атрибуция материалов',
  'владелец и источник оригинала',
  'приватность отдельного материала',
  'согласие на публикацию и передачу',
  'экспорт архивной подборки',
  'процедура «Предложить Центру»',
  'долговременное архивное хранение',
  'требования ЦСИ к метаданным',
];

export default function SlideCSI06CurrentAndRoadmap() {
  return (
    <CsiSlideFrame
      id="csi-6"
      eyebrow="Честная граница"
      title="Честная граница текущего продукта"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/70 border border-emerald-800/15 rounded-xl p-5">
          <div className="text-sm font-semibold text-emerald-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Icon name="CheckCircle2" size={16} />
            Уже работает в «Нашей Семье»
          </div>
          <ul className="space-y-2">
            {working.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-stone-800 leading-relaxed">
                <Icon name="Check" size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50/70 border border-amber-800/15 rounded-xl p-5">
          <div className="text-sm font-semibold text-amber-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Wrench" size={16} />
            Нуждается в совместной проработке
          </div>
          <ul className="space-y-2">
            {toRefine.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-stone-800 leading-relaxed">
                <Icon name="Circle" size={10} className="text-amber-600 shrink-0 mt-1.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-stone-900 text-amber-50 rounded-xl px-5 py-4 text-sm sm:text-base leading-relaxed">
        Сегодня это цифровое пространство семейной памяти, а не готовая
        музейная архивная система. Пилот поможет определить необходимые
        доработки вместе с экспертами ЦСИ.
      </div>
    </CsiSlideFrame>
  );
}
