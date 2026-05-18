// Umbrella-runner для smoke-тестов модуля memory (G2 guardrails).
//
// Использование в консоли браузера:
//   import('@/lib/memory/__smokeTests__').then(m => m.runAllMemorySmokeTests());
// Или через window.__smoke:
//   await window.__smoke.memory()

import * as create from './memoryCreate.smoke';
import * as edit from './memoryEdit.smoke';
import * as link from './memoryLink.smoke';
import * as section from './memorySection.smoke';

export async function runAllMemorySmokeTests(): Promise<void> {
  console.group('🧠 Memory — All smoke tests (G2)');
  const t0 = performance.now();
  await create.runAll();
  await edit.runAll();
  await link.runAll();
  await section.runAll();
  const dt = Math.round(performance.now() - t0);
  console.log(`✅ Memory прогон завершён за ${dt} мс`);
  console.groupEnd();
}

export { create, edit, link, section };
