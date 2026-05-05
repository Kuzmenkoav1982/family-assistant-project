import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

interface LayerItem {
  name: string;
  icon: string;
  status: 'live' | 'dev' | 'planned';
  moduleId?: string;
}

const STATUS_DOT: Record<string, string> = {
  live: 'bg-emerald-500',
  dev: 'bg-amber-400',
  planned: 'bg-purple-300',
};

const STATUS_BORDER: Record<string, string> = {
  live: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100',
  dev: 'border-amber-300 bg-amber-50 hover:bg-amber-100',
  planned: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
};

interface Layer {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: LayerItem[];
}

const layers: Layer[] = [
  {
    title: 'Внешние интеграции и каналы',
    subtitle: 'Куда платформа подключается и кому продаётся',
    icon: 'Globe',
    color: 'from-blue-500 to-cyan-500',
    items: [
      { name: 'Госуслуги (ЕПГУ)', icon: 'Landmark', status: 'planned' },
      { name: 'Соцказначейство', icon: 'Database', status: 'planned' },
      { name: 'Региональные ИС', icon: 'Network', status: 'planned', moduleId: 'region-api' },
      { name: 'Telegram Mini App', icon: 'Send', status: 'dev' },
      { name: 'Web (poehali)', icon: 'Globe', status: 'live' },
      { name: 'API для регионов', icon: 'Code', status: 'planned', moduleId: 'region-api' },
      { name: 'HR-системы (B2B2C)', icon: 'Briefcase', status: 'planned', moduleId: 'b2b2c' },
    ],
  },
  {
    title: 'Стратегические модули по 615-р',
    subtitle: 'Модули, прямо отражающие задачи Стратегии до 2036',
    icon: 'Target',
    color: 'from-purple-500 to-pink-500',
    items: [
      { name: 'Навигатор льгот', icon: 'Compass', status: 'dev', moduleId: 'support-navigator' },
      { name: 'Кабинет многодетной', icon: 'Users', status: 'dev', moduleId: 'large-family' },
      { name: 'Маршрут беременности', icon: 'HeartHandshake', status: 'dev', moduleId: 'pregnancy' },
      { name: 'Family Case Manager', icon: 'GitBranch', status: 'planned', moduleId: 'case-manager' },
      { name: 'Кабинет СВО', icon: 'Shield', status: 'planned', moduleId: 'svo-family' },
      { name: 'Студ. семья', icon: 'GraduationCap', status: 'planned', moduleId: 'student-family' },
      { name: 'Соцконтракт', icon: 'FileSignature', status: 'planned', moduleId: 'social-contract' },
      { name: 'ЗОЖ-модуль', icon: 'Activity', status: 'planned', moduleId: 'zog' },
    ],
  },
  {
    title: 'Family OS · ядро повседневной координации',
    subtitle: 'То, что работает уже сейчас — фундамент платформы',
    icon: 'Layers',
    color: 'from-emerald-500 to-teal-500',
    items: [
      { name: 'Древо', icon: 'TreeDeciduous', status: 'live', moduleId: 'family-tree' },
      { name: 'Календарь', icon: 'Calendar', status: 'live', moduleId: 'calendar' },
      { name: 'Задачи', icon: 'CheckSquare', status: 'live', moduleId: 'tasks' },
      { name: 'Бюджет', icon: 'Wallet', status: 'live', moduleId: 'budget' },
      { name: 'Чат', icon: 'MessageCircle', status: 'live', moduleId: 'chat' },
      { name: 'Дети', icon: 'Baby', status: 'live', moduleId: 'children' },
      { name: 'Здоровье', icon: 'HeartPulse', status: 'live', moduleId: 'health' },
      { name: 'Документы', icon: 'FileText', status: 'live', moduleId: 'documents' },
      { name: 'Места', icon: 'MapPin', status: 'live', moduleId: 'places' },
      { name: 'Покупки', icon: 'ShoppingCart', status: 'live', moduleId: 'shopping' },
      { name: 'Воспоминания', icon: 'Image', status: 'live', moduleId: 'memories' },
      { name: 'AI-ассистент', icon: 'Sparkles', status: 'dev', moduleId: 'ai-assistant' },
    ],
  },
  {
    title: 'Платформенный фундамент',
    subtitle: 'Технологическая инфраструктура и комплаенс',
    icon: 'Server',
    color: 'from-gray-600 to-slate-700',
    items: [
      { name: 'Аутентификация', icon: 'Lock', status: 'live' },
      { name: 'PostgreSQL', icon: 'Database', status: 'live' },
      { name: 'Cloud Functions', icon: 'Cloud', status: 'live' },
      { name: 'S3 файлы', icon: 'HardDrive', status: 'live' },
      { name: 'Push / уведомления', icon: 'Bell', status: 'live' },
      { name: '152-ФЗ ПДн', icon: 'ShieldCheck', status: 'dev' },
      { name: 'Реестр ПО Минцифры', icon: 'BadgeCheck', status: 'planned' },
      { name: 'Аналитика', icon: 'BarChart3', status: 'live' },
    ],
  },
];

