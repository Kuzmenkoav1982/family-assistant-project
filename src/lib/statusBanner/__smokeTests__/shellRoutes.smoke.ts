// Smoke для shellRoutes — единого hidden-route matcher (B3.5/B5).

import { SHELL_HIDDEN_ROUTES, isShellHiddenRoute } from '@/lib/shellRoutes';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

function testExact(): TestResult[] {
  return SHELL_HIDDEN_ROUTES.map((r) =>
    assert(isShellHiddenRoute(r) === true, `exact match: ${r}`),
  );
}

function testSegmentBoundary(): TestResult[] {
  return [
    assert(isShellHiddenRoute('/login') === true, '/login → hidden'),
    assert(isShellHiddenRoute('/login/oauth') === true, '/login/oauth → hidden (sub-route)'),
    assert(isShellHiddenRoute('/login-info') === false, '/login-info → НЕ hidden (граница сегмента)'),
    assert(
      isShellHiddenRoute('/admin/login') === true,
      '/admin/login → hidden',
    ),
    assert(
      isShellHiddenRoute('/admin/login/sso') === true,
      '/admin/login/sso → hidden (sub-route)',
    ),
    assert(
      isShellHiddenRoute('/admin/login2') === false,
      '/admin/login2 → НЕ hidden',
    ),
  ];
}

function testRealApp(): TestResult[] {
  return [
    assert(isShellHiddenRoute('/') === false, '/ (home) → shown'),
    assert(isShellHiddenRoute('/portfolio') === false, '/portfolio → shown'),
    assert(
      isShellHiddenRoute('/portfolio/abc/sphere/intellect') === false,
      'sphere detail → shown',
    ),
    assert(
      isShellHiddenRoute('/admin/dashboard') === false,
      '/admin/dashboard → shown (только login/* скрыт)',
    ),
    assert(isShellHiddenRoute('/admin/status-banner') === false, '/admin/status-banner → shown'),
  ];
}

function testEdgeCases(): TestResult[] {
  return [
    assert(isShellHiddenRoute('') === false, 'пустая строка → false'),
    assert(isShellHiddenRoute(null) === false, 'null → false'),
    assert(isShellHiddenRoute(undefined) === false, 'undefined → false'),
  ];
}

function testNoTypoRegression(): TestResult[] {
  // Регрессия: до B3.5 были опечатки '/demo-mode' и '/admin-login' — теперь они
  // НЕ должны фигурировать в списке.
  return [
    assert(
      !SHELL_HIDDEN_ROUTES.includes('/demo-mode'),
      'legacy typo /demo-mode исправлен на /demo',
    ),
    assert(
      !SHELL_HIDDEN_ROUTES.includes('/admin-login'),
      'legacy typo /admin-login исправлен на /admin/login',
    ),
    assert(SHELL_HIDDEN_ROUTES.includes('/demo'), '/demo присутствует'),
    assert(SHELL_HIDDEN_ROUTES.includes('/admin/login'), '/admin/login присутствует'),
  ];
}

export async function runAll(): Promise<void> {
  const groups = [
    { title: 'exact matches', results: testExact() },
    { title: 'segment boundary', results: testSegmentBoundary() },
    { title: 'real app paths', results: testRealApp() },
    { title: 'edge cases', results: testEdgeCases() },
    { title: 'typo regression (B3.5)', results: testNoTypoRegression() },
  ];
  let passed = 0;
  let failed = 0;
  console.group('🟡 shellRoutes smoke');
  for (const g of groups) {
    console.group(g.title);
    for (const r of g.results) {
      if (r.ok) {
        passed++;
        console.log(`  ✓ ${r.name}`);
      } else {
        failed++;
        console.error(`  ✗ ${r.name}${r.details ? ' — ' + r.details : ''}`);
      }
    }
    console.groupEnd();
  }
  console.log(`Итого: ${passed} прошло, ${failed} упало`);
  console.groupEnd();
}
