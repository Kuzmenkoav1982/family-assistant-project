import { useCallback, useEffect, useState } from 'react';
import { memoryApi } from './api';
import type { MemoryEntry, MemorySort, CreateMemoryEntryInput, UpdateMemoryEntryInput } from './types';

interface UseMemoryEntriesOptions {
  eventId?: string;
  memberId?: number;
  albumId?: string;
  q?: string;
  year?: number;
  sort?: MemorySort;
  enabled?: boolean;
}

export function useMemoryEntries(options: UseMemoryEntriesOptions = {}) {
  const { eventId, memberId, albumId, q, year, sort, enabled = true } = options;
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const list = await memoryApi.listEntries({
        event_id: eventId,
        member_id: memberId,
        album_id: albumId,
        q,
        year,
        sort,
      });
      setEntries(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить память');
    } finally {
      setLoading(false);
    }
  }, [enabled, eventId, memberId, albumId, q, year, sort]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (input: CreateMemoryEntryInput) => {
    const created = await memoryApi.createEntry(input);
    setEntries(prev => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, patch: UpdateMemoryEntryInput) => {
    const updated = await memoryApi.updateEntry(id, patch);
    setEntries(prev => prev.map(e => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const archive = useCallback(async (id: string) => {
    await memoryApi.archiveEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const replaceEntry = useCallback((entry: MemoryEntry) => {
    setEntries(prev => prev.map(e => (e.id === entry.id ? entry : e)));
  }, []);

  return { entries, loading, error, reload, create, update, archive, replaceEntry };
}
