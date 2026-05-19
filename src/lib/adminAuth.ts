// adminAuth — клиент над backend admin-auth (SEC-1.3).
//
// Контракт:
//   - login(email, password) → server verify → server-issued session token
//   - token хранится в localStorage под ключом ADMIN_SESSION_TOKEN_KEY
//   - старый ключ 'adminToken' = 'admin_authenticated' оставлен как legacy
//     fallback для grace-period; будет удалён после SEC-1 checkpoint
//   - logout → revoke на сервере + локальная очистка
//   - verify → POST /verify, возвращает {valid, admin_email, expires_at}

import func2url from '../../backend/func2url.json';

const ADMIN_AUTH_URL =
  (func2url as Record<string, string>)['admin-auth'] ?? '';

export const ADMIN_SESSION_TOKEN_KEY = 'adminSessionToken';
export const ADMIN_SESSION_EXPIRES_KEY = 'adminSessionExpires';
export const ADMIN_SESSION_EMAIL_KEY = 'adminSessionEmail';
/** Legacy ключ — оставлен для grace-period, не пишется новой логикой. */
export const LEGACY_ADMIN_TOKEN_KEY = 'adminToken';
/** Event-имя, на которое подписаны AdminRoute и UI компоненты. */
export const ADMIN_SESSION_EVENT = 'admin-session-changed';

export interface AdminLoginResponse {
  token: string;
  expires_at: string;
  admin_email: string;
}

export interface AdminLoginError {
  error: string;
  cooldown_minutes?: number;
}

function emitChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
  }
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminLoginResponse> {
  if (!ADMIN_AUTH_URL) {
    throw new Error('admin-auth URL не настроен');
  }
  const res = await fetch(`${ADMIN_AUTH_URL}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as AdminLoginError;
    if (res.status === 429) {
      throw new Error(
        `Слишком много неудачных попыток. Попробуйте через ${body.cooldown_minutes ?? 10} минут.`,
      );
    }
    throw new Error(
      body.error === 'invalid_credentials'
        ? 'Неверный email или пароль.'
        : body.error || `HTTP ${res.status}`,
    );
  }
  const data = (await res.json()) as AdminLoginResponse;
  try {
    localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_SESSION_EXPIRES_KEY, data.expires_at);
    localStorage.setItem(ADMIN_SESSION_EMAIL_KEY, data.admin_email);
    // Чистим legacy ключ, чтобы не оставлять «два источника правды».
    localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  } catch {
    // storage недоступен — session не сохранится, это пользователь увидит
  }
  emitChange();
  return data;
}

export async function adminLogout(): Promise<void> {
  const token = readAdminSessionToken();
  if (token && ADMIN_AUTH_URL) {
    try {
      await fetch(`${ADMIN_AUTH_URL}?action=logout`, {
        method: 'POST',
        headers: { 'X-Admin-Session-Token': token },
      });
    } catch {
      // best-effort revoke; локально всё равно чистим
    }
  }
  try {
    localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_EXPIRES_KEY);
    localStorage.removeItem(ADMIN_SESSION_EMAIL_KEY);
    localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  } catch {
    // storage недоступен — невозможно очистить
  }
  emitChange();
}

export function readAdminSessionToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function readAdminSessionEmail(): string | null {
  try {
    return localStorage.getItem(ADMIN_SESSION_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function readAdminSessionExpires(): Date | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_EXPIRES_KEY);
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isFinite(d.getTime()) ? d : null;
  } catch {
    return null;
  }
}

/**
 * Локальная проверка: есть ли валидная сессия (без round-trip на сервер).
 * Используется AdminRoute для синхронного гейтинга. Окончательное доверие —
 * на стороне backend (он проверяет токен в БД).
 */
export function hasValidLocalAdminSession(): boolean {
  const token = readAdminSessionToken();
  if (!token) return false;
  const exp = readAdminSessionExpires();
  if (exp && exp.getTime() <= Date.now()) return false;
  return true;
}

/** Legacy hatch: проверка старого флага. Будет удалена после checkpoint. */
export function hasLegacyAdminFlag(): boolean {
  try {
    return localStorage.getItem(LEGACY_ADMIN_TOKEN_KEY) === 'admin_authenticated';
  } catch {
    return false;
  }
}
