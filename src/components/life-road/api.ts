import func2url from '@/config/func2url';
import type { BalanceSnapshot, LifeEvent, LifeGoal } from './types';

const API_URL = (func2url as Record<string, string>)['life-road'];

function getUserId(): string {
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

  throw new Error('Не найден ID пользователя. Войдите в аккаунт заново.');
}

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: Record<string, unknown>;
  constructor(status: number, message: string, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.code = typeof payload?.error === 'string' ? payload.error : undefined;
  }
}

async function call<T>(method: string, query: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${query}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-Id': getUserId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let payload: Record<string, unknown> | undefined;
    const text = await res.text().catch(() => '');
    try { payload = text ? JSON.parse(text) : undefined; } catch { /* not json */ }
    const message = (payload?.message as string) || (payload?.error as string) || text || `HTTP ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }
  return res.json() as Promise<T>;
}

export const lifeApi = {
  // Goals
  listGoals: () => call<LifeGoal[]>('GET', '?resource=goals'),
  createGoal: (g: Partial<LifeGoal>) => call<LifeGoal>('POST', '?resource=goals', g),
  updateGoal: (id: string, g: Partial<LifeGoal>) => call<LifeGoal>('PUT', `?resource=goals&id=${id}`, g),
  deleteGoal: (id: string) => call<{ success: boolean }>('DELETE', `?resource=goals&id=${id}`),

  // Balance
  listBalance: () => call<BalanceSnapshot[]>('GET', '?resource=balance'),
  saveBalance: (scores: Record<string, number>, notes?: string) =>
    call<BalanceSnapshot>('POST', '?resource=balance', { scores, notes }),

  // Coach
  coach: (payload: {
    mode: 'general' | 'goal-suggest' | 'reflect-past' | 'plan-future' | 'ikigai';
    question?: string;
    framework?: string;
    goalTitle?: string;
    goalDescription?: string;
  }) => call<{ response: string; mode: string }>('POST', '?resource=coach', payload),
};

// Re-export events helpers for symmetry
export const lifeEventsApi = {
  list: () => call<LifeEvent[]>('GET', '?resource=events'),
};