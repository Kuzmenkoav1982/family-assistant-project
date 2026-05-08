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
