import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import { useMemoryEntries } from '@/components/memory/useMemoryEntries';
import { useMemoryAlbums } from '@/components/memory/useMemoryAlbums';
import { memoryApi } from '@/components/memory/api';
import MemoryCard from '@/components/memory/MemoryCard';
import MemoryAlbumCard from '@/components/memory/MemoryAlbumCard';
import MemoryAlbumDialog from '@/components/memory/MemoryAlbumDialog';
import MemoryEntryDialog from '@/components/memory/MemoryEntryDialog';
import MemoryEntryView from '@/components/memory/MemoryEntryView';
import BulkAddToAlbumDialog from '@/components/memory/BulkAddToAlbumDialog';
import SelectAlbumCoverDialog from '@/components/memory/SelectAlbumCoverDialog';
import { resolveAlbumCover } from '@/components/memory/coverResolver';
import type { MemoryAlbum, MemoryEntry } from '@/components/memory/types';

export default function Memory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const memberIdParam = searchParams.get('memberId');
  const eventIdParam = searchParams.get('eventId');
  const albumIdParam = searchParams.get('albumId');
  const filterMemberId = memberIdParam ? Number(memberIdParam) : undefined;
  const filterEventId = eventIdParam || undefined;
  const filterAlbumId = albumIdParam || undefined;

  const { members } = useFamilyTree();
  const { events } = useLifeEvents();
  const {
    albums,
    loading: albumsLoading,
    reload: reloadAlbums,
    archive: archiveAlbum,
  } = useMemoryAlbums();
  const { entries, loading, error, reload, archive, replaceEntry } = useMemoryEntries({
    memberId: filterMemberId,
    eventId: filterEventId,
    albumId: filterAlbumId,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MemoryEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<MemoryEntry | null>(null);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<MemoryAlbum | null>(null);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);

  const filterMember = useMemo(
    () => (filterMemberId ? members.find(m => m.id === filterMemberId) : null),
    [filterMemberId, members],
  );
  const filterEvent = useMemo(
    () => (filterEventId ? events.find(e => e.id === filterEventId) : null),
    [filterEventId, events],
  );
  const filterAlbum = useMemo(
    () => (filterAlbumId ? albums.find(a => a.id === filterAlbumId) : null),
    [filterAlbumId, albums],
  );

  useEffect(() => {
    const prev = document.title;
    if (filterAlbum) {
      document.title = `Альбом — ${filterAlbum.title}`;
    } else if (filterMember) {
      document.title = `Память — ${filterMember.name}`;
    } else if (filterEvent) {
      document.title = `Память — ${filterEvent.title}`;
    } else {
      document.title = 'Альбом поколений — Наша Семья';
    }
    return () => { document.title = prev; };
  }, [filterMember, filterEvent, filterAlbum]);

  const handleSaved = async (entry: MemoryEntry) => {
    if (editEntry) {
      replaceEntry(entry);
      setEditEntry(null);
      return;
    }
    // если мы в контексте альбома — авто-привязка новой памяти
    if (filterAlbumId) {
      try {
        await memoryApi.addToAlbum(filterAlbumId, entry.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Не удалось добавить в альбом');
      }
    }
    reload();
    reloadAlbums();
  };

  const handleArchive = async (entry: MemoryEntry) => {
    if (!confirm(`Перенести «${entry.title}» в архив?`)) return;
    await archive(entry.id);
    setViewEntry(null);
    reloadAlbums();
  };

  const handleRemoveFromAlbum = async (entry: MemoryEntry) => {
    if (!filterAlbumId) return;
    if (!confirm(`Убрать «${entry.title}» из альбома?`)) return;
    try {
      await memoryApi.removeFromAlbum(filterAlbumId, entry.id);
      toast.success('Карточка убрана из альбома');
      reload();
      reloadAlbums();
      setViewEntry(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось убрать');
    }
  };

  const handleArchiveAlbum = async () => {
    if (!filterAlbum) return;
    if (!confirm(`Перенести альбом «${filterAlbum.title}» в архив? Сами карточки памяти не удалятся.`)) return;
    await archiveAlbum(filterAlbum.id);
    clearFilter();
  };

  const clearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('memberId');
    next.delete('eventId');
    next.delete('albumId');
    setSearchParams(next, { replace: true });
  };

  const openAlbum = (album: MemoryAlbum) => {
    const next = new URLSearchParams(searchParams);
    next.set('albumId', album.id);
    next.delete('memberId');
    next.delete('eventId');
    setSearchParams(next);
  };

  const hasFilter = Boolean(filterMember || filterEvent || filterAlbum);
  const showAlbumShelf = !hasFilter;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Альбом поколений</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Не свалка фотографий — а осмысленная семейная память. Сохраняйте важные моменты с
            подписью и людьми, чтобы передать их детям и внукам.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0">
          <Icon name="Plus" size={18} className="mr-1.5" />
          Добавить память
        </Button>
      </header>

      {showAlbumShelf && (
        <AlbumShelf
          albums={albums}
          entries={entries}
          loading={albumsLoading}
          onOpen={openAlbum}
          onCreate={() => {
            setEditingAlbum(null);
            setAlbumDialogOpen(true);
          }}
        />
      )}

      {filterMember && (
        <FilterBar
          color="amber"
          icon="User"
          label="Память про"
          chip={
            <>
              <span className="text-base leading-none">{filterMember.avatar || '👤'}</span>
              {filterMember.name}
            </>
          }
          onClear={clearFilter}
        />
      )}

      {filterEvent && (
        <FilterBar
          color="purple"
          icon="Sparkle"
          label="Память об"
          chip={
            <>
              <Icon name="Calendar" size={12} />
              {filterEvent.title}
            </>
          }
          onClear={clearFilter}
        />
      )}

      {filterAlbum && (
        <AlbumHeader
          album={filterAlbum}
          coverUrl={resolveAlbumCover(filterAlbum, entries)}
          onClear={clearFilter}
          onEdit={() => {
            setEditingAlbum(filterAlbum);
            setAlbumDialogOpen(true);
          }}
          onArchive={handleArchiveAlbum}
          onBulkAdd={() => setBulkAddOpen(true)}
          onPickCover={() => setCoverDialogOpen(true)}
        />
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
          <Button variant="link" size="sm" onClick={reload} className="ml-2 h-auto p-0">
            Повторить
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          filterKind={
            filterMember ? 'member' : filterEvent ? 'event' : filterAlbum ? 'album' : null
          }
          filterLabel={filterMember?.name || filterEvent?.title || filterAlbum?.title}
          onAdd={() => setCreateOpen(true)}
          onBulkAdd={filterAlbum ? () => setBulkAddOpen(true) : undefined}
          onClearFilter={hasFilter ? clearFilter : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {entries.map(entry => (
            <MemoryCard key={entry.id} entry={entry} onClick={() => setViewEntry(entry)} />
          ))}
        </div>
      )}

      <MemoryEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialMemberId={filterMemberId}
        initialEventId={filterEventId}
        suggestedTitle={filterEvent?.title}
        suggestedDate={filterEvent?.date}
        onSaved={handleSaved}
      />

      <MemoryEntryDialog
        open={Boolean(editEntry)}
        onOpenChange={open => !open && setEditEntry(null)}
        initialEntry={editEntry}
        onSaved={handleSaved}
      />

      <MemoryEntryView
        entry={viewEntry}
        open={Boolean(viewEntry)}
        onOpenChange={open => !open && setViewEntry(null)}
        onEdit={e => {
          setViewEntry(null);
          setEditEntry(e);
        }}
        onArchive={filterAlbum ? handleRemoveFromAlbum : handleArchive}
        removeFromAlbumMode={Boolean(filterAlbum)}
      />

      <MemoryAlbumDialog
        open={albumDialogOpen}
        onOpenChange={open => {
          setAlbumDialogOpen(open);
          if (!open) setEditingAlbum(null);
        }}
        initialAlbum={editingAlbum}
        onSaved={() => reloadAlbums()}
      />

      <BulkAddToAlbumDialog
        open={bulkAddOpen}
        onOpenChange={setBulkAddOpen}
        album={filterAlbum || null}
        excludeEntryIds={new Set(entries.map(e => e.id))}
        onAdded={() => {
          reload();
          reloadAlbums();
        }}
      />

      <SelectAlbumCoverDialog
        open={coverDialogOpen}
        onOpenChange={setCoverDialogOpen}
        album={filterAlbum || null}
        onSaved={() => reloadAlbums()}
      />
    </div>
  );
}

function AlbumShelf({
  albums,
  entries,
  loading,
  onOpen,
  onCreate,
}: {
  albums: MemoryAlbum[];
  entries: MemoryEntry[];
  loading: boolean;
  onOpen: (a: MemoryAlbum) => void;
  onCreate: () => void;
}) {
  const getCover = (album: MemoryAlbum): string | null =>
    resolveAlbumCover(album, entries);

  if (loading) {
    return (
      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Icon name="BookHeart" size={18} className="text-amber-600" />
          Альбомы
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Icon name="BookHeart" size={18} className="text-amber-600" />
          Альбомы
          {albums.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">({albums.length})</span>
          )}
        </h2>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <Icon name="Plus" size={14} className="mr-1.5" />
          Создать альбом
        </Button>
      </div>

      {albums.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 px-4 py-6 text-center">
          <Icon name="BookHeart" size={28} className="mx-auto mb-2 text-amber-600" />
          <p className="text-sm text-amber-900">
            Соберите тематические альбомы — «Предки», «Наша семья в 90-е», «Детство Матвея»
          </p>
          <Button variant="link" className="mt-1 h-auto p-0 text-amber-700" onClick={onCreate}>
            Создать первый альбом
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {albums.map(a => (
            <MemoryAlbumCard key={a.id} album={a} coverUrl={getCover(a)} onClick={() => onOpen(a)} />
          ))}
        </div>
      )}
    </section>
  );
}

