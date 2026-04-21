/**
 * Глобальный перехватчик fetch для обработки 401 Unauthorized.
 * При просроченном токене очищает localStorage и выкидывает пользователя на /login.
 * Работает для всех ролей (в т.ч. детского режима).
 */

const LAST_REDIRECT_KEY = '__auth_expired_redirect_at';
const REDIRECT_COOLDOWN_MS = 5000;

const AUTH_KEYS_TO_CLEAR = [
  'authToken',
  'auth_token',
  'userData',
  'authUser',
  'familyId',
  'childAuthToken',
  'childUserData',
];

function shouldTriggerRedirect(): boolean {
  const last = Number(sessionStorage.getItem(LAST_REDIRECT_KEY) || '0');
  if (Date.now() - last < REDIRECT_COOLDOWN_MS) return false;
  sessionStorage.setItem(LAST_REDIRECT_KEY, String(Date.now()));
  return true;
}

function isAuthRequest(input: RequestInfo | URL, init?: RequestInit): boolean {
  try {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (!url) return false;
    if (url.includes('/auth') && !url.includes('X-Auth-Token')) {
      const method = (init?.method || 'GET').toUpperCase();
      if (method === 'POST') return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function hasAuthHeader(init?: RequestInit, input?: RequestInfo | URL): boolean {
  if (init?.headers) {
    const headers = init.headers;
    if (headers instanceof Headers) {
      return (
        !!headers.get('X-Auth-Token') ||
        !!headers.get('Authorization') ||
        !!headers.get('x-auth-token') ||
        !!headers.get('authorization')
      );
    }
    if (Array.isArray(headers)) {
      return headers.some(([k]) => k.toLowerCase() === 'x-auth-token' || k.toLowerCase() === 'authorization');
    }
    const h = headers as Record<string, string>;
    return !!(h['X-Auth-Token'] || h['x-auth-token'] || h['Authorization'] || h['authorization']);
  }
  if (input instanceof Request) {
    return (
      !!input.headers.get('X-Auth-Token') ||
      !!input.headers.get('Authorization')
    );
  }
  return false;
}

export function installFetchInterceptor(): void {
  const w = window as unknown as { __fetchInterceptorInstalled?: boolean };
  if (w.__fetchInterceptorInstalled) return;
  w.__fetchInterceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init);

    if (response.status === 401) {
      const wasAuthRequest = isAuthRequest(input, init);
      const wasAuthenticated = hasAuthHeader(init, input);

      if (!wasAuthRequest && wasAuthenticated && shouldTriggerRedirect()) {
        try {
          AUTH_KEYS_TO_CLEAR.forEach((k) => localStorage.removeItem(k));
        } catch {
          /* ignore */
        }

        const path = window.location.pathname;
        const publicPaths = ['/', '/login', '/welcome', '/register', '/reset-password'];
        if (!publicPaths.includes(path)) {
          setTimeout(() => {
            window.location.href = '/login?session_expired=1';
          }, 100);
        }
      }
    }

    return response;
  };
}
