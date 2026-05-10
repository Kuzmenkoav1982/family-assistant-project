import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DeckNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DeckNavigation({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
}: DeckNavigationProps) {
  return (
    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Badge variant="outline" className="text-white border-white text-xs">
          {currentSlide + 1} / {totalSlides}
        </Badge>
        <a
          href="https://nris.ru/deposits/check-certificate/?num=518-830-027"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 transition-all"
          title="Свидетельство о депонировании n'RIS №518-830-027"
        >
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider">Интеллектуальная собственность</span>
            <span className="text-white font-bold text-xs">n'RIS №518-830-027</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-slate-300">Депонировано</span>
            <span className="text-white text-xs font-semibold">04.03.2026</span>
          </div>
          <Icon name="ShieldCheck" size={14} className="text-green-400 ml-1" />
        </a>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onPrev}
          disabled={currentSlide === 0}
          variant="outline"
          size="sm"
          className="text-white border-white"
        >
          <Icon name="ChevronLeft" size={20} />
        </Button>
        <Button
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          variant="outline"
          size="sm"
          className="text-white border-white"
        >
          <Icon name="ChevronRight" size={20} />
        </Button>
      </div>
    </div>
  );
}
