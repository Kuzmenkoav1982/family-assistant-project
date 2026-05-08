import { useEffect, useState } from 'react';
import func2url from '../../backend/func2url.json';

const ADMIN_API = (func2url as Record<string, string>)['admin-users'];

interface FlagsCache {
  flags: Record<string, boolean>;
  fetchedAt: number;
}

let cache: FlagsCache | null = null;
let inflight: Promise<Record<string, boolean>> | null = null;
const TTL_MS = 60_000;

async function fetchFlags(): Promise<Record<string, boolean>> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
    return cache.flags;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${ADMIN_API}?resource=public_flags`);
      if (!res.ok) throw new Error('flags fetch failed');
      const data = await res.json();
      const map: Record<string, boolean> = {};
      (data?.flags || []).forEach((f: { key: string; enabled: boolean }) => {
        map[f.key] = !!f.enabled;
      });
      cache = { flags: map, fetchedAt: Date.now() };
      return map;
    } catch {
      return cache?.flags || {};
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useFeatureFlag(key: string, fallback = true): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (cache && key in cache.flags) return cache.flags[key];
    return fallback;
  });

  useEffect(() => {
    let cancelled = false;
    fetchFlags().then((map) => {
      if (cancelled) return;
      if (key in map) setEnabled(map[key]);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return enabled;
}

export function useFeatureFlags(): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => cache?.flags || {});
  useEffect(() => {
    let cancelled = false;
    fetchFlags().then((map) => {
      if (!cancelled) setFlags(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return flags;
}
