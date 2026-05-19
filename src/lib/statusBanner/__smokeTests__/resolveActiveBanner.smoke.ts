// Smoke-tests для resolveActiveBanner (B1 — Status Banner track).
//
// Без vitest. Прогон:
//   import('@/lib/statusBanner/__smokeTests__/resolveActiveBanner.smoke')
//     .then(m => m.runAll());
//
// Покрываем все ветки решения:
//   enabled / startsAt / endsAt / audience / routeScope / dismiss /
//   priority / freshness / invalid data.

import {
  resolveActiveBanner,
  isValidBanner,
} from '../resolveActiveBanner';
import type {
  StatusBanner,
  BannerType,
  BannerAudience,
} from '../types';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ---------- fixtures ----------

const NOW = Date.parse('2026-05-20T12:00:00Z');

function makeBanner(over: Partial<StatusBanner> & { id: string }): StatusBanner {
  return {
    id: over.id,
    type: (over.type ?? 'info') as BannerType,
    title: over.title ?? 'T',
    message: over.message ?? 'M',
    ctaLabel: over.ctaLabel ?? null,
    ctaHref: over.ctaHref ?? null,
    enabled: over.enabled ?? true,
    dismissible: over.dismissible ?? true,
    startsAt: over.startsAt ?? null,
    endsAt: over.endsAt ?? null,
    audience: (over.audience ?? 'all') as BannerAudience,
    routeScope: over.routeScope ?? [],
    priority: over.priority ?? 10,
    createdBy: over.createdBy ?? null,
    updatedBy: over.updatedBy ?? null,
    createdAt: over.createdAt ?? '2026-05-01T00:00:00Z',
    updatedAt: over.updatedAt ?? '2026-05-01T00:00:00Z',
    publishedAt: over.publishedAt ?? null,
    unpublishedAt: over.unpublishedAt ?? null,
  };
}

// ---------- groups ----------

function testEnabledFilter(): TestResult[] {
  const r = resolveActiveBanner(
    [
      makeBanner({ id: 'off', enabled: false }),
      makeBanner({ id: 'on', enabled: true }),
    ],
    { now: NOW, pathname: '/', viewer: 'public' },
  );
  return [
    assert(r.active?.banner.id === 'on', 'выбран только enabled'),
    assert(
      r.rejected.some((x) => x.id === 'off' && x.reason === 'disabled'),
      'disabled попал в rejected',
    ),
  ];
}

function testStartsAt(): TestResult[] {
  const r = resolveActiveBanner(
    [
      makeBanner({ id: 'future', startsAt: '2026-06-01T00:00:00Z' }),
      makeBanner({ id: 'past', startsAt: '2026-05-01T00:00:00Z' }),
      makeBanner({ id: 'noStart' }),
    ],
    { now: NOW, pathname: '/', viewer: 'public' },
  );
  return [
    assert(
      r.rejected.some((x) => x.id === 'future' && x.reason === 'not-started'),
      'future startsAt → not-started',
    ),
    assert(r.active !== null, 'есть активный из past/noStart'),
    assert(
      ['past', 'noStart'].includes(r.active?.banner.id ?? ''),
      'выбран один из доступных по startsAt',
    ),
  ];
}

function testEndsAt(): TestResult[] {
  const r = resolveActiveBanner(
    [
      makeBanner({ id: 'expired', endsAt: '2026-05-19T00:00:00Z' }),
      makeBanner({ id: 'live', endsAt: '2026-05-21T00:00:00Z' }),
      makeBanner({ id: 'forever' }),
    ],
    { now: NOW, pathname: '/', viewer: 'public' },
  );
  return [
    assert(
      r.rejected.some((x) => x.id === 'expired' && x.reason === 'expired'),
      'expired endsAt → expired',
    ),
    assert(r.active?.banner.id !== 'expired', 'не выбран expired'),
  ];
}

