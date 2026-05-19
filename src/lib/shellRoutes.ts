// shellRoutes — единый источник правды для app-shell visibility.
//
// До этого 4 компонента держали свои локальные `HIDDEN_ROUTES`:
//   GlobalTopBar, GlobalSidebar, GlobalBottomBar, GlobalStatusBanner
// + PageWrapper имел `NO_PADDING_ROUTES`.
//
// Из-за этого:
//   - они расходились между собой,
//   - в Status Banner были опечатки '/demo-mode' и '/admin-login', которые
//     никогда не матчились (реальные пути — '/demo' и '/admin/login'),
//   - любое добавление новой "тихой" страницы (например, /presentation)
//     требовало обновить 5 разных мест.
//
// Теперь:
//   - SHELL_HIDDEN_ROUTES — один список,
//   - isShellHiddenRoute(pathname) — корректный prefix-matcher
//     на границе сегмента (как resolveActiveBanner.routeMatches),
//   - все 5 компонентов импортируют это место.

/**
 * Маршруты, на которых платформенный shell (TopBar / Sidebar / BottomBar /
 * StatusBanner / page padding) НЕ показывается:
 *   - auth / onboarding flow (пользователь ещё «не в приложении»)
 *   - presentational decks (investor / matryoshka / presentation)
 *   - admin auth screen
 *   - debug / oauth-debug
 *
 * Список выверен по реальным путям из src/App.tsx.
 */
export const SHELL_HIDDEN_ROUTES: ReadonlyArray<string> = Object.freeze([
  '/welcome',
  '/login',
  '/register',
  '/reset-password',
  '/onboarding',
  '/join',
  '/activate',
  '/activate-callback',
  '/oauth-debug',
  '/debug-auth',
  '/demo',
  '/admin/login',
  '/presentation',
  '/investor-deck',
  '/matryoshka',
]);

/**
 * true если pathname попадает в SHELL_HIDDEN_ROUTES.
 *
 * Match-правило (граница сегмента, не contains):
 *   '/login'             → /login, /login/oauth — да; /login-info — нет
 *   '/admin/login'       → /admin/login, /admin/login/sso — да; /admin/login2 — нет
 *
 * Пустая строка / null / undefined → false (на всякий случай).
 */
export function isShellHiddenRoute(pathname: string | null | undefined): boolean {
  if (typeof pathname !== 'string' || pathname.length === 0) return false;
  for (const prefix of SHELL_HIDDEN_ROUTES) {
    if (pathname === prefix) return true;
    if (pathname.startsWith(prefix + '/')) return true;
  }
  return false;
}
