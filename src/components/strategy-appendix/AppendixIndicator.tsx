import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { APPENDIX_SECTIONS } from './appendixSections';

export default function AppendixIndicator() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const probeY = 160;
      for (let i = APPENDIX_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(APPENDIX_SECTIONS[i].id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probeY) {
          if (i !== activeIndex) setActiveIndex(i);
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(APPENDIX_SECTIONS.length - 1, index));
    const el = document.getElementById(APPENDIX_SECTIONS[clamped].id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="fixed top-16 right-3 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 rounded-full pl-3 pr-1 py-1 shadow-sm text-slate-700">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 pr-2 border-r border-slate-200 hidden sm:inline">
        Резерв
      </span>
      <button
        type="button"
        onClick={() => goTo(activeIndex - 1)}
        disabled={activeIndex === 0}
        className="w-6 h-6 rounded-full hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"
        aria-label="Назад"
      >
        <Icon name="ChevronLeft" size={14} />
      </button>
      <div className="text-xs font-semibold tabular-nums px-1">
        {APPENDIX_SECTIONS[activeIndex].code}{' '}
        <span className="text-slate-400">/ {APPENDIX_SECTIONS.length}</span>
      </div>
      <button
        type="button"
        onClick={() => goTo(activeIndex + 1)}
        disabled={activeIndex === APPENDIX_SECTIONS.length - 1}
        className="w-6 h-6 rounded-full hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center"
        aria-label="Вперёд"
      >
        <Icon name="ChevronRight" size={14} />
      </button>
    </div>
  );
}
