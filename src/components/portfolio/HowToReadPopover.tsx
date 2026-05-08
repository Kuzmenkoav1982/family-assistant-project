import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { track } from '@/lib/analytics';

interface HowToReadPopoverProps {
  /** Откуда вызван — для аналитики и контекстного текста */
  context: 'radar' | 'highlights' | 'table';
}

const CONTEXT_TEXT: Record<HowToReadPopoverProps['context'], { title: string; body: string }> = {
  radar: {
    title: 'Как читать радар',
    body: 'Каждая ось — одна из 8 сфер развития. Чем дальше точка от центра, тем полнее картина по этой сфере. Цвет точки показывает, насколько хватает данных: зелёный — полная картина, жёлтый — предварительно, серый — данных мало.',
  },
  highlights: {
    title: 'Как читать «Главное сейчас»',
    body: 'Здесь — три ориентира: сильная сторона, точка внимания и активный фокус. Это не оценка ребёнка, а подсказка, на чём имеет смысл сосредоточиться по сегодняшним данным семьи.',
  },
  table: {
    title: 'Как читать таблицу',
    body: 'Каждая строка — одна сфера. Уровень опирается на данные семьи, динамика — изменение за квартал. Если данных по сфере мало, балл не показывается, чтобы не делать поспешных выводов.',
  },
};

export default function HowToReadPopover({ context }: HowToReadPopoverProps) {
  const { title, body } = CONTEXT_TEXT[context];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Как читать?"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Icon name="HelpCircle" size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-72 text-xs p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon name="BookOpen" size={12} className="text-primary" />
          <p className="font-semibold text-sm">{title}</p>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-2">{body}</p>
        <Link
          to="/portfolio/about"
          onClick={() =>
            track('portfolio_about_open', {
              props: { source: `how_to_read_${context}` },
            })
          }
          className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary hover:underline"
        >
          Подробнее о методике
          <Icon name="ArrowRight" size={10} />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
