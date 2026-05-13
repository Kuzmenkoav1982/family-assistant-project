import func2url from '../../../backend/func2url.json';
import { readActorMemberId } from '@/lib/identity';
import type {
  BalanceSnapshot,
  GoalActionLink,
  GoalCheckin,
  GoalKeyResult,
  GoalMilestone,
  GoalPortfolioLink,
  LifeEvent,
  LifeGoal,
  PortfolioItemType,
  PortfolioPickerItem,
} from './types';

const API_URL = (func2url as Record<string, string>)['life-road'];

/**
 * KE-life-road (см. docs/stage-4-id-contracts.md):
 *   backend/life-road/index.py трактует X-User-Id как family_members.id
 *   (делает SELECT family_id FROM family_members WHERE id = X-User-Id).
 *   Поэтому actor для life-road = readActorMemberId(), а не readActorUserId().
 *
 * Stage 4.3: убран старый getUserId() с прямым чтением
 *   localStorage.familyMemberId / localStorage.userId / member_id || id —
 *   неоднозначный fallback мог подменять member_id на users.id и наоборот.
 *   Теперь единственная точка истины — src/lib/identity.ts.
 */
function getActorMemberId(): string {
  const id = readActorMemberId();
  if (!id) {
    throw new Error('Не найден member_id. Войдите в аккаунт заново.');
  }
  return id;
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
    headers: { 'Content-Type': 'application/json', 'X-User-Id': getActorMemberId() },
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

  // Milestones (вехи цели — для SMART и др.)
  listMilestones: (goalId: string) =>
    call<GoalMilestone[]>('GET', `?resource=milestones&goalId=${goalId}`),
  createMilestone: (m: Partial<GoalMilestone> & { goalId: string }) =>
    call<GoalMilestone>('POST', '?resource=milestones', m),
  updateMilestone: (id: string, m: Partial<GoalMilestone>) =>
    call<GoalMilestone>('PUT', `?resource=milestones&id=${id}`, m),
  deleteMilestone: (id: string) =>
    call<{ success: boolean }>('DELETE', `?resource=milestones&id=${id}`),

  // Key Results (для OKR)
  listKeyResults: (goalId: string) =>
    call<GoalKeyResult[]>('GET', `?resource=keyresults&goalId=${goalId}`),
  createKeyResult: (k: Partial<GoalKeyResult> & { goalId: string }) =>
    call<GoalKeyResult>('POST', '?resource=keyresults', k),
  updateKeyResult: (id: string, k: Partial<GoalKeyResult>) =>
    call<GoalKeyResult>('PUT', `?resource=keyresults&id=${id}`, k),
  deleteKeyResult: (id: string) =>
    call<{ success: boolean }>('DELETE', `?resource=keyresults&id=${id}`),

  // Check-ins (еженедельные сверки)
  listCheckins: (goalId: string) =>
    call<GoalCheckin[]>('GET', `?resource=checkins&goalId=${goalId}`),
  createCheckin: (c: Partial<GoalCheckin> & { goalId: string }) =>
    call<GoalCheckin>('POST', '?resource=checkins', c),

  // Action links (связь цели с задачами/привычками/событиями)
  listLinks: (goalId: string) =>
    call<GoalActionLink[]>('GET', `?resource=links&goalId=${goalId}`),
  /** Этап 3.2.1: обратный поиск origin-links по сущности (для Planning UI). */
  listLinksByEntity: (entityType: string, entityId: string) =>
    call<GoalActionLink[]>(
      'GET',
      `?resource=links&entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
    ),
  createLink: (l: Partial<GoalActionLink> & { goalId: string; entityType: string; entityId: string }) =>
    call<GoalActionLink>('POST', '?resource=links', l),
  deleteLink: (id: string) =>
    call<{ success: boolean }>('DELETE', `?resource=links&id=${id}`),

  // Portfolio links (Этап 3.3.1)
  listPortfolioLinks: (goalId: string) =>
    call<GoalPortfolioLink[]>('GET', `?resource=portfolio-links&goalId=${goalId}`),
  /** Этап 3.3.2: обратный поиск связей по item (для Portfolio UI). */
  listPortfolioLinksByItem: (itemType: PortfolioItemType, itemId: string) =>
    call<GoalPortfolioLink[]>(
      'GET',
      `?resource=portfolio-links&itemType=${encodeURIComponent(itemType)}&itemId=${encodeURIComponent(itemId)}`,
    ),
  attachPortfolioItem: (input: { goalId: string; itemType: PortfolioItemType; itemId: string; meta?: Record<string, unknown> }) =>
    call<GoalPortfolioLink>('POST', '?resource=portfolio-links', input),
  detachPortfolioItem: (linkId: string) =>
    call<{ success: boolean }>('DELETE', `?resource=portfolio-links&id=${linkId}`),
  portfolioPicker: (params: { itemType?: PortfolioItemType; q?: string; excludeGoalId?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    qs.set('itemType', params.itemType || 'achievement');
    if (params.q) qs.set('q', params.q);
    if (params.excludeGoalId) qs.set('excludeGoalId', params.excludeGoalId);
    qs.set('limit', String(params.limit ?? 50));
    return call<PortfolioPickerItem[]>('GET', `?resource=portfolio-picker&${qs.toString()}`);
  },

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