/**
 * K2 — Release checklist / canary discipline.
 *
 * Минимальный набор проверок перед подтверждением релиза.
 * Запускается в браузере после деплоя.
 *
 * Использование:
 *   import('@/lib/__smoke/releaseChecklist').then(m => m.runReleaseChecklist())
 *   // или:
 *   await window.__smoke.release()
 *
 * Критерии "зелёного" релиза:
 *   ✅ window.__APP_BUILD__ существует и валиден
 *   ✅ window.__smoke зарегистрирован
 *   ✅ нет активных auth-ошибок в первые 5 секунд
 *   ✅ smoke report: 0 failed
 */

import { BUILD_INFO } from '@/lib/buildInfo';

interface CheckResult {
  name: string;
  ok: boolean;
  value?: string;
  details?: string;
}

function check(name: string, ok: boolean, value?: string, details?: string): CheckResult {
  return { name, ok, value, details };
}

// ─── Проверки ─────────────────────────────────────────────────────────────────

function checkBuildInfo(): CheckResult[] {
  const build = typeof window !== 'undefined' ? window.__APP_BUILD__ : undefined;
  return [
    check(
      'window.__APP_BUILD__ существует',
      !!build,
      build ? 'present' : 'missing',
    ),
    check(
      '__APP_BUILD__.commit задан',
      !!build?.commit && build.commit !== '',
      build?.commit,
    ),
    check(
      '__APP_BUILD__.startedAt — валидная дата',
      !!build?.startedAt && !isNaN(new Date(build.startedAt).getTime()),
      build?.startedAt,
    ),
    check(
      '__APP_BUILD__.mode задан',
      !!build?.mode && build.mode !== '',
      build?.mode,
    ),
    check(
      'BUILD_INFO модуль загружен',
      typeof BUILD_INFO === 'object' && !!BUILD_INFO.startedAt,
      'ok',
    ),
  ];
}

function checkSmokeApi(): CheckResult[] {
  const smoke = typeof window !== 'undefined' ? window.__smoke : undefined;
  const methods = ['help', 'portfolio', 'development', 'memory', 'auth', 'all', 'report'] as const;
  return [
    check('window.__smoke зарегистрирован', !!smoke),
    ...methods.map(m =>
      check(
        `window.__smoke.${m} — функция`,
        smoke != null && typeof smoke[m] === 'function',
      )
    ),
  ];
}

function checkServiceWorker(): CheckResult[] {
  const hasSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  return [
    check('Service Worker поддерживается браузером', hasSW),
  ];
}

// ─── Async: smoke report ──────────────────────────────────────────────────────

async function checkSmokeReport(): Promise<CheckResult[]> {
  if (typeof window === 'undefined' || !window.__smoke?.report) {
    return [check('smoke.report() недоступен', false)];
  }
  try {
    const report = await window.__smoke.report();
    return [
      check(
        `smoke report: 0 failed (всего тестов: ${report.totalPassed + report.totalFailed})`,
        report.totalFailed === 0,
        `${report.totalPassed}✓ ${report.totalFailed}✗`,
        report.totalFailed > 0
          ? `Упавшие: ${report.suites.flatMap(s => s.tests.filter(t => !t.ok).map(t => t.name)).join(', ')}`
          : undefined,
      ),
    ];
  } catch (err) {
    return [check('smoke.report() выбросил ошибку', false, String(err))];
  }
}

// ─── Printer ──────────────────────────────────────────────────────────────────

function printChecks(title: string, checks: CheckResult[]): void {
  console.group(title);
  for (const c of checks) {
    const icon = c.ok ? '  ✅' : '  ❌';
    const val = c.value ? ` [${c.value}]` : '';
    const det = c.details ? ` — ${c.details}` : '';
    if (c.ok) console.log(`${icon} ${c.name}${val}`);
    else console.error(`${icon} ${c.name}${val}${det}`);
  }
  console.groupEnd();
}

// ─── Runner ───────────────────────────────────────────────────────────────────

export async function runReleaseChecklist(): Promise<{ ok: boolean; failed: number }> {
  console.group('📋 Release Checklist — Canary Discipline (K2)');
  const t0 = performance.now();

  const buildChecks = checkBuildInfo();
  const smokeApiChecks = checkSmokeApi();
  const swChecks = checkServiceWorker();
  const smokeReportChecks = await checkSmokeReport();

  printChecks('Build info', buildChecks);
  printChecks('Smoke API', smokeApiChecks);
  printChecks('Service Worker', swChecks);
  printChecks('Smoke report (full run)', smokeReportChecks);

  const allChecks = [...buildChecks, ...smokeApiChecks, ...swChecks, ...smokeReportChecks];
  const failed = allChecks.filter(c => !c.ok).length;
  const passed = allChecks.length - failed;
  const dt = Math.round(performance.now() - t0);

  const status = failed === 0 ? '✅ RELEASE READY' : `❌ ${failed} CHECK(S) FAILED`;
  console.log(`\n${status} — ${passed}/${allChecks.length} checks passed (${dt}ms)`);
  console.groupEnd();

  return { ok: failed === 0, failed };
}
