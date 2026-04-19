import { useCallback, useEffect, useState } from 'react';
import func2url from '../../../backend/func2url.json';
import type { LifeEvent } from './types';

const API_URL = (func2url as Record<string, string>)['life-road'];

function getUserId(): string | null {
  const direct = localStorage.getItem('familyMemberId') || localStorage.getItem('userId');
  if (direct) return direct;
  const raw = localStorage.getItem('userData') || localStorage.getItem('user');
  if (raw) {
    try {
      const u = JSON.parse(raw);
      const id = u?.member_id || u?.memberId || u?.id;
      if (id) return String(id);
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function call(method: string, path = '', body?: unknown): Promise<unknown> {
  const userId = getUserId();
  if (!userId) throw new Error('Не найден ID пользователя');
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
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