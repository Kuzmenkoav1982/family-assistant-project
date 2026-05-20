// adminFetch — единая точка для всех admin-API запросов (SEC-1.3b).
//
// До этого admin-страницы дёргали fetch напрямую с
// `'X-Admin-Token': 'admin_authenticated'`. Это был «магический» токен,
// тот же на всех. Сейчас:
//   - все admin-страницы ходят через adminFetch
//   - adminFetch берёт X-Admin-Session-Token из localStorage
//   - на 401/403 единым обработчиком чистит сессию и редиректит на /admin/login
//   - НИГДЕ во фронте больше не отправляется X-Admin-Token (legacy)

import {
  ADMIN_SESSION_EVENT,
  ADMIN_SESSION_EMAIL_KEY,
  ADMIN_SESSION_EXPIRES_KEY,
  ADMIN_SESSION_TOKEN_KEY,
  LEGACY_ADMIN_TOKEN_KEY,
  readAdminSessionToken,
} from './adminAuth';

const ADMIN_LOGIN_PATH = '/admin/login';

export class AdminUnauthorizedError extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
    this.name = 'AdminUnauthorizedError';
  }
}

/**
 * Очистка локального admin-state. Безопасно вызывать многократно.
 * Не делает редирект сам — это делает forceAdminReauth().
 */
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_EXPIRES_KEY);
    localStorage.removeItem(ADMIN_SESSION_EMAIL_KEY);
    // Подчищаем заодно legacy ключ, чтобы он не «оживал» после миграции.
    localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  } catch {
    // storage недоступен — нечего чистить
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
  }
}

/**
 * Универсальная реакция на 401/invalid_session:
 *   1) clearAdminSession (включая legacy)
 *   2) если мы не на /admin/login — навигировать туда
 *
 * Без react-router (выполняется снаружи компонентов тоже).
 */
export function forceAdminReauth(): void {
  clearAdminSession();
  if (typeof window === 'undefined') return;
  const path = window.location.pathname || '';
  if (path === ADMIN_LOGIN_PATH || path.startsWith(ADMIN_LOGIN_PATH + '/')) return;
  // Hash-роутер не используется — простая навигация.
  window.location.assign(ADMIN_LOGIN_PATH);
}

export interface AdminFetchOptions extends Omit<RequestInit, 'headers'> {
  /** Дополнительные заголовки. X-Admin-Session-Token проставляется автоматически. */
  headers?: Record<string, string>;
  // actor убран (SEC-1.5): backend берёт actor из верифицированной сессии,
  // клиентский X-Admin-Actor игнорируется.
  /** Не делать auto-reauth при 401 (например, для health-check). По умолчанию делает. */
  skipAutoReauth?: boolean;
}

/**
 * adminFetch — основной helper.
 *   - добавляет X-Admin-Session-Token (если есть)
 *   - на 401 чистит сессию и редиректит на /admin/login (если не skipAutoReauth)
 *   - бросает AdminUnauthorizedError для 401/403
 *   - НЕ парсит response — это делает caller (некоторые endpoints возвращают не JSON)
 */
export async function adminFetch(
  url: string,
  options: AdminFetchOptions = {},
): Promise<Response> {
  const token = readAdminSessionToken();
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };
  if (token) {
    headers['X-Admin-Session-Token'] = token;
  }
  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    if (!options.skipAutoReauth) {
      forceAdminReauth();
    }
    throw new AdminUnauthorizedError(res.status, `Admin auth required (HTTP ${res.status})`);
  }

  return res;
}

/** JSON helper: бросает с error.message при не-OK ответе. */
export async function adminFetchJson<T = unknown>(
  url: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  const res = await adminFetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { detail?: string; error?: string }).detail ||
      (body as { error?: string }).error ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }
  return (await res.json()) as T;
}