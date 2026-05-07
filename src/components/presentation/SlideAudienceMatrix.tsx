import Icon from '@/components/ui/icon';
import { MODULES, type ModuleStatus } from './moduleData';

type Audience = 'B2C' | 'B2G' | 'B2B2C';

interface LayerDef {
  key: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
  iconName: string;
  moduleIds: string[];
  // Дополнительные элементы фундамента/каналов, не привязанные к MODULES
  extras?: { name: string; icon: string; status: ModuleStatus; audiences: Audience[] }[];
}

const LAYERS: LayerDef[] = [
  {
    key: 'family-os',
    label: 'НАША СЕМЬЯ',
    sublabel: 'Ядро · работает',
    color: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    iconName: 'Heart',
    moduleIds: [
      'family-tree',
      'calendar',
      'tasks',
      'budget',
      'chat',
      'children',
      'health',
      'documents',
      'places',
      'shopping',
      'memories',
      'ai-assistant',
    ],
  },
  {
    key: 'strategy',
    label: 'СТРАТЕГИЯ 615-р',
    sublabel: 'Модули до 2036',
    color: '#7c3aed',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    iconName: 'Target',
    moduleIds: [
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
    ],
  },
  {
    key: 'channels',
    label: 'КАНАЛЫ',
    sublabel: 'Интеграции',
    color: '#2563eb',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    iconName: 'Network',
    moduleIds: [],
    extras: [
      { name: 'Госуслуги / ЕСИА', icon: 'Landmark', status: 'planned', audiences: ['B2C', 'B2G'] },
      { name: 'Соцказначейство', icon: 'Database', status: 'planned', audiences: ['B2G'] },
      { name: 'СМЭВ · Регионы', icon: 'Network', status: 'planned', audiences: ['B2G'] },
      { name: 'Telegram-бот', icon: 'Send', status: 'dev', audiences: ['B2C'] },
      { name: 'Web · PWA', icon: 'Globe', status: 'live', audiences: ['B2C', 'B2G', 'B2B2C'] },
      { name: 'API регионам', icon: 'Code', status: 'planned', audiences: ['B2G'] },
      { name: 'HR-системы', icon: 'Briefcase', status: 'planned', audiences: ['B2B2C'] },
      { name: 'Туристические сервисы', icon: 'Mountain', status: 'planned', audiences: ['B2C', 'B2B2C'] },
    ],
  },
  {
    key: 'foundation',
    label: 'ФУНДАМЕНТ',
    sublabel: '152-ФЗ · Реестр ПО',
    color: '#475569',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    iconName: 'Server',
    moduleIds: [],
    extras: [
      { name: 'Auth · ЕСИА-ready', icon: 'Lock', status: 'live', audiences: ['B2C', 'B2G', 'B2B2C'] },
      { name: 'PostgreSQL', icon: 'Database', status: 'live', audiences: ['B2C', 'B2G', 'B2B2C'] },
      { name: 'Cloud Functions', icon: 'Cloud', status: 'live', audiences: ['B2C', 'B2G', 'B2B2C'] },
      { name: 'S3 · файлы', icon: 'HardDrive', status: 'live', audiences: ['B2C', 'B2G', 'B2B2C'] },
      { name: 'Push-уведомления', icon: 'Bell', status: 'live', audiences: ['B2C', 'B2B2C'] },
      { name: '152-ФЗ', icon: 'ShieldCheck', status: 'dev', audiences: ['B2G'] },
      { name: 'Реестр отеч. ПО', icon: 'BadgeCheck', status: 'planned', audiences: ['B2G'] },
      { name: 'Аналитика', icon: 'BarChart3', status: 'live', audiences: ['B2C', 'B2G', 'B2B2C'] },
    ],
  },
];

const AUDIENCES: { key: Audience; label: string; sublabel: string; color: string; bg: string; iconName: string }[] = [
  {
    key: 'B2C',
    label: 'B2C',
    sublabel: 'Семьи',
    color: '#0284c7',
    bg: 'bg-sky-100',
    iconName: 'User',
  },
  {
    key: 'B2G',
    label: 'B2G',
    sublabel: 'Регионы',
    color: '#059669',
    bg: 'bg-emerald-100',
    iconName: 'Landmark',
  },
  {
    key: 'B2B2C',
    label: 'B2B2C',
    sublabel: 'Работодатели',
    color: '#d97706',
    bg: 'bg-amber-100',
    iconName: 'Briefcase',
  },
];

const STATUS_DOT: Record<ModuleStatus, string> = {
  live: 'bg-emerald-500',
  dev: 'bg-amber-400',
  planned: 'bg-purple-400',
};

interface CellItem {
  name: string;
  icon: string;
  status: ModuleStatus;
}

