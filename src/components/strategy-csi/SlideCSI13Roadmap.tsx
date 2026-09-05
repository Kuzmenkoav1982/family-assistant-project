import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const steps = [
  {
    icon: 'Landmark' as const,
    title: 'Программа ЦСИ',
    desc: 'Выставка · лекция · лаборатория · мастер-класс',
    caption: 'Человек видит ценность частной истории и получает первый методический импульс.',
  },
  {
    icon: 'Route' as const,
    title: 'Цифровой маршрут',
    desc: 'Добавить родственников · выбрать фотографию · записать сведения · сохранить событие',
    caption: 'Содержание и терминология маршрута проверяются вместе с ЦСИ.',
  },
  {
    icon: 'Lock' as const,
    title: 'Закрытое семейное пространство',
    tools: ['Семейное древо', 'Альбом поколений', 'Мастерская жизни'],
    caption: 'Семья связывает людей, фотографии, воспоминания и события.',
  },
  {
    icon: 'HeartHandshake' as const,
    title: 'Домашнее продолжение',
    desc: 'Подключение родственников · дополнение истории · семейные обсуждения',
    caption: 'Разовый интерес может превратиться в регулярную семейную практику.',
  },
];

export default function SlideCSI13Roadmap() {
  return (
    <CsiSlideFrame
      id="csi-13"
      eyebrow="Приложение 2 · Возможный маршрут"
      title="От музейного знакомства — к семейному исследованию дома"
      subtitle="Как может работать совместный цифровой маршрут ЦСИ × «Наша Семья»"
      tone="accent"
    >
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center gap-3 flex-1">
            <div className="bg-white/70 border border-amber-900/10 rounded-2xl p-5 flex-1 w-full text-center flex flex-col items-center min-h-[190px]">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shrink-0">
                <Icon name={s.icon} size={20} />
              </div>
              <div className="text-sm font-semibold text-stone-900 mb-1.5">{s.title}</div>
              {s.desc && (
                <div className="text-xs text-stone-600 leading-relaxed mb-2">{s.desc}</div>
              )}
              {s.tools && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                  {s.tools.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-medium text-amber-800 bg-amber-100 rounded-full px-2.5 py-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-[11px] text-stone-500 leading-relaxed mt-auto pt-2 border-t border-stone-200 w-full">
                {s.caption}
              </div>
            </div>
            <Icon
              name="ArrowDown"
              size={18}
              className="text-amber-700 shrink-0 md:hidden"
            />
            <Icon
              name="ArrowRight"
              size={18}
              className="text-amber-700 shrink-0 hidden md:block"
            />
          </div>
        ))}

        {/* Шаг 5 — развилка добровольного возврата */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="bg-white border-2 border-emerald-700/25 rounded-2xl p-4 flex-1 text-center flex flex-col items-center justify-center">
            <Icon name="Undo2" fallback="RotateCcw" size={18} className="text-emerald-700 mb-1.5" />
            <div className="text-xs font-semibold text-stone-900 mb-1">Основное продолжение</div>
            <div className="text-[11px] text-stone-600 leading-relaxed">
              Участие в следующих программах, лекциях и лабораториях Центра
            </div>
          </div>
          <div className="bg-white/60 border-2 border-dashed border-amber-800/30 rounded-2xl p-4 flex-1 text-center flex flex-col items-center justify-center">
            <Icon name="Sprout" size={18} className="text-amber-700 mb-1.5" />
            <div className="text-xs font-semibold text-stone-900 mb-1">
              Дополнительный перспективный сценарий
            </div>
            <div className="text-[11px] text-stone-600 leading-relaxed">
              Добровольное предложение отдельного материала для рассмотрения ЦСИ
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-500">
        <Icon name="CornerUpLeft" size={14} className="text-stone-400 shrink-0" />
        Только по выбору семьи и по отдельно согласованной процедуре — возможное продолжение отношений с ЦСИ
      </div>

      <div className="mt-6 bg-amber-50 border-2 border-amber-800/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <Icon name="ShieldCheck" size={20} className="text-amber-800 shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base text-stone-900 leading-relaxed font-medium">
          Семейные материалы закрыты по умолчанию. Ничего не передаётся Центру
          автоматически.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
