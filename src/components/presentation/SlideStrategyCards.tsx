import Icon from '@/components/ui/icon';
import { MODULES, type ModuleStatus } from './moduleData';

const STRATEGY_IDS = [
  'support-navigator',
  'large-family',
  'pregnancy',
  'case-manager',
  'svo-family',
  'student-family',
  'social-contract',
  'zog',
  'nannies',
  'rental',
  'after-school',
  'mediation',
  'tourism',
  'b2b2c',
  'region-api',
  'compatriots',
];

const STATUS_BADGE: Record<ModuleStatus, { bg: string; text: string; border: string; label: string; dot: string }> = {
  live: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Уже работает',
    dot: 'bg-emerald-500',
  },
  dev: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'В разработке',
    dot: 'bg-amber-400',
  },
  planned: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'План по 615-р',
    dot: 'bg-purple-400',
  },
};

export function SlideStrategyCards() {
  const cards = STRATEGY_IDS.map((id) => MODULES[id]).filter(Boolean);

  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-3">
          <Icon name="FileText" size={14} className="text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
            Стратегия 615-р · карточки модулей
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Печатная карта по Распоряжению № 615-р</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Каждый модуль с цитатой из Стратегии и привязкой к KPI. Версия для печати и PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cards.map((m) => {
          const badge = STATUS_BADGE[m.status];
          return (
            <div
              key={m.id}
              className={`rounded-xl border ${badge.border} ${badge.bg} p-4 flex flex-col gap-2.5`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name={m.icon} size={18} className={badge.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{m.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${badge.text} bg-white border ${badge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">{m.shortDesc}</p>
                </div>
              </div>

              {m.citation && (
                <div className="bg-white/70 border-l-2 border-purple-400 pl-2.5 py-1.5 rounded-r">
                  <p className="text-[10px] text-gray-700 italic leading-snug">
                    «{m.citation.text}»
                  </p>
                  <p className="text-[9px] text-purple-700 font-semibold mt-0.5">
                    Стратегия 615-р · {m.citation.section}
                  </p>
                </div>
              )}

              {m.kpi && m.kpi.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.kpi.map((k, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-[9px] font-medium text-gray-700"
                    >
                      <Icon name="Target" size={9} className="text-purple-600" />
                      {k}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-gray-200/70">
                <div className="flex gap-1">
                  {m.audience.map((a) => (
                    <span key={a} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
                {m.timeline && <span className="text-gray-500">{m.timeline}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-6">
        Слайд · Печатные карточки 615-р · {cards.length} модулей · Версия 2.6
      </p>
    </section>
  );
}

export default SlideStrategyCards;
