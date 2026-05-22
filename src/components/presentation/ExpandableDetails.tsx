import { useState, type ReactNode } from 'react';
import Icon from '@/components/ui/icon';

interface ExpandableDetailsProps {
  label?: string;
  labelOpen?: string;
  tone?: 'amber' | 'slate' | 'indigo' | 'emerald';
  children: ReactNode;
  defaultOpen?: boolean;
}

const TONE: Record<NonNullable<ExpandableDetailsProps['tone']>, string> = {
  amber:
    'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800',
  slate:
    'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700',
  indigo:
    'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800',
  emerald:
    'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800',
};

export function ExpandableDetails({
  label = 'Развернуть детали',
  labelOpen = 'Свернуть детали',
  tone = 'slate',
  children,
  defaultOpen = false,
}: ExpandableDetailsProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="no-print mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors ${TONE[tone]}`}
      >
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} />
        {open ? labelOpen : label}
      </button>
      {open && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default ExpandableDetails;
