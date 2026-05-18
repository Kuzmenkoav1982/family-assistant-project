import func2url from '../../../backend/func2url.json';

export const FAITH_API = (func2url as Record<string, string>)['faith-api'];

export function getAuthToken(): string {
  try {
    const ud = localStorage.getItem('userData');
    if (ud) {
      const parsed = JSON.parse(ud);
      if (parsed.auth_token) return parsed.auth_token;
    }
  } catch (_e) { /* fallback */ }
  return localStorage.getItem('authToken') || '';
}

export async function apiFetch(action: string, extra: Record<string, unknown> = {}) {
  const res = await fetch(FAITH_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': getAuthToken(),
    },
    body: JSON.stringify({ action, ...extra }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'API error');
  return data;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
