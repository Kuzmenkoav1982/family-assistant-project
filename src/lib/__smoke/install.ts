// Публичная точка входа для smoke-runner'ов в проде.
//
// Контракт (План B, B.2 acceptance-gate):
//   window.__smoke.help()         — печать списка доступных команд
//   await window.__smoke.portfolio()    — runAllPortfolioSmokeTests
//   await window.__smoke.development()  — runAllDevelopmentSmokeTests
//   await window.__smoke.all()    — портфолио + развитие подряд
//
// Жёсткие гарантии:
//   - только lazy import(), никакого auto-run
//   - сами smoke-модули не меняются
//   - вешается только в браузере (есть проверка window)
//   - non-enumerable, чтобы не светиться в Object.keys(window)
//   - все методы возвращают Promise — можно await

import type { SmokeReport } from './smokeReport';

type SmokeApi = {
  help: () => void;
  portfolio: () => Promise<void>;
  development: () => Promise<void>;
  memory: () => Promise<void>;
  auth: () => Promise<void>;
  all: () => Promise<void>;
  report: () => Promise<SmokeReport>;
  release: () => Promise<{ ok: boolean; failed: number }>;
};

declare global {
  interface Window {
    __smoke?: SmokeApi;
  }
}

async function runReport(): Promise<SmokeReport> {
  const { buildReport, printReport } = await import('./smokeReport');
  const [memMod, authMod] = await Promise.all([
    import('@/lib/memory/__smokeTests__'),
    import('@/lib/auth/__smokeTests__'),
  ]);
  const suites = [
    ...(await memMod.collectMemorySmokeResults()),
    ...(await authMod.collectAuthSmokeResults()),
  ];
  const report = buildReport(suites);
  printReport(report);
  return report;
}

async function runRelease(): Promise<{ ok: boolean; failed: number }> {
  const mod = await import('./releaseChecklist');
  return mod.runReleaseChecklist();
}

async function runMemory(): Promise<void> {
  const mod = await import('@/lib/memory/__smokeTests__');
  await mod.runAllMemorySmokeTests();
}

async function runAuth(): Promise<void> {
  const mod = await import('@/lib/auth/__smokeTests__');
  await mod.runAllAuthSmokeTests();
}

function printHelp(): void {
   
  console.group('🧪 window.__smoke — доступные команды');
   
  console.log('window.__smoke.help()              — эта подсказка');
   
  console.log('await window.__smoke.portfolio()   — Portfolio V1 (Hub + Member + SectionContract)');
   
  console.log('await window.__smoke.development() — раздел «Развитие» (Goals V1 + Portfolio V1)');
   
  console.log('await window.__smoke.memory()      — Memory guardrails (create/edit/link/section)');
   
  console.log('await window.__smoke.auth()        — Auth/session guardrails (identity, session decisions)');
   
  console.log('await window.__smoke.all()         — portfolio() + development() + memory() + auth() подряд');
   
  console.log('await window.__smoke.report()      — machine-readable JSON report (K1)');
   
  console.log('await window.__smoke.release()     — release checklist / canary discipline (K2)');
   
  console.groupEnd();
}

async function runPortfolio(): Promise<void> {
  const mod = await import('@/lib/portfolio/__smokeTests__');
  await mod.runAllPortfolioSmokeTests();
}

async function runDevelopment(): Promise<void> {
  const mod = await import('@/lib/development/__smokeTests__');
  await mod.runAllDevelopmentSmokeTests();
}

async function runAll(): Promise<void> {
   
  console.group('🧪 window.__smoke.all — полный прогон');
  const t0 = performance.now();
  await runPortfolio();
  await runDevelopment();
  await runMemory();
  await runAuth();
  const dt = Math.round(performance.now() - t0);
   
  console.log(`✅ window.__smoke.all завершён за ${dt} мс`);
   
  console.groupEnd();
}

if (typeof window !== 'undefined' && !window.__smoke) {
  const api: SmokeApi = {
    help: printHelp,
    portfolio: runPortfolio,
    development: runDevelopment,
    memory: runMemory,
    auth: runAuth,
    all: runAll,
    report: runReport,
    release: runRelease,
  };

  try {
    Object.defineProperty(window, '__smoke', {
      value: api,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  } catch {
     
    window.__smoke = api;
  }

   
  console.log('🧪 Smoke runners ready. Введи window.__smoke.help() для списка команд.');
}

export {};