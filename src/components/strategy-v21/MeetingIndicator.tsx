import Icon from '@/components/ui/icon';

interface MeetingIndicatorProps {
  activeIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

export default function MeetingIndicator({
  activeIndex,
  total,
  onPrev,
  onNext,
  onExit,
}: MeetingIndicatorProps) {
  return (
    <div
      data-meeting-indicator
      className="fixed top-3 right-3 z-[60] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-white/15 text-white rounded-full pl-3 pr-1.5 py-1.5 shadow-2xl"
    >
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-indigo-200/90 pr-2 border-r border-white/15">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Режим встречи
      </div>

      <button
        type="button"
        onClick={onPrev}
        disabled={activeIndex === 0}
        className="w-7 h-7 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition"
        aria-label="Предыдущий экран"
      >
        <Icon name="ChevronLeft" size={16} />
      </button>

      <div className="text-xs sm:text-sm font-semibold tabular-nums px-1">
        {activeIndex + 1} <span className="text-white/40">/ {total}</span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex === total - 1}
        className="w-7 h-7 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition"
        aria-label="Следующий экран"
      >
        <Icon name="ChevronRight" size={16} />
      </button>

      <button
        type="button"
        onClick={onExit}
        className="ml-1 h-7 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1 transition"
        title="Выйти из режима встречи (Esc)"
      >
        <Icon name="X" size={12} />
        <span className="hidden sm:inline">Выйти</span>
      </button>
    </div>
  );
}
