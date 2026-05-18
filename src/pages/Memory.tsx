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
import MemoryFiltersBar from '@/components/memory/MemoryFiltersBar';
import HowItWorksBlock from '@/components/hub/HowItWorksBlock';
import SectionHero from '@/components/ui/section-hero';
import { resolveAlbumCover } from '@/components/memory/coverResolver';
import type { MemoryAlbum, MemoryEntry, MemorySort } from '@/components/memory/types';

const DEFAULT_SORT: MemorySort = 'memory_date_desc';

export default function Memory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const memberIdParam = searchParams.get('memberId');
  const eventIdParam = searchParams.get('eventId');
  const albumIdParam = searchParams.get('albumId');
  const qParam = (searchParams.get('q') || '').trim();
  const yearParam = searchParams.get('year');
  const sortParam = (searchParams.get('sort') as MemorySort | null) || DEFAULT_SORT;

  const filterMemberId = memberIdParam ? Number(memberIdParam) : undefined;
  const filterEventId = eventIdParam || undefined;
  const filterAlbumId = albumIdParam || undefined;
  const filterYear = yearParam ? Number(yearParam) : undefined;
  const filterQ = qParam || undefined;

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
    q: filterQ,
    year: filterYear,
    sort: sortParam,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MemoryEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<MemoryEntry | null>(null);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<MemoryAlbum | null>(null);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRemoving, setBulkRemoving] = useState(false);

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

  const handleSaved = async (_entry: MemoryEntry) => {
    if (editEntry) {
      replaceEntry(_entry);
      setEditEntry(null);
    }
    // Контекст альбома теперь предзаполняется в диалоге через initialAlbumId,
    // привязка к альбомам делается через setEntryAlbums в save-оркестраторе.
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

  // выход из selection mode при смене альбома или фильтра
  useEffect(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [filterAlbumId, filterMemberId, filterEventId]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkRemove = async () => {
    if (!filterAlbum || selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (
      !confirm(
        `Убрать ${count} ${count === 1 ? 'карточку' : count < 5 ? 'карточки' : 'карточек'} из альбома?\n\nКарточки останутся в общем архиве памяти и в других альбомах.`,
      )
    ) {
      return;
    }
    setBulkRemoving(true);
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(
        ids.map(id => memoryApi.removeFromAlbum(filterAlbum.id, id)),
      );
      const ok = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - ok;

      // Edge case: если убираем память с текущей ручной обложкой —
      // сбрасываем cover_asset_id, чтобы не висел битый указатель.
      if (filterAlbum.cover_asset_id && ok > 0) {
        const removedEntries = entries.filter(e => ids.includes(e.id));
        const coverInRemoved = removedEntries.some(e =>
          e.assets.some(a => a.id === filterAlbum.cover_asset_id),
        );
        if (coverInRemoved) {
          try {
            await memoryApi.updateAlbum(filterAlbum.id, { cover_asset_id: null });
          } catch {
            // не критично
          }
        }
      }

      if (ok > 0) {
        toast.success(
          failed === 0 ? `Убрано из альбома: ${ok}` : `Убрано: ${ok}, ошибок: ${failed}`,
        );
      }
      if (failed > 0 && ok === 0) {
        toast.error('Не удалось убрать ни одной карточки');
      }
      reload();
      reloadAlbums();
      exitSelectionMode();
    } finally {
      setBulkRemoving(false);
    }
  };

  const clearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('memberId');
    next.delete('eventId');
    next.delete('albumId');
    setSearchParams(next, { replace: true });
  };

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value == null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const resetAllFilters = () => {
    const next = new URLSearchParams();
    setSearchParams(next, { replace: true });
  };

  // годы из памятей (только когда они уже загружены) + годы из событий — для select
  const yearsAvailable = useMemo(() => {
    const years = new Set<number>();
    for (const e of entries) {
      if (e.memory_date) {
        const y = new Date(e.memory_date).getFullYear();
        if (Number.isFinite(y)) years.add(y);
      }
    }
    for (const ev of events) {
      if (ev.date) {
        const y = new Date(ev.date).getFullYear();
        if (Number.isFinite(y)) years.add(y);
      }
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [entries, events]);

  const eventOptions = useMemo(
    () => events.map(e => ({ id: e.id, title: e.title, date: e.date })),
    [events],
  );
  const memberOptions = useMemo(
    () => members.map(m => ({ id: m.id, name: m.name, avatar: m.avatar })),
    [members],
  );

  const hasAnyFilter = Boolean(filterQ || filterMemberId || filterEventId || filterYear);
  const hasAnyOrAlbum = hasAnyFilter || Boolean(filterAlbumId);

  const openAlbum = (album: MemoryAlbum) => {
    const next = new URLSearchParams(searchParams);
    next.set('albumId', album.id);
    next.delete('memberId');
    next.delete('eventId');
    setSearchParams(next);
  };

  const hasFilter = Boolean(filterMember || filterEvent || filterAlbum);
  // Полка альбомов — только в чистом режиме (без фильтров и без открытого альбома)
  const showAlbumShelf = !hasFilter && !hasAnyFilter;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <SectionHero
        title="Альбом поколений"
        subtitle="Не свалка фотографий — а осмысленная семейная память. Сохраняйте важные моменты с подписью и людьми, чтобы передать их детям и внукам."
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/7caf5914-dd0e-49ba-830b-c44b378c04ae.jpg"
        backPath="/family-hub"
        rightAction={
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="bg-white text-violet-700 hover:bg-white/90 shadow-lg"
          >
            <Icon name="Plus" size={16} className="mr-1.5" />
            Добавить
          </Button>
        }
      />

      <div className="mb-4">
        <HowItWorksBlock
          accent="violet"
          title="Как устроен Альбом поколений?"
          intro="Альбом поколений — третий слой семейного кода. Древо отвечает на вопрос «кто мы», Дорога жизни — «что мы прошли», а Альбом — «что мы чувствовали». Это не Google Photos и не Instagram: здесь у каждой фотографии есть автор, герои из вашего древа, дата, место и история. Через 30 лет внуки откроют профиль прабабушки — и увидят не пустую ячейку, а живые мгновения."
          steps={[
            {
              icon: 'Plus',
              title: 'Шаг 1. Добавьте память',
              description: 'Нажмите «Добавить память». Загрузите до 10 фото, напишите короткую историю, поставьте дату и место — это превращает снимок в свидетельство эпохи.',
            },
            {
              icon: 'GitBranch',
              title: 'Шаг 2. Свяжите с Древом',
              description: 'Отметьте, кто на фото. Память автоматически появится в карточке каждого человека в Древе семьи — даже у тех, кого уже нет рядом.',
            },
            {
              icon: 'Milestone',
              title: 'Шаг 3. Привяжите к Дороге жизни',
              description: 'Выберите событие («Свадьба», «Рождение Маши», «Переезд») — память встанет на свою точку на Дороге жизни и обогатит общую хронику семьи.',
            },
            {
              icon: 'FolderHeart',
              title: 'Шаг 4. Соберите альбом',
              description: 'Группируйте карточки в тематические альбомы: «Лето на даче», «Школа», «90-е». Один клик — и на стене семьи появляется готовая глава вашей истории.',
            },
            {
              icon: 'Search',
              title: 'Шаг 5. Находите за секунды',
              description: 'Фильтры по человеку, событию, году и полнотекстовый поиск — найдёте нужный момент через 20 лет, даже если забыли точную дату.',
            },
            {
              icon: 'Sparkles',
              title: 'В чём уникальность?',
              description: 'Ни одна соцсеть не связывает фото с генеалогией и таймлайном жизни. Здесь память не теряется в ленте — она становится частью родового кода и наследуется детьми.',
            },
          ]}
          footer="Память хранится приватно и доступна только членам вашей семьи. Архив не удаляет карточку — он скрывает её из ленты, но связи с Древом и Дорогой жизни сохраняются навсегда."
        />
      </div>

      {showAlbumShelf && (
        <div className="mb-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/40 dark:from-violet-950/20 dark:via-gray-900 dark:to-fuchsia-950/20 dark:border-violet-900/40 p-4 sm:p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Icon name="FolderHeart" size={16} className="text-violet-600 dark:text-violet-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-violet-900 dark:text-violet-100">Альбомы</h2>
              <p className="text-[11px] text-violet-700/70 dark:text-violet-300/70">Тематические подборки воспоминаний</p>
            </div>
          </div>
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
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <Icon name="SlidersHorizontal" size={16} className="text-sky-600 dark:text-sky-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Поиск и фильтры</h2>
            <p className="text-[11px] text-muted-foreground">Найдите момент по человеку, событию или году</p>
          </div>
        </div>
        <MemoryFiltersBar
        q={filterQ ?? ''}
        memberId={filterMemberId}
        eventId={filterEventId}
        year={filterYear}
        sort={sortParam}
        years={yearsAvailable}
        members={memberOptions}
        events={eventOptions}
        hasAny={hasAnyOrAlbum || sortParam !== DEFAULT_SORT}
        onChangeQ={v => updateParam('q', v)}
        onChangeMember={v => updateParam('memberId', v != null ? String(v) : undefined)}
        onChangeEvent={v => updateParam('eventId', v)}
        onChangeYear={v => updateParam('year', v != null ? String(v) : undefined)}
        onChangeSort={v => updateParam('sort', v === DEFAULT_SORT ? undefined : v)}
        onResetAll={resetAllFilters}
        />
      </div>

      {filterAlbum && (
        <AlbumHeader
          album={filterAlbum}
          coverUrl={resolveAlbumCover(filterAlbum, entries)}
          canSelect={entries.length > 0}
          onClear={clearFilter}
          onEdit={() => {
            setEditingAlbum(filterAlbum);
            setAlbumDialogOpen(true);
          }}
          onArchive={handleArchiveAlbum}
          onBulkAdd={() => setBulkAddOpen(true)}
          onPickCover={() => setCoverDialogOpen(true)}
          onStartSelection={() => setSelectionMode(true)}
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

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
              <Icon name="Images" size={16} className="text-pink-600 dark:text-pink-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Воспоминания</h2>
              <p className="text-[11px] text-muted-foreground">
                {loading ? 'Загружаем…' : `Всего карточек: ${entries.length}`}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            filterKind={
              hasAnyFilter
                ? 'search'
                : filterMember
                  ? 'member'
                  : filterEvent
                    ? 'event'
                    : filterAlbum
                      ? 'album'
                      : null
            }
            filterLabel={filterMember?.name || filterEvent?.title || filterAlbum?.title}
            onAdd={() => setCreateOpen(true)}
            onBulkAdd={filterAlbum ? () => setBulkAddOpen(true) : undefined}
            onClearFilter={hasFilter || hasAnyFilter ? resetAllFilters : undefined}
          />
        ) : (
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 ${selectionMode ? 'pb-24' : ''}`}>
            {entries.map(entry => (
              <MemoryCard
                key={entry.id}
                entry={entry}
                selectable={selectionMode}
                selected={selectedIds.has(entry.id)}
                onClick={() => (selectionMode ? toggleSelect(entry.id) : setViewEntry(entry))}
              />
            ))}
          </div>
        )}
      </div>

      <MemoryEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialMemberId={filterMemberId}
        initialEventId={filterEventId}
        initialAlbumId={filterAlbumId}
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

      {selectionMode && filterAlbum && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="text-sm">
              <span className="font-medium">Выбрано: {selectedIds.size}</span>
              <span className="ml-2 hidden text-muted-foreground sm:inline">
                в альбоме «{filterAlbum.title}»
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={exitSelectionMode} disabled={bulkRemoving}>
                Снять выбор
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
                disabled={selectedIds.size === 0 || bulkRemoving}
              >
                {bulkRemoving ? (
                  <>
                    <Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />
                    Убираем...
                  </>
                ) : (
                  <>
                    <Icon name="FolderMinus" size={14} className="mr-1.5" />
                    Убрать из альбома{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
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
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 shadow-sm">
          <img
            src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a55c5cf6-8112-4305-accd-bb133edf0a83.jpg"
            alt="Семейный альбом"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 dark:from-gray-900/95 dark:via-gray-900/80 dark:to-gray-900/20" />
          <div className="relative flex flex-col items-start gap-3 p-5 sm:p-6 max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shadow-sm">
                <Icon name="BookHeart" size={18} className="text-amber-600 dark:text-amber-300" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Тематические альбомы
              </span>
            </div>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-50 leading-tight">
              Начните летопись своей семьи
            </h3>
            <p className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
              Соберите воспоминания в альбомы — «Предки», «Наша семья в 90-е», «Детство Матвея», «Свадьба бабушки и дедушки».
            </p>
            <Button onClick={onCreate} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
              <Icon name="Plus" size={16} className="mr-1.5" />
              Создать первый альбом
            </Button>
          </div>
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
  canSelect,
  onClear,
  onEdit,
  onArchive,
  onBulkAdd,
  onPickCover,
  onStartSelection,
}: {
  album: MemoryAlbum;
  coverUrl: string | null;
  canSelect: boolean;
  onClear: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onBulkAdd: () => void;
  onPickCover: () => void;
  onStartSelection: () => void;
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
        {canSelect && (
          <Button
            size="sm"
            variant="outline"
            onClick={onStartSelection}
            className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
          >
            <Icon name="CheckSquare" size={14} className="mr-1.5" />
            Выбрать
          </Button>
        )}
        <Badge variant="secondary" className="bg-white">
          <Icon name="Images" size={11} className="mr-1" />
          Новая память здесь автоматически попадёт в этот альбом
        </Badge>
      </div>
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
  filterKind: 'member' | 'event' | 'album' | 'search' | null;
  filterLabel?: string;
  onAdd: () => void;
  onBulkAdd?: () => void;
  onClearFilter?: () => void;
}) {
  let heading = 'Здесь будут жить семейные моменты';
  if (filterKind === 'search') heading = 'Ничего не найдено по текущим фильтрам';
  else if (filterKind === 'member' && filterLabel) heading = `Пока нет воспоминаний про ${filterLabel}`;
  else if (filterKind === 'event' && filterLabel) heading = `Пока нет воспоминаний об «${filterLabel}»`;
  else if (filterKind === 'album' && filterLabel) heading = `Альбом «${filterLabel}» пока пуст`;

  let description = 'Добавьте первую карточку памяти: 1–10 фото, кто на них, дата и короткая история. Раз в месяц или раз в полгода — пополняйте альбом вместе с семьёй.';
  if (filterKind === 'search') description = 'Попробуйте упростить запрос или сбросить часть фильтров.';
  else if (filterKind === 'album') description = 'Соберите его из уже созданных карточек или создайте новую — она автоматически попадёт сюда.';
  else if (filterKind) description = 'Создайте первую карточку памяти — фото, дата и короткая история. Контекст уже привязан.';

  const isSearch = filterKind === 'search';
  const eyebrow = isSearch ? 'Поиск не дал результатов' : 'Семейная память';
  const eyebrowColor = isSearch
    ? 'text-slate-700 dark:text-slate-300'
    : 'text-violet-700 dark:text-violet-300';
  const iconBg = isSearch
    ? 'bg-slate-100 dark:bg-slate-800'
    : 'bg-violet-100 dark:bg-violet-900/40';
  const iconColor = isSearch
    ? 'text-slate-600 dark:text-slate-300'
    : 'text-violet-600 dark:text-violet-300';
  const overlay = isSearch
    ? 'bg-gradient-to-r from-white/95 via-white/85 to-white/40 dark:from-gray-900/95 dark:via-gray-900/85 dark:to-gray-900/30'
    : 'bg-gradient-to-r from-white/95 via-white/80 to-white/30 dark:from-gray-900/95 dark:via-gray-900/80 dark:to-gray-900/20';
  const borderColor = isSearch ? 'border-slate-200' : 'border-violet-200';

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor} shadow-sm`}>
      <img
        src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ba58e6ab-2db3-41c5-b3a4-43bbec9c87c4.jpg"
        alt="Семейные воспоминания"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="relative flex flex-col items-start gap-3 p-5 sm:p-7 max-w-xl">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
            <Icon name={isSearch ? 'SearchX' : 'BookHeart'} size={18} className={iconColor} />
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${eyebrowColor}`}>
            {eyebrow}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold leading-tight text-gray-900 dark:text-gray-50">
          {heading}
        </h3>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {description}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {onBulkAdd && !isSearch && (
            <Button onClick={onBulkAdd} variant="outline" className="bg-white/90 hover:bg-white">
              <Icon name="FolderPlus" size={16} className="mr-1.5" />
              Добавить существующие
            </Button>
          )}
          {!isSearch && (
            <Button
              onClick={onAdd}
              className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
            >
              <Icon name="Plus" size={16} className="mr-1.5" />
              {filterKind ? 'Создать новую' : 'Добавить первую память'}
            </Button>
          )}
          {onClearFilter && (
            <Button
              onClick={onClearFilter}
              variant={isSearch ? 'default' : 'ghost'}
              className={isSearch ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-md' : ''}
            >
              <Icon name="X" size={14} className="mr-1.5" />
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}