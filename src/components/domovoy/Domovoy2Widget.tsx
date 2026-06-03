/**
 * Domovoy2Widget — главный оркестратор Домового 2.0.
 *
 * Режимы работы:
 *  'entry'   — сценарный вход (DomovoyEntry)
 *  'guide'   — guided flow / stepper (DomovoyGuide)
 *  'map'     — карта платформы (DomovoyPlatformMap)
 *  'chat'    — обычный чат (существующий AIAssistantWidget)
 *
 * Контекстная панель (DomovoyContextPanel) монтируется независимо
 * и управляется через пропс showContextPanel.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import DomovoyEntry from './DomovoyEntry';
import DomovoyGuide from './DomovoyGuide';
import DomovoyPlatformMap from './DomovoyPlatformMap';
import DomovoyContextPanel from './DomovoyContextPanel';
import { useDomovoyPage } from './hooks/useDomovoyPage';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

type DomovoyMode = 'entry' | 'guide' | 'map' | 'chat';

interface Domovoy2WidgetProps {
  /** Показывать ли виджет сейчас */
  isOpen: boolean;
  onClose: () => void;
  /** Показывать ли контекстную панель на текущей странице */
  showContextPanel?: boolean;
}

export default function Domovoy2Widget({
  isOpen,
  onClose,
  showContextPanel = false,
}: Domovoy2WidgetProps) {
  const navigate = useNavigate();
  const { assistantName } = useAIAssistant();
  const { pathname, pageContext, currentModuleId, incompleteFlows } = useDomovoyPage();

  const [mode, setMode] = useState<DomovoyMode>('entry');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [freeQuery, setFreeQuery] = useState<string>('');

  const name = assistantName || 'Домовой';

  // ── Обработчики ──────────────────────────────────────────────────────────

  const handleStartScenario = useCallback((scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setMode('guide');
  }, []);

  const handleFreeQuery = useCallback((query: string) => {
    setFreeQuery(query);
    setMode('chat');
  }, []);

  const handleOpenMap = useCallback(() => {
    setMode('map');
  }, []);

  const handleNavigate = useCallback((href: string) => {
    navigate(href);
    onClose();
  }, [navigate, onClose]);

  const handleGuideComplete = useCallback(() => {
    setMode('entry');
    setActiveScenarioId(null);
  }, []);

  const handleGuideClose = useCallback(() => {
    setMode('entry');
    setActiveScenarioId(null);
  }, []);

  const handleBackToEntry = useCallback(() => {
    setMode('entry');
  }, []);

  // ── Контекстная панель ───────────────────────────────────────────────────

  if (showContextPanel && !isOpen) {
    return (
      <DomovoyContextPanel
        pageKey={pathname}
        variant="sidebar"
        isOpen={true}
        onOpenScenario={handleStartScenario}
        onOpenMap={handleOpenMap}
        onAction={(action) => {
          if (action.href) navigate(action.href);
          else if (action.scenarioId) handleStartScenario(action.scenarioId);
        }}
      />
    );
  }

  if (!isOpen) return null;

  // ── Основной виджет ──────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Шапка виджета */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {mode !== 'entry' && (
              <button
                onClick={handleBackToEntry}
                className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center"
                aria-label="Назад"
              >
                <Icon name="ChevronLeft" size={14} className="text-slate-500" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <span
                className="text-[15px] font-bold text-slate-800"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {name}
              </span>
            </div>
            {/* Индикатор режима */}
            {mode === 'guide' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Проводник
              </span>
            )}
            {mode === 'map' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                Карта
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="X" size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Контент по режиму */}
        <div className="flex-1 overflow-y-auto">

          {mode === 'entry' && (
            <DomovoyEntry
              assistantName={name}
              onScenario={handleStartScenario}
              onFreeQuery={handleFreeQuery}
              onOpenMap={handleOpenMap}
              incompleteFlows={incompleteFlows}
            />
          )}

          {mode === 'guide' && activeScenarioId && (
            <DomovoyGuide
              scenarioId={activeScenarioId}
              onClose={handleGuideClose}
              onComplete={handleGuideComplete}
              onNavigate={handleNavigate}
            />
          )}

          {mode === 'map' && (
            <DomovoyPlatformMap
              currentModuleId={currentModuleId ?? undefined}
              onNavigate={handleNavigate}
              onStartScenario={handleStartScenario}
              onClose={handleBackToEntry}
            />
          )}

          {mode === 'chat' && (
            <div className="p-5">
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {freeQuery
                    ? `Понял запрос: «${freeQuery}»`
                    : 'Готов отвечать на вопросы о платформе'}
                </p>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Полный чат с Домовым доступен через кнопку в правом нижнем углу
              </p>
              <button
                onClick={handleBackToEntry}
                className="w-full mt-4 py-2.5 rounded-2xl text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                ← Вернуться к сценариям
              </button>
            </div>
          )}

        </div>

        {/* Строка состояния */}
        {pageContext && mode === 'entry' && (
          <div className="px-5 py-3 border-t border-slate-100 flex-shrink-0">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Icon name="MapPin" size={10} className="text-slate-300" />
              <span>Вы сейчас в разделе</span>
              <span className="font-medium text-slate-500">{pageContext.label}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}