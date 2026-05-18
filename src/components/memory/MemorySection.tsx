import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { memoryApi } from './api';
import type { MemoryEntry } from './types';
import MemoryEntryDialog from './MemoryEntryDialog';
import MemoryEntryView from './MemoryEntryView';
import LinkExistingMemoriesDialog from './LinkExistingMemoriesDialog';

export interface MemorySectionConfig {
  fetchParams: Parameters<typeof memoryApi.listEntries>[0];
  linkMode: 'person' | 'event';
  linkTargetId: number | string;
  linkTargetLabel: string;
  allMemoriesHref: string;
  emptyLabel?: string;
  createDialogProps?: {
    initialMemberId?: number;
    initialEventId?: string;
    suggestedTitle?: string;
    suggestedDate?: string;
  };
}

interface MemorySectionProps {
  config: MemorySectionConfig;
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

export default function MemorySection({ config, previewLimit = 4 }: MemorySectionProps) {
  const {
    fetchParams,
    linkMode,
    linkTargetId,
    linkTargetLabel,
    allMemoriesHref,
    emptyLabel,
    createDialogProps = {},
  } = config;

  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<MemoryEntry | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);

  const reload = () => {
    setLoading(true);
    memoryApi
      .listEntries(fetchParams)
      .then(list => setEntries(list))
      .catch(err => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  const alreadyLinked = useMemo(() => new Set(entries.map(e => e.id)), [entries]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    memoryApi
      .listEntries(fetchParams)
      .then(list => {
        if (!cancelled) setEntries(list);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fetchParams)]);

  const handleSaved = (entry: MemoryEntry) => {
    const isLinked =
      (createDialogProps.initialMemberId != null &&
        entry.member_ids.includes(createDialogProps.initialMemberId)) ||
      (createDialogProps.initialEventId != null &&
        entry.event_id === createDialogProps.initialEventId);
    if (isLinked) {
      setEntries(prev => [entry, ...prev.filter(e => e.id !== entry.id)]);
    }
  };

  const preview = entries.slice(0, previewLimit);
  const hasMore = entries.length > previewLimit;

  return (
    <div className="border-t pt-3 mt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Icon name="BookHeart" size={14} className="text-amber-600" />
          Фото и воспоминания
          {entries.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({entries.length})</span>
          )}
        </p>
        {entries.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setLinkOpen(true)}
              title="Привязать существующие памяти"
            >
              <Icon name="Link2" size={12} />
              Привязать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setCreateOpen(true)}
            >
              <Icon name="Plus" size={12} />
              Добавить
            </Button>
          </div>
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
        <div className="rounded-lg border border-dashed bg-amber-50/40 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            {emptyLabel ?? 'Пока нет воспоминаний'}
          </p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-xs text-amber-700"
              onClick={() => setCreateOpen(true)}
            >
              <Icon name="Plus" size={12} className="mr-1" />
              Добавить первое
            </Button>
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-xs text-amber-700"
              onClick={() => setLinkOpen(true)}
            >
              <Icon name="Link2" size={12} className="mr-1" />
              Привязать существующие
            </Button>
          </div>
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
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              to={allMemoriesHref}
              className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700 hover:underline"
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
        {...createDialogProps}
        onSaved={handleSaved}
      />

      <MemoryEntryView
        entry={viewEntry}
        open={Boolean(viewEntry)}
        onOpenChange={open => !open && setViewEntry(null)}
      />

      <LinkExistingMemoriesDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        mode={linkMode}
        targetId={linkTargetId}
        targetLabel={linkTargetLabel}
        alreadyLinkedEntryIds={alreadyLinked}
        onCompleted={() => reload()}
      />
    </div>
  );
}