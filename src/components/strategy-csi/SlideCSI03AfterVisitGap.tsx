import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const steps = [
  { icon: 'Sparkles' as const, text: 'Человек увидел ценность семейной истории' },
  { icon: 'Search' as const, text: 'Захотел исследовать собственную семью' },
  { icon: 'Home' as const, text: 'Вернулся домой' },
  { icon: 'HelpCircle' as const, text: 'Не знает, с чего начать' },
  { icon: 'MessagesSquare' as const, text: 'Материалы снова расходятся по телефону, чатам и бумажным папкам' },
  { icon: 'CloudFog' as const, text: 'Без понятного продолжения исследование может остановиться после первого интереса' },
];

export default function SlideCSI03AfterVisitGap() {
  return (
    <CsiSlideFrame
      id="csi-3"
      eyebrow="Гипотеза, которую хотим проверить вместе"
      title="Что происходит после выставки или мастер-класса?"
    >
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-white/70 border border-amber-900/10 rounded-xl px-4 py-3"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold shrink-0">
              {i + 1}
            </div>
            <Icon name={s.icon} size={18} className="text-amber-700 shrink-0" />
            <span className="text-sm sm:text-base text-stone-800">{s.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-stone-900 text-amber-50 rounded-xl px-5 py-4 text-sm sm:text-base leading-relaxed">
        Мы предполагаем, что между посещением Центра и дальнейшей домашней
        работой может не хватать простого цифрового маршрута. Хотим проверить
        эту гипотезу вместе с вами.
      </div>
    </CsiSlideFrame>
  );
}