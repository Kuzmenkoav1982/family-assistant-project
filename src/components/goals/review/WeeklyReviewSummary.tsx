import Icon from '@/components/ui/icon';
import type { WeeklySummary } from '@/lib/goals/weeklyReviewHelpers';

// Верхние 4 тайла Weekly Review V1.
// Симметрично GoalsSummary: 4 кликабельных тайла, переключающих секцию ниже.

export type WeeklyTab = 'progress' | 'regress' | 'review' | 'updated';

interface Props {
  summary: WeeklySummary;
  activeTab: WeeklyTab;
  onTabChange: (tab: WeeklyTab) => void;
}

interface TileProps {
  label: string;
  value: string | number;
  icon: string;
  tone: 'emerald' | 'rose' | 'amber' | 'blue';
  active: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

const TONE_STYLES: Record<TileProps['tone'], { bg: string; bgActive: string; text: string; ring: string }> = {
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200',
    bgActive: 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400',
    text: 'text-emerald-700',
    ring: 'ring-emerald-300',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
    bgActive: 'bg-gradient-to-br from-rose-100 to-pink-100 border-rose-400',
    text: 'text-rose-700',
    ring: 'ring-rose-300',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
    bgActive: 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-400',
    text: 'text-amber-700',
    ring: 'ring-amber-300',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    bgActive: 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-400',
    text: 'text-blue-700',
    ring: 'ring-blue-300',
  },
};

function Tile({ label, value, icon, tone, active, onClick, ariaLabel }: TileProps) {
  const t = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel ?? label}
      className={
        'rounded-xl border p-3 text-left transition-all ' +
        (active ? `${t.bgActive} ring-2 ${t.ring} shadow-sm` : `${t.bg} hover:shadow-md`)
      }
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] uppercase tracking-wide font-semibold ${t.text}`}>
          {label}
        </span>
        <Icon name={icon} size={14} className={t.text} />
      </div>
      <div className="text-2xl font-extrabold text-gray-900 leading-none tabular-nums">
        {value}
      </div>
    </button>
  );
}

export default function WeeklyReviewSummary({ summary, activeTab, onTabChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Tile
        label="Check-ins"
        value={summary.checkinsThisWeek}
        icon="MessageCircle"
        tone="blue"
        active={activeTab === 'updated'}
        onClick={() => onTabChange('updated')}
        ariaLabel={`Check-ins за неделю: ${summary.checkinsThisWeek}`}
      />
      <Tile
        label="Прогресс"
        value={summary.goalsProgressed}
        icon="TrendingUp"
        tone="emerald"
        active={activeTab === 'progress'}
        onClick={() => onTabChange('progress')}
        ariaLabel={`Целей с прогрессом: ${summary.goalsProgressed}`}
      />
      <Tile
        label="Откат"
        value={summary.goalsRegressed}
        icon="TrendingDown"
        tone="rose"
        active={activeTab === 'regress'}
        onClick={() => onTabChange('regress')}
        ariaLabel={`Целей с откатом: ${summary.goalsRegressed}`}
      />
      <Tile
        label="Пересмотр"
        value={summary.goalsNeedingReview}
        icon="AlertCircle"
        tone="amber"
        active={activeTab === 'review'}
        onClick={() => onTabChange('review')}
        ariaLabel={`Требуют пересмотра: ${summary.goalsNeedingReview}`}
      />
    </div>
  );
}
