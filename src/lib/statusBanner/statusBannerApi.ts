// statusBannerApi — тонкий клиент над public read и admin write endpoints.
//
// Public read:   status-banners-public  (GET only)
//                viewer определяется server-side по headers:
//                  - X-Admin-Token=admin_authenticated → admin
//                  - X-Auth-Token (любой непустой) → authenticated
//                  - иначе → public (только audience=all)
//                Безопасный default: без токенов backend не отдаёт
//                authenticated/admins-баннеры (audience-leakage защита, B3.5).
// Admin write:   admin-status-banners   (CRUD, требует X-Admin-Token)
//
// URL'ы — через @/../backend/func2url.json (генерируется при sync_backend).

import func2url from '../../../backend/func2url.json';
import { storage } from '@/lib/storage';
import type { StatusBanner, StatusBannerDraft } from './types';

const PUBLIC_URL = (func2url as Record<string, string>)['status-banners-public'] ?? '';
const ADMIN_URL = (func2url as Record<string, string>)['admin-status-banners'] ?? '';

const ADMIN_TOKEN = 'admin_authenticated';

interface PublicResponse {
  banners: StatusBanner[];
  server_time?: string;
  viewer?: 'public' | 'authenticated' | 'admin';
  error?: string;
}

/**
 * Заголовки для public read: бэкенд по ним определит viewer и отсечёт
 * чувствительный к audience контент. Без токенов backend трактует viewer
 * как 'public' — это безопасный default.
 */
function publicReadHeaders(): HeadersInit {
  const h: Record<string, string> = {};
  try {
    const authToken = storage.getItem('authToken');
    if (authToken) h['X-Auth-Token'] = authToken;
    const adminFlag = localStorage.getItem('adminToken');
    if (adminFlag === ADMIN_TOKEN) h['X-Admin-Token'] = ADMIN_TOKEN;
  } catch {
    // storage недоступен — едем как public, это безопасно
  }
  return h;
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
    const res = await fetch(PUBLIC_URL, {
      method: 'GET',
      headers: publicReadHeaders(),
      signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as PublicResponse;
    return Array.isArray(data.banners) ? data.banners : [];
  } catch {
    return [];
  }
}

// ---------- admin ----------

function adminHeaders(actor?: string): HeadersInit {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Token': ADMIN_TOKEN,
  };
  if (actor) h['X-Admin-Actor'] = actor;
  return h;
}

export async function adminListBanners(): Promise<StatusBanner[]> {
  if (!ADMIN_URL) throw new Error('admin-status-banners URL not configured');
  const res = await fetch(ADMIN_URL, { method: 'GET', headers: adminHeaders() });
  if (!res.ok) throw new Error(`adminListBanners HTTP ${res.status}`);
  const data = (await res.json()) as AdminListResponse;
  return Array.isArray(data.banners) ? data.banners : [];
}

export async function adminCreateBanner(
  draft: StatusBannerDraft,
  actor?: string,
): Promise<StatusBanner> {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: adminHeaders(actor),
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
  actor?: string,
): Promise<StatusBanner> {
  const url = `${ADMIN_URL}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: adminHeaders(actor),
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
  actor?: string,
): Promise<StatusBanner> {
  const action = enabled ? 'enable' : 'disable';
  const url = `${ADMIN_URL}?id=${encodeURIComponent(id)}&action=${action}`;
  const res = await fetch(url, { method: 'POST', headers: adminHeaders(actor) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as AdminOneResponse;
  return data.banner;
}

export async function adminDeleteBanner(id: string): Promise<void> {
  const url = `${ADMIN_URL}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: 'DELETE', headers: adminHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
}