export function SlidePlatformLayers() {
  const [selected, setSelected] = useState<ModuleDetail | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (moduleId?: string) => {
    if (!moduleId) return;
    const module = MODULES[moduleId];
    if (module) {
      setSelected(module);
      setOpen(true);
    }
  };

  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full mb-3">
          <Icon name="Layers" size={14} className="text-gray-700" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Архитектура</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Слоёная карта платформы</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Сверху вниз: каналы и интеграции → стратегические модули по 615-р → ядро Family OS → технологический фундамент
        </p>
        <p className="text-[11px] text-purple-600 mt-2 font-medium flex items-center justify-center gap-1">
          <Icon name="MousePointerClick" size={11} />
          Кликабельные модули раскрывают детали
        </p>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-gray-700">Уже работает</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs font-medium text-gray-700">В разработке</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-300" />
          <span className="text-xs font-medium text-gray-700">План по 615-р</span>
        </div>
      </div>

      <div className="space-y-3">
        {layers.map((layer, idx) => (
          <div key={idx} className="relative">
            {/* Стрелка между слоями */}
            {idx > 0 && (
              <div className="flex justify-center -mt-1.5 mb-1.5">
                <Icon name="ChevronDown" size={20} className="text-gray-300" />
              </div>
            )}

            <div className="rounded-2xl border-2 border-gray-200 overflow-hidden bg-white">
              {/* Заголовок слоя */}
              <div className={`bg-gradient-to-r ${layer.color} px-4 py-2.5 flex items-center gap-3`}>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
                  <Icon name={layer.icon} size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{layer.title}</h3>
                  <p className="text-[10px] text-white/80 leading-tight">{layer.subtitle}</p>
                </div>
              </div>

              {/* Содержимое слоя */}
              <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {layer.items.map((item, i) => {
                  const isClickable = !!item.moduleId;
                  const Comp = isClickable ? 'button' : 'div';
                  return (
                    <Comp
                      key={i}
                      type={isClickable ? 'button' : undefined}
                      onClick={isClickable ? () => handleClick(item.moduleId) : undefined}
                      className={`${STATUS_BORDER[item.status]} border rounded-lg p-2 flex items-center gap-1.5 transition-all ${
                        isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''
                      }`}
                    >
                      <Icon name={item.icon} size={14} className="text-gray-700 flex-shrink-0" />
                      <span className="text-[10px] font-medium text-gray-800 leading-tight truncate flex-1 text-left">
                        {item.name}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status]} flex-shrink-0`} />
                    </Comp>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Итог снизу */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">11</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">модулей живых</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">5</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">в разработке (Q2 2026)</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">15+</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">в плане по 615-р</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 2 из 3 · Слоёная архитектура · Версия 2.0 от 06.05.2026
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default SlidePlatformLayers;
