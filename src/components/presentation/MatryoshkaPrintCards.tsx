import Icon from '@/components/ui/icon';
import { MODULES, type ModuleStatus } from './moduleData';
import { VALUES_809, VALUES_ORDER } from './values809Data';

// Те же группировки, что и в матрёшке — чтобы расшифровка ячеек 1:1 совпадала
const CORE_IDS = [
  'family-tree',
  'children',
  'health',
  'budget',
  'calendar',
  'tasks',
  'places',
  'chat',
  'ai-assistant',
];

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
];

// Каналы — описания захардкожены, потому что не все есть в MODULES
const CHANNELS = [
  {
    name: 'Госуслуги',
    icon: 'Landmark',
    status: 'planned' as ModuleStatus,
    desc: 'Единый вход через 100M+ аккаунтов. Доставка мер поддержки и интеграция с реестрами семей.',
  },
  {
    name: 'Соцказна',
    icon: 'Database',
    status: 'planned' as ModuleStatus,
    desc: 'Подключение к социальному казначейству для автоматического информирования и оформления льгот.',
  },
  {
    name: 'Региональные ИС',
    icon: 'Network',
    status: 'planned' as ModuleStatus,
    desc: 'Интеграция с информационными системами субъектов РФ — пилотные региональные кабинеты.',
  },
  {
    name: 'МАХ',
    icon: 'Send',
    status: 'live' as ModuleStatus,
    desc: 'Канал в национальном мессенджере. Бот семьи для напоминаний, новостей и быстрого доступа к функциям.',
  },
  {
    name: 'Web',
    icon: 'Globe',
    status: 'live' as ModuleStatus,
    desc: 'Веб-приложение с полной функциональностью. PWA с установкой на устройство.',
  },
  {
    name: 'API регионам',
    icon: 'Code',
    status: 'planned' as ModuleStatus,
    desc: 'Программный интерфейс для подключения региональных операторов и муниципалитетов.',
  },
  {
    name: 'HR / B2B2C',
    icon: 'Briefcase',
    status: 'planned' as ModuleStatus,
    desc: 'Интеграция в корпоративные HR-порталы — корпоративная семейная программа для сотрудников.',
  },
  {
    name: 'Реестр ПО',
    icon: 'BadgeCheck',
    status: 'dev' as ModuleStatus,
    desc: 'Включение в реестр отечественного ПО. Документы поданы и находятся на рассмотрении.',
  },
];

const STATUS_BADGE: Record<
  ModuleStatus,
  { bg: string; text: string; border: string; label: string; dot: string }
> = {
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
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'План по 615-р',
    dot: 'bg-rose-400',
  },
};

interface SectionProps {
  title: string;
  subtitle: string;
  ringColor: string;
  ringBg: string;
  children: React.ReactNode;
  count: number;
}

