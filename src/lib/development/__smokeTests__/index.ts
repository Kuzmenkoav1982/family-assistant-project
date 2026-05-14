// Umbrella-runner для всего раздела «Развитие».
//
// Прогоняет smoke-наборы по всем подразделам и печатает суммарный отчёт.
// На текущем этапе:
//   - Goals V1 (frozen)
//   - Portfolio V1 (Wave 2 — в работе)
//
// Использование в консоли браузера:
//   import('@/lib/development/__smokeTests__').then(m => m.runAllDevelopmentSmokeTests());

import { runAllGoalsSmokeTests } from '@/lib/goals/__smokeTests__';
import { runAllPortfolioSmokeTests } from '@/lib/portfolio/__smokeTests__';

export async function runAllDevelopmentSmokeTests(): Promise<void> {
   
  console.group('🚀 Развитие — All smoke tests');
  const t0 = performance.now();
  await runAllGoalsSmokeTests();
  await runAllPortfolioSmokeTests();
  const dt = Math.round(performance.now() - t0);
   
  console.log(`✅ Прогон по разделу завершён за ${dt} мс`);
   
  console.groupEnd();
}
