import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail, type ModuleStatus } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

const STATUS_CONFIG: Record<ModuleStatus, { bg: string; border: string; text: string; label: string; dot: string }> = {
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

const innerIds = [
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
];

const outerIds = [
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

function ModuleCard({
  module,
  onClick,
  compact = false,
}: {
  module: ModuleDetail;
  onClick: () => void;
  compact?: boolean;
}) {
  const config = STATUS_CONFIG[module.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${config.bg} ${config.border} ${config.text} border rounded-lg flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
        compact ? 'p-1.5 gap-0.5' : 'p-2 gap-1'
      }`}
    >
      <Icon name={module.icon} size={compact ? 14 : 16} className={config.text} />
      <span className={`font-medium leading-tight ${compact ? 'text-[8px]' : 'text-[9px]'}`}>{module.name}</span>
    </button>
  );
}

export function SlidePlatformEcosystem() {
  const [selected, setSelected] = useState<ModuleDetail | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (id: string) => {
    const module = MODULES[id];
    if (module) {
      setSelected(module);
      setOpen(true);
    }
  };

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
        <p className="text-[11px] text-purple-600 mt-2 font-medium flex items-center justify-center gap-1">
          <Icon name="MousePointerClick" size={11} />
          Нажмите на любой модуль — откроется карточка с цитатой из Стратегии и KPI
        </p>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {(['live', 'dev', 'planned'] as ModuleStatus[]).map((s) => (
          <div
            key={s}
            className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
          >
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
          {outerIds.map((id) => {
            const m = MODULES[id];
            return m ? <ModuleCard key={id} module={m} compact onClick={() => handleClick(id)} /> : null;
          })}
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
          {innerIds.slice(0, 6).map((id) => {
            const m = MODULES[id];
            return m ? <ModuleCard key={id} module={m} onClick={() => handleClick(id)} /> : null;
          })}
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
          {innerIds.slice(6).map((id) => {
            const m = MODULES[id];
            return m ? <ModuleCard key={id} module={m} onClick={() => handleClick(id)} /> : null;
          })}
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

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default SlidePlatformEcosystem;
