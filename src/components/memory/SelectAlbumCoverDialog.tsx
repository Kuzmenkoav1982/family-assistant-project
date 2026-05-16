import { useEffect, useMemo, useState } from 'react';
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
import type { MemoryAlbum, MemoryEntry } from './types';

interface SelectAlbumCoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: MemoryAlbum | null;
  onSaved?: (album: MemoryAlbum) => void;
}

interface AssetChoice {
  assetId: string;
  fileUrl: string;
  entryTitle: string;
  entryId: string;
}

export default function SelectAlbumCoverDialog({
  open,
  onOpenChange,
  album,
  onSaved,
}: SelectAlbumCoverDialogProps) {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !album) return;
    setSelectedAssetId(album.cover_asset_id ?? null);
    setLoading(true);
    memoryApi
      .listEntries({ album_id: album.id })
      .then(list => setEntries(list))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  }, [open, album]);

  const choices: AssetChoice[] = useMemo(() => {
    const list: AssetChoice[] = [];
    for (const e of entries) {
      const sorted = [...e.assets].sort((a, b) => a.sort_order - b.sort_order);
      for (const a of sorted) {
        list.push({
          assetId: a.id,
          fileUrl: a.file_url,
          entryTitle: e.title,
          entryId: e.id,
        });
      }
    }
    return list;
  }, [entries]);

  async function handleSave() {
    if (!album) return;
    setSaving(true);
    try {
      const updated = await memoryApi.updateAlbum(album.id, {
        cover_asset_id: selectedAssetId,
      });
      toast.success(selectedAssetId ? 'Обложка обновлена' : 'Автообложка восстановлена');
      onSaved?.(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSelectedAssetId(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Обложка альбома</DialogTitle>
          <DialogDescription>
            {album ? `Выберите фотографию для альбома «${album.title}».` : ''} Если не выбрать —
            обложка будет браться автоматически из последней памяти.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-mx-2 flex-1 rounded-md border">
          {loading ? (
            <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          ) : choices.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Icon name="ImageOff" size={32} className="mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium">В альбоме пока нет фотографий</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Сначала добавьте карточки памяти с фото, потом выберите одно как обложку
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4">
              {choices.map(c => {
                const isSelected = selectedAssetId === c.assetId;
                return (
                  <button
                    key={c.assetId}
                    type="button"
                    onClick={() => setSelectedAssetId(c.assetId)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all focus:outline-none ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent hover:border-amber-300'
                    }`}
                    title={c.entryTitle}
                  >
                    <img
                      src={c.fileUrl}
                      alt={c.entryTitle}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                        <div className="rounded-full bg-primary p-2 text-primary-foreground">
                          <Icon name="Check" size={16} />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-left text-white">
                      <p className="line-clamp-1 text-[10px] leading-tight">{c.entryTitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-2">
          {album?.cover_asset_id && (
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={saving || selectedAssetId === null}
              className="text-muted-foreground"
            >
              <Icon name="RotateCcw" size={14} className="mr-1.5" />
              Автообложка
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || selectedAssetId === (album?.cover_asset_id ?? null)}
          >
            {saving ? 'Сохранение...' : 'Сохранить обложку'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
