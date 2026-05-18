import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { useLinkExistingMemories } from './useLinkExistingMemories';
import LinkMemoriesResultItem from './LinkMemoriesResultItem';

export type LinkMode = 'person' | 'event';

interface LinkExistingMemoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: LinkMode;
  targetId: number | string;
  targetLabel: string;
  eventTitles?: Map<string, string>;
  alreadyLinkedEntryIds?: Set<string>;
  onCompleted?: (addedCount: number) => void;
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
  const {
    allEntries,
    candidates,
    loading,
    working,
    selected,
    search,
    setSearch,
    allSelected,
    relinkCount,
    toggle,
    toggleAll,
    handleSubmit,
  } = useLinkExistingMemories({
    open,
    mode,
    targetId,
    targetLabel,
    alreadyLinkedEntryIds,
    onCompleted,
    onClose: () => onOpenChange(false),
  });

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
              {candidates.map(entry => (
                <LinkMemoriesResultItem
                  key={entry.id}
                  entry={entry}
                  isSelected={selected.has(entry.id)}
                  mode={mode}
                  targetId={targetId}
                  eventTitles={eventTitles}
                  onToggle={toggle}
                />
              ))}
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
