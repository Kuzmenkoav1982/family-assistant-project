import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import type { MemoryEntry } from './types';

interface MemoryEntryViewProps {
  entry: MemoryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (entry: MemoryEntry) => void;
  onArchive?: (entry: MemoryEntry) => void;
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

export default function MemoryEntryView({
  entry,
  open,
  onOpenChange,
  onEdit,
  onArchive,
}: MemoryEntryViewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { members } = useFamilyTree();

  if (!entry) return null;

  const sortedAssets = [...entry.assets].sort((a, b) => a.sort_order - b.sort_order);
  const dateLabel = formatDate(entry);
  const linkedMembers = members.filter(m => entry.member_ids.includes(m.id));

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex(i => (i == null ? 0 : (i - 1 + sortedAssets.length) % sortedAssets.length));
  const next = () =>
    setLightboxIndex(i => (i == null ? 0 : (i + 1) % sortedAssets.length));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8 text-xl">{entry.title}</DialogTitle>
            {dateLabel && (
              <DialogDescription className="flex items-center gap-2 text-sm">
                <Icon name="Calendar" size={14} />
                {dateLabel}
                {entry.location_label && (
                  <>
                    <span className="opacity-60">·</span>
                    <Icon name="MapPin" size={14} />
                    {entry.location_label}
                  </>
                )}
              </DialogDescription>
            )}
          </DialogHeader>

          {sortedAssets.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sortedAssets.map((asset, i) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={asset.file_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}

          {entry.caption && (
            <p className="mt-2 italic text-muted-foreground">{entry.caption}</p>
          )}

          {entry.story && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
              {entry.story}
            </div>
          )}

          {linkedMembers.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                На фото
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedMembers.map(m => (
                  <Badge key={m.id} variant="secondary" className="gap-1.5">
                    <Icon name="User" size={12} />
                    {m.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {onArchive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(entry)}
                className="text-muted-foreground"
              >
                <Icon name="Archive" size={16} className="mr-1.5" />
                В архив
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(entry)}>
                <Icon name="Pencil" size={16} className="mr-1.5" />
                Редактировать
              </Button>
            )}
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lightboxIndex != null && sortedAssets[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={e => { e.stopPropagation(); closeLightbox(); }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Закрыть"
          >
            <Icon name="X" size={24} />
          </button>
          {sortedAssets.length > 1 && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Предыдущее"
              >
                <Icon name="ChevronLeft" size={24} />
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Следующее"
              >
                <Icon name="ChevronRight" size={24} />
              </button>
            </>
          )}
          <img
            src={sortedAssets[lightboxIndex].file_url}
            alt=""
            className="max-h-[92vh] max-w-[92vw] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            {lightboxIndex + 1} / {sortedAssets.length}
          </div>
        </div>
      )}
    </>
  );
}
