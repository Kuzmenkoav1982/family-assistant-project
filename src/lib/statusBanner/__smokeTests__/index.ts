// Единая точка запуска smoke-tests для Status Banner.
//
// import('@/lib/statusBanner/__smokeTests__').then(m => m.runAllStatusBannerSmokeTests());
//
// Состав:
//   - resolveActiveBanner  — pure resolver (B1)
//   - classifyBanner       — admin lifecycle (active/scheduled/disabled/expired)
//   - dismissedTtl         — TTL/cleanup/legacy migration
//   - shellRoutes          — единый hidden-route matcher (B3.5)
//   - suggestions          — rule-based suggestion engine + NO-AUTOPUBLISH guard (B4)

import * as resolveActiveBanner from './resolveActiveBanner.smoke';
import * as classifyBanner from './classifyBanner.smoke';
import * as dismissedTtl from './dismissedTtl.smoke';
import * as shellRoutes from './shellRoutes.smoke';
import * as suggestions from './suggestions.smoke';

export async function runAllStatusBannerSmokeTests(): Promise<void> {
  console.group('🟡 Status Banner — All smoke tests');
  const t0 = performance.now();
  await resolveActiveBanner.runAll();
  await classifyBanner.runAll();
  await dismissedTtl.runAll();
  await shellRoutes.runAll();
  await suggestions.runAll();
  const dt = Math.round(performance.now() - t0);
  console.log(`✅ Прогон завершён за ${dt} мс`);
  console.groupEnd();
}

export { resolveActiveBanner, classifyBanner, dismissedTtl, shellRoutes, suggestions };
