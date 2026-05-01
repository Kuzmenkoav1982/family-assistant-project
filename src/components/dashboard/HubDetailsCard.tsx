import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Hub, Section } from './types';

interface Props {
  hub: Hub;
  onToggleStep: (stepId: number, completed: boolean) => void;
  onOpenSection: (route: string) => void;
  onOpenHub: (route: string) => void;
}

export default function HubDetailsCard({ hub, onToggleStep, onOpenSection, onOpenHub }: Props) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

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
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">
              {hub.title.toUpperCase()}
            </h3>
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

      <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">
        РАЗДЕЛЫ
      </div>

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
  onOpen,
}: {
  section: Section;
  color: string;
  expanded: boolean;
  onExpand: () => void;
  onToggleStep: (id: number, completed: boolean) => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white/80 border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-2 p-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}1a` }}
        >
          <Icon name={section.icon} size={14} style={{ color }} />
        </div>
        <button
          onClick={onExpand}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[13px] font-medium text-slate-700 truncate">
              {section.title}
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
        </div>
      )}
    </div>
  );
}
