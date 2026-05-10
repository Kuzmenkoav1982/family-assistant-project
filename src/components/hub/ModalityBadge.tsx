import Icon from '@/components/ui/icon';

export type Modality = 'law' | 'gov' | 'ai' | 'reflect' | 'content' | 'service' | 'family';

interface ModalityConfig {
  label: string;
  icon: string;
  bg: string;
  text: string;
  ring: string;
}

const CONFIG: Record<Modality, ModalityConfig> = {
  law:     { label: 'Право',      icon: 'Scale',         bg: 'bg-slate-100 dark:bg-slate-800/60',     text: 'text-slate-700 dark:text-slate-300',     ring: 'ring-slate-200 dark:ring-slate-700' },
  gov:     { label: 'Госданные',  icon: 'Landmark',      bg: 'bg-blue-50 dark:bg-blue-950/40',        text: 'text-blue-700 dark:text-blue-300',       ring: 'ring-blue-200 dark:ring-blue-800' },
  ai:      { label: 'ИИ',         icon: 'Sparkles',      bg: 'bg-violet-50 dark:bg-violet-950/40',    text: 'text-violet-700 dark:text-violet-300',   ring: 'ring-violet-200 dark:ring-violet-800' },
  reflect: { label: 'Осмысление', icon: 'BrainCircuit',  bg: 'bg-amber-50 dark:bg-amber-950/40',      text: 'text-amber-700 dark:text-amber-300',     ring: 'ring-amber-200 dark:ring-amber-800' },
  content: { label: 'Контент',    icon: 'BookOpen',      bg: 'bg-orange-50 dark:bg-orange-950/40',    text: 'text-orange-700 dark:text-orange-300',   ring: 'ring-orange-200 dark:ring-orange-800' },
  service: { label: 'Сервис',     icon: 'Cog',           bg: 'bg-emerald-50 dark:bg-emerald-950/40',  text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  family:  { label: 'Семья',      icon: 'Users',         bg: 'bg-pink-50 dark:bg-pink-950/40',        text: 'text-pink-700 dark:text-pink-300',       ring: 'ring-pink-200 dark:ring-pink-800' },
};

interface ModalityBadgeProps {
  modality: Modality;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const ModalityBadge = ({ modality, size = 'sm', showIcon = true, className = '' }: ModalityBadgeProps) => {
  const cfg = CONFIG[modality];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const text = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} rounded-full ring-1 ring-inset ${cfg.ring} ${cfg.bg} ${cfg.text} ${text} font-semibold ${className}`}
    >
      {showIcon && <Icon name={cfg.icon} fallback="Tag" size={iconSize} />}
      {cfg.label}
    </span>
  );
};

export default ModalityBadge;