function testAudience(): TestResult[] {
  const banners = [
    makeBanner({ id: 'all', audience: 'all' }),
    makeBanner({ id: 'auth', audience: 'authenticated' }),
    makeBanner({ id: 'admins', audience: 'admins' }),
  ];

  const pub = resolveActiveBanner(banners, { now: NOW, pathname: '/', viewer: 'public' });
  const auth = resolveActiveBanner(banners, { now: NOW, pathname: '/', viewer: 'authenticated' });
  const adm = resolveActiveBanner(banners, { now: NOW, pathname: '/', viewer: 'admin' });

  return [
    assert(pub.active?.banner.id === 'all', 'public видит только all'),
    assert(
      pub.rejected.some((x) => x.id === 'auth' && x.reason === 'audience-mismatch'),
      'public не видит authenticated',
    ),
    assert(
      pub.rejected.some((x) => x.id === 'admins' && x.reason === 'audience-mismatch'),
      'public не видит admins',
    ),
    assert(
      ['all', 'auth'].includes(auth.active?.banner.id ?? ''),
      'authenticated видит all и authenticated',
    ),
    assert(
      auth.rejected.some((x) => x.id === 'admins' && x.reason === 'audience-mismatch'),
      'authenticated не видит admins',
    ),
    assert(adm.active !== null, 'admin видит хотя бы один'),
    assert(
      adm.rejected.every((x) => x.reason !== 'audience-mismatch'),
      'admin видит всех audience',
    ),
  ];
}

function testRouteScope(): TestResult[] {
  const banners = [
    makeBanner({ id: 'global', routeScope: [] }),
    makeBanner({ id: 'portfolio', routeScope: ['/portfolio'] }),
    makeBanner({ id: 'workshop', routeScope: ['/workshop'] }),
  ];

  const onPortfolio = resolveActiveBanner(banners, {
    now: NOW,
    pathname: '/portfolio/abc/sphere/intellect',
    viewer: 'public',
  });
  const onSettings = resolveActiveBanner(banners, {
    now: NOW,
    pathname: '/settings',
    viewer: 'public',
  });
  const segmentBoundary = resolveActiveBanner(
    [makeBanner({ id: 'p', routeScope: ['/portfolio'] })],
    { now: NOW, pathname: '/portfolio-compare', viewer: 'public' },
  );

  return [
    assert(
      onPortfolio.rejected.some((x) => x.id === 'workshop' && x.reason === 'route-mismatch'),
      'workshop не показан на /portfolio/*',
    ),
    assert(
      onPortfolio.active !== null,
      'global или portfolio выбран на /portfolio/*',
    ),
    assert(onSettings.active?.banner.id === 'global', 'на /settings только global'),
    assert(
      segmentBoundary.rejected.some((x) => x.reason === 'route-mismatch'),
      '/portfolio-compare НЕ матчит /portfolio (граница сегмента)',
    ),
  ];
}

function testDismissed(): TestResult[] {
  const banners = [
    makeBanner({ id: 'a', priority: 10 }),
    makeBanner({ id: 'b', priority: 5 }),
  ];

  const noDismiss = resolveActiveBanner(banners, {
    now: NOW,
    pathname: '/',
    viewer: 'public',
  });
  const dismissA = resolveActiveBanner(banners, {
    now: NOW,
    pathname: '/',
    viewer: 'public',
    dismissedIds: ['a'],
  });
  // critical не должен прятаться даже если пользователь его dismissed-нул:
  // critical.dismissible=false → effectiveDismissible=false → dismissal игнорируется
  const criticalDismissed = resolveActiveBanner(
    [makeBanner({ id: 'c', type: 'critical', dismissible: false, priority: 100 })],
    { now: NOW, pathname: '/', viewer: 'public', dismissedIds: ['c'] },
  );

  return [
    assert(noDismiss.active?.banner.id === 'a', 'без dismiss → priority winner'),
    assert(dismissA.active?.banner.id === 'b', 'после dismiss a → выбран b'),
    assert(
      dismissA.rejected.some((x) => x.id === 'a' && x.reason === 'locally-dismissed'),
      'a помечен как locally-dismissed',
    ),
    assert(
      criticalDismissed.active?.banner.id === 'c',
      'critical non-dismissible не прячется по dismissal',
    ),
  ];
}

function testPriorityAndFreshness(): TestResult[] {
  const r = resolveActiveBanner(
    [
      makeBanner({ id: 'old-hi', priority: 50, publishedAt: '2026-04-01T00:00:00Z' }),
      makeBanner({ id: 'new-hi', priority: 50, publishedAt: '2026-05-10T00:00:00Z' }),
      makeBanner({ id: 'low', priority: 10, publishedAt: '2026-05-19T00:00:00Z' }),
    ],
    { now: NOW, pathname: '/', viewer: 'public' },
  );
  return [
    assert(r.active?.banner.id === 'new-hi', 'priority desc, затем publishedAt desc'),
    assert(r.rejected.length === 0, 'неактивные не идут в rejected (только проигравшие сорт)'),
  ];
}

function testInvalidData(): TestResult[] {
  const garbage = [
    null,
    undefined,
    { id: 'bad-type', type: 'unknown', title: 'x', message: 'y', enabled: true,
      dismissible: true, audience: 'all', routeScope: [], priority: 0,
      ctaLabel: null, ctaHref: null, startsAt: null, endsAt: null,
      createdAt: '2026', updatedAt: '2026', publishedAt: null, unpublishedAt: null,
      createdBy: null, updatedBy: null },
    { id: 'bad-cta', type: 'info', title: 'x', message: 'y', enabled: true,
      dismissible: true, audience: 'all', routeScope: [], priority: 0,
      ctaLabel: 'click', ctaHref: null, startsAt: null, endsAt: null,
      createdAt: '2026', updatedAt: '2026', publishedAt: null, unpublishedAt: null,
      createdBy: null, updatedBy: null },
    { id: 'bad-dates', type: 'info', title: 'x', message: 'y', enabled: true,
      dismissible: true, audience: 'all', routeScope: [], priority: 0,
      ctaLabel: null, ctaHref: null,
      startsAt: '2026-05-20T00:00:00Z', endsAt: '2026-05-19T00:00:00Z',
      createdAt: '2026', updatedAt: '2026', publishedAt: null, unpublishedAt: null,
      createdBy: null, updatedBy: null },
    makeBanner({ id: 'good' }),
  ];

  const r = resolveActiveBanner(garbage, { now: NOW, pathname: '/', viewer: 'public' });

  return [
    assert(r.active?.banner.id === 'good', 'мусор не валит resolver, валидный выбран'),
    assert(
      r.rejected.filter((x) => x.reason === 'invalid').length >= 3,
      'битые записи помечены как invalid',
    ),
    assert(isValidBanner(garbage[5]) === true, 'isValidBanner: valid → true'),
    assert(isValidBanner(garbage[2]) === false, 'isValidBanner: unknown type → false'),
    assert(isValidBanner(garbage[3]) === false, 'isValidBanner: cta pair broken → false'),
    assert(isValidBanner(garbage[4]) === false, 'isValidBanner: endsAt <= startsAt → false'),
  ];
}

function testNullCandidates(): TestResult[] {
  const empty = resolveActiveBanner([], { now: NOW, pathname: '/', viewer: 'public' });
  return [
    assert(empty.active === null, 'пустой список → null'),
    assert(empty.rejected.length === 0, 'пустой список → rejected=[]'),
  ];
}

// ---------- runner ----------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'enabled filter', results: testEnabledFilter() },
    { title: 'startsAt', results: testStartsAt() },
    { title: 'endsAt', results: testEndsAt() },
    { title: 'audience', results: testAudience() },
    { title: 'routeScope', results: testRouteScope() },
    { title: 'dismissed', results: testDismissed() },
    { title: 'priority + freshness', results: testPriorityAndFreshness() },
    { title: 'invalid data resilience', results: testInvalidData() },
    { title: 'empty input', results: testNullCandidates() },
  ];

  let passed = 0;
  let failed = 0;
  console.group('🟡 Status Banner · resolveActiveBanner smoke');
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
