import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTraditions, syncTraditions, type TraditionItem } from '@/lib/familyTraditions/api';

const LS_KEY = 'traditions';
const SYNC_DEBOUNCE_MS = 600;

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
      participants: Array.isArray(r.participants) ? r.participants.map(String) : [],
    }));
  } catch {
    return [];
  }
}

interface UseFamilyTraditionsResult {
  traditions: TraditionItem[];
  loading: boolean;
  isRemote: boolean;
  persistTraditions: (next: TraditionItem[]) => void;
}

export function useFamilyTraditions(defaultItems?: TraditionItem[]): UseFamilyTraditionsResult {
  const [traditions, setTraditions] = useState<TraditionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemote, setIsRemote] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTraditions()
      .then((remote) => {
        if (cancelled) return;
        if (remote.length > 0) {
          setTraditions(remote);
          setIsRemote(true);
          localStorage.removeItem(LS_KEY);
        } else {
          const local = readLocalStorage();
          const fallback = local.length > 0 ? local : (defaultItems ?? []);
          setTraditions(fallback);
          if (fallback.length > 0) {
            syncTraditions(fallback).catch(() => null);
            localStorage.removeItem(LS_KEY);
          }
          setIsRemote(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        const local = readLocalStorage();
        setTraditions(local.length > 0 ? local : (defaultItems ?? []));
        setIsRemote(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const persistTraditions = useCallback((next: TraditionItem[]) => {
    setTraditions(next);
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncTraditions(next).catch(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      });
    }, SYNC_DEBOUNCE_MS);
  }, []);

  return { traditions, loading, isRemote, persistTraditions };
}
