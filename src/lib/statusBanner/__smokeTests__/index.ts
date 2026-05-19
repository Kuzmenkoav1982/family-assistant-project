// Единая точка запуска smoke-tests для Status Banner.
//
// import('@/lib/statusBanner/__smokeTests__').then(m => m.runAllStatusBannerSmokeTests());

import * as resolveActiveBanner from './resolveActiveBanner.smoke';

export async function runAllStatusBannerSmokeTests(): Promise<void> {
  console.group('🟡 Status Banner — All smoke tests');
  const t0 = performance.now();
  await resolveActiveBanner.runAll();
  const dt = Math.round(performance.now() - t0);
  console.log(`✅ Прогон завершён за ${dt} мс`);
  console.groupEnd();
}

export { resolveActiveBanner };
