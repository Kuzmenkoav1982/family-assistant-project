import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const steps = [
  'Создать семейное пространство',
  'Добавить близких и родственные связи',
  'Собрать первую ветвь семейного древа',
  'Сохранить одну старую фотографию',
  'Добавить к ней имена, дату, место и историю',
  'Записать рассказ старшего родственника',
  'Сохранить семейное событие, традицию или реликвию',
];

export default function SlideCSI05PilotSevenSteps() {
  return (
    <CsiSlideFrame
      id="csi-5"
      eyebrow="Пилот"
      title="«Моя семейная история — первые 7 шагов»"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white/70 border border-amber-900/10 rounded-xl px-4 py-3"
          >
            <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {i + 1}
            </div>
            <span className="text-sm text-stone-800 leading-relaxed pt-0.5">{text}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-stone-600 leading-relaxed">
        Небольшой маршрут для участников одной программы или мероприятия ЦСИ —
        без большой интеграции на первом этапе.
      </p>

      <div className="mt-4 flex items-start gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
        <Icon name="Info" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          На первом этапе рассказ сохраняется доступным в продукте способом;
          формат уточняется вместе с ЦСИ.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
