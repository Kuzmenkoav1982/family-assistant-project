import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import { useMemoryAlbums } from './useMemoryAlbums';
import { memoryApi } from './api';
import { MAX_PHOTOS_PER_MEMORY, type MemoryEntry } from './types';

export interface MemoryEntryFormOptions {
  open: boolean;
  initialEntry?: MemoryEntry | null;
  initialMemberId?: number;
  initialEventId?: string;
  initialAlbumId?: string;
  suggestedTitle?: string;
  suggestedDate?: string;
  suggestedLocation?: string;
  onSaved: (entry: MemoryEntry) => void;
  onClose: () => void;
}

export function useMemoryEntryForm({
  open,
  initialEntry,
  initialMemberId,
  initialEventId,
  initialAlbumId,
  suggestedTitle,
  suggestedDate,
  suggestedLocation,
  onSaved,
  onClose,
}: MemoryEntryFormOptions) {
  const isEdit = Boolean(initialEntry);
  const { upload, uploading, progress } = useFileUpload();
  const { members } = useFamilyTree();
  const { events } = useLifeEvents();
  const { albums } = useMemoryAlbums();

  const [entry, setEntry] = useState<MemoryEntry | null>(initialEntry ?? null);
  const [title, setTitle] = useState(initialEntry?.title ?? '');
  const [caption, setCaption] = useState(initialEntry?.caption ?? '');
  const [story, setStory] = useState(initialEntry?.story ?? '');
  const [memoryDate, setMemoryDate] = useState(initialEntry?.memory_date ?? '');
  const [periodLabel, setPeriodLabel] = useState(initialEntry?.memory_period_label ?? '');
  const [location, setLocation] = useState(initialEntry?.location_label ?? '');
  const [memberIds, setMemberIds] = useState<number[]>(
    initialEntry?.member_ids ?? (initialMemberId ? [initialMemberId] : []),
  );
  const [eventId, setEventId] = useState<string | null>(
    initialEntry?.event_id ?? initialEventId ?? null,
  );
  const [albumIds, setAlbumIds] = useState<string[]>(
    initialEntry?.album_ids ?? (initialAlbumId ? [initialAlbumId] : []),
  );
  const [saving, setSaving] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const legitimateCloseRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setEntry(initialEntry ?? null);
    if (initialEntry) {
      setTitle(initialEntry.title ?? '');
      setCaption(initialEntry.caption ?? '');
      setStory(initialEntry.story ?? '');
      setMemoryDate(initialEntry.memory_date ?? '');
      setPeriodLabel(initialEntry.memory_period_label ?? '');
      setLocation(initialEntry.location_label ?? '');
      setMemberIds(initialEntry.member_ids ?? []);
      setEventId(initialEntry.event_id ?? null);
      setAlbumIds(initialEntry.album_ids ?? []);
    } else {
      setTitle(suggestedTitle ?? '');
      setCaption('');
      setStory('');
      setMemoryDate(suggestedDate ?? '');
      setPeriodLabel('');
      setLocation(suggestedLocation ?? '');
      setMemberIds(initialMemberId ? [initialMemberId] : []);
      setEventId(initialEventId ?? null);
      setAlbumIds(initialAlbumId ? [initialAlbumId] : []);
    }
    setMemberSearch('');
   
  }, [open, initialEntry, initialMemberId, initialEventId, initialAlbumId, suggestedTitle, suggestedDate, suggestedLocation]);

  const assets = useMemo(
    () => (entry ? [...entry.assets].sort((a, b) => a.sort_order - b.sort_order) : []),
    [entry],
  );

  const photosLeft = MAX_PHOTOS_PER_MEMORY - assets.length;

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name.toLowerCase().includes(q));
  }, [members, memberSearch]);

  async function ensureDraft(): Promise<MemoryEntry> {
    if (entry) return entry;
    if (!title.trim()) throw new Error('Сначала укажите название памяти');
    const created = await memoryApi.createEntry({
      title: title.trim(),
      caption: caption || null,
      story: story || null,
      memory_date: memoryDate || null,
      memory_period_label: periodLabel || null,
      location_label: location || null,
      event_id: eventId,
      member_ids: memberIds,
      status: 'draft',
    });
    setEntry(created);
    return created;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!title.trim()) { toast.error('Сначала укажите название памяти'); return; }
    const arr = Array.from(files);
    if (arr.length > photosLeft) {
      toast.error(`Можно добавить ещё ${photosLeft} фото (лимит ${MAX_PHOTOS_PER_MEMORY})`);
      return;
    }
    try {
      const draft = await ensureDraft();
      let current = draft;
      for (const file of arr) {
        const url = await upload(file, `memory/${draft.id}`);
        const result = await memoryApi.addAsset(draft.id, { file_url: url, mime_type: file.type || undefined });
        current = result.entry;
        setEntry(current);
      }
      toast.success(`Загружено фото: ${arr.length}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось загрузить фото');
    }
  }

  async function handleRemoveAsset(assetId: string) {
    try {
      const result = await memoryApi.removeAsset(assetId);
      setEntry(result.entry);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить фото');
    }
  }

  async function handleSetCover(assetId: string) {
    if (!entry) return;
    try {
      const updated = await memoryApi.updateEntry(entry.id, { cover_asset_id: assetId });
      setEntry(updated);
      toast.success('Обложка обновлена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось обновить обложку');
    }
  }

  function toggleMember(id: number) {
    setMemberIds(prev => (prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Укажите название памяти'); return; }
    setSaving(true);
    let partial = false;
    try {
      const basePayload = {
        title: title.trim(),
        caption: caption || null,
        story: story || null,
        memory_date: memoryDate || null,
        memory_period_label: periodLabel || null,
        location_label: location || null,
        event_id: eventId,
        member_ids: memberIds,
      };
      let workingEntry: MemoryEntry;
      if (entry) {
        workingEntry = await memoryApi.updateEntry(entry.id, basePayload);
      } else {
        workingEntry = await memoryApi.createEntry({ ...basePayload, status: 'draft' });
      }

      try {
        await memoryApi.setEntryAlbums(workingEntry.id, albumIds);
      } catch (err) {
        partial = true;
        toast.error('Не удалось обновить альбомы: ' + (err instanceof Error ? err.message : 'неизвестная ошибка'));
      }

      let saved = workingEntry;
      if (!partial && workingEntry.status === 'draft') {
        saved = await memoryApi.publishEntry(workingEntry.id);
      } else if (partial && workingEntry.status === 'draft') {
        toast('Сохранено как черновик — исправьте альбомы и попробуйте снова');
      }

      onSaved(saved);

      if (!partial) {
        toast.success(isEdit ? 'Память обновлена' : 'Память сохранена');
        legitimateCloseRef.current = true;
        onClose();
      } else {
        setEntry(saved);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  async function handleClose() {
    if (!legitimateCloseRef.current && entry?.status === 'draft') {
      try { await memoryApi.discardDraft(entry.id); } catch { /* тихо */ }
    }
    legitimateCloseRef.current = false;
    onClose();
  }

  return {
    isEdit,
    entry,
    title, setTitle,
    caption, setCaption,
    story, setStory,
    memoryDate, setMemoryDate,
    periodLabel, setPeriodLabel,
    location, setLocation,
    memberIds,
    eventId, setEventId,
    albumIds, setAlbumIds,
    saving,
    uploading,
    progress,
    memberSearch, setMemberSearch,
    assets,
    photosLeft,
    filteredMembers,
    members,
    events,
    albums,
    handleFiles,
    handleRemoveAsset,
    handleSetCover,
    toggleMember,
    handleSave,
    handleClose,
  };
}