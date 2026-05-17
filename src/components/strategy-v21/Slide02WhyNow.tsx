import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const steps = [
  {
    icon: 'Landmark' as const,
    title: 'Долгосрочный государственный приоритет',
    text: 'Семья закреплена как приоритет страны до 2036 года',
  },
  {
    icon: 'Unplug' as const,
    title: 'Цифровой семейный слой остаётся фрагментированным',
    text: 'Жизненные семейные сценарии по-прежнему разорваны между сервисами',
  },
  {
    icon: 'DoorOpen' as const,
    title: 'Возникает место для платформенного решения',
    text: 'Единый семейный контур может стать новой точкой координации и дистрибуции',
  },
];

export default function Slide02WhyNow() {
  return (
    <SlideFrame
      id="slide-2"
      eyebrow="Почему именно сейчас"
      title="Семья закреплена как долгосрочный приоритет до 2036 года"
      subtitle="Для государственного банка это не внешняя социальная тема, а совпадение с долгосрочной рамкой страны и окном для цифрового семейного слоя"
      tone="accent"
      footnote="Источник: распоряжение Правительства РФ № 615-р"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <Icon name={step.icon} size={22} />
            </div>
            <div className="text-xs uppercase tracking-wider text-indigo-600 mb-1">
              Шаг {i + 1}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
              {step.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-900 text-white rounded-xl px-5 py-4 flex items-start gap-3">
        <Icon
          name="Landmark"
          size={20}
          className="text-amber-300 mt-0.5 shrink-0"
        />
        <p className="text-sm sm:text-base leading-relaxed">
          <span className="text-amber-300 font-semibold">Для госбанка:</span> это
          сочетание социальной значимости, клиентского контекста и
          стратегической уместности.
        </p>
      </div>
    </SlideFrame>
  );
}