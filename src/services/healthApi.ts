/**
 * Stage 4 — Health API thin wrapper.
 *
 * KNOWN EXCEPTION (KE-health, подтверждено в БД на 8 строках health_profiles):
 *   health_profiles.user_id физически хранит family_members.id, не users.id.
 *   Backend (backend/health-profiles/index.py:80–85) делает
 *     WHERE user_id = %s OR %s = ANY(shared_with)
 *   против X-User-Id. То есть actor identity для health = family_members.id.
 *
 * Поэтому весь health surface шлёт X-User-Id = readActorMemberId(), а НЕ readActorUserId().
 *
 * Жёсткие правила (закрывают P0-аномалии A1, A2, A5, A6 из docs/stage-4-id-contracts.md):
 *   - X-User-Id берётся ТОЛЬКО через identity adapter (readActorMemberId).
 *   - Если member id нет — header не отправляется, caller получит честный 401.
 *   - Никаких fallback на '1' или на selectedProfile.id.
 *   - profileId передаётся как resource id в query/body, а не в header.
 *   - Все health-вызовы (GET/POST/PUT/DELETE) идут через эти helpers.
 */

import func2url from '../../backend/func2url.json';
import { readActorMemberId, readAuthToken } from '@/lib/identity';

const API_URLS = {
  profiles: func2url['health-profiles'],
  records: func2url['health-records'],
  vaccinations: func2url['health-vaccinations'],
  medications: func2url['health-medications'],
  vitals: func2url['health-vitals'],
  doctors: func2url['health-doctors'],
  insurance: func2url['health-insurance'],
  telemedicine: func2url['health-telemedicine'],
} as const;

export type HealthResource = keyof typeof API_URLS;

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const memberId = readActorMemberId();
  if (memberId) headers['X-User-Id'] = memberId;
  const token = readAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function buildUrl(resource: HealthResource, query?: Record<string, string | undefined>): string {
  const base = API_URLS[resource];
  if (!query) return base;
  const filtered = Object.entries(query).filter(([, v]) => v !== undefined && v !== '');
  if (filtered.length === 0) return base;
  const qs = new URLSearchParams(filtered as [string, string][]).toString();
  return `${base}?${qs}`;
}

async function ensureOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  let detail = '';
  try {
    const j = await res.json();
    if (j?.error) detail = ` ${j.error}`;
  } catch {
    /* ignore */
  }
  throw new Error(`${fallback} (${res.status})${detail}`);
}

export const healthApi = {
  async get<T = unknown>(
    resource: HealthResource,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    const res = await fetch(buildUrl(resource, query), {
      credentials: 'include',
      headers: buildHeaders(),
    });
    await ensureOk(res, `Health API GET ${resource} failed`);
    return res.json() as Promise<T>;
  },

  async post<T = unknown>(
    resource: HealthResource,
    body: unknown,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    const res = await fetch(buildUrl(resource, query), {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body ?? {}),
    });
    await ensureOk(res, `Health API POST ${resource} failed`);
    return res.json() as Promise<T>;
  },

  async put<T = unknown>(
    resource: HealthResource,
    body: unknown,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    const res = await fetch(buildUrl(resource, query), {
      method: 'PUT',
      credentials: 'include',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body ?? {}),
    });
    await ensureOk(res, `Health API PUT ${resource} failed`);
    return res.json() as Promise<T>;
  },

  async delete<T = unknown>(
    resource: HealthResource,
    body?: unknown,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    const res = await fetch(buildUrl(resource, query), {
      method: 'DELETE',
      credentials: 'include',
      headers: buildHeaders(body !== undefined ? { 'Content-Type': 'application/json' } : undefined),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    await ensureOk(res, `Health API DELETE ${resource} failed`);
    return res.json() as Promise<T>;
  },
};
