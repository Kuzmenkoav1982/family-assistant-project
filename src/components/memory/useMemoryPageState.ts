import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import { useMemoryEntries } from './useMemoryEntries';
import { useMemoryAlbums } from './useMemoryAlbums';
import { memoryApi } from './api';
import type { MemoryAlbum, MemoryEntry, MemorySort } from './types';

const DEFAULT_SORT: MemorySort = 'memory_date_desc';

export function useMemoryPageState() {
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
  const { albums, loading: albumsLoading, reload: reloadAlbums, archive: archiveAlbum } = useMemoryAlbums();
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
    if (filterAlbum) document.title = `Альбом — ${filterAlbum.title}`;
    else if (filterMember) document.title = `Память — ${filterMember.name}`;
    else if (filterEvent) document.title = `Память — ${filterEvent.title}`;
    else document.title = 'Альбом поколений — Наша Семья';
    return () => { document.title = prev; };
  }, [filterMember, filterEvent, filterAlbum]);

  useEffect(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [filterAlbumId, filterMemberId, filterEventId]);

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

  const eventOptions = useMemo(() => events.map(e => ({ id: e.id, title: e.title, date: e.date })), [events]);
  const memberOptions = useMemo(() => members.map(m => ({ id: m.id, name: m.name, avatar: m.avatar })), [members]);

  const hasAnyFilter = Boolean(filterQ || filterMemberId || filterEventId || filterYear);
  const hasAnyOrAlbum = hasAnyFilter || Boolean(filterAlbumId);
  const hasFilter = Boolean(filterMember || filterEvent || filterAlbum);
  const showAlbumShelf = !hasFilter && !hasAnyFilter;

  // URL helpers
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
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const openAlbum = (album: MemoryAlbum) => {
    const next = new URLSearchParams(searchParams);
    next.set('albumId', album.id);
    next.delete('memberId');
    next.delete('eventId');
    setSearchParams(next);
  };

  // Selection
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

  // Handlers
  const handleSaved = async (_entry: MemoryEntry) => {
    if (editEntry) {
      replaceEntry(_entry);
      setEditEntry(null);
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

  const handleBulkRemove = async () => {
    if (!filterAlbum || selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Убрать ${count} ${count === 1 ? 'карточку' : count < 5 ? 'карточки' : 'карточек'} из альбома?\n\nКарточки останутся в общем архиве памяти и в других альбомах.`)) return;
    setBulkRemoving(true);
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(
        ids.map(id => memoryApi.removeFromAlbum(filterAlbum.id, id)),
      );
      const ok = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - ok;

      if (filterAlbum.cover_asset_id && ok > 0) {
        const removedEntries = entries.filter(e => ids.includes(e.id));
        const coverInRemoved = removedEntries.some(e =>
          e.assets.some(a => a.id === filterAlbum.cover_asset_id),
        );
        if (coverInRemoved) {
          try { await memoryApi.updateAlbum(filterAlbum.id, { cover_asset_id: null }); } catch { /* не критично */ }
        }
      }

      if (ok > 0) toast.success(failed === 0 ? `Убрано из альбома: ${ok}` : `Убрано: ${ok}, ошибок: ${failed}`);
      if (failed > 0 && ok === 0) toast.error('Не удалось убрать ни одной карточки');
      reload();
      reloadAlbums();
      exitSelectionMode();
    } finally {
      setBulkRemoving(false);
    }
  };

  return {
    // filters
    filterMemberId, filterEventId, filterAlbumId, filterQ, filterYear, sortParam,
    filterMember, filterEvent, filterAlbum,
    hasAnyFilter, hasAnyOrAlbum, hasFilter, showAlbumShelf,
    DEFAULT_SORT,
    // data
    entries, loading, error, reload,
    albums, albumsLoading, reloadAlbums,
    yearsAvailable, eventOptions, memberOptions,
    // dialogs
    createOpen, setCreateOpen,
    editEntry, setEditEntry,
    viewEntry, setViewEntry,
    albumDialogOpen, setAlbumDialogOpen,
    editingAlbum, setEditingAlbum,
    bulkAddOpen, setBulkAddOpen,
    coverDialogOpen, setCoverDialogOpen,
    // selection
    selectionMode, setSelectionMode,
    selectedIds, toggleSelect, exitSelectionMode,
    bulkRemoving,
    // actions
    openAlbum, clearFilter, updateParam, resetAllFilters,
    handleSaved, handleArchive, handleRemoveFromAlbum,
    handleArchiveAlbum, handleBulkRemove,
  };
}
