import Icon from '@/components/ui/icon';
import type { HubSummary } from '@/lib/goals/hubHelpers';

// Верхний summary-блок Goals Hub V1.
// Минимальный полезный набор: активные / средний прогресс / требуют внимания / завершённые.

interface Props {
  summary: HubSummary;
  /** Клик по тайлу = быстро применить фильтр. */
  onPickFilter?: (preset: 'active' | 'attention' | 'completed') => void;
}

interface TileProps {
  label: string;
  value: string | number;
  icon: string;
  tone: 'purple' | 'amber' | 'emerald' | 'blue';
  onClick?: () => void;
  ariaLabel?: string;
}

const TONE_STYLES: Record<TileProps['tone'], { bg: string; text: string; icon: string }> = {
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
  },
};

function Tile({ label, value, icon, tone, onClick, ariaLabel }: TileProps) {
  const t = TONE_STYLES[tone];
  const inner = (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] uppercase tracking-wide font-semibold ${t.text}`}>
          {label}
        </span>
        <Icon name={icon} size={14} className={t.icon} />
      </div>
      <div className="text-2xl font-extrabold text-gray-900 leading-none tabular-nums">
        {value}
      </div>
    </>
  );
  const baseClass = `rounded-xl border p-3 ${t.bg}`;
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? label}
        className={`${baseClass} text-left hover:shadow-md transition-shadow`}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseClass}>{inner}</div>;
}

export default function GoalsSummary({ summary, onPickFilter }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Tile
        label="Активных"
        value={summary.active}
        icon="Target"
        tone="purple"
        onClick={onPickFilter ? () => onPickFilter('active') : undefined}
        ariaLabel={`Активных целей: ${summary.active}`}
      />
      <Tile
        label="Средний %"
        value={summary.averageProgress !== null ? `${summary.averageProgress}%` : '—'}
        icon="Gauge"
        tone="blue"
      />
      <Tile
        label="Внимание"
        value={summary.attention}
        icon="AlertCircle"
        tone="amber"
        onClick={onPickFilter ? () => onPickFilter('attention') : undefined}
        ariaLabel={`Требуют внимания: ${summary.attention}`}
      />
      <Tile
        label="Завершено"
        value={summary.completed}
        icon="Trophy"
        tone="emerald"
        onClick={onPickFilter ? () => onPickFilter('completed') : undefined}
        ariaLabel={`Завершено целей: ${summary.completed}`}
      />
    </div>
  );
}
