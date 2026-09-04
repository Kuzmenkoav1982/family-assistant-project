import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const currentSteps = [
  'Создать семейное пространство',
  'Добавить близких и родственные связи',
  'Собрать первую ветвь семейного древа',
  'Сохранить одну старую фотографию',
  'Добавить имена, дату, место и текстовую историю',
  'Сохранить семейное событие, традицию или реликвию',
];

const nextSteps = [
  'аудиозапись рассказа старшего родственника',
  'расшифровка устного интервью',
  'расширенные метаданные по методике ЦСИ',
  'отдельная процедура «Предложить Центру»',
];

export default function SlideCSI05PilotSevenSteps() {
  return (
    <CsiSlideFrame
      id="csi-5"
      eyebrow="Пилот"
      title="«Моя семейная история — первые шаги»"
    >
      <div className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider">
        В рамках текущего продукта
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentSteps.map((text, i) => (
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

      <div className="text-sm font-semibold text-stone-700 mb-3 mt-6 uppercase tracking-wider">
        Возможное развитие пилота — обсуждается
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {nextSteps.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 bg-stone-100/70 border border-dashed border-stone-300 rounded-xl px-4 py-2.5"
          >
            <Icon name="Sprout" size={15} className="text-stone-500 shrink-0 mt-0.5" />
            <span className="text-sm text-stone-600 leading-relaxed">{text}</span>
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
          Верхний блок — то, что работает в продукте уже сегодня. Нижний блок —
          то, что мы готовы доработать, если это окажется нужным Центру.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
