import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  fetchTraditions,
  syncTraditions,
  type TraditionItem,
} from '@/lib/familyTraditions/api';

// ─── constants ───────────────────────────────────────────────────────────────

const LS_KEY = 'traditions';
const SYNC_DEBOUNCE_MS = 600;

// ─── localStorage migration helper ───────────────────────────────────────────

function readLocalStorage(): TraditionItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((r) => ({
      id: String(r.id ?? Date.now()),
      name: String(r.name ?? r.title ?? ''),
      description: String(r.description ?? ''),
      icon: String(r.icon ?? '✨'),
      frequency: String(r.frequency ?? 'monthly'),
      nextDate: String(r.nextDate ?? r.next_date ?? ''),
      participants: Array.isArray(r.participants)
        ? r.participants.map(String)
        : [],
    }));
  } catch {
    return [];
  }
}

// ─── context shape ────────────────────────────────────────────────────────────

export interface FamilyTraditionsContextValue {
  traditions: TraditionItem[];
  loading: boolean;
  error: string | null;
  isRemote: boolean;
  persistTraditions: (next: TraditionItem[]) => void;
  saveNow: () => Promise<void>;
}

export const FamilyTraditionsContext =
  createContext<FamilyTraditionsContextValue | null>(null);

// ─── provider ─────────────────────────────────────────────────────────────────

interface FamilyTraditionsProviderProps {
  children: React.ReactNode;
  /** Начальный набор традиций (используется только если сервер и LS пусты) */
  defaultItems?: TraditionItem[];
}

export function FamilyTraditionsProvider({
  children,
  defaultItems,
}: FamilyTraditionsProviderProps) {
  const [traditions, setTraditions] = useState<TraditionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemote, setIsRemote] = useState(false);

  // debounce timer
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // последний актуальный снимок для saveNow()
  const latestRef = useRef<TraditionItem[]>([]);

  // обновляем ref синхронно вместе со state
  const applyTraditions = useCallback((next: TraditionItem[]) => {
    latestRef.current = next;
    setTraditions(next);
  }, []);

  // ─── начальная загрузка ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchTraditions()
      .then((remote) => {
        if (cancelled) return;
        if (remote.length > 0) {
          applyTraditions(remote);
          setIsRemote(true);
          localStorage.removeItem(LS_KEY);
        } else {
          const local = readLocalStorage();
          const fallback = local.length > 0 ? local : (defaultItems ?? []);
          applyTraditions(fallback);
          setIsRemote(false);
          if (fallback.length > 0) {
            // миграция из LS → сервер (fire-and-forget)
            syncTraditions(fallback).catch(() => null);
            localStorage.removeItem(LS_KEY);
          }
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const local = readLocalStorage();
        applyTraditions(local.length > 0 ? local : (defaultItems ?? []));
        setIsRemote(false);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки традиций');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — запускаем единожды при монтировании провайдера

  // ─── debounce-sync при каждом изменении ───────────────────────────────────
  const persistTraditions = useCallback(
    (next: TraditionItem[]) => {
      applyTraditions(next);

      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        syncTraditions(next).catch(() => {
          localStorage.setItem(LS_KEY, JSON.stringify(next));
        });
      }, SYNC_DEBOUNCE_MS);
    },
    [applyTraditions],
  );

  // ─── немедленное сохранение (например, перед unmount) ─────────────────────
  const saveNow = useCallback(async () => {
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }
    await syncTraditions(latestRef.current).catch(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(latestRef.current));
    });
  }, []);

  const value: FamilyTraditionsContextValue = {
    traditions,
    loading,
    error,
    isRemote,
    persistTraditions,
    saveNow,
  };

  return (
    <FamilyTraditionsContext.Provider value={value}>
      {children}
    </FamilyTraditionsContext.Provider>
  );
}
