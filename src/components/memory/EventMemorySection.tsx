import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { memoryApi } from './api';
import type { MemoryEntry } from './types';
import MemoryEntryDialog from './MemoryEntryDialog';
import MemoryEntryView from './MemoryEntryView';

interface EventMemorySectionProps {
  eventId: string;
  /** Подсказки для предзаполнения при создании памяти (мягкие, не перезаписывают вводимое). */
  eventTitle?: string;
  eventDate?: string;
  previewLimit?: number;
}

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

export default function EventMemorySection({
  eventId,
  eventTitle,
  eventDate,
  previewLimit = 4,
}: EventMemorySectionProps) {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<MemoryEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    memoryApi
      .listEntries({ event_id: eventId })
      .then(list => {
        if (!cancelled) setEntries(list);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleSaved = (entry: MemoryEntry) => {
    if (entry.event_id === eventId) {
      setEntries(prev => [entry, ...prev.filter(e => e.id !== entry.id)]);
    }
  };

  const preview = entries.slice(0, previewLimit);
  const hasMore = entries.length > previewLimit;

  return (
    <div className="space-y-1.5 pt-4 mt-2 border-t">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Icon name="BookHeart" size={14} className="text-purple-600" />
          Память об этом моменте
          {entries.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({entries.length})</span>
          )}
        </p>
        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="Plus" size={12} />
            Добавить
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: previewLimit }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-purple-50/40 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Пока нет воспоминаний об этом моменте
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
            Сохраните фото, подпись или семейную историю, связанную с этим событием.
          </p>
          <Button
            size="sm"
            variant="link"
            className="mt-1 h-auto p-0 text-xs text-purple-700"
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="Plus" size={12} className="mr-1" />
            Добавить первое
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {preview.map(entry => {
              const cover =
                entry.assets.find(a => a.id === entry.cover_asset_id)?.file_url ||
                entry.assets[0]?.file_url;
              const date = formatShortDate(entry);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setViewEntry(entry)}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title={entry.title}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={entry.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Icon name="ImageOff" size={20} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-left text-white">
                    <p className="line-clamp-1 text-[10px] font-medium leading-tight">
                      {entry.title}
                    </p>
                    {date && <p className="text-[9px] opacity-80">{date}</p>}
                  </div>
                  {entry.assets.length > 1 && (
                    <span className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                      {entry.assets.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {hasMore && (
            <Link
              to={`/memory?eventId=${eventId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-purple-700 hover:underline"
            >
              Смотреть все {entries.length}
              <Icon name="ChevronRight" size={12} />
            </Link>
          )}
        </>
      )}

      <MemoryEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialEventId={eventId}
        suggestedTitle={eventTitle}
        suggestedDate={eventDate}
        onSaved={handleSaved}
      />

      <MemoryEntryView
        entry={viewEntry}
        open={Boolean(viewEntry)}
        onOpenChange={open => !open && setViewEntry(null)}
      />
    </div>
  );
}
