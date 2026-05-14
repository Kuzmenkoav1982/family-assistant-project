// Единая точка запуска smoke-tests по разделу Portfolio.
//
// Использование в консоли браузера:
//   import('@/lib/portfolio/__smokeTests__').then(m => m.runAllPortfolioSmokeTests());
//
// Текущий состав (Sprint A — Hub):
//   - portfolioHubHelpers (форматирование, состояния карточек, summary, sort)

import * as hubHelpers from './portfolioHubHelpers.smoke';

export async function runAllPortfolioSmokeTests(): Promise<void> {
   
  console.group('🪞 Portfolio V1 — All smoke tests');
  const t0 = performance.now();
  await hubHelpers.runAll();
  const dt = Math.round(performance.now() - t0);
   
  console.log(`✅ Прогон завершён за ${dt} мс`);
   
  console.groupEnd();
}

export { hubHelpers };