function AlbumHeader({
  album,
  coverUrl,
  onClear,
  onEdit,
  onArchive,
  onBulkAdd,
  onPickCover,
}: {
  album: MemoryAlbum;
  coverUrl: string | null;
  onClear: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onBulkAdd: () => void;
  onPickCover: () => void;
}) {
  return (
    <div className="mb-4 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {coverUrl && (
            <button
              type="button"
              onClick={onPickCover}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-amber-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:h-20 sm:w-20"
              title="Сменить обложку"
            >
              <img src={coverUrl} alt={album.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <Icon
                  name="Pencil"
                  size={14}
                  className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Icon name="BookHeart" size={16} className="text-amber-700" />
              <span className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Альбом
              </span>
            </div>
            <h2 className="text-xl font-bold text-amber-950">{album.title}</h2>
            {album.description && (
              <p className="mt-1 text-sm text-amber-900/80">{album.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Icon name="MoreHorizontal" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Icon name="Pencil" size={14} className="mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPickCover}>
                <Icon name="Image" size={14} className="mr-2" />
                Выбрать обложку
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive} className="text-destructive">
                <Icon name="Archive" size={14} className="mr-2" />
                В архив
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 px-2 text-xs">
            <Icon name="X" size={12} />
            Закрыть
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onBulkAdd}
          className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
        >
          <Icon name="FolderPlus" size={14} className="mr-1.5" />
          Добавить существующие
        </Button>
        <Badge variant="secondary" className="bg-white">
          <Icon name="Images" size={11} className="mr-1" />
          Новая память здесь автоматически попадёт в этот альбом
        </Badge>
      </div>
    </div>
  );
}

function FilterBar({
  color,
  icon,
  label,
  chip,
  onClear,
}: {
  color: 'amber' | 'purple';
  icon: string;
  label: string;
  chip: React.ReactNode;
  onClear: () => void;
}) {
  const bg = color === 'amber' ? 'bg-amber-50' : 'bg-purple-50';
  const text = color === 'amber' ? 'text-amber-700' : 'text-purple-700';
  const text2 = color === 'amber' ? 'text-amber-900' : 'text-purple-900';
  return (
    <div className={`mb-4 flex items-center gap-2 rounded-lg ${bg} px-3 py-2`}>
      <Icon name={icon} size={14} className={text} />
      <span className={`text-sm ${text2}`}>{label}</span>
      <Badge variant="secondary" className="gap-1.5 bg-white">
        {chip}
      </Badge>
      <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1 px-2 text-xs" onClick={onClear}>
        <Icon name="X" size={12} />
        Сбросить
      </Button>
    </div>
  );
}

function EmptyState({
  filterKind,
  filterLabel,
  onAdd,
  onBulkAdd,
  onClearFilter,
}: {
  filterKind: 'member' | 'event' | 'album' | null;
  filterLabel?: string;
  onAdd: () => void;
  onBulkAdd?: () => void;
  onClearFilter?: () => void;
}) {
  let heading = 'Здесь будут жить семейные моменты';
  if (filterKind === 'member' && filterLabel) heading = `Пока нет воспоминаний про ${filterLabel}`;
  else if (filterKind === 'event' && filterLabel) heading = `Пока нет воспоминаний об «${filterLabel}»`;
  else if (filterKind === 'album' && filterLabel) heading = `Альбом «${filterLabel}» пока пуст`;

  const description = filterKind === 'album'
    ? 'Соберите его из уже созданных карточек или создайте новую — она автоматически попадёт сюда.'
    : filterKind
      ? 'Создайте первую карточку памяти — фото, дата и короткая история. Контекст уже привязан.'
      : 'Добавьте первую карточку памяти: 1–10 фото, кто на них, дата и короткая история. Раз в месяц или раз в полгода — пополняйте альбом вместе с семьёй.';

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-4 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="BookHeart" size={40} />
      </div>
      <h2 className="text-xl font-semibold">{heading}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {onBulkAdd && (
          <Button onClick={onBulkAdd} size="lg" variant="outline">
            <Icon name="FolderPlus" size={18} className="mr-1.5" />
            Добавить существующие
          </Button>
        )}
        <Button onClick={onAdd} size="lg">
          <Icon name="Plus" size={18} className="mr-1.5" />
          {filterKind ? 'Создать новую' : 'Создать первую память'}
        </Button>
        {onClearFilter && (
          <Button variant="ghost" size="lg" onClick={onClearFilter}>
            Показать все
          </Button>
        )}
      </div>
    </div>
  );
}