function getCellItems(layer: LayerDef, audience: Audience): CellItem[] {
  const items: CellItem[] = [];

  for (const id of layer.moduleIds) {
    const m = MODULES[id];
    if (!m) continue;
    if (m.audience.includes(audience)) {
      items.push({ name: m.name, icon: m.icon, status: m.status });
    }
  }

  if (layer.extras) {
    for (const e of layer.extras) {
      if (e.audiences.includes(audience)) {
        items.push({ name: e.name, icon: e.icon, status: e.status });
      }
    }
  }

  return items;
}

export function SlideAudienceMatrix() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-3 py-7 sm:px-5 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full mb-3">
          <Icon name="Grid3x3" size={14} className="text-gray-700" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Сводная матрица</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Слой × Аудитория</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Какие модули закрывают потребности каждой аудитории — для инвесторов, регионов и работодателей.
        </p>
      </div>

      {/* Легенда статусов */}
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-gray-700">Уже работает</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] font-medium text-gray-700">В разработке</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-[11px] font-medium text-gray-700">План</span>
        </div>
      </div>

      {/* Матрица */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px] lg:min-w-0">
          {/* Заголовки столбцов */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr] sm:grid-cols-[150px_1fr_1fr_1fr] gap-1.5 sm:gap-2 mb-2">
            <div />
            {AUDIENCES.map((a) => (
              <div
                key={a.key}
                className={`${a.bg} rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2.5 border-2 min-w-0`}
                style={{ borderColor: a.color }}
              >
                <div
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm"
                  style={{ color: a.color }}
                >
                  <Icon name={a.iconName} size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold leading-tight" style={{ color: a.color }}>
                    {a.label}
                  </p>
                  <p className="text-[10px] text-gray-700 leading-tight truncate">{a.sublabel}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Строки слоёв */}
          {LAYERS.map((layer) => (
            <div key={layer.key} className="grid grid-cols-[120px_1fr_1fr_1fr] sm:grid-cols-[150px_1fr_1fr_1fr] gap-1.5 sm:gap-2 mb-2">
              {/* Заголовок строки */}
              <div
                className={`${layer.bg} rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 flex flex-col justify-center border-2 min-w-0`}
                style={{ borderColor: layer.color }}
              >
                <div className="flex items-center gap-1.5">
                  <Icon name={layer.iconName} size={13} style={{ color: layer.color }} />
                  <p className="text-[11px] sm:text-[12px] font-bold leading-tight break-words" style={{ color: layer.color }}>
                    {layer.label}
                  </p>
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5 leading-tight">{layer.sublabel}</p>
              </div>

              {/* Ячейки по аудиториям */}
              {AUDIENCES.map((a) => {
                const items = getCellItems(layer, a.key);
                return (
                  <div
                    key={a.key}
                    className="rounded-xl border border-gray-200 bg-white p-2 flex flex-wrap gap-1 content-start min-h-[80px]"
                  >
                    {items.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center min-h-[60px]">
                        <span className="text-[10px] text-gray-300 italic">—</span>
                      </div>
                    ) : (
                      items.map((it, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-700 whitespace-normal break-words leading-tight"
                          title={it.name}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[it.status]} shrink-0`} />
                          <Icon name={it.icon} size={10} className="text-gray-500 shrink-0" />
                          <span className="whitespace-normal break-words">{it.name}</span>
                        </span>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Итоговые подсчёты по аудиториям */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        {AUDIENCES.map((a) => {
          const total = LAYERS.reduce((sum, layer) => sum + getCellItems(layer, a.key).length, 0);
          return (
            <div
              key={a.key}
              className={`${a.bg} rounded-xl p-3 text-center border-2`}
              style={{ borderColor: a.color }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Icon name={a.iconName} size={14} style={{ color: a.color }} />
                <p className="text-xs font-bold" style={{ color: a.color }}>
                  {a.label}
                </p>
              </div>
              <p className="text-2xl font-bold" style={{ color: a.color }}>
                {total}
              </p>
              <p className="text-[9px] text-gray-700 leading-tight">модулей релевантны {a.sublabel.toLowerCase()}</p>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-600 text-center mt-5 max-w-2xl mx-auto leading-relaxed">
        <Icon name="Info" size={11} className="inline-block mr-1 text-gray-500" />
        Один модуль может относиться к нескольким аудиториям — например, Календарь работает и для семьи (B2C),
        и в корпоративных программах (B2B2C).
      </p>

      <p className="text-[10px] text-gray-500 text-center mt-3">
        Слайд · Матрица «Слой × Аудитория» · Версия 2.6
      </p>
    </section>
  );
}

export default SlideAudienceMatrix;