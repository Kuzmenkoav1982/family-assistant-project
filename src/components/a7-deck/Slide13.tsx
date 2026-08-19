import Icon from '@/components/ui/icon';
import { CANONICAL_METRICS } from '@/components/presentation/canonicalMetrics';

const metrics = [
  { icon: 'Layers', value: CANONICAL_METRICS.uiModules.formatted, label: 'UI/бизнес-модулей', bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', accent: 'text-violet-700' },
  { icon: 'Plug', value: CANONICAL_METRICS.backendFunctions.formatted, label: 'backend functions', bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-200', accent: 'text-indigo-700' },
  { icon: 'Database', value: CANONICAL_METRICS.coreTables.formatted, label: 'продуктовых таблиц БД', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', accent: 'text-emerald-700' },
  { icon: 'LayoutGrid', value: CANONICAL_METRICS.hubs.formatted, label: 'хабов платформы', bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', accent: 'text-pink-700' },
  { icon: 'Boxes', value: CANONICAL_METRICS.sections.formatted, label: 'разделов в хабах', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', accent: 'text-amber-700' },
  { icon: 'Wallet', value: '4', label: 'модуля хаба «Финансы»', bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-200', accent: 'text-cyan-700' },
];

const proofs = [
  { icon: 'ShieldCheck', title: 'Российская инфраструктура', desc: 'Персональные данные в контуре РФ, соответствие 152-ФЗ' },
  { icon: 'BadgeCheck', title: 'Реестр российского ПО', desc: 'Включение в Единый реестр — открывает B2G-каналы и льготы' },
  { icon: 'Zap', title: 'Founder-led AI-native разработка', desc: 'Короткие циклы итераций, быстрая доставка новых интеграций' },
];

export default function Slide13() {
  return (
    <section
      id="slide-13"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-purple-100/50"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-600 shrink-0">
          <Icon name="Layers3" size={24} className="text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Icon name="BarChart3" size={11} />
            Архитектурная зрелость
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">Готовая платформа, а не идея на бумаге</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className={`rounded-xl border ${m.border} bg-gradient-to-br ${m.bg} p-4 flex flex-col gap-1`}>
            <Icon name={m.icon} size={16} className={m.accent} />
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none mt-1">{m.value}</div>
            <div className="text-[11px] font-semibold text-gray-700 leading-tight">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {proofs.map((p) => (
          <div key={p.title} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-2 shadow-sm">
              <Icon name={p.icon} size={18} className="text-indigo-700" />
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{p.title}</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-snug">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-[12px] text-gray-700 leading-relaxed">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="Info" size={15} className="text-slate-700" />
          </div>
          <p>
            Мы намеренно не приводим здесь пользовательские метрики (MAU, retention) — платформа находится на ранней
            стадии, и предъявлять их инвестору такого уровня как доказательство было бы нечестно. Аргумент этого слайда —
            архитектурная готовность: интеграция финансового хаба ложится на существующую структуру, а не строится с нуля.
          </p>
        </div>
      </div>
    </section>
  );
}
