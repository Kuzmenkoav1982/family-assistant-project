import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { LinkMode } from './LinkExistingMemoriesDialog';
import type { MemoryEntry } from './types';

function formatShortDate(entry: MemoryEntry): string | null {
  if (entry.memory_date) {
    try {
      return new Date(entry.memory_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return entry.memory_date;
    }
  }
  return entry.memory_period_label || null;
}

interface LinkMemoriesResultItemProps {
  entry: MemoryEntry;
  isSelected: boolean;
  mode: LinkMode;
  targetId: number | string;
  eventTitles?: Map<string, string>;
  onToggle: (id: string) => void;
}

export default function LinkMemoriesResultItem({
  entry,
  isSelected,
  mode,
  targetId,
  eventTitles,
  onToggle,
}: LinkMemoriesResultItemProps) {
  const cover =
    entry.assets.find(a => a.id === entry.cover_asset_id)?.file_url ||
    entry.assets[0]?.file_url;
  const date = formatShortDate(entry);
  const otherEventTitle =
    mode === 'event' && entry.event_id && String(entry.event_id) !== String(targetId)
      ? eventTitles?.get(String(entry.event_id))
      : undefined;
  const noEvent = mode === 'event' && !entry.event_id;

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${
        isSelected ? 'bg-primary/10' : 'hover:bg-accent'
      }`}
    >
      <Checkbox checked={isSelected} onCheckedChange={() => onToggle(entry.id)} />
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Icon name="ImageOff" size={18} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{entry.title}</div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {date && <span>{date}</span>}
          {entry.assets.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Icon name="Images" size={11} />
              {entry.assets.length}
            </span>
          )}
          {mode === 'event' && otherEventTitle && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] text-amber-800">
              Сейчас: {otherEventTitle}
            </Badge>
          )}
          {noEvent && (
            <Badge variant="secondary" className="text-[10px]">
              Без события
            </Badge>
          )}
        </div>
      </div>
    </label>
  );
}
