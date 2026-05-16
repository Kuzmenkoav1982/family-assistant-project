import { useCallback, useEffect, useState } from 'react';
import { memoryApi } from './api';
import type { MemoryAlbum } from './types';

export function useMemoryAlbums(enabled = true) {
  const [albums, setAlbums] = useState<MemoryAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const list = await memoryApi.listAlbums();
      setAlbums(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить альбомы');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (input: { title: string; description?: string | null }) => {
      const created = await memoryApi.createAlbum(input);
      setAlbums(prev => [created, ...prev]);
      return created;
    },
    [],
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<{ title: string; description: string | null; cover_asset_id: string | null }>,
    ) => {
      const updated = await memoryApi.updateAlbum(id, patch);
      setAlbums(prev => prev.map(a => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const archive = useCallback(async (id: string) => {
    await memoryApi.archiveAlbum(id);
    setAlbums(prev => prev.filter(a => a.id !== id));
  }, []);

  return { albums, loading, error, reload, create, update, archive };
}
