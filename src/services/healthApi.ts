/**
 * Health API thin wrapper.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * СЕРВЕРНАЯ АВТОРИЗАЦИЯ (волна 1)
 *
 * Identity больше не передаётся клиентом. Раньше здесь отправлялся
 * X-User-Id = readActorMemberId(), и backend доверял этому значению как
 * ответу на вопрос «кто я» — подстановка чужого UUID открывала чужие
 * медицинские данные. Теперь:
 *
 *   - клиент отправляет только X-Auth-Token (серверная сессия);
 *   - actor, семья, роль и множество доступных субъектов определяются
 *     на backend в auth_guard.require_session();
 *   - profileId остаётся resource id в query/body — как и было;
 *   - subjectMemberId передаётся лишь тогда, когда действие осознанно
 *     выполняется за другого доступного участника.
 *
 * KE-health (health_profiles.user_id хранит family_members.id) сохраняется
 * как особенность схемы данных, но больше не влияет на аутентификацию:
 * сервер сам сопоставляет сессию с member_id.
 */

import func2url from '../../backend/func2url.json';
import { apiHeaders } from '@/lib/apiHeaders';

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
  return apiHeaders({ extra });
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