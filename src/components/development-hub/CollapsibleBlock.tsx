import { useState, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Props {
  icon: string;
  iconBg: string;
  title: string;
  borderColor: string;
  bgGradient: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleBlock({
  icon,
  iconBg,
  title,
  borderColor,
  bgGradient,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={`border-2 ${borderColor} ${bgGradient} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-white/20 transition-colors"
      >
        <div className={`${iconBg} p-2 rounded-xl flex-shrink-0`}>
          <Icon name={icon} size={18} className="text-inherit" />
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
        <div className="px-4 pb-4 md:px-5 md:pb-5">{children}</div>
      </div>
    </Card>
  );
}
