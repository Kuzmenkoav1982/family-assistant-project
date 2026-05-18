/**
 * K1 — Machine-readable smoke report.
 *
 * Структурированный результат прогона smoke-тестов.
 * Используется для:
 *   - CI artifact / console.table
 *   - сравнения между релизами
 *   - window.__smoke.report() → JSON
 *
 * Контракт: каждый smoke-модуль должен экспортировать
 *   runAllCollect(): Promise<SmokeResult[]>
 * Если модуль ещё не поддерживает collect — используется
 *   consoleCapture: перехват console.error для подсчёта fail'ов (fallback).
 */

export interface SmokeTestResult {
  name: string;
  ok: boolean;
  details?: string;
}

export interface SmokeSuiteResult {
  suite: string;
  passed: number;
  failed: number;
  durationMs: number;
  tests: SmokeTestResult[];
}

export interface SmokeReport {
  totalPassed: number;
  totalFailed: number;
  totalDurationMs: number;
  suites: SmokeSuiteResult[];
  build: {
    commit: string;
    startedAt: string;
    mode: string;
  };
  ranAt: string;
}

// ─── Runner helper ────────────────────────────────────────────────────────────

/**
 * Запускает набор групп и возвращает SmokeSuiteResult.
 * Используется внутри smoke-модулей для collect-режима.
 */
export async function runSuite(
  suiteName: string,
  groups: Array<{
    title: string;
    results: SmokeTestResult[];
  }>,
): Promise<SmokeSuiteResult> {
  const t0 = performance.now();
  const tests: SmokeTestResult[] = [];

  for (const g of groups) {
    for (const r of g.results) {
      tests.push({ ...r, name: `${g.title}: ${r.name}` });
    }
  }

  const passed = tests.filter(t => t.ok).length;
  const failed = tests.filter(t => !t.ok).length;
  const durationMs = Math.round(performance.now() - t0);

  return { suite: suiteName, passed, failed, durationMs, tests };
}

// ─── Console printer (для backward-compat printAll) ───────────────────────────

export function printSuiteResult(suite: SmokeSuiteResult): void {
  console.group(`${suite.failed === 0 ? '✅' : '❌'} ${suite.suite} (${suite.passed}✓ ${suite.failed}✗ ${suite.durationMs}ms)`);
  for (const t of suite.tests) {
    if (t.ok) {
      console.log(`  ✓ ${t.name}`);
    } else {
      console.error(`  ✗ ${t.name}${t.details ? ' — ' + t.details : ''}`);
    }
  }
  console.groupEnd();
}

// ─── Report builder ───────────────────────────────────────────────────────────

export function buildReport(suites: SmokeSuiteResult[]): SmokeReport {
  const totalPassed = suites.reduce((s, r) => s + r.passed, 0);
  const totalFailed = suites.reduce((s, r) => s + r.failed, 0);
  const totalDurationMs = suites.reduce((s, r) => s + r.durationMs, 0);

  const build = typeof window !== 'undefined' && window.__APP_BUILD__
    ? {
        commit: window.__APP_BUILD__.commit,
        startedAt: window.__APP_BUILD__.startedAt,
        mode: window.__APP_BUILD__.mode,
      }
    : { commit: 'unknown', startedAt: 'unknown', mode: 'unknown' };

  return {
    totalPassed,
    totalFailed,
    totalDurationMs,
    suites,
    build,
    ranAt: new Date().toISOString(),
  };
}

// ─── Summary printer ──────────────────────────────────────────────────────────

export function printReport(report: SmokeReport): void {
  const status = report.totalFailed === 0 ? '✅ ALL PASSED' : `❌ ${report.totalFailed} FAILED`;
  console.group(`🧪 Smoke Report — ${status}`);
  console.log(`Passed: ${report.totalPassed} | Failed: ${report.totalFailed} | Duration: ${report.totalDurationMs}ms`);
  console.log(`Build: commit=${report.build.commit} mode=${report.build.mode}`);
  console.log(`Ran at: ${report.ranAt}`);
  console.table(
    report.suites.map(s => ({
      suite: s.suite,
      passed: s.passed,
      failed: s.failed,
      'ms': s.durationMs,
    }))
  );
  if (report.totalFailed > 0) {
    console.group('❌ Failed tests');
    for (const s of report.suites) {
      for (const t of s.tests.filter(x => !x.ok)) {
        console.error(`  [${s.suite}] ${t.name}${t.details ? ' — ' + t.details : ''}`);
      }
    }
    console.groupEnd();
  }
  console.groupEnd();
}
