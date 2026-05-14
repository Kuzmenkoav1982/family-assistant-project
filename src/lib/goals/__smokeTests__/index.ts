// Единая точка запуска smoke-tests по модулю Goals V1.
//
// Использование в консоли браузера:
//   import('@/lib/goals/__smokeTests__').then(m => m.runAllGoalsSmokeTests());
//
// Прогоняет все группы по очереди (SMART → OKR → Wheel → Shared flow → Hub)
// и печатает суммарный отчёт.

import * as smart from './smartPolish.smoke';
import * as okr from './okrPolish.smoke';
import * as wheel from './wheelPolish.smoke';
import * as shared from './sharedFlow.smoke';
import * as hub from './hubHelpers.smoke';
import * as weekly from './weeklyReview.smoke';
import * as narrative from './weeklyNarrative.smoke';
import * as focus from './focusQueue.smoke';

export async function runAllGoalsSmokeTests(): Promise<void> {
   
  console.group('🎯 Goals V1 — All smoke tests');
  const t0 = performance.now();
  await smart.runAll();
  await okr.runAll();
  await wheel.runAll();
  await shared.runAll();
  await hub.runAll();
  await weekly.runAll();
  await narrative.runAll();
  await focus.runAll();
  const dt = Math.round(performance.now() - t0);
   
  console.log(`✅ Прогон завершён за ${dt} мс`);
   
  console.groupEnd();
}

// Экспортируем отдельные runner'ы — если нужно прогнать только один блок.
export { smart, okr, wheel, shared, hub, weekly, narrative, focus };