function PrintSection({ title, subtitle, ringColor, ringBg, children, count }: SectionProps) {
  return (
    <div className="mb-6">
      <div className={`flex items-center gap-3 mb-3 pb-2 border-b-2 ${ringColor}`}>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${ringBg}`}
        >
          {title}
        </div>
        <p className="text-xs text-gray-600">{subtitle}</p>
        <span className="ml-auto text-[10px] text-gray-500 font-medium">{count} ячеек</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

export function MatryoshkaPrintCards() {
  const coreModules = CORE_IDS.map((id) => MODULES[id]).filter(Boolean);
  const strategyModules = STRATEGY_IDS.map((id) => MODULES[id]).filter(Boolean);
  const values = VALUES_ORDER.map((id) => VALUES_809[id]);

  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full mb-3">
          <Icon name="FileText" size={14} className="text-amber-700" />
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Печатная форма матрёшки
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Расшифровка всех ячеек матрёшки
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Каждая ячейка четырёх колец и центра — с описанием, источником и связью с продуктом.
          Версия для печати и PDF.
        </p>
      </div>

      {/* ========== ЦЕНТР: ЦЕННОСТИ 809 ========== */}
      <PrintSection
        title="Центр · Ценности 809"
        subtitle="7 традиционных ценностей по Указу № 809"
        ringColor="border-amber-700"
        ringBg="bg-amber-100 text-amber-800 border border-amber-300"
        count={values.length}
      >
        {values.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2.5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                <Icon name={v.icon} size={18} className="text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 leading-tight">{v.name}</h3>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Реализуется: {v.productMatch.join(', ')}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{v.description}</p>
            <div className="bg-white/80 border-l-2 border-amber-500 pl-2.5 py-1.5 rounded-r">
              <p className="text-[10px] text-amber-900 italic leading-snug">{v.citation}</p>
              <p className="text-[9px] text-amber-700 font-semibold mt-0.5">— {v.citationSource}</p>
            </div>
          </div>
        ))}
      </PrintSection>

      {/* ========== КОЛЬЦО 2: ЯДРО ========== */}
      <PrintSection
        title="Кольцо 2 · Ядро"
        subtitle="8 модулей, которые уже работают и связаны с гос-повесткой"
        ringColor="border-emerald-600"
        ringBg="bg-emerald-100 text-emerald-800 border border-emerald-300"
        count={coreModules.length}
      >
        {coreModules.map((m) => {
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
              <p className="text-xs text-gray-700 leading-relaxed">{m.fullDesc}</p>
              {m.citation && (
                <div className="bg-white/70 border-l-2 border-emerald-400 pl-2.5 py-1.5 rounded-r">
                  <p className="text-[10px] text-gray-700 italic leading-snug">
                    «{m.citation.text}»
                  </p>
                  <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                    Стратегия 615-р · {m.citation.section}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-gray-200/70">
                <div className="flex gap-1">
                  {m.audience.map((a) => (
                    <span
                      key={a}
                      className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-semibold"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                {m.timeline && <span>{m.timeline}</span>}
              </div>
            </div>
          );
        })}
      </PrintSection>

      {/* ========== КОЛЬЦО 3: СТРАТЕГИЯ 615-р ========== */}
      <PrintSection
        title="Кольцо 3 · Стратегия 615-р"
        subtitle="12 прикладных сервисов по Распоряжению Правительства"
        ringColor="border-orange-600"
        ringBg="bg-orange-100 text-orange-800 border border-orange-300"
        count={strategyModules.length}
      >
        {strategyModules.map((m) => {
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
              <p className="text-xs text-gray-700 leading-relaxed">{m.fullDesc}</p>
              {m.citation && (
                <div className="bg-white/70 border-l-2 border-orange-400 pl-2.5 py-1.5 rounded-r">
                  <p className="text-[10px] text-gray-700 italic leading-snug">
                    «{m.citation.text}»
                  </p>
                  <p className="text-[9px] text-orange-700 font-semibold mt-0.5">
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
                      <Icon name="Target" size={9} className="text-orange-600" />
                      {k}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-gray-200/70">
                <div className="flex gap-1">
                  {m.audience.map((a) => (
                    <span
                      key={a}
                      className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-semibold"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                {m.timeline && <span>{m.timeline}</span>}
              </div>
            </div>
          );
        })}
      </PrintSection>

      {/* ========== КОЛЬЦО 4: КАНАЛЫ ГОСУДАРСТВА ========== */}
      <PrintSection
        title="Кольцо 4 · Каналы государства"
        subtitle="8 каналов дистрибуции — от Госуслуг до Реестра ПО"
        ringColor="border-blue-700"
        ringBg="bg-blue-100 text-blue-800 border border-blue-300"
        count={CHANNELS.length}
      >
        {CHANNELS.map((c) => {
          const badge = STATUS_BADGE[c.status];
          return (
            <div
              key={c.name}
              className={`rounded-xl border ${badge.border} ${badge.bg} p-4 flex flex-col gap-2.5`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name={c.icon} size={18} className={badge.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{c.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${badge.text} bg-white border ${badge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{c.desc}</p>
            </div>
          );
        })}
      </PrintSection>

      <p className="text-[10px] text-gray-500 text-center mt-6">
        Печатная форма матрёшки · {values.length} ценностей · {coreModules.length} модулей ядра ·{' '}
        {strategyModules.length} сервисов 615-р · {CHANNELS.length} каналов
      </p>
    </section>
  );
}

export default MatryoshkaPrintCards;