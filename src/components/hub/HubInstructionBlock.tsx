import { useState } from 'react';
import Icon from '@/components/ui/icon';

export interface HubInstructionStep {
  number: number;
  title: string;
  description: string;
}

export interface HubInstructionSection {
  icon: string;
  title: string;
  content: string;
}

export interface HubInstructionTip {
  text: string;
}

export interface HubInstructionBlockProps {
  /** Короткий вводный текст (синяя полоса слева) */
  intro: string;
  /** Нумерованные шаги — всегда видны при открытом блоке */
  steps: HubInstructionStep[];
  /** Каскадные секции «Подробнее» */
  sections?: HubInstructionSection[];
  /** Советы внизу */
  tips?: HubInstructionTip[];
  /** Цвет акцента */
  accent?: 'blue' | 'rose' | 'violet' | 'emerald' | 'amber' | 'sky' | 'indigo' | 'pink' | 'teal' | 'orange' | 'slate';
  /** Заголовок кнопки-тоглера */
  title?: string;
}

const ACCENT_MAP = {
  blue:    { border: 'border-blue-200',    bg: 'bg-blue-50',    icon: 'text-blue-600',    badge: 'bg-blue-600',    tipBg: 'bg-blue-50',    tipBorder: 'border-blue-200',    tipText: 'text-blue-800',    sectionBg: 'bg-blue-50 hover:bg-blue-100/60',    sectionBorder: 'border-blue-100',    sectionIcon: 'text-blue-500', strip: 'border-l-4 border-blue-400 bg-blue-50/70' },
  rose:    { border: 'border-rose-200',    bg: 'bg-rose-50',    icon: 'text-rose-600',    badge: 'bg-rose-600',    tipBg: 'bg-rose-50',    tipBorder: 'border-rose-200',    tipText: 'text-rose-800',    sectionBg: 'bg-rose-50 hover:bg-rose-100/60',    sectionBorder: 'border-rose-100',    sectionIcon: 'text-rose-500', strip: 'border-l-4 border-rose-400 bg-rose-50/70' },
  violet:  { border: 'border-violet-200',  bg: 'bg-violet-50',  icon: 'text-violet-600',  badge: 'bg-violet-600',  tipBg: 'bg-violet-50',  tipBorder: 'border-violet-200',  tipText: 'text-violet-800',  sectionBg: 'bg-violet-50 hover:bg-violet-100/60',  sectionBorder: 'border-violet-100',  sectionIcon: 'text-violet-500', strip: 'border-l-4 border-violet-400 bg-violet-50/70' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-600', tipBg: 'bg-emerald-50', tipBorder: 'border-emerald-200', tipText: 'text-emerald-800', sectionBg: 'bg-emerald-50 hover:bg-emerald-100/60', sectionBorder: 'border-emerald-100', sectionIcon: 'text-emerald-500', strip: 'border-l-4 border-emerald-400 bg-emerald-50/70' },
  amber:   { border: 'border-amber-200',   bg: 'bg-amber-50',   icon: 'text-amber-600',   badge: 'bg-amber-600',   tipBg: 'bg-amber-50',   tipBorder: 'border-amber-200',   tipText: 'text-amber-800',   sectionBg: 'bg-amber-50 hover:bg-amber-100/60',   sectionBorder: 'border-amber-100',   sectionIcon: 'text-amber-500', strip: 'border-l-4 border-amber-400 bg-amber-50/70' },
  sky:     { border: 'border-sky-200',     bg: 'bg-sky-50',     icon: 'text-sky-600',     badge: 'bg-sky-600',     tipBg: 'bg-sky-50',     tipBorder: 'border-sky-200',     tipText: 'text-sky-800',     sectionBg: 'bg-sky-50 hover:bg-sky-100/60',     sectionBorder: 'border-sky-100',     sectionIcon: 'text-sky-500', strip: 'border-l-4 border-sky-400 bg-sky-50/70' },
  indigo:  { border: 'border-indigo-200',  bg: 'bg-indigo-50',  icon: 'text-indigo-600',  badge: 'bg-indigo-600',  tipBg: 'bg-indigo-50',  tipBorder: 'border-indigo-200',  tipText: 'text-indigo-800',  sectionBg: 'bg-indigo-50 hover:bg-indigo-100/60',  sectionBorder: 'border-indigo-100',  sectionIcon: 'text-indigo-500', strip: 'border-l-4 border-indigo-400 bg-indigo-50/70' },
  pink:    { border: 'border-pink-200',    bg: 'bg-pink-50',    icon: 'text-pink-600',    badge: 'bg-pink-600',    tipBg: 'bg-pink-50',    tipBorder: 'border-pink-200',    tipText: 'text-pink-800',    sectionBg: 'bg-pink-50 hover:bg-pink-100/60',    sectionBorder: 'border-pink-100',    sectionIcon: 'text-pink-500', strip: 'border-l-4 border-pink-400 bg-pink-50/70' },
  teal:    { border: 'border-teal-200',    bg: 'bg-teal-50',    icon: 'text-teal-600',    badge: 'bg-teal-600',    tipBg: 'bg-teal-50',    tipBorder: 'border-teal-200',    tipText: 'text-teal-800',    sectionBg: 'bg-teal-50 hover:bg-teal-100/60',    sectionBorder: 'border-teal-100',    sectionIcon: 'text-teal-500', strip: 'border-l-4 border-teal-400 bg-teal-50/70' },
  orange:  { border: 'border-orange-200',  bg: 'bg-orange-50',  icon: 'text-orange-600',  badge: 'bg-orange-600',  tipBg: 'bg-orange-50',  tipBorder: 'border-orange-200',  tipText: 'text-orange-800',  sectionBg: 'bg-orange-50 hover:bg-orange-100/60',  sectionBorder: 'border-orange-100',  sectionIcon: 'text-orange-500', strip: 'border-l-4 border-orange-400 bg-orange-50/70' },
  slate:   { border: 'border-slate-200',   bg: 'bg-slate-50',   icon: 'text-slate-600',   badge: 'bg-slate-600',   tipBg: 'bg-slate-50',   tipBorder: 'border-slate-200',   tipText: 'text-slate-800',   sectionBg: 'bg-slate-50 hover:bg-slate-100/60',   sectionBorder: 'border-slate-100',   sectionIcon: 'text-slate-500', strip: 'border-l-4 border-slate-400 bg-slate-50/70' },
};

export default function HubInstructionBlock({
  intro,
  steps,
  sections = [],
  tips = [],
  accent = 'blue',
  title = 'Как пользоваться',
}: HubInstructionBlockProps) {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  const a = ACCENT_MAP[accent];

  const toggleSection = (i: number) =>
    setOpenSections(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className={`rounded-2xl border ${a.border} bg-white dark:bg-gray-900 overflow-hidden`}>
      {/* ── Тоглер ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon name="HelpCircle" size={16} className={a.icon} />
        </div>
        <span className="text-[13px] font-semibold text-gray-900 dark:text-white flex-1">
          {title}
        </span>
        <Icon
          name="ChevronDown"
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Тело ── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">

          {/* Intro — синяя полоса */}
          <div className={`${a.strip} rounded-r-lg pl-3 pr-3 py-2`}>
            <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-relaxed">
              {intro}
            </p>
          </div>

          {/* Нумерованные шаги — ПОШАГОВО */}
          {steps.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Пошагово
              </div>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full ${a.badge} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                        {step.title}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Каскадные секции — ПОДРОБНЕЕ */}
          {sections.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Подробнее
              </div>
              <div className="space-y-1">
                {sections.map((section, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border ${a.sectionBorder} overflow-hidden`}
                  >
                    <button
                      onClick={() => toggleSection(i)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${a.sectionBg}`}
                    >
                      <Icon name={section.icon} size={14} className={a.sectionIcon} />
                      <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 flex-1">
                        {section.title}
                      </span>
                      <Icon
                        name="ChevronDown"
                        size={13}
                        className={`text-gray-400 transition-transform duration-150 ${
                          openSections[i] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`transition-all duration-200 ease-in-out overflow-hidden ${
                        openSections[i] ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-3 pb-3 pt-2 bg-white dark:bg-gray-900">
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Советы */}
          {tips.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Советы
              </div>
              <div className={`rounded-xl border ${a.tipBorder} ${a.tipBg} p-3 space-y-1.5`}>
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={13} className={`${a.sectionIcon} mt-0.5 flex-shrink-0`} />
                    <p className={`text-[11px] ${a.tipText} leading-relaxed`}>
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
