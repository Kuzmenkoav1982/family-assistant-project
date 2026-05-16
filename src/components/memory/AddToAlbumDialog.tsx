import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { memoryApi } from './api';
import MemoryAlbumDialog from './MemoryAlbumDialog';
import type { MemoryAlbum, MemoryEntry } from './types';

interface AddToAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: MemoryEntry | null;
  onAdded?: (album: MemoryAlbum) => void;
}

export default function AddToAlbumDialog({
  open,
  onOpenChange,
  entry,
  onAdded,
}: AddToAlbumDialogProps) {
  const [albums, setAlbums] = useState<MemoryAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const list = await memoryApi.listAlbums();
      setAlbums(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось загрузить альбомы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) reload();
  }, [open]);

  async function addToAlbum(album: MemoryAlbum) {
    if (!entry) return;
    setAdding(album.id);
    try {
      await memoryApi.addToAlbum(album.id, entry.id);
      toast.success(`Добавлено в «${album.title}»`);
      onAdded?.(album);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось добавить');
    } finally {
      setAdding(null);
    }
  }

  function handleCreated(album: MemoryAlbum) {
    setAlbums(prev => [album, ...prev]);
    // сразу добавляем в новосозданный альбом
    addToAlbum(album);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить в альбом</DialogTitle>
            <DialogDescription>
              {entry?.title ? `«${entry.title}»` : 'Карточка памяти'} попадёт в выбранный
              тематический альбом.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-72 rounded-md border">
            {loading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : albums.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Icon name="BookHeart" size={28} className="mx-auto mb-2 opacity-50" />
                Пока нет альбомов — создайте первый
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {albums.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => addToAlbum(a)}
                    disabled={adding === a.id}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent disabled:opacity-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                      <Icon name="BookHeart" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.entries_count === 0
                          ? 'Пусто'
                          : a.entries_count === 1
                            ? '1 память'
                            : `${a.entries_count} памятей`}
                      </div>
                    </div>
                    {adding === a.id ? (
                      <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />
                    ) : (
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="Plus" size={14} className="mr-1.5" />
              Новый альбом
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MemoryAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={handleCreated}
      />
    </>
  );
}
