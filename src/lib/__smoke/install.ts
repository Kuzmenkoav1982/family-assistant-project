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

type SmokeApi = {
  help: () => void;
  portfolio: () => Promise<void>;
  development: () => Promise<void>;
  all: () => Promise<void>;
};

declare global {
  interface Window {
    __smoke?: SmokeApi;
  }
}

function printHelp(): void {
   
  console.group('🧪 window.__smoke — доступные команды');
   
  console.log('window.__smoke.help()              — эта подсказка');
   
  console.log('await window.__smoke.portfolio()   — Portfolio V1 (Hub + Member + SectionContract)');
   
  console.log('await window.__smoke.development() — раздел «Развитие» (Goals V1 + Portfolio V1)');
   
  console.log('await window.__smoke.all()         — portfolio() + development() подряд');
   
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
  const dt = Math.round(performance.now() - t0);
   
  console.log(`✅ window.__smoke.all завершён за ${dt} мс`);
   
  console.groupEnd();
}

if (typeof window !== 'undefined' && !window.__smoke) {
  const api: SmokeApi = {
    help: printHelp,
    portfolio: runPortfolio,
    development: runDevelopment,
    all: runAll,
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
