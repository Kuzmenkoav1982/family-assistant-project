import Icon from '@/components/ui/icon';

export type CardStatus =
  | 'idle'         // не настроено
  | 'partial'      // частично заполнено
  | 'ready'        // готово / активно
  | 'attention'    // требует внимания
  | 'new'          // новое
  | 'recommended'; // рекомендуем

interface StatusConfig {
  label: string;
  icon: string;
  bg: string;
  text: string;
  ring: string;
}

const CONFIG: Record<CardStatus, StatusConfig> = {
  idle:        { label: 'Не настроено',        icon: 'Circle',       bg: 'bg-gray-50 dark:bg-gray-800/60',       text: 'text-gray-600 dark:text-gray-400',     ring: 'ring-gray-200 dark:ring-gray-700' },
  partial:     { label: 'Частично заполнено',  icon: 'CircleDashed', bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-300',   ring: 'ring-amber-200 dark:ring-amber-800' },
  ready:       { label: 'Готово',              icon: 'CheckCircle2', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  attention:   { label: 'Требует внимания',    icon: 'AlertCircle',  bg: 'bg-orange-50 dark:bg-orange-950/40',   text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-200 dark:ring-orange-800' },
  new:         { label: 'Новое',               icon: 'Sparkles',     bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-700 dark:text-blue-300',     ring: 'ring-blue-200 dark:ring-blue-800' },
  recommended: { label: 'Рекомендуем',         icon: 'Star',         bg: 'bg-violet-50 dark:bg-violet-950/40',   text: 'text-violet-700 dark:text-violet-300', ring: 'ring-violet-200 dark:ring-violet-800' },
};

interface StatusBadgeProps {
  status: CardStatus;
  customLabel?: string;
  className?: string;
}

const StatusBadge = ({ status, customLabel, className = '' }: StatusBadgeProps) => {
  const cfg = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ring-inset ${cfg.ring} ${cfg.bg} ${cfg.text} text-[10px] font-semibold ${className}`}
    >
      <Icon name={cfg.icon} fallback="Circle" size={10} />
      {customLabel || cfg.label}
    </span>
  );
};

export default StatusBadge;
