import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const CSI_LOGO_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/5a2d382f-2406-4676-abfb-6e92d1fbc421.png';
const NS_LOGO_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/c0fcb6ce-d833-4fce-b2d4-26dda0c44c4b.png';

const csiPoints = [
  'увлекает человека исследованием своих предков',
  'обучает работе с семейными источниками',
  'собирает устные и письменные истории',
  'проводит выставки и просветительские программы',
  'развивает идею народного архива и вовлекает жителей в работу с семейными источниками',
];

const nsPoints = [
  'помогает подключить родственников',
  'собирает родственные связи',
  'помогает семье собирать и структурировать фотографии, истории и события',
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
          <div className="flex items-center gap-3 mb-4">
            <img src={CSI_LOGO_URL} alt="Центр семейной истории" className="h-9 w-auto" />
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
          <div className="flex items-center gap-2.5 mb-4">
            <img src={NS_LOGO_URL} alt="Наша Семья" className="w-9 h-9 rounded-lg shadow-sm" />
            <span className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
              «Наша Семья»
            </span>
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