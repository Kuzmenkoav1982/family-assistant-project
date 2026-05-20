// statusBannerApi — тонкий клиент над public read и admin write endpoints.
//
// Public read:   status-banners-public  (GET only)
//                v1 (B3.6 hardening, вариант A): возвращает ТОЛЬКО audience='all'
//                независимо от заголовков. authenticated/admins audiences
//                considered gated до security mini-sprint с верифицированной
//                серверной auth-валидацией.
// Admin write:   admin-status-banners   (CRUD, требует X-Admin-Session-Token)
//
// URL'ы — через @/../backend/func2url.json (генерируется при sync_backend).

import func2url from '../../../backend/func2url.json';
import type { StatusBanner, StatusBannerDraft } from './types';
import { adminFetch } from '@/lib/adminFetch';

const PUBLIC_URL = (func2url as Record<string, string>)['status-banners-public'] ?? '';
const ADMIN_URL = (func2url as Record<string, string>)['admin-status-banners'] ?? '';

/** Политика audience public endpoint в v1 (B3.6, вариант A). */
export const AUDIENCE_POLICY_V1 = 'all_only_v1' as const;

interface PublicResponse {
  banners: StatusBanner[];
  server_time?: string;
  viewer?: 'public';
  audience_policy?: typeof AUDIENCE_POLICY_V1;
  error?: string;
}

interface AdminListResponse {
  banners: StatusBanner[];
}

interface AdminOneResponse {
  banner: StatusBanner;
}

// ---------- public ----------

export async function fetchPublicBanners(signal?: AbortSignal): Promise<StatusBanner[]> {
  if (!PUBLIC_URL) return [];
  try {
    // v1: токены НЕ шлём — backend всё равно их игнорирует и отдаёт только
    // audience='all'. Когда вернёмся к viewer-aware фильтрации (после
    // security mini-sprint), сюда вернутся publicReadHeaders().
    const res = await fetch(PUBLIC_URL, { method: 'GET', signal });
    if (!res.ok) return [];
    const data = (await res.json()) as PublicResponse;
    return Array.isArray(data.banners) ? data.banners : [];
  } catch {
    return [];
  }
}

// ---------- admin ----------

export async function adminListBanners(): Promise<StatusBanner[]> {
  if (!ADMIN_URL) throw new Error('admin-status-banners URL not configured');
  const res = await adminFetch(ADMIN_URL);
  if (!res.ok) throw new Error(`adminListBanners HTTP ${res.status}`);
  const data = (await res.json()) as AdminListResponse;
  return Array.isArray(data.banners) ? data.banners : [];
}

export async function adminCreateBanner(
  draft: StatusBannerDraft,
): Promise<StatusBanner> {
  // SEC-1.5: actor не принимается от клиента — backend берёт из сессии.
  const res = await adminFetch(ADMIN_URL, {
    method: 'POST',
    body: JSON.stringify(draft),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as AdminOneResponse;
  return data.banner;
}

export async function adminUpdateBanner(
  id: string,
  draft: StatusBannerDraft,
): Promise<StatusBanner> {
  // SEC-1.5: actor не принимается от клиента — backend берёт из сессии.
  const url = `${ADMIN_URL}?id=${encodeURIComponent(id)}`;
  const res = await adminFetch(url, {
    method: 'PUT',
    body: JSON.stringify(draft),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as AdminOneResponse;
  return data.banner;
}

export async function adminSetEnabled(
  id: string,
  enabled: boolean,
): Promise<StatusBanner> {
  // SEC-1.5: actor не принимается от клиента — backend берёт из сессии.
  const action = enabled ? 'enable' : 'disable';
  const url = `${ADMIN_URL}?id=${encodeURIComponent(id)}&action=${action}`;
  const res = await adminFetch(url, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as AdminOneResponse;
  return data.banner;
}

export async function adminDeleteBanner(id: string): Promise<void> {
  const url = `${ADMIN_URL}?id=${encodeURIComponent(id)}`;
  const res = await adminFetch(url, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
}