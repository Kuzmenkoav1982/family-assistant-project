/**
 * H2 — Build/version observability.
 *
 * Экспортирует build-метаданные и инициализирует window.__APP_BUILD__.
 *
 * Источники данных:
 *   - import.meta.env.VITE_COMMIT_SHA  — SHA коммита (если задан в CI/CD)
 *   - import.meta.env.VITE_BUILD_TIME  — ISO timestamp билда (если задан в CI/CD)
 *   - import.meta.env.MODE             — 'development' | 'production' (Vite встраивает автоматически)
 *
 * Если переменные не заданы — используются fallback значения.
 * Это позволяет работать без настройки CI/CD, постепенно добавляя precision.
 *
 * Использование:
 *   // В консоли браузера:
 *   window.__APP_BUILD__
 *   // → { commit: "abc1234", buildTime: "2026-05-18T20:00:00Z", mode: "production", startedAt: "..." }
 */

export interface AppBuildInfo {
  commit: string;
  buildTime: string;
  mode: string;
  startedAt: string;
}

const commit: string =
  (import.meta.env.VITE_COMMIT_SHA as string | undefined) ?? 'unknown';

const buildTime: string =
  (import.meta.env.VITE_BUILD_TIME as string | undefined) ?? 'unknown';

const mode: string = import.meta.env.MODE ?? 'unknown';

const startedAt: string = new Date().toISOString();

export const BUILD_INFO: AppBuildInfo = {
  commit,
  buildTime,
  mode,
  startedAt,
};

declare global {
  interface Window {
    __APP_BUILD__?: AppBuildInfo;
  }
}

export function initBuildInfo(): void {
  if (typeof window === 'undefined') return;

  try {
    Object.defineProperty(window, '__APP_BUILD__', {
      value: BUILD_INFO,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  } catch {
    window.__APP_BUILD__ = BUILD_INFO;
  }

  if (mode !== 'production') return;

  console.info(
    `[App] commit=${commit} buildTime=${buildTime} startedAt=${startedAt}`,
  );
}
