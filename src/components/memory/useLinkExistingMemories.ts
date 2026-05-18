import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { memoryApi } from './api';
import type { LinkMode } from './LinkExistingMemoriesDialog';
import type { MemoryEntry } from './types';

interface UseLinkExistingMemoriesOptions {
  open: boolean;
  mode: LinkMode;
  targetId: number | string;
  targetLabel: string;
  alreadyLinkedEntryIds?: Set<string>;
  onCompleted?: (addedCount: number) => void;
  onClose: () => void;
}

export function useLinkExistingMemories({
  open,
  mode,
  targetId,
  targetLabel,
  alreadyLinkedEntryIds,
  onCompleted,
  onClose,
}: UseLinkExistingMemoriesOptions) {
  const [allEntries, setAllEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setSearch('');
    setLoading(true);
    memoryApi
      .listEntries()
      .then(list => setAllEntries(list))
      .catch(err => toast.error(err instanceof Error ? err.message : 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  }, [open]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEntries
      .filter(e => {
        if (mode === 'person') {
          if (alreadyLinkedEntryIds?.has(e.id)) return false;
          return true;
        }
        if (e.event_id && String(e.event_id) === String(targetId)) return false;
        return true;
      })
      .filter(e => {
        if (!q) return true;
        const hay = [e.title, e.caption, e.location_label, e.memory_period_label]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
  }, [allEntries, alreadyLinkedEntryIds, mode, targetId, search]);

  const allCandidateIds = useMemo(() => candidates.map(e => e.id), [candidates]);
  const allSelected = candidates.length > 0 && candidates.every(e => selected.has(e.id));

  const relinkCount = useMemo(() => {
    if (mode !== 'event') return 0;
    let n = 0;
    for (const id of selected) {
      const e = allEntries.find(x => x.id === id);
      if (e?.event_id && String(e.event_id) !== String(targetId)) n++;
    }
    return n;
  }, [mode, selected, allEntries, targetId]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allCandidateIds));
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    if (mode === 'event' && relinkCount > 0) {
      const ok = confirm(
        `Перенести ${relinkCount} ${relinkCount === 1 ? 'память' : 'памятей'} из других событий в «${targetLabel}»?`,
      );
      if (!ok) return;
    }
    setWorking(true);
    try {
      const ids = Array.from(selected);
      let results: PromiseSettledResult<unknown>[];
      if (mode === 'person') {
        results = await Promise.allSettled(
          ids.map(id => memoryApi.addPerson(id, Number(targetId))),
        );
      } else {
        results = await Promise.allSettled(
          ids.map(id => memoryApi.updateEntry(id, { event_id: String(targetId) })),
        );
      }
      const okCount = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - okCount;
      if (okCount > 0) {
        toast.success(
          failed === 0 ? `Привязано: ${okCount}` : `Привязано: ${okCount}, ошибок: ${failed}`,
        );
        onCompleted?.(okCount);
      }
      if (failed > 0 && okCount === 0) {
        toast.error('Не удалось привязать ни одной памяти');
      } else {
        onClose();
      }
    } finally {
      setWorking(false);
    }
  }

  return {
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
  };
}
