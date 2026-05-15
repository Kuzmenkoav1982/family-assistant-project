// Единая точка запуска smoke-tests по разделу Portfolio.
//
// Использование в консоли браузера:
//   import('@/lib/portfolio/__smokeTests__').then(m => m.runAllPortfolioSmokeTests());
//
// Текущий состав:
//   - portfolioHubHelpers        (Sprint A: формат, состояния карточек, summary, sort)
//   - portfolioMemberHelpers     (Sprint B.1: refresh-toast форматтер + trimOneLine)
//   - portfolioSectionContract   (Sprint B.2: invariant'ы обёртки секций)

import * as hubHelpers from './portfolioHubHelpers.smoke';
import * as memberHelpers from './portfolioMemberHelpers.smoke';
import * as sectionContract from './portfolioSectionContract.smoke';

export async function runAllPortfolioSmokeTests(): Promise<void> {
   
  console.group('🪞 Portfolio V1 — All smoke tests');
  const t0 = performance.now();
  await hubHelpers.runAll();
  await memberHelpers.runAll();
  await sectionContract.runAll();
  const dt = Math.round(performance.now() - t0);
   
  console.log(`✅ Прогон завершён за ${dt} мс`);
   
  console.groupEnd();
}

export { hubHelpers, memberHelpers, sectionContract };