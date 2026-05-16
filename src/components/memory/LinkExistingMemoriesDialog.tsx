import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { memoryApi } from './api';
import type { MemoryEntry } from './types';

export type LinkMode = 'person' | 'event';

interface LinkExistingMemoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: LinkMode;
  /** member_id (для person) или event_id (для event) — куда привязываем. */
  targetId: number | string;
  /** Подпись цели для UI (имя человека или название события). */
  targetLabel: string;
  /** Карта event_id → title для бейджей "другое событие" (используется только в mode=event). */
  eventTitles?: Map<string, string>;
  /** Только для person — id уже привязанных памятей, их скрываем из списка. */
  alreadyLinkedEntryIds?: Set<string>;
  onCompleted?: (addedCount: number) => void;
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

export default function LinkExistingMemoriesDialog({
  open,
  onOpenChange,
  mode,
  targetId,
  targetLabel,
  eventTitles,
  alreadyLinkedEntryIds,
  onCompleted,
}: LinkExistingMemoriesDialogProps) {
  const [allEntries, setAllEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setSearch('');
    setLoading(true);
    memoryApi
      .listEntries()
      .then(list => setAllEntries(list))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  }, [open]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEntries
      .filter(e => {
        if (mode === 'person') {
          // скрываем уже привязанные к этому человеку
          if (alreadyLinkedEntryIds?.has(e.id)) return false;
          return true;
        }
        // event-mode: скрываем только тех, кто уже в этом событии
        if (e.event_id && String(e.event_id) === String(targetId)) return false;
        return true;
      })
      .filter(e => {
        if (!q) return true;
        const hay = [e.title, e.caption, e.location_label, e.memory_period_label]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
  }, [allEntries, alreadyLinkedEntryIds, mode, targetId, search]);

  const allCandidateIds = useMemo(() => candidates.map(e => e.id), [candidates]);
  const allSelected = candidates.length > 0 && candidates.every(e => selected.has(e.id));

  // сколько выбранных в event-mode нужно переносить из другого события
  const relinkCount = useMemo(() => {
    if (mode !== 'event') return 0;
    let n = 0;
    for (const id of selected) {
      const e = allEntries.find(x => x.id === id);
      if (e?.event_id && String(e.event_id) !== String(targetId)) n++;
    }
    return n;
  }, [mode, selected, allEntries, targetId]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allCandidateIds));
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    if (mode === 'event' && relinkCount > 0) {
      const ok = confirm(
        `Перенести ${relinkCount} ${relinkCount === 1 ? 'память' : 'памятей'} из других событий в «${targetLabel}»?`,
      );
      if (!ok) return;
    }
    setWorking(true);
    try {
      const ids = Array.from(selected);
      let results: PromiseSettledResult<unknown>[];
      if (mode === 'person') {
        results = await Promise.allSettled(
          ids.map(id => memoryApi.addPerson(id, Number(targetId))),
        );
      } else {
        results = await Promise.allSettled(
          ids.map(id => memoryApi.updateEntry(id, { event_id: String(targetId) })),
        );
      }
      const okCount = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - okCount;
      if (okCount > 0) {
        toast.success(
          failed === 0
            ? `Привязано: ${okCount}`
            : `Привязано: ${okCount}, ошибок: ${failed}`,
        );
        onCompleted?.(okCount);
      }
      if (failed > 0 && okCount === 0) {
        toast.error('Не удалось привязать ни одной памяти');
      } else {
        onOpenChange(false);
      }
    } finally {
      setWorking(false);
    }
  }

  const title =
    mode === 'person'
      ? 'Привязать существующие памяти к человеку'
      : 'Привязать существующие памяти к событию';

  const description =
    mode === 'person'
      ? `Выбранные карточки будут показаны в профиле «${targetLabel}».`
      : `Выбранные карточки будут связаны с событием «${targetLabel}».`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon
              name="Search"
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск"
              className="pl-8"
            />
          </div>
          {candidates.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleAll} className="shrink-0">
              {allSelected ? 'Снять всё' : 'Выбрать всё'}
            </Button>
          )}
        </div>

        <ScrollArea className="-mx-2 flex-1 rounded-md border">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Icon name="BookHeart" size={32} className="mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {search
                  ? 'Ничего не найдено'
                  : allEntries.length === 0
                    ? 'У вас пока нет карточек памяти'
                    : mode === 'person'
                      ? 'Все доступные памяти уже привязаны к этому человеку'
                      : 'Все памяти уже связаны с этим событием'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {candidates.map(entry => {
                const cover =
                  entry.assets.find(a => a.id === entry.cover_asset_id)?.file_url ||
                  entry.assets[0]?.file_url;
                const date = formatShortDate(entry);
                const isSelected = selected.has(entry.id);
                const otherEventTitle =
                  mode === 'event' && entry.event_id && String(entry.event_id) !== String(targetId)
                    ? eventTitles?.get(String(entry.event_id))
                    : undefined;
                const noEvent = mode === 'event' && !entry.event_id;

                return (
                  <label
                    key={entry.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                    }`}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggle(entry.id)} />
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
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
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-sm text-muted-foreground">
            Выбрано: <span className="font-semibold text-foreground">{selected.size}</span>
            {mode === 'event' && relinkCount > 0 && (
              <span className="ml-2 text-amber-700">
                · перенесём из другого события: {relinkCount}
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={working}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={working || selected.size === 0}>
              {working ? (
                <>
                  <Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />
                  Привязываем...
                </>
              ) : (
                <>
                  <Icon name="Link2" size={14} className="mr-1.5" />
                  Привязать{selected.size > 0 ? ` (${selected.size})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
