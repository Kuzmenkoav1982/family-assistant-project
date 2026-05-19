// useDismissedBanners — управление списком локально закрытых баннеров.
//
// Контракт:
//   - хранится в localStorage под ключом 'dismissedBanners' (JSON: string[])
//   - TTL не реализован в B2 (закрытый баннер останется dismissed до тех пор,
//     пока запись существует в БД ИЛИ пока пользователь не очистит storage)
//   - в дальнейшем (B3+) backend сможет помечать баннер unpublished_at, и
//     resolver его отфильтрует на этапе 'expired'
//   - storage недоступен (private mode / quota) → graceful fallback в память
//
// Использование:
//   const { dismissed, dismiss, undismiss } = useDismissedBanners();
//   dismiss(bannerId);  // → переcчёт + persist

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dismissedBanners';

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function writeStored(ids: ReadonlyArray<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // storage unavailable — состояние всё равно живёт в памяти (useState)
  }
}

export interface UseDismissedBanners {
  dismissed: string[];
  dismiss: (id: string) => void;
  undismiss: (id: string) => void;
  clear: () => void;
}

export function useDismissedBanners(): UseDismissedBanners {
  const [dismissed, setDismissed] = useState<string[]>(() => readStored());

  // Sync между вкладками
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setDismissed(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStored(next);
      return next;
    });
  }, []);

  const undismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter((x) => x !== id);
      writeStored(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setDismissed([]);
    writeStored([]);
  }, []);

  return { dismissed, dismiss, undismiss, clear };
}
