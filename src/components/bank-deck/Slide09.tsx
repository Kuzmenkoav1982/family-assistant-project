import SlideFrame from './SlideFrame';
import AlpinaLogo from './AlpinaLogo';

const theses = [
  {
    emoji: '📖',
    title: 'Детская библиотека',
    desc: 'Книги и аудиокниги по возрасту — подобранные, актуальные',
  },
  {
    emoji: '💰',
    title: 'Финансовая грамотность',
    desc: 'Отдельный трек: истории, объяснения, практические задания',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Семейное чтение',
    desc: 'Подборки для совместного чтения родителей и детей',
  },
  {
    emoji: '🌟',
    title: 'Темы по интересам',
    desc: 'Природа, наука, история — развитие не только через деньги',
  },
];

const flowSteps = [
  'Раздел «Дети»',
  'Блок «Читать / слушать»',
  'Подборки по теме / возрасту',
];

export default function Slide09() {
  return (
    <SlideFrame
      id="slide-9"
      eyebrow="09. Библиотека / Альпина"
      title="Следующий этап: образовательный контент внутри детского модуля"
    >
      {/* Stage badge + Alpina logo */}
      <div className="flex flex-wrap items-center gap-3 mb-7">
        <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
          <span>⚡</span> Возможный Этап 2 · Партнёрская интеграция
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-xs text-slate-500">Партнёр:</span>
          <AlpinaLogo size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {theses.map((t) => (
          <div
            key={t.title}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4"
          >
            <span className="text-3xl shrink-0">{t.emoji}</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">{t.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Flow scheme */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">Схема интеграции</div>
        <div className="flex flex-wrap items-center gap-2">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm">
                {step}
              </div>
              {i < flowSteps.length - 1 && (
                <span className="text-slate-400 text-lg">→</span>
              )}
            </div>
          ))}
          <span className="text-slate-400 text-lg">→</span>
          <div className="bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2">
            <AlpinaLogo size="sm" />
            <span className="text-xs text-slate-500">контент</span>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}