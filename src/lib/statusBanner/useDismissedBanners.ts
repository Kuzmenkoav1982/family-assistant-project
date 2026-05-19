// useDismissedBanners — управление списком локально закрытых баннеров.
//
// Контракт (B3-update):
//   - хранится в localStorage под ключом 'dismissedBanners' (JSON: Entry[])
//   - формат записи: { id: string, expiresAt: number | null, dismissedAt: number }
//     expiresAt — Unix ms. null = «без явного TTL» (применится DEFAULT_TTL_MS
//     от dismissedAt).
//   - истёкшие записи автоматически очищаются:
//       * при mount (через useEffect → reread)
//       * на window 'storage' event (из других вкладок)
//       * на window 'focus' (вернулся в таб → пересчёт)
//   - старый формат (массив строк) распознаётся как expiresAt=null,
//     dismissedAt=now → ремигрируется при следующем dismiss/cleanup.
//   - storage недоступен (private mode / quota) → graceful fallback в память.
//
// Зачем TTL: если админ удалил баннер или поменял его id, старая запись в
// localStorage не должна мусорить ключ годами. Cleanup делает поведение
// предсказуемым: новый баннер с тем же смыслом, но другим id, не будет
// заблокирован старой записью.

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dismissedBanners';

/** 90 дней — fallback TTL для записей без явного expiresAt. */
const DEFAULT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

interface Entry {
  id: string;
  /** Unix ms. null → применяется DEFAULT_TTL_MS от dismissedAt. */
  expiresAt: number | null;
  /** Когда запись была создана (Unix ms). */
  dismissedAt: number;
}

function isLiveEntry(e: Entry, now: number): boolean {
  if (typeof e.expiresAt === 'number' && Number.isFinite(e.expiresAt)) {
    return e.expiresAt > now;
  }
  return e.dismissedAt + DEFAULT_TTL_MS > now;
}

function readStored(now: number): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const out: Entry[] = [];
    for (const item of parsed) {
      // Legacy формат — просто id-строка
      if (typeof item === 'string' && item.length > 0) {
        out.push({ id: item, expiresAt: null, dismissedAt: now });
        continue;
      }
      if (!item || typeof item !== 'object') continue;
      const r = item as Record<string, unknown>;
      if (typeof r.id !== 'string' || r.id.length === 0) continue;
      const expiresAt =
        typeof r.expiresAt === 'number' && Number.isFinite(r.expiresAt)
          ? r.expiresAt
          : null;
      const dismissedAt =
        typeof r.dismissedAt === 'number' && Number.isFinite(r.dismissedAt)
          ? r.dismissedAt
          : now;
      const entry: Entry = { id: r.id, expiresAt, dismissedAt };
      if (isLiveEntry(entry, now)) out.push(entry);
    }
    return out;
  } catch {
    return [];
  }
}

function writeStored(entries: ReadonlyArray<Entry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries]));
  } catch {
    // storage unavailable — состояние всё равно живёт в памяти (useState)
  }
}

export interface UseDismissedBanners {
  /** Массив активных (не истёкших) id для передачи в resolver.dismissedIds. */
  dismissed: string[];
  /**
   * Закрыть баннер.
   * @param id           bannerId
   * @param endsAtIso    Опционально — ISO endsAt баннера. Если задано и > now —
   *                     запись истечёт ровно тогда. Иначе DEFAULT_TTL_MS.
   */
  dismiss: (id: string, endsAtIso?: string | null) => void;
  undismiss: (id: string) => void;
  clear: () => void;
}

export function useDismissedBanners(): UseDismissedBanners {
  const [entries, setEntries] = useState<Entry[]>(() => readStored(Date.now()));

  useEffect(() => {
    const reread = () => setEntries(readStored(Date.now()));
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      reread();
    };
    // На mount — перечитываем (вдруг с прошлого рендера что-то истекло).
    reread();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', reread);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', reread);
    };
  }, []);

  // Sync state → storage (на случай cleanup истёкших без явного dismiss/undismiss).
  useEffect(() => {
    writeStored(entries);
  }, [entries]);

  const dismiss = useCallback((id: string, endsAtIso?: string | null) => {
    const now = Date.now();
    let expiresAt: number | null = null;
    if (endsAtIso) {
      const parsed = Date.parse(endsAtIso);
      if (Number.isFinite(parsed) && parsed > now) {
        expiresAt = parsed;
      }
    }
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      const next: Entry[] = [...filtered, { id, expiresAt, dismissedAt: now }];
      writeStored(next);
      return next;
    });
  }, []);

  const undismiss = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeStored(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    writeStored([]);
  }, []);

  return {
    dismissed: entries.map((e) => e.id),
    dismiss,
    undismiss,
    clear,
  };
}

// ---------- exports for tests ----------

export const __test__ = {
  STORAGE_KEY,
  DEFAULT_TTL_MS,
  readStored,
  writeStored,
  isLiveEntry,
};
