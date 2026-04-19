import func2url from '../../../backend/func2url.json';
import type { BalanceSnapshot, LifeEvent, LifeGoal } from './types';

const API_URL = (func2url as Record<string, string>)['life-road'];

function getUserId(): string {
  const id = localStorage.getItem('familyMemberId') || localStorage.getItem('userId') || '';
  if (!id) throw new Error('Не найден ID пользователя');
  return id;
}

async function call<T>(method: string, query: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${query}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-Id': getUserId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method}: ${res.status} ${text}`);
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
