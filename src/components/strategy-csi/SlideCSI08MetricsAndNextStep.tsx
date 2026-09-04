import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const metrics = [
  'сколько семей начали маршрут',
  'сколько завершили все шаги',
  'сколько подключили второго родственника',
  'сколько сохранили хотя бы одну семейную историю',
  'сколько вернулись через 7 и 30 дней',
  'сколько захотели продолжить работу с Центром',
];

const decisions = [
  'Кто со стороны ЦСИ отвечает за направление?',
  'Какую программу или аудиторию берём для пилота?',
  'Какие методические и юридические требования нужно учесть?',
];

export default function SlideCSI08MetricsAndNextStep() {
  return (
    <CsiSlideFrame
      id="csi-8"
      eyebrow="Небольшой пилот — измеримый результат"
      title="Как проверить результат и что делать дальше"
    >
      <div className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider">
        Возможные показатели
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        {metrics.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 bg-white/70 border border-amber-900/10 rounded-lg px-3 py-2"
          >
            <Icon name="BarChart3" size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-stone-800">{text}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-800/15 rounded-xl px-5 py-4 mb-6">
        <div className="text-sm font-semibold text-amber-900 mb-1">Следующий шаг</div>
        <p className="text-sm sm:text-base text-stone-800 leading-relaxed">
          Организовать установочную встречу с представителем ЦСИ, уточнить их
          текущую задачу и выбрать одну программу для небольшого пилота.
        </p>
      </div>

      <div className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider">
        Три решения, которые нужны после встречи
      </div>
      <div className="space-y-2">
        {decisions.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-stone-900 text-amber-50 rounded-xl px-4 py-3"
          >
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {i + 1}
            </div>
            <span className="text-sm leading-relaxed">{text}</span>
          </div>
        ))}
      </div>
    </CsiSlideFrame>
  );
}