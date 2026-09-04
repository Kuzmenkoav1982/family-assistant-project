import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const notOffering = [
  'заменять методику и экспертизу ЦСИ',
  'автоматически передавать Центру семейные материалы',
  'превращать частные архивы в открытую базу',
  'сразу создавать музейную информационную систему',
  'требовать эксклюзивности',
  'делать сложную билетную или техническую интеграцию',
  'публиковать материалы без отдельного согласия',
  'использовать имя и логотип музея без согласования',
];

const offering = [
  'проверить одну образовательную гипотезу',
  'использовать уже работающий цифровой контур',
  'получить экспертную обратную связь Центра',
  'совместно определить необходимые доработки',
  'принять решение о дальнейшем формате только после пилота',
];

export default function SlideCSI11Boundaries() {
  return (
    <CsiSlideFrame
      id="csi-11"
      eyebrow="Прозрачные рамки"
      title="Чего мы не предлагаем на первом этапе"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/70 border border-stone-300 rounded-xl p-5">
          <div className="text-sm font-semibold text-stone-600 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Icon name="XCircle" size={16} />
            Мы не предлагаем
          </div>
          <ul className="space-y-2.5">
            {notOffering.map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-stone-700 leading-relaxed"
              >
                <Icon name="Minus" size={14} className="text-stone-400 shrink-0 mt-1" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-800/20 rounded-xl p-5">
          <div className="text-sm font-semibold text-amber-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Icon name="CheckCircle2" size={16} />
            Мы предлагаем
          </div>
          <ul className="space-y-2.5">
            {offering.map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-stone-800 leading-relaxed"
              >
                <Icon name="Check" size={14} className="text-amber-700 shrink-0 mt-1" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
        <Icon name="Handshake" size={16} className="text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Методика, экспертиза и репутация остаются за Центром. Мы отвечаем за
          цифровой инструмент и готовы адаптировать его под требования ЦСИ.
        </p>
      </div>
    </CsiSlideFrame>
  );
}
