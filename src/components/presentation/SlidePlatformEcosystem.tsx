import Icon from '@/components/ui/icon';

type Status = 'live' | 'dev' | 'planned';

interface Module {
  name: string;
  icon: string;
  status: Status;
  ring: 'inner' | 'outer';
}

const STATUS_CONFIG: Record<Status, { bg: string; border: string; text: string; label: string; dot: string }> = {
  live: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    label: 'Уже работает',
    dot: 'bg-emerald-500',
  },
  dev: {
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    text: 'text-amber-950',
    label: 'В разработке',
    dot: 'bg-amber-400',
  },
  planned: {
    bg: 'bg-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-900',
    label: 'План по Стратегии 615-р',
    dot: 'bg-purple-300',
  },
};

const innerModules: Module[] = [
  { name: 'Семейное древо', icon: 'TreeDeciduous', status: 'live', ring: 'inner' },
  { name: 'Календарь и события', icon: 'Calendar', status: 'live', ring: 'inner' },
  { name: 'Задачи и роли', icon: 'CheckSquare', status: 'live', ring: 'inner' },
  { name: 'Семейный бюджет', icon: 'Wallet', status: 'live', ring: 'inner' },
  { name: 'Чат семьи', icon: 'MessageCircle', status: 'live', ring: 'inner' },
  { name: 'Профили детей', icon: 'Baby', status: 'live', ring: 'inner' },
  { name: 'Здоровье семьи', icon: 'HeartPulse', status: 'live', ring: 'inner' },
  { name: 'Документы', icon: 'FileText', status: 'live', ring: 'inner' },
  { name: 'Локации и места', icon: 'MapPin', status: 'live', ring: 'inner' },
  { name: 'Списки покупок', icon: 'ShoppingCart', status: 'live', ring: 'inner' },
  { name: 'Воспоминания', icon: 'Image', status: 'live', ring: 'inner' },
  { name: 'AI-ассистент', icon: 'Sparkles', status: 'dev', ring: 'inner' },
];

const outerModules: Module[] = [
  { name: 'Навигатор мер поддержки', icon: 'Compass', status: 'dev', ring: 'outer' },
  { name: 'Кабинет многодетной семьи', icon: 'Users', status: 'dev', ring: 'outer' },
  { name: 'Маршрут беременности 0–12 мес', icon: 'HeartHandshake', status: 'dev', ring: 'outer' },
  { name: 'Family Case Manager', icon: 'GitBranch', status: 'planned', ring: 'outer' },
  { name: 'Семья участника СВО', icon: 'Shield', status: 'planned', ring: 'outer' },
  { name: 'Студенческая семья', icon: 'GraduationCap', status: 'planned', ring: 'outer' },
  { name: 'Соцконтракт-навигатор', icon: 'FileSignature', status: 'planned', ring: 'outer' },
  { name: 'ЗОЖ-модуль (4 фактора)', icon: 'Activity', status: 'planned', ring: 'outer' },
  { name: 'Каталог нянь и групп', icon: 'UserCheck', status: 'planned', ring: 'outer' },
  { name: 'Каталог проката', icon: 'Package', status: 'planned', ring: 'outer' },
  { name: 'Продлёнка 1–4 классов', icon: 'BookOpen', status: 'planned', ring: 'outer' },
  { name: 'Семейная медиация', icon: 'Handshake', status: 'planned', ring: 'outer' },
  { name: 'Семейный туризм РФ', icon: 'Mountain', status: 'planned', ring: 'outer' },
  { name: 'B2B2C для работодателей', icon: 'Building2', status: 'planned', ring: 'outer' },
  { name: 'API для регионов', icon: 'Network', status: 'planned', ring: 'outer' },
  { name: 'Адаптация соотечественников', icon: 'Globe', status: 'planned', ring: 'outer' },
];

function ModuleCard({ module, compact = false }: { module: Module; compact?: boolean }) {
  const config = STATUS_CONFIG[module.status];
  return (
    <div
      className={`${config.bg} ${config.border} ${config.text} border rounded-lg flex flex-col items-center justify-center text-center transition-transform hover:scale-105 ${
        compact ? 'p-1.5 gap-0.5' : 'p-2 gap-1'
      }`}
    >
      <Icon name={module.icon} size={compact ? 14 : 16} className={config.text} />
      <span className={`font-medium leading-tight ${compact ? 'text-[8px]' : 'text-[9px]'}`}>{module.name}</span>
    </div>
  );
}

export function SlidePlatformEcosystem() {
  return (
    <section
      data-pdf-slide
      className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl shadow-xl my-6 overflow-hidden border border-purple-100 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-3">
          <Icon name="LayoutGrid" size={14} className="text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Экосистема платформы</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          «Наша Семья» — карта продукта
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Внутренний круг — ядро «Family OS»: то, что работает уже сейчас.<br />
          Внешний круг — стратегические модули по Распоряжению Правительства РФ № 615-р до 2036 года.
        </p>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {(['live', 'dev', 'planned'] as Status[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
            <span className="text-xs font-medium text-gray-700">{STATUS_CONFIG[s].label}</span>
          </div>
        ))}
      </div>

      {/* Внешний круг — план по Стратегии 615-р */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-purple-200" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 px-2">
            Внешний круг · Стратегия 615-р до 2036
          </span>
          <div className="h-px flex-1 bg-purple-200" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {outerModules.map((m, i) => (
            <ModuleCard key={i} module={m} compact />
          ))}
        </div>
      </div>

      {/* Ядро + центр */}
      <div className="relative my-5 p-4 bg-white/70 rounded-2xl border-2 border-dashed border-purple-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-emerald-300" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 px-2">
            Внутренний круг · Family OS — ядро
          </span>
          <div className="h-px flex-1 bg-emerald-300" />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {innerModules.slice(0, 6).map((m, i) => (
            <ModuleCard key={i} module={m} />
          ))}
        </div>

        {/* Логотип в центре */}
        <div className="flex justify-center my-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl px-6 py-3 shadow-xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <Icon name="Heart" size={20} className="text-white" />
                <span className="text-lg font-bold">Наша Семья</span>
              </div>
              <span className="text-[10px] opacity-90">Family OS · цифровой семейноцентричный сервис</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {innerModules.slice(6).map((m, i) => (
            <ModuleCard key={i} module={m} />
          ))}
        </div>
      </div>

      {/* Каналы и интеграции */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        <div className="bg-white border border-blue-200 rounded-xl p-3 text-center">
          <Icon name="User" size={16} className="text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-blue-900">B2C</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">Семьи — приложение</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-3 text-center">
          <Icon name="Landmark" size={16} className="text-emerald-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-emerald-900">B2G</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">Регионы — соцказначейство</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-3 text-center">
          <Icon name="Briefcase" size={16} className="text-amber-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-amber-900">B2B2C</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">Работодатели — family-benefit</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 1 из 3 · Экосистемная карта · Версия 2.0 от 06.05.2026
      </p>
    </section>
  );
}

export default SlidePlatformEcosystem;
