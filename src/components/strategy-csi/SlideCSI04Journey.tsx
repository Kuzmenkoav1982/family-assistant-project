import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const stages = [
  {
    icon: 'Landmark' as const,
    title: 'ЦСИ',
    desc: 'Выставка / лаборатория / мастер-класс',
  },
  {
    icon: 'Route' as const,
    title: 'Совместный цифровой маршрут',
    desc: 'Методика ЦСИ + инструменты «Нашей Семьи»',
  },
  {
    icon: 'Lock' as const,
    title: 'Частное семейное пространство',
    desc: 'Древо / люди / фотографии / истории / события / традиции',
  },
  {
    icon: 'HeartHandshake' as const,
    title: 'Добровольное продолжение',
    desc: 'Возвращение в программу ЦСИ или добровольное предложение отдельных материалов для возможного проекта Центра',
  },
];

export default function SlideCSI04Journey() {
  return (
    <CsiSlideFrame
      id="csi-4"
      eyebrow="Предлагаемая модель"
      title="Из Центра — в семью. Из семьи — в культурную память"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stages.map((s, i) => (
          <div key={i} className="flex md:flex-col items-center gap-3 md:gap-0">
            <div className="bg-white/70 border border-amber-900/10 rounded-xl p-4 flex-1 md:w-full text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <Icon name={s.icon} size={20} />
              </div>
              <div className="text-sm font-semibold text-stone-900 mb-1">{s.title}</div>
              <div className="text-xs text-stone-600 leading-relaxed">{s.desc}</div>
            </div>
            {i < stages.length - 1 && (
              <Icon
                name="ArrowRight"
                size={18}
                className="text-amber-700 shrink-0 md:rotate-90 md:my-2"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border-2 border-amber-800/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <Icon name="ShieldCheck" size={20} className="text-amber-800 shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base text-stone-900 leading-relaxed font-medium">
          Частный семейный контур закрыт по умолчанию. Передача материалов ЦСИ
          возможна только отдельно, добровольно и с явным согласием.
        </p>
      </div>

      <div className="mt-3 flex items-start gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
        <Icon name="Info" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Передача материалов не является обязательной частью пилота и возможна
          только по отдельной процедуре — после согласования требований и
          получения необходимых согласий. Что именно означает «передача»
          (показать, предоставить копию, разрешить публикацию, включить в
          исследование или выставку) — определяем вместе с Центром.
        </p>
      </div>
    </CsiSlideFrame>
  );
}