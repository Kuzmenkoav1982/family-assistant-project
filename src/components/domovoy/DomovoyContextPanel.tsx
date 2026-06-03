import React from 'react';
import Icon from '@/components/ui/icon';
import { getPageContext, PageAction } from '@/components/domovoy/registry/pageRegistry';

interface DomovoyContextPanelProps {
  pageKey: string;
  variant?: 'sidebar' | 'bottomsheet' | 'compact';
  isOpen?: boolean;
  onClose?: () => void;
  onAction?: (action: PageAction) => void;
  onOpenScenario?: (scenarioId: string) => void;
  onOpenMap?: () => void;
}

const DomovoyContextPanel: React.FC<DomovoyContextPanelProps> = ({
  pageKey,
  variant = 'sidebar',
  isOpen = true,
  onClose,
  onAction,
  onOpenScenario,
  onOpenMap,
}) => {
  const ctx = getPageContext(pageKey);

  const handleAction = (action: PageAction) => {
    if (onAction) onAction(action);
    if (action.scenarioId && onOpenScenario) {
      onOpenScenario(action.scenarioId);
    } else if (action.href) {
      window.location.href = action.href;
    }
  };

  // Wrapper classNames per variant
  const wrapperClass = (() => {
    if (variant === 'sidebar') {
      return [
        'fixed right-0 top-0 h-full w-72 z-40 bg-white/95 backdrop-blur-md',
        'border-l border-slate-200 shadow-xl flex flex-col',
        'transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      ].join(' ');
    }
    if (variant === 'bottomsheet') {
      return [
        'fixed bottom-0 left-0 right-0 z-40 bg-white',
        'rounded-t-3xl border-t border-slate-200 shadow-2xl flex flex-col',
        'max-h-[60vh] transition-transform duration-300',
        isOpen ? 'translate-y-0' : 'translate-y-full',
      ].join(' ');
    }
    // compact — inline
    return 'relative bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden';
  })();

  const content = (
    <div className={wrapperClass}>
      {/* Хедер */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
            <span className="text-base leading-none">🏡</span>
          </div>
          <span
            className="text-sm font-semibold text-slate-800"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Домовой
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icon name="X" size={15} />
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
        {!ctx ? (
          // Страница не найдена в реестре
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Icon name="MapPin" size={22} className="text-slate-400" />
            </div>
            <div>
              <p
                className="text-sm font-semibold text-slate-700"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Раздел не определён
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Откройте карту платформы, чтобы найти нужный раздел
              </p>
            </div>
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl px-4 py-2 transition-colors"
              >
                <Icon name="Map" size={13} />
                Карта платформы
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Вы сейчас здесь */}
            <div className="bg-slate-50 rounded-xl px-3 py-3">
              {/* Breadcrumb */}
              <nav className="flex items-center flex-wrap gap-1 mb-2">
                {ctx.breadcrumb.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <Icon name="ChevronRight" size={11} className="text-slate-300 shrink-0" />
                    )}
                    <button
                      className={[
                        'text-xs transition-colors',
                        i === ctx.breadcrumb.length - 1
                          ? 'text-slate-600 font-medium cursor-default'
                          : 'text-slate-400 hover:text-indigo-500',
                      ].join(' ')}
                    >
                      {crumb}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
              <p
                className="text-base font-semibold text-slate-800 leading-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {ctx.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{ctx.tagline}</p>
            </div>

            {/* Что можно сделать */}
            <div>
              <p
                className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Что можно сделать
              </p>
              <div className="flex flex-col gap-2">
                {ctx.actions.slice(0, 4).map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(action)}
                    className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors mt-0.5">
                      <Icon name={action.icon} size={14} className="text-slate-500 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-800 leading-tight block">
                        {action.label}
                      </span>
                      {action.description && (
                        <span className="text-xs text-slate-400 leading-snug block mt-0.5">
                          {action.description}
                        </span>
                      )}
                    </div>
                    <Icon name="ArrowRight" size={13} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Зачем это */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon name="Lightbulb" size={13} className="text-indigo-400" />
                <p className="text-xs font-semibold text-indigo-600">Зачем этот раздел</p>
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed">
                {ctx.tagline}. Здесь собраны все инструменты для управления этой частью семейной жизни.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer — кнопка карты */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <button
          onClick={onOpenMap}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-indigo-600 font-medium py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Icon name="Map" size={13} />
          Карта платформы
        </button>
      </div>
    </div>
  );

  return content;
};

export default DomovoyContextPanel;
