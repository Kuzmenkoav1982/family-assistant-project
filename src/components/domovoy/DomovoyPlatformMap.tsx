import React from 'react';
import Icon from '@/components/ui/icon';
import { PLATFORM_MODULES, MODULE_MAP, PlatformModule } from '@/components/domovoy/registry/platformMap';

interface DomovoyPlatformMapProps {
  currentModuleId?: string;
  onNavigate: (href: string) => void;
  onStartScenario?: (scenarioId: string) => void;
  onClose?: () => void;
}

const STATUS_LABELS: Record<PlatformModule['status'], string> = {
  live: '',
  dev: 'В разработке',
  planned: 'Скоро',
};

const RECOMMENDED_ROUTE = [
  { label: 'Настройте семью', href: '/settings', emoji: '👨‍👩‍👧' },
  { label: 'Добавьте детей', href: '/children?action=add-child', emoji: '👶' },
  { label: 'Откройте финансы', href: '/finance', emoji: '💰' },
  { label: 'Сохраните первые воспоминания', href: '/memory', emoji: '📷' },
];

const DomovoyPlatformMap: React.FC<DomovoyPlatformMapProps> = ({
  currentModuleId,
  onNavigate,
  onClose,
}) => {
  const currentModule = currentModuleId ? MODULE_MAP[currentModuleId] : null;

  // Связанные модули текущего
  const connectedModules = currentModule
    ? currentModule.connections
        .map((id) => MODULE_MAP[id])
        .filter(Boolean)
    : [];

  // Сортируем: сначала live, потом dev, потом planned
  const sortedModules = [...PLATFORM_MODULES].sort((a, b) => {
    const order = { live: 0, dev: 1, planned: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Хедер */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <Icon name="Map" size={15} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2
              className="text-sm font-bold text-slate-800 truncate leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Карта платформы «Наша семья»
            </h2>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-2"
          >
            <Icon name="X" size={15} />
          </button>
        )}
      </div>

      {/* Подзаголовок */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <p className="text-xs text-slate-400">
          Выберите раздел, с которого хотите начать
        </p>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-5 min-h-0">

        {/* Сетка модулей */}
        <div className="grid grid-cols-3 gap-2.5">
          {sortedModules.map((module) => {
            const isCurrent = module.id === currentModuleId;
            const isPlanned = module.status === 'planned';
            const isDev = module.status === 'dev';
            const isConnected = connectedModules.some((m) => m.id === module.id);

            return (
              <button
                key={module.id}
                onClick={() => !isPlanned && onNavigate(module.href)}
                disabled={isPlanned}
                className={[
                  'relative flex flex-col items-start gap-1 rounded-2xl px-3 py-3 text-left transition-all duration-150',
                  isPlanned
                    ? 'opacity-50 cursor-not-allowed bg-slate-100'
                    : 'hover:scale-[1.02] hover:shadow-md cursor-pointer',
                  module.color,
                  isCurrent ? 'ring-2 ring-indigo-400' : '',
                  isConnected && !isCurrent ? 'ring-1 ring-slate-300' : '',
                ].join(' ')}
              >
                {/* Badges */}
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap">
                    Вы здесь
                  </span>
                )}
                {(isPlanned || isDev) && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[9px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap">
                    {STATUS_LABELS[module.status]}
                  </span>
                )}

                <span className="text-xl leading-none">{module.emoji}</span>
                <span
                  className={[
                    'text-xs font-bold leading-tight',
                    module.accentColor,
                  ].join(' ')}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {module.label}
                </span>
                <span className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                  {module.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Связи текущего модуля */}
        {currentModule && connectedModules.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Связи раздела «{currentModule.label}»
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 flex flex-col gap-2">
              {connectedModules.map((mod, idx) => (
                <div key={mod.id} className="flex items-center gap-2">
                  {idx > 0 && (
                    <div className="w-full h-px bg-slate-200 -mt-1 mb-1" />
                  )}
                  <button
                    onClick={() => onNavigate(mod.href)}
                    className="flex items-center gap-2 group w-full"
                  >
                    <span className="text-base leading-none">{mod.emoji}</span>
                    <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors font-medium">
                      {mod.label}
                    </span>
                    <span className="text-xs text-slate-400 flex-1 text-left hidden sm:block">
                      — {mod.tagline}
                    </span>
                    <Icon name="ArrowRight" size={12} className="text-slate-300 group-hover:text-indigo-400 transition-colors ml-auto" />
                  </button>
                </div>
              ))}
            </div>
            {/* Связи в виде цепочки */}
            <div className="mt-2 flex items-center flex-wrap gap-1 px-1">
              {connectedModules.map((mod, idx) => (
                <React.Fragment key={mod.id}>
                  <button
                    onClick={() => onNavigate(mod.href)}
                    className={[
                      'text-xs font-medium px-2 py-0.5 rounded-full transition-colors',
                      mod.color,
                      mod.accentColor,
                      'hover:opacity-80',
                    ].join(' ')}
                  >
                    {mod.emoji} {mod.label}
                  </button>
                  {idx < connectedModules.length - 1 && (
                    <span className="text-slate-300 text-xs">↔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Рекомендованный маршрут для новых */}
        {!currentModuleId && (
          <div>
            <p
              className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Рекомендованный маршрут для новых
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-3 flex flex-col gap-0">
              {RECOMMENDED_ROUTE.map((step, idx) => (
                <React.Fragment key={step.href}>
                  <button
                    onClick={() => onNavigate(step.href)}
                    className="flex items-center gap-3 py-2 text-left group"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-indigo-500">{idx + 1}</span>
                    </div>
                    <span className="text-sm leading-none">{step.emoji}</span>
                    <span className="text-sm text-indigo-800 font-medium group-hover:text-indigo-600 transition-colors">
                      {step.label}
                    </span>
                    <Icon name="ArrowRight" size={12} className="text-indigo-300 group-hover:text-indigo-500 transition-colors ml-auto" />
                  </button>
                  {idx < RECOMMENDED_ROUTE.length - 1 && (
                    <div className="flex items-center gap-3 py-0.5">
                      <div className="w-6 flex justify-center">
                        <div className="w-px h-3 bg-indigo-200" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DomovoyPlatformMap;