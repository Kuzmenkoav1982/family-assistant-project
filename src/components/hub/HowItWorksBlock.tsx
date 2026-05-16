import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export interface HowItWorksStep {
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksBlockProps {
  intro: string;
  steps: HowItWorksStep[];
  footer?: string;
  accent?: 'violet' | 'amber' | 'pink' | 'blue' | 'emerald';
  title?: string;
  defaultOpen?: boolean;
}

const ACCENTS = {
  violet: {
    border: 'border-violet-200',
    bg: 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50',
    iconBg: 'bg-violet-100 text-violet-600',
    text: 'text-violet-900/80',
    cardBorder: 'border-violet-100',
    title: 'text-violet-900',
    icon: 'text-violet-600',
    desc: 'text-violet-800/70',
    footerText: 'text-violet-800/80',
  },
  amber: {
    border: 'border-amber-200',
    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50',
    iconBg: 'bg-amber-100 text-amber-600',
    text: 'text-amber-900/80',
    cardBorder: 'border-amber-100',
    title: 'text-amber-900',
    icon: 'text-amber-600',
    desc: 'text-amber-800/70',
    footerText: 'text-amber-800/80',
  },
  pink: {
    border: 'border-pink-200',
    bg: 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50',
    iconBg: 'bg-pink-100 text-pink-600',
    text: 'text-pink-900/80',
    cardBorder: 'border-pink-100',
    title: 'text-pink-900',
    icon: 'text-pink-600',
    desc: 'text-pink-800/70',
    footerText: 'text-pink-800/80',
  },
  blue: {
    border: 'border-blue-200',
    bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50',
    iconBg: 'bg-blue-100 text-blue-600',
    text: 'text-blue-900/80',
    cardBorder: 'border-blue-100',
    title: 'text-blue-900',
    icon: 'text-blue-600',
    desc: 'text-blue-800/70',
    footerText: 'text-blue-800/80',
  },
  emerald: {
    border: 'border-emerald-200',
    bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-900/80',
    cardBorder: 'border-emerald-100',
    title: 'text-emerald-900',
    icon: 'text-emerald-600',
    desc: 'text-emerald-800/70',
    footerText: 'text-emerald-800/80',
  },
};

export default function HowItWorksBlock({
  intro,
  steps,
  footer,
  accent = 'violet',
  title = 'Как это работает?',
  defaultOpen = false,
}: HowItWorksBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const a = ACCENTS[accent];

  return (
    <Card className={`border-2 ${a.border} ${a.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-white/20 transition-colors"
      >
        <div className={`${a.iconBg} p-2 rounded-xl flex-shrink-0`}>
          <Icon name="Info" size={18} className="text-inherit" />
        </div>
        <h3 className="font-bold text-sm flex-1">{title}</h3>
        <Icon
          name="ChevronDown"
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <div className="space-y-3">
            <p className={`text-sm ${a.text} leading-relaxed`}>{intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`bg-white/60 rounded-lg p-3 border ${a.cardBorder}`}
                >
                  <p
                    className={`text-xs font-semibold ${a.title} mb-1.5 flex items-center gap-1.5`}
                  >
                    <Icon name={step.icon} size={14} className={a.icon} />
                    {step.title}
                  </p>
                  <p className={`text-[11px] ${a.desc} leading-relaxed`}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            {footer && (
              <div className={`bg-white/60 rounded-lg p-3 border ${a.cardBorder}`}>
                <p
                  className={`text-[11px] ${a.footerText} leading-relaxed flex items-start gap-1.5`}
                >
                  <Icon
                    name="Sparkles"
                    size={13}
                    className={`${a.icon} mt-0.5 flex-shrink-0`}
                  />
                  <span>{footer}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
