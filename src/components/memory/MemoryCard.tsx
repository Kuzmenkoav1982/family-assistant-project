import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { MemoryEntry } from './types';

interface MemoryCardProps {
  entry: MemoryEntry;
  onClick?: () => void;
  /** Если true — отображается чекбокс-оверлей. Клик переключает выбор, не открывает view. */
  selectable?: boolean;
  selected?: boolean;
}

function formatDate(entry: MemoryEntry): string | null {
  if (entry.memory_date) {
    try {
      return format(parseISO(entry.memory_date), 'd MMMM yyyy', { locale: ru });
    } catch {
      return entry.memory_date;
    }
  }
  return entry.memory_period_label || null;
}

export default function MemoryCard({ entry, onClick, selectable, selected }: MemoryCardProps) {
  const cover =
    entry.assets.find(a => a.id === entry.cover_asset_id)?.file_url ||
    entry.assets[0]?.file_url;
  const dateLabel = formatDate(entry);
  const photosCount = entry.assets.length;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selectable ? Boolean(selected) : undefined}
      className={`group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary ${
        selectable && selected
          ? 'border-primary ring-2 ring-primary/40'
          : ''
      }`}
    >
      <div className="relative aspect-[4/5] w-full bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={entry.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Icon name="ImageOff" size={32} />
          </div>
        )}
        {selectable && (
          <div
            className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-md transition-colors ${
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-white bg-white/90 text-transparent'
            }`}
            aria-hidden="true"
          >
            <Icon name="Check" size={14} />
          </div>
        )}
        {photosCount > 1 && (
          <Badge variant="secondary" className="absolute right-2 top-2 gap-1 bg-black/60 text-white">
            <Icon name="Images" size={12} />
            {photosCount}
          </Badge>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10 text-white">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{entry.title}</h3>
          {dateLabel && <p className="mt-1 text-xs opacity-80">{dateLabel}</p>}
        </div>
      </div>
      {entry.caption && (
        <p className="line-clamp-2 px-3 py-2 text-xs text-muted-foreground">{entry.caption}</p>
      )}
    </button>
  );
}
