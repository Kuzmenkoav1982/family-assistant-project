// Smoke-тесты для runtime/release границ (I3).
//
// Тестируем:
//   - window.__APP_BUILD__ существует и имеет ожидаемую форму
//   - window.__smoke существует и имеет все методы
//   - build-поля типизированы корректно (не undefined, строки)
//   - идемпотентность: повторный вызов initBuildInfo не ломает __APP_BUILD__
// Pure + browser-context (нужен window, но без HTTP и React).

import { BUILD_INFO, initBuildInfo, type AppBuildInfo } from '@/lib/buildInfo';
import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── BUILD_INFO модульный объект ──────────────────────────────────────────────

export function testBuildInfoShape(): TestResult[] {
  return [
    assert(typeof BUILD_INFO.commit === 'string', 'commit — строка'),
    assert(typeof BUILD_INFO.buildTime === 'string', 'buildTime — строка'),
    assert(typeof BUILD_INFO.mode === 'string', 'mode — строка'),
    assert(typeof BUILD_INFO.startedAt === 'string', 'startedAt — строка'),
    assert(BUILD_INFO.commit.length > 0, 'commit не пустой'),
    assert(BUILD_INFO.mode.length > 0, 'mode не пустой'),
    assert(BUILD_INFO.startedAt.length > 0, 'startedAt не пустой'),
  ];
}

export function testStartedAtIsIso(): TestResult[] {
  const d = new Date(BUILD_INFO.startedAt);
  return [
    assert(!isNaN(d.getTime()), 'startedAt — валидный ISO timestamp'),
    assert(d.getFullYear() >= 2026, 'startedAt год >= 2026 (реалистичная дата)'),
  ];
}

// ─── window.__APP_BUILD__ ─────────────────────────────────────────────────────

export function testWindowAppBuild(): TestResult[] {
  if (typeof window === 'undefined') {
    return [assert(false, 'window не доступен (SSR?)')];
  }

  const build = window.__APP_BUILD__;
  const expectedKeys: (keyof AppBuildInfo)[] = ['commit', 'buildTime', 'mode', 'startedAt'];

  return [
    assert(build !== undefined, 'window.__APP_BUILD__ существует'),
    assert(build !== null, 'window.__APP_BUILD__ не null'),
    ...expectedKeys.map(k =>
      assert(
        build != null && typeof build[k] === 'string',
        `__APP_BUILD__.${k} — строка`,
      )
    ),
    assert(
      build?.commit === BUILD_INFO.commit,
      '__APP_BUILD__.commit совпадает с BUILD_INFO.commit',
    ),
  ];
}

// ─── идемпотентность initBuildInfo ───────────────────────────────────────────

export function testInitBuildInfoIdempotent(): TestResult[] {
  if (typeof window === 'undefined') {
    return [assert(false, 'window не доступен')];
  }

  const before = window.__APP_BUILD__;

  // Повторный вызов не должен ломать и не должен бросать
  let threw = false;
  try {
    initBuildInfo();
    initBuildInfo();
  } catch {
    threw = true;
  }

  const after = window.__APP_BUILD__;

  return [
    assert(!threw, 'повторный initBuildInfo не бросает исключение'),
    assert(before === after, '__APP_BUILD__ не заменился при повторном вызове (same reference)'),
  ];
}

// ─── window.__smoke ───────────────────────────────────────────────────────────

export function testSmokeApiShape(): TestResult[] {
  if (typeof window === 'undefined') {
    return [assert(false, 'window не доступен')];
  }

  const smoke = window.__smoke;
  const methods = ['help', 'portfolio', 'development', 'memory', 'auth', 'all'] as const;

  return [
    assert(smoke !== undefined, 'window.__smoke существует'),
    ...methods.map(m =>
      assert(
        smoke != null && typeof smoke[m] === 'function',
        `window.__smoke.${m} — функция`,
      )
    ),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'runtime: BUILD_INFO shape', results: testBuildInfoShape() },
    { title: 'runtime: startedAt ISO timestamp', results: testStartedAtIsIso() },
    { title: 'runtime: window.__APP_BUILD__', results: testWindowAppBuild() },
    { title: 'runtime: initBuildInfo идемпотентен', results: testInitBuildInfoIdempotent() },
    { title: 'runtime: window.__smoke API shape', results: testSmokeApiShape() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('runtime-boundaries', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();

  let passed = 0;
  let failed = 0;

  console.group('🚀 Runtime — boundaries smoke (I3)');
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