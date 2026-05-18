// Smoke-тесты для SW update flow (J1 PWA/update polish).
//
// Тестируем pure-логику принятия решений update banner:
//   - app-update-available event → баннер показывается
//   - first-install guard: баннер НЕ показывается если нет controller
//   - skipWaiting path vs reload-only path
//   - controllerchange → reload (once listener)
// Pure state-machine тесты без DOM-рендеринга и SW API.

import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── first-install guard ──────────────────────────────────────────────────────
// Воспроизводим логику из main.tsx:
//   if (newWorker.state === 'installed' && navigator.serviceWorker.controller)

interface SwUpdateDecision {
  shouldShowBanner: boolean;
  reason: 'update' | 'first-install' | 'not-installed';
}

function decideSwUpdate(
  newWorkerState: string,
  hasExistingController: boolean,
): SwUpdateDecision {
  if (newWorkerState !== 'installed') {
    return { shouldShowBanner: false, reason: 'not-installed' };
  }
  if (!hasExistingController) {
    return { shouldShowBanner: false, reason: 'first-install' };
  }
  return { shouldShowBanner: true, reason: 'update' };
}

export function testFirstInstallGuard(): TestResult[] {
  const firstInstall = decideSwUpdate('installed', false);
  const trueUpdate = decideSwUpdate('installed', true);
  const notInstalled = decideSwUpdate('activating', true);

  return [
    assert(!firstInstall.shouldShowBanner, 'first install: баннер НЕ показывается'),
    assert(firstInstall.reason === 'first-install', 'first install: reason = first-install'),
    assert(trueUpdate.shouldShowBanner, 'true update: баннер показывается'),
    assert(trueUpdate.reason === 'update', 'true update: reason = update'),
    assert(!notInstalled.shouldShowBanner, 'не installed state: баннер не показывается'),
    assert(notInstalled.reason === 'not-installed', 'не installed state: reason = not-installed'),
  ];
}

// ─── handleRefresh decision ───────────────────────────────────────────────────
// Воспроизводим логику AppUpdateBanner.handleRefresh:
//   если есть waiting SW → skipWaiting + ждём controllerchange → reload
//   иначе → сразу reload

type RefreshPath = 'skip-waiting' | 'direct-reload';

function decideRefreshPath(hasWaitingWorker: boolean): RefreshPath {
  if (hasWaitingWorker) return 'skip-waiting';
  return 'direct-reload';
}

export function testRefreshPath(): TestResult[] {
  return [
    assert(
      decideRefreshPath(true) === 'skip-waiting',
      'есть waiting worker → путь через skipWaiting',
    ),
    assert(
      decideRefreshPath(false) === 'direct-reload',
      'нет waiting worker → прямой reload',
    ),
  ];
}

// ─── controllerchange once semantics ─────────────────────────────────────────
// Проверяем что { once: true } предотвращает повторный reload

function simulateControllerChangeListener(
  fireCount: number,
): { reloads: number } {
  let reloads = 0;
  let fired = false;

  const handler = () => {
    if (fired) return; // имитируем { once: true }
    fired = true;
    reloads++;
  };

  for (let i = 0; i < fireCount; i++) {
    handler();
  }

  return { reloads };
}

export function testOnceListener(): TestResult[] {
  const single = simulateControllerChangeListener(1);
  const multi = simulateControllerChangeListener(5);

  return [
    assert(single.reloads === 1, 'одно controllerchange → один reload'),
    assert(multi.reloads === 1, 'пять controllerchange → всё равно один reload (once semantics)'),
  ];
}

// ─── banner visibility state machine ─────────────────────────────────────────

interface BannerState {
  visible: boolean;
}

function simulateBannerLifecycle(events: Array<'update' | 'dismiss' | 'refresh'>): BannerState {
  let visible = false;
  for (const ev of events) {
    if (ev === 'update') visible = true;
    if (ev === 'dismiss') visible = false;
    if (ev === 'refresh') visible = false;
  }
  return { visible };
}

export function testBannerStateMachine(): TestResult[] {
  const afterUpdate = simulateBannerLifecycle(['update']);
  const afterDismiss = simulateBannerLifecycle(['update', 'dismiss']);
  const afterRefresh = simulateBannerLifecycle(['update', 'refresh']);
  const noUpdate = simulateBannerLifecycle([]);
  const multipleUpdates = simulateBannerLifecycle(['update', 'dismiss', 'update']);

  return [
    assert(afterUpdate.visible, 'update event → баннер виден'),
    assert(!afterDismiss.visible, 'update → dismiss → баннер скрыт'),
    assert(!afterRefresh.visible, 'update → refresh → баннер скрыт'),
    assert(!noUpdate.visible, 'нет событий → баннер не виден'),
    assert(multipleUpdates.visible, 'update → dismiss → update → баннер снова виден'),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'sw-update: first-install guard', results: testFirstInstallGuard() },
    { title: 'sw-update: refresh path decision', results: testRefreshPath() },
    { title: 'sw-update: controllerchange once semantics', results: testOnceListener() },
    { title: 'sw-update: banner state machine', results: testBannerStateMachine() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('sw-update-flow', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();

  let passed = 0;
  let failed = 0;

  console.group('🔄 SW Update — flow smoke (J1)');
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