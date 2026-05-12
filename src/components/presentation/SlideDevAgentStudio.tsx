import Icon from '@/components/ui/icon';

/**
 * Слайд: «Внутренняя AI-фабрика разработки» — Dev Agent Studio.
 * Подача: бизнес-формулировки, без англицизмов и упоминаний GitHub/stage/prod/Copilot.
 * Угол подачи — три преимущества одной карточкой:
 *   капитализация, технологическое лидерство, защита от bus-factor.
 */

const CAPABILITIES = [
  { icon: 'Library',     text: 'индексирует кодовую базу и документацию' },
  { icon: 'Search',      text: 'ускоряет поиск решений и онбординг инженеров' },
  { icon: 'GitCommit',   text: 'работает с версионными срезами кода' },
  { icon: 'Layers',      text: 'разделяет тестовый и боевой контуры' },
  { icon: 'UsersRound',  text: 'уменьшает зависимость от экспертизы отдельных сотрудников' },
  { icon: 'Bot',         text: 'создаёт основу для частично автономного инженерного сопровождения' },
];

const ADVANTAGES = [
  {
    icon: 'TrendingUp',
    title: 'Капитализация и масштабируемость',
    text: 'Внутренний AI ускоряет рост команды и снижает стоимость каждого нового релиза. Это напрямую отражается на оценке компании.',
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
  },
  {
    icon: 'Sparkles',
    title: 'Технологическое лидерство',
    text: 'Свой AI-инструмент разработки в российской семейной нише. Снижение зависимости от зарубежных аналогов.',
    color: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    accent: 'text-violet-700',
  },
  {
    icon: 'ShieldCheck',
    title: 'Защита от bus-factor',
    text: 'Любой инженер входит в проект за дни, а не месяцы. Накопленный код и знания превращаются в производственную систему.',
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
  },
];

export const SlideDevAgentStudio = () => {
  return (
    <section data-pdf-slide className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-6 border border-purple-100/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Icon name="Cpu" size={12} />
          Внутренняя AI-фабрика разработки
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Снижает стоимость разработки и ускоряет масштабирование команды
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Внутренний AI-инструмент, который превращает накопленный код и знания команды в производственную систему.
        </p>
      </div>

      {/* Возможности */}
      <div className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
          Что умеет
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAPABILITIES.map((c, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50/60 p-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                <Icon name={c.icon} fallback="Circle" size={15} className="text-indigo-600" />
              </div>
              <div className="text-[12px] text-gray-800 leading-snug pt-1">{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Бизнес-смысл для инвестора — три преимущества одной карточкой */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
          Бизнес-смысл для инвестора
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ADVANTAGES.map((a, idx) => (
            <div
              key={idx}
              className={`rounded-xl border ${a.border} bg-gradient-to-br ${a.color} p-4 flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name={a.icon} fallback="Star" size={16} className={a.accent} />
                </div>
                <h4 className={`text-[13px] font-bold ${a.accent} leading-tight`}>{a.title}</h4>
              </div>
              <p className="text-[12px] text-gray-700 leading-snug">{a.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 border p-3 text-[12px] text-gray-600 leading-relaxed">
          <strong className="text-gray-900">Что это даёт:</strong> быстрее выпуск новых функций · ниже стоимость
          ошибки и повторной разработки · меньше зависимости от отдельных сотрудников · выше скорость масштабирования
          инженерной команды.
        </div>
      </div>
    </section>
  );
};

export default SlideDevAgentStudio;
