/**
 * Простой механизм feature flags.
 * Источник правды:
 *   1) localStorage['ff:<name>'] === '1' — ручной overrides (для разработки)
 *   2) DEFAULT_FLAGS — продуктовые умолчания
 *
 * Не используется для секретов или контроля доступа на бэкенде.
 * Это только UX-выключатель; реальная авторизация — на бэке.
 */

export type FeatureFlagName =
  | 'family_overview' // бывший «compare», переименован в «Семейный обзор»
  | 'portfolio_ai_inline'
  | 'portfolio_age_plan_templates';

const DEFAULT_FLAGS: Record<FeatureFlagName, boolean> = {
  family_overview: true,
  portfolio_ai_inline: false,
  portfolio_age_plan_templates: false,
};

export function isFeatureEnabled(name: FeatureFlagName): boolean {
  if (typeof window !== 'undefined') {
    try {
      const v = window.localStorage.getItem(`ff:${name}`);
      if (v === '1') return true;
      if (v === '0') return false;
    } catch {
      /* ignore */
    }
  }
  return DEFAULT_FLAGS[name] ?? false;
}

// ── Домовой 2.0 / Guide mode ────────────────────────────────────────────────

export type FlagSource = 'localStorage' | 'env' | 'dev-default' | 'prod-default';

export interface FeatureFlagResult {
  enabled: boolean;
  source: FlagSource;
}

export const DOMOVOY_GUIDE_STORAGE_KEY = 'domovoy_guide_enabled';

function parseBooleanLike(value: string | null): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'on', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'off', 'no'].includes(normalized)) return false;
  return null;
}

export function readDomovoyGuideFlag(): FeatureFlagResult {
  if (typeof window !== 'undefined') {
    try {
      const localOverride = parseBooleanLike(
        window.localStorage.getItem(DOMOVOY_GUIDE_STORAGE_KEY)
      );
      if (localOverride !== null) {
        return { enabled: localOverride, source: 'localStorage' };
      }
    } catch { /* ignore */ }
  }

  const envValue = parseBooleanLike(import.meta.env.VITE_DOMOVOY_GUIDE ?? null);
  if (envValue !== null) {
    return { enabled: envValue, source: 'env' };
  }

  if (import.meta.env.DEV) {
    return { enabled: true, source: 'dev-default' };
  }

  // Rollout decision: prod-default = true.
  // Причина: на poehali.dev VITE_* env не вшиваются в prod-билд,
  // поэтому env-rollout недоступен на этой платформе.
  //
  // Kill switch (только client-side, не глобальный):
  //   localStorage.setItem('domovoy_guide_enabled', 'false') + reload
  // Глобальное отключение — только через redeploy с изменением этой строки.
  return { enabled: true, source: 'prod-default' };
}

// ── QA / Internal helpers ────────────────────────────────────────────────────
// Использование в консоли браузера:
//   enableDomovoyGuideOverride();  location.reload();
//   disableDomovoyGuideOverride(); location.reload();
//   clearDomovoyGuideOverride();   location.reload();

export function enableDomovoyGuideOverride(): void {
  window.localStorage.setItem(DOMOVOY_GUIDE_STORAGE_KEY, 'true');
}

export function disableDomovoyGuideOverride(): void {
  window.localStorage.setItem(DOMOVOY_GUIDE_STORAGE_KEY, 'false');
}

export function clearDomovoyGuideOverride(): void {
  window.localStorage.removeItem(DOMOVOY_GUIDE_STORAGE_KEY);
}