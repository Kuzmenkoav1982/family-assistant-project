import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Hub, Section } from './types';

interface Props {
  hub: Hub;
  onToggleStep: (stepId: number, completed: boolean) => void;
  onSetMode: (sectionId: number, mode: 'auto' | 'manual') => void;
  onSetBulkMode: (sectionIds: number[], mode: 'auto' | 'manual') => void;
  onOpenSection: (route: string) => void;
  onOpenHub: (route: string) => void;
}

export default function HubDetailsCard({
  hub,
  onToggleStep,
  onSetMode,
  onSetBulkMode,
  onOpenSection,
  onOpenHub,
}: Props) {
  const [expandedByHub, setExpandedByHub] = useState<Record<number, number | null>>({});
  const expandedSection = expandedByHub[hub.id] ?? null;
  const setExpandedSection = (id: number | null) =>
    setExpandedByHub((prev) => ({ ...prev, [hub.id]: id }));

  return (
    <div
      className="rounded-3xl backdrop-blur-xl bg-white/70 border border-white/60 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] p-5 animate-fade-in"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.85) 0%, ${hub.color}11 100%)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${hub.color}22` }}
          >
            <Icon name={hub.icon} size={18} style={{ color: hub.color }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">
                {hub.title.toUpperCase()}
              </h3>
              <span
                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                  hub.scope === 'personal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
                title={
                  hub.scope === 'personal'
                    ? 'Личный хаб — у каждого члена семьи свой прогресс'
                    : 'Общий хаб — прогресс на всю семью'
                }
              >
                {hub.scope === 'personal' ? 'Личный' : 'Общий'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {hub.completed_sections}/{hub.total_sections} разделов готово
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: hub.color }}>
            {hub.progress}%
          </div>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${hub.progress}%`,
            background: `linear-gradient(90deg, ${hub.color}, ${hub.color}cc)`,
          }}
        />
      </div>

      {(() => {
        const autoSupported = hub.sections.filter((s) => s.auto_supported);
        const allAuto = autoSupported.length > 0 && autoSupported.every((s) => s.mode === 'auto');
        const noneAuto = autoSupported.every((s) => s.mode !== 'auto');
        const handleBulk = (mode: 'auto' | 'manual') => {
          const ids = autoSupported.map((s) => s.id);
          onSetBulkMode(ids, mode);
        };
        return (
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider">
              РАЗДЕЛЫ
            </div>
            {autoSupported.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleBulk('auto')}
                  disabled={allAuto}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                    allAuto
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'hover:scale-105'
                  }`}
                  style={!allAuto ? { background: `${hub.color}22`, color: hub.color } : undefined}
                  title="Включить авто-режим во всех разделах"
                >
                  <Icon name="Zap" size={10} />
                  Все на авто
                </button>
                {!noneAuto && (
                  <button
                    onClick={() => handleBulk('manual')}
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100"
                    title="Переключить все на ручной"
                  >
                    <Icon name="ListChecks" size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}

      <div className="space-y-2">
        {hub.sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            color={hub.color}
            expanded={expandedSection === section.id}
            onExpand={() =>
              setExpandedSection(expandedSection === section.id ? null : section.id)
            }
            onToggleStep={onToggleStep}
            onSetMode={onSetMode}
            onOpen={() => onOpenSection(section.route)}
          />
        ))}
      </div>

      <button
        onClick={() => onOpenHub(hub.route)}
        className="mt-4 w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${hub.color}, ${hub.color}dd)`,
          boxShadow: `0 8px 20px -6px ${hub.color}88`,
        }}
      >
        Открыть хаб целиком
        <Icon name="ArrowRight" size={16} />
      </button>
    </div>
  );
}

function SectionRow({
  section,
  color,
  expanded,
  onExpand,
  onToggleStep,
  onSetMode,
  onOpen,
}: {
  section: Section;
  color: string;
  expanded: boolean;
  onExpand: () => void;
  onToggleStep: (id: number, completed: boolean) => void;
  onSetMode: (sectionId: number, mode: 'auto' | 'manual') => void;
  onOpen: () => void;
}) {
  const isAuto = section.mode === 'auto';
  const autoSupported = !!section.auto_supported;

  return (
    <div className="rounded-2xl bg-white/80 border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}1a` }}
        >
          <Icon name={section.icon} size={14} style={{ color }} />
        </div>
        <button onClick={onExpand} className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[13px] font-medium text-slate-700 truncate flex items-center gap-1">
              {section.title}
              {isAuto && autoSupported && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5"
                  style={{ background: `${color}22`, color }}
                  title="Авто-режим: прогресс считается автоматически"
                >
                  <Icon name="Zap" size={8} /> авто
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color }}>
              {section.progress}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${section.progress}%`,
                background: `linear-gradient(90deg, ${color}, ${color}aa)`,
              }}
            />
          </div>
        </button>
        <button
          onClick={onOpen}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex-shrink-0"
          title="Открыть раздел"
        >
          <Icon name="ExternalLink" size={13} />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50">
          {autoSupported && (
            <div className="flex items-center gap-1 my-2 p-0.5 rounded-lg bg-slate-100">
              <button
                onClick={() => onSetMode(section.id, 'auto')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  isAuto ? 'bg-white shadow-sm' : 'text-slate-500'
                }`}
                style={isAuto ? { color } : undefined}
                title="Прогресс считается автоматически по вашим данным"
              >
                <Icon name="Zap" size={11} />
                Авто
              </button>
              <button
                onClick={() => onSetMode(section.id, 'manual')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  !isAuto ? 'bg-white shadow-sm' : 'text-slate-500'
                }`}
                style={!isAuto ? { color } : undefined}
                title="Отмечайте шаги вручную"
              >
                <Icon name="ListChecks" size={11} />
                Ручной
              </button>
            </div>
          )}

          {isAuto && autoSupported ? (
            <div className="my-2 p-2.5 rounded-lg bg-white border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">
                АВТО-ИСТОЧНИК
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Database" size={14} style={{ color }} />
                <div className="text-[12px] text-slate-700 flex-1">
                  Прогресс растёт по мере того, как вы добавляете данные в раздел
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold" style={{ color }}>
                  {section.auto_count ?? 0}
                </span>
                <span className="text-[11px] text-slate-500">
                  из {section.auto_target ?? 1} для 100%
                </span>
              </div>
              <button
                onClick={onOpen}
                className="mt-2 w-full py-1.5 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                style={{ background: `${color}22`, color }}
              >
                Перейти и наполнить
                <Icon name="ArrowRight" size={12} />
              </button>
            </div>
          ) : (
            <>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider my-2">
                ШАГИ ({section.completed_steps}/{section.total_steps})
              </div>
              <div className="space-y-1.5">
                {section.steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => onToggleStep(step.id, !step.completed)}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white text-left"
                  >
                    <div
                      className="w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: step.completed ? color : '#cbd5e1',
                        background: step.completed ? color : 'transparent',
                      }}
                    >
                      {step.completed && (
                        <Icon name="Check" size={10} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span
                      className={`text-[12px] flex-1 ${
                        step.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}