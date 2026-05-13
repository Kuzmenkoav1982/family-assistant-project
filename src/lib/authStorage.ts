/**
 * Stage 4.6.1 — Single write-point for auth session.
 *
 * Точка истины для ЗАПИСИ identity в storage.
 * Все login / register / oauth-callback / activate / logout flows должны
 * вызывать ТОЛЬКО saveAuthSession() / clearAuthSession() / updateAuthUser().
 *
 * Парная сторона — src/lib/identity.ts (READ-точка истины).
 * authStorage пишет, identity читает.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Почему write-helper нужен:
 *
 * До stage 4.6.1 в проекте было ~14 разных мест, которые писали в localStorage
 * пары (token, userData) — каждый со своим выбором ключей:
 *   - 'authToken' + 'userData'           (Login.tsx, Register.tsx, AuthForm.tsx)
 *   - 'auth_token' + 'user_data'         (AuthPage.tsx)
 *   - 'authToken' + 'user'               (DebugAuth, TestAccountSelector,
 *                                          AuthForm логин-ветка)
 *
 * При этом logout-ы чистили только ОДИН из вариантов, из-за чего "призраки"
 * прошлой сессии оставались в storage. Identity adapter (4.2) научил READ
 * подбирать значение из любого из 3 ключей, но WRITE оставался расходящимся.
 *
 * Это исправление: один helper, всегда пишет в canonical ключи и ЗЕРКАЛИТ
 * в legacy (на переходный период, пока не разобраны все readers).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Canonical ключи:
 *   token:     'authToken'
 *   userData:  'userData'
 *
 * Legacy mirror (TODO: remove after read cleanup in 4.7+):
 *   token:     'auth_token'
 *   userData:  'user_data', 'user'
 *
 * Под "read cleanup" имеется в виду: убедиться, что весь код читает identity
 * только через src/lib/identity.ts (readNormalizedIdentity и обёртки), а не
 * через прямой localStorage.getItem('auth_token' | 'user_data' | 'user').
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Канонический shape user-объекта (см. backend/auth login response):
 *   { id: users.id, email, name?, phone?, family_id?, family_name?,
 *     member_id?, access_role?, avatar?, permissions? }
 *
 * Запись делается as-is, без перетряхивания полей — что прислал backend,
 * то и сохраняем. Identity adapter уже умеет вынимать нужное.
 */

import { storage } from './storage';

export type AuthUser = {
  id: string | number;
  email?: string;
  name?: string;
  phone?: string;
  family_id?: string | number;
  family_name?: string;
  member_id?: string | number;
  memberId?: string | number;
  user_id?: string | number;
  access_role?: string;
  avatar?: string;
  permissions?: unknown;
  [key: string]: unknown;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const CANONICAL_TOKEN_KEY = 'authToken';
const CANONICAL_USER_KEY = 'userData';
const LEGACY_TOKEN_KEYS = ['auth_token'] as const;
const LEGACY_USER_KEYS = ['user_data', 'user'] as const;

/**
 * Имя кастомного DOM-события, которое helper диспатчит после любой
 * мутации auth-state (save / update / clear).
 *
 * Зачем: нативный 'storage' event срабатывает ТОЛЬКО в других вкладках/окнах,
 * не в той же вкладке, где произошла запись. Это важно для guard-компонентов
 * (ProtectedRoute, AdminRoute), которым нужно реагировать на login/logout
 * прямо в текущей вкладке без polling-а.
 *
 * Подписчики: см. src/components/RouteGuards.tsx и любые будущие auth-aware
 * компоненты. Стандартное использование:
 *
 *   useEffect(() => {
 *     const sync = () => { ... };
 *     window.addEventListener(AUTH_SESSION_EVENT, sync);
 *     window.addEventListener('storage', sync);
 *     return () => {
 *       window.removeEventListener(AUTH_SESSION_EVENT, sync);
 *       window.removeEventListener('storage', sync);
 *     };
 *   }, []);
 */
export const AUTH_SESSION_EVENT = 'auth-session-changed';

function emitAuthSessionChanged(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT));
  } catch {
    // CustomEvent не поддерживается (очень старый browser / SSR).
    // Не критично — кросс-табный fallback через 'storage' event остаётся.
  }
}

/**
 * Записывает полную auth-сессию. Идемпотентно: повторный вызов с тем же
 * объектом не ломает state.
 *
 * Пишет в canonical ключи + зеркалит в legacy на переходный период.
 * Это сознательное дублирование, чтобы не сломать legacy readers
 * (AuthGuard, auth-context.tsx, прямые getItem кое-где) до их миграции.
 */
export function saveAuthSession(session: AuthSession): void {
  if (!session?.token || !session?.user) {
    console.warn('[authStorage] saveAuthSession called with incomplete session', {
      hasToken: !!session?.token,
      hasUser: !!session?.user,
    });
    return;
  }
  const userJson = JSON.stringify(session.user);

  storage.setItem(CANONICAL_TOKEN_KEY, session.token);
  storage.setItem(CANONICAL_USER_KEY, userJson);

  for (const k of LEGACY_TOKEN_KEYS) storage.setItem(k, session.token);
  for (const k of LEGACY_USER_KEYS) storage.setItem(k, userJson);

  emitAuthSessionChanged();
}

/**
 * Частичное обновление user-объекта (после смены family, после profile-edit
 * и т.п.). Сохраняет существующие поля, мерджит новые.
 *
 * Если в storage ничего нет — no-op (нет сессии, нечего обновлять).
 * Token не трогается.
 */
export function updateAuthUser(patch: Partial<AuthUser>): void {
  const raw =
    storage.getItem(CANONICAL_USER_KEY) ||
    storage.getItem('user_data') ||
    storage.getItem('user');
  if (!raw) return;
  let existing: AuthUser;
  try {
    existing = JSON.parse(raw) as AuthUser;
  } catch {
    console.warn('[authStorage] updateAuthUser: existing userData is not valid JSON, skip');
    return;
  }
  const merged: AuthUser = { ...existing, ...patch };
  const merged_json = JSON.stringify(merged);

  storage.setItem(CANONICAL_USER_KEY, merged_json);
  for (const k of LEGACY_USER_KEYS) storage.setItem(k, merged_json);

  emitAuthSessionChanged();
}

/**
 * Полная очистка auth-сессии. Стирает все варианты ключей —
 * canonical + legacy + старые алиасы.
 *
 * Используется в:
 *  - logout
 *  - auth-check failure (401 → invalidate session)
 *  - account deletion
 *
 * НЕ трогает другие ключи (settings, family-meta, theme и т.п.).
 */
export function clearAuthSession(): void {
  storage.removeItem(CANONICAL_TOKEN_KEY);
  storage.removeItem(CANONICAL_USER_KEY);
  for (const k of LEGACY_TOKEN_KEYS) storage.removeItem(k);
  for (const k of LEGACY_USER_KEYS) storage.removeItem(k);

  emitAuthSessionChanged();
}

/**
 * Удобная проверка "есть ли вообще сессия". Не валидирует токен,
 * только наличие пары token + userData.
 */
export function hasAuthSession(): boolean {
  const token =
    storage.getItem(CANONICAL_TOKEN_KEY) || storage.getItem('auth_token');
  const user =
    storage.getItem(CANONICAL_USER_KEY) ||
    storage.getItem('user_data') ||
    storage.getItem('user');
  return !!(token && user);
}