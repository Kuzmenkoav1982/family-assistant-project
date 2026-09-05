import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

const codes = [
  {
    icon: 'Home' as const,
    title: 'Дом и память',
    text: 'Поленово показывает, как дом, вещи и семейная хроника превращаются в наследие поколений — от записи 1887 года до музея, который семья открыла для людей.',
  },
  {
    icon: 'Hammer' as const,
    title: 'Труд и мастерство',
    text: 'Оружейные, самоварные, пряничные и музыкальные династии Тулы позволяют исследовать передачу профессии, инструмента и семейной репутации.',
  },
  {
    icon: 'Sparkles' as const,
    title: 'Традиция и творчество',
    text: 'Домашний театр Поленовых, Натальин день и Бал фонарей показывают, как повторяемая семейная практика становится живой культурой края.',
  },
  {
    icon: 'History' as const,
    title: 'Частная история и история страны',
    text: 'Революция, репрессии, война, эвакуация и восстановление становятся понятнее через судьбы конкретных семей — а не только через даты и цифры.',
  },
];

export default function SlideCSI04bCulture() {
  return (
    <CsiSlideFrame
      id="csi-4b"
      eyebrow="Культурная основа"
      title="Почему эта идея органична именно для Тульского края"
      footnote="Источники: музей-заповедник В. Д. Поленова; Центр семейной истории; Государственный архив Тульской области; Тульское музейное объединение; Тульский государственный музей оружия."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {codes.map((c, i) => (
          <div
            key={i}
            className="bg-white/70 border border-amber-900/10 rounded-xl p-5"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Icon name={c.icon} size={18} />
            </div>
            <div className="text-sm font-semibold text-stone-900 mb-1.5">
              {c.title}
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-800/15 rounded-xl px-5 py-4 text-sm sm:text-base text-stone-800 leading-relaxed">
        Совместный проект может помочь семье увидеть, что её дом, профессия,
        фотография, традиция или семейная вещь — часть истории Тульского края
        и страны.
      </div>
    </CsiSlideFrame>
  );
}
