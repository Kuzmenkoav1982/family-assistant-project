/**
 * Страница-демо Домового 2.0.
 * Показывает все 4 режима по вкладкам.
 * URL: /domovoy-v2
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import DomovoyEntry from '@/components/domovoy/DomovoyEntry';
import DomovoyGuide from '@/components/domovoy/DomovoyGuide';
import DomovoyPlatformMap from '@/components/domovoy/DomovoyPlatformMap';
import DomovoyContextPanel from '@/components/domovoy/DomovoyContextPanel';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { useDomovoyPage } from '@/components/domovoy/hooks/useDomovoyPage';

type DemoTab = 'entry' | 'context' | 'guide' | 'map';

const TABS: Array<{ id: DemoTab; label: string; icon: string; desc: string }> = [
  { id: 'entry',   label: 'Вход',      icon: 'Home',      desc: 'Сценарный старт' },
  { id: 'guide',   label: 'Проводник', icon: 'Navigation', desc: 'Guided flow' },
  { id: 'map',     label: 'Карта',     icon: 'Map',        desc: 'Платформа' },
  { id: 'context', label: 'Контекст',  icon: 'Sidebar',    desc: 'На странице' },
];

export default function DomovoyV2Demo() {
  const navigate = useNavigate();
  const { assistantName } = useAIAssistant();
  const { pathname, incompleteFlows, currentModuleId } = useDomovoyPage();

  const [tab, setTab] = useState<DemoTab>('entry');
  const [activeScenario, setActiveScenario] = useState<string>('setup-family');

  const name = assistantName || 'Домовой';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Заголовок */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-[18px] font-bold text-slate-800"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Домовой 2.0 — демо
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">AI-проводник по платформе «Наша семья»</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center"
          >
            <Icon name="X" size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Табы */}
      <div className="bg-white border-b border-slate-100 px-4">
        <div className="max-w-2xl mx-auto flex gap-1 py-2 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                tab === t.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon name={t.icon} size={13} />
              {t.label}
              <span className={`hidden sm:inline text-[10px] ${tab === t.id ? 'text-white/70' : 'text-slate-400'}`}>
                — {t.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-2xl mx-auto px-4 py-4">

        {tab === 'entry' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <DomovoyEntry
              assistantName={name}
              onScenario={(id) => { setActiveScenario(id); setTab('guide'); }}
              onFreeQuery={(q) => alert(`Свободный запрос: "${q}"`)}
              onOpenMap={() => setTab('map')}
              incompleteFlows={incompleteFlows}
            />
          </div>
        )}

        {tab === 'guide' && (
          <div>
            {/* Выбор сценария */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {['setup-family', 'add-child', 'setup-children-module', 'child-finance'].map(id => (
                <button
                  key={id}
                  onClick={() => setActiveScenario(id)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                    activeScenario === id
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <DomovoyGuide
                key={activeScenario}
                scenarioId={activeScenario}
                onClose={() => setTab('entry')}
                onComplete={() => { alert('Сценарий завершён!'); setTab('entry'); }}
                onNavigate={(href) => navigate(href)}
              />
            </div>
          </div>
        )}

        {tab === 'map' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <DomovoyPlatformMap
              currentModuleId={currentModuleId ?? undefined}
              onNavigate={(href) => navigate(href)}
              onStartScenario={(id) => { setActiveScenario(id); setTab('guide'); }}
              onClose={() => setTab('entry')}
            />
          </div>
        )}

        {tab === 'context' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 px-1">
              Контекстная панель для текущей страницы:{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{pathname}</code>
            </p>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <DomovoyContextPanel
                pageKey={pathname}
                variant="compact"
                isOpen={true}
                onOpenScenario={(id) => { setActiveScenario(id); setTab('guide'); }}
                onOpenMap={() => setTab('map')}
                onAction={(action) => {
                  if (action.href) navigate(action.href);
                  else if (action.scenarioId) { setActiveScenario(action.scenarioId); setTab('guide'); }
                }}
              />
            </div>
            <p className="text-xs text-slate-400 px-1 text-center">
              На реальной странице эта панель появляется справа (sidebar) или снизу (mobile)
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
