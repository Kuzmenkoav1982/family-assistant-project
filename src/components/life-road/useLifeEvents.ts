import { useCallback, useEffect, useState } from 'react';
import func2url from '../../../backend/func2url.json';
import { readActorMemberId } from '@/lib/identity';
import type { LifeEvent } from './types';

const API_URL = (func2url as Record<string, string>)['life-road'];

/**
 * KE-life-road: X-User-Id = family_members.id (см. docs/stage-4-id-contracts.md).
 * Stage 4.3: ушли с прямого чтения localStorage на identity adapter.
 */
async function call(method: string, path = '', body?: unknown): Promise<unknown> {
  const actorMemberId = readActorMemberId();
  if (!actorMemberId) throw new Error('Не найден member_id. Войдите в аккаунт заново.');
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': actorMemberId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

export function useLifeEvents() {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await call('GET', '?resource=events')) as LifeEvent[];
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(async (payload: Partial<LifeEvent>) => {
    const created = (await call('POST', '?resource=events', payload)) as LifeEvent;
    setEvents((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
    return created;
  }, []);

  const update = useCallback(async (id: string, payload: Partial<LifeEvent>) => {
    const updated = (await call('PUT', `?resource=events&id=${id}`, payload)) as LifeEvent;
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)).sort((a, b) => a.date.localeCompare(b.date)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await call('DELETE', `?resource=events&id=${id}`);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { events, loading, error, reload, create, update, remove };
}