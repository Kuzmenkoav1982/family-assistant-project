import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const csiPoints = [
  'увлекает человека исследованием своих предков',
  'обучает работе с семейными источниками',
  'собирает устные и письменные истории',
  'проводит выставки и просветительские программы',
  'формирует народный архив',
];

const nsPoints = [
  'помогает подключить родственников',
  'собирает родственные связи',
  'сохраняет фотографии и истории',
  'формирует семейную хронологию',
  'помогает поддерживать работу с памятью дома',
];

export default function SlideCSI02SharedMission() {
  return (
    <CsiSlideFrame
      id="csi-2"
      eyebrow="Общее смысловое поле"
      title="Одна миссия — разные пространства"
      footnote="Источники: официальный сайт Центра семейной истории; официальный сайт музея-заповедника В. Д. Поленова."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 border border-amber-900/10 rounded-xl p-5">
          <div className="text-sm font-semibold text-amber-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Landmark" size={16} />
            Центр семейной истории
          </div>
          <ul className="space-y-2.5">
            {csiPoints.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-stone-800 leading-relaxed">
                <Icon name="Dot" size={20} className="text-amber-600 shrink-0 -mt-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/70 border border-amber-900/10 rounded-xl p-5">
          <div className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Home" size={16} />
            «Наша Семья»
          </div>
          <ul className="space-y-2.5">
            {nsPoints.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-stone-800 leading-relaxed">
                <Icon name="Dot" size={20} className="text-stone-500 shrink-0 -mt-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-800/15 rounded-xl px-5 py-4 text-sm sm:text-base text-stone-800 leading-relaxed">
        ЦСИ создаёт интерес и методологию. Приложение может превратить разовое
        посещение в продолжающееся семейное исследование.
      </div>
    </CsiSlideFrame>
  );
}
