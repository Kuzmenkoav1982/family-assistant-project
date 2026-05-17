import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const steps = [
  {
    icon: 'Landmark' as const,
    title: 'Долгосрочный приоритет',
    text: 'Семья закреплена как приоритет страны до 2036 года',
  },
  {
    icon: 'Unplug' as const,
    title: 'Цифровой разрыв',
    text: 'Семейный цифровой слой остаётся фрагментированным',
  },
  {
    icon: 'DoorOpen' as const,
    title: 'Окно возможностей',
    text: 'Возникает место для платформенного семейного решения',
  },
];

export default function Slide02WhyNow() {
  return (
    <SlideFrame
      id="slide-2"
      eyebrow="Почему именно сейчас"
      title="Семья закреплена как долгосрочный приоритет до 2036 года"
      subtitle="Цифровой семейный слой по-прежнему остаётся фрагментированным"
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
