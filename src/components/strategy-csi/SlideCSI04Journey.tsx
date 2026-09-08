import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const stages = [
  {
    icon: 'CalendarClock' as const,
    title: 'Договориться',
    desc: 'Кто, когда и что делает',
    tools: 'Задачи · календарь · напоминания',
  },
  {
    icon: 'Users' as const,
    title: 'Сделать вместе',
    desc: 'Подключить родственников и собрать разные знания',
    tools: 'Участники · общение · роли',
  },
  {
    icon: 'BookOpenText' as const,
    fallback: 'BookOpen' as const,
    title: 'Понять ценность',
    desc: 'Почему эта история важна',
    tools: 'Ценности · традиции · семейный код',
  },
  {
    icon: 'GitBranch' as const,
    title: 'Сохранить и связать',
    desc: 'Соединить человека, материал и событие',
    tools: 'Семейное древо · Альбом поколений · Мастерская жизни',
  },
];

export default function SlideCSI04Journey() {
  return (
    <CsiSlideFrame
      id="csi-4"
      eyebrow="Предлагаемая модель"
      title="Семейная история продолжается дома"
      subtitle="ЦСИ помогает начать исследование. «Наша Семья» поддерживает совместные действия, необходимые для его продолжения."
    >
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* ЦСИ */}
        <div className="flex flex-col items-center justify-center text-center bg-white/70 border border-amber-900/10 rounded-2xl p-4 md:w-32 shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <Icon name="DoorOpen" size={20} />
          </div>
          <div className="text-sm font-semibold text-stone-900">ЦСИ</div>
          <div className="text-[11px] text-stone-500 mt-1 leading-snug">Импульс и методика</div>
        </div>

        <Icon name="ArrowRight" size={18} className="text-amber-700 shrink-0 hidden md:block self-center" />
        <Icon name="ArrowDown" size={18} className="text-amber-700 shrink-0 md:hidden self-center mx-auto" />

        {/* Платформа «Наша Семья» под четырьмя этапами */}
        <div className="relative flex-1 pb-7 md:pb-9">
          <div
            aria-hidden
            className="hidden md:block absolute inset-x-0 top-0 bottom-7 bg-amber-50/70 border border-amber-800/15 rounded-2xl"
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:p-3">
            {stages.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-amber-900/10 rounded-xl p-4 text-center flex flex-col items-center shadow-sm h-full"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Icon name={s.icon} fallback={s.fallback} size={18} />
                </div>
                <div className="text-sm font-semibold text-stone-900 mb-1">{s.title}</div>
                <div className="text-xs text-stone-600 leading-relaxed mb-2">{s.desc}</div>
                <div className="text-[10px] text-stone-500 leading-relaxed mt-auto pt-2 border-t border-stone-200 w-full">
                  {s.tools}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center text-[11px] font-medium text-amber-900 leading-snug">
            Закрытое семейное пространство «Наша Семья» — организация · взаимодействие · ценности · память
          </div>
        </div>

        <Icon name="ArrowRight" size={18} className="text-amber-700 shrink-0 hidden md:block self-center" />
        <Icon name="ArrowDown" size={18} className="text-amber-700 shrink-0 md:hidden self-center mx-auto" />

        {/* Преемственность поколений */}
        <div className="flex flex-col items-center justify-center text-center bg-amber-50 border-2 border-amber-800/25 rounded-2xl md:rounded-full p-5 md:w-40 shrink-0 mx-auto">
          <div className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center mb-2">
            <Icon name="Sparkles" size={20} />
          </div>
          <div className="text-sm font-semibold text-stone-900 leading-snug">Преемственность поколений</div>
          <div className="text-[11px] text-stone-600 mt-1 leading-snug">
            Обсуждать · дополнять · передавать дальше
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs sm:text-sm text-stone-500">
        <Icon name="CornerUpLeft" size={14} className="text-stone-400 shrink-0" />
        Память растёт через регулярные семейные действия — а не через разовое посещение
      </div>

      <div className="mt-6 bg-amber-50 border-2 border-amber-800/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <Icon name="Lock" size={20} className="text-amber-800 shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base text-stone-900 leading-relaxed font-medium">
          Семья сама определяет участников и доступ к материалам. Частный семейный контур
          закрыт по умолчанию — передача материалов ЦСИ возможна только отдельно, добровольно
          и с явным согласием.
        </p>
      </div>

      <div className="mt-3 flex items-start gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
        <Icon name="Info" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Передача материалов не является обязательной частью пилота и возможна только по
          отдельной процедуре — после согласования требований и получения необходимых
          согласий. Что именно означает «передача» (показать, предоставить копию, разрешить
          публикацию, включить в исследование или выставку) — определяем вместе с Центром.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
