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
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { memoryApi } from './api';
import type { MemoryAlbum, MemoryEntry } from './types';

interface BulkAddToAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: MemoryAlbum | null;
  /** id памятей, которые уже в альбоме — будут исключены из списка. */
  excludeEntryIds: Set<string>;
  onAdded?: (count: number) => void;
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

export default function BulkAddToAlbumDialog({
  open,
  onOpenChange,
  album,
  excludeEntryIds,
  onAdded,
}: BulkAddToAlbumDialogProps) {
  const [allEntries, setAllEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);

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
      .filter(e => !excludeEntryIds.has(e.id))
      .filter(e => {
        if (!q) return true;
        const hay = [e.title, e.caption, e.location_label, e.memory_period_label]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
  }, [allEntries, excludeEntryIds, search]);

  const allCandidateIds = useMemo(() => candidates.map(e => e.id), [candidates]);
  const allSelected = candidates.length > 0 && candidates.every(e => selected.has(e.id));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allCandidateIds));
    }
  }

  async function handleAdd() {
    if (!album || selected.size === 0) return;
    setAdding(true);
    try {
      const results = await Promise.allSettled(
        Array.from(selected).map(id => memoryApi.addToAlbum(album.id, id)),
      );
      const ok = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - ok;
      if (ok > 0) {
        toast.success(
          failed === 0
            ? `Добавлено в «${album.title}»: ${ok}`
            : `Добавлено: ${ok}, ошибок: ${failed}`,
        );
        onAdded?.(ok);
      }
      if (ok > 0 && failed === 0) {
        onOpenChange(false);
      } else if (failed > 0 && ok === 0) {
        toast.error('Не удалось добавить ни одной памяти');
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Добавить существующие памяти</DialogTitle>
          <DialogDescription>
            {album ? `В альбом «${album.title}»` : 'В альбом'} попадут выбранные карточки.
          </DialogDescription>
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
              placeholder="Поиск по названию или подписи"
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
                    : 'Все доступные воспоминания уже в этом альбоме'}
              </p>
              {!search && allEntries.length > excludeEntryIds.size && (
                <p className="mt-1 text-xs text-muted-foreground">Попробуйте другой запрос</p>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {candidates.map(entry => {
                const cover =
                  entry.assets.find(a => a.id === entry.cover_asset_id)?.file_url ||
                  entry.assets[0]?.file_url;
                const date = formatShortDate(entry);
                const isSelected = selected.has(entry.id);
                return (
                  <label
                    key={entry.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(entry.id)}
                    />
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {date && <span>{date}</span>}
                        {entry.assets.length > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Icon name="Images" size={11} />
                            {entry.assets.length}
                          </span>
                        )}
                        {entry.member_ids.length > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Icon name="User" size={11} />
                            {entry.member_ids.length}
                          </span>
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
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={adding}>
              Отмена
            </Button>
            <Button onClick={handleAdd} disabled={adding || selected.size === 0}>
              {adding ? (
                <>
                  <Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />
                  Добавляем...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Добавить{selected.size > 0 ? ` (${selected.size})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
