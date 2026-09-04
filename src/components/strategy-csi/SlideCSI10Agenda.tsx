import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const questions = [
  'Есть ли у ЦСИ потребность в цифровом продолжении семейно-исторических программ?',
  'Какая аудитория была бы наиболее подходящей для первого теста?',
  'К какой существующей программе Центра можно было бы подключиться?',
  'Какие методические требования должен соблюдать цифровой маршрут?',
  'Какие материалы допустимо хранить в частном семейном пространстве?',
  'Какие действия должны происходить только по отдельному согласию?',
  'Как выглядел бы небольшой пилот без сложной интеграции?',
];

export default function SlideCSI10Agenda() {
  return (
    <CsiSlideFrame
      id="csi-10"
      eyebrow="Повестка встречи"
      title="Что мы предлагаем обсудить сегодня"
      subtitle="Мы не приносим готовое решение — приносим гипотезу и вопросы, ответы на которые есть только у Центра."
    >
      <div className="space-y-2.5">
        {questions.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white/70 border border-amber-900/10 rounded-xl px-4 py-3"
          >
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-semibold shrink-0">
              {i + 1}
            </div>
            <span className="text-sm sm:text-base text-stone-800 leading-relaxed pt-0.5">
              {text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-stone-900 text-amber-50 rounded-xl px-5 py-4 flex items-start gap-3">
        <Icon name="Compass" size={20} className="text-amber-300 shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base leading-relaxed">
          Мы не предлагаем сразу запускать большую платформу. Наша цель — сначала
          проверить одну гипотезу на небольшой группе семей.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
