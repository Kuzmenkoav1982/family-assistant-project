import SlideFrame from './SlideFrame';
import PsbCardImg from './PsbCardImg';

const layers = [
  {
    num: '01',
    emoji: null,
    cardImg: true,
    label: 'Детская карта ПСБ',
    desc: 'Финансовый инструмент, контроль, безопасность',
    tags: ['Лимиты', 'Уведомления', 'Безопасность'],
    color: 'border-indigo-200 bg-indigo-50',
    accent: 'text-indigo-700',
    tag: 'bg-indigo-100 text-indigo-700',
  },
  {
    num: '02',
    cardImg: null,
    emoji: '📱',
    label: 'Модуль «Наша семья / Дети»',
    desc: 'Среда развития, финансовой грамотности, семейного взаимодействия',
    tags: ['Развитие', 'Цели', 'Привычки'],
    color: 'border-emerald-200 bg-emerald-50',
    accent: 'text-emerald-700',
    tag: 'bg-emerald-100 text-emerald-700',
  },
  {
    num: '03',
    cardImg: null,
    emoji: '📚',
    label: 'Партнёрский контент',
    desc: 'Книги, аудиокниги, обучающие подборки — опционально',
    tags: ['Библиотека', 'Аудио', 'Контент'],
    color: 'border-amber-200 bg-amber-50',
    accent: 'text-amber-700',
    tag: 'bg-amber-100 text-amber-700',
    optional: true,
  },
];

export default function Slide03() {
  return (
    <SlideFrame
      id="slide-3"
      eyebrow="03. Совместное решение"
      title="Мы предлагаем не просто карту, а совместный экосистемный формат"
    >
      <div className="flex flex-col gap-3 mb-8">
        {layers.map((layer, i) => (
          <div key={layer.num} className="flex items-stretch gap-0">
            <div className={`rounded-2xl border p-5 flex-1 flex flex-col sm:flex-row sm:items-center gap-4 ${layer.color}`}>
              <div className="flex items-center gap-4 sm:w-56">
                {layer.cardImg ? (
                  <PsbCardImg className="w-14 h-9 shadow-md" />
                ) : (
                  <div className="text-3xl shrink-0">{layer.emoji}</div>
                )}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${layer.accent}`}>
                    Слой {layer.num} {layer.optional && <span className="ml-1 opacity-60">(опционально)</span>}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900">{layer.label}</div>
                </div>
              </div>
              <div className="flex-1 text-sm text-slate-600 leading-relaxed">{layer.desc}</div>
              <div className="flex flex-wrap gap-1.5">
                {layer.tags.map((t) => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${layer.tag}`}>{t}</span>
                ))}
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="flex items-center justify-center w-8 text-slate-300 text-xl font-light select-none">↓</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-2xl px-6 py-5 text-center">
        <span className="text-base sm:text-lg font-semibold">
          Карта + цифровая ценность = долгосрочный семейный продукт
        </span>
      </div>
    </SlideFrame>
  );
}