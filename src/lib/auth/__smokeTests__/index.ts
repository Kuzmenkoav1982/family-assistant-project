// Umbrella-runner для smoke-тестов auth/session (H1 guardrails).
//
// Использование в консоли браузера:
//   await window.__smoke.auth()

import * as identity from './identityResolver.smoke';
import * as session from './sessionDecisions.smoke';
import * as runtime from './runtimeBoundaries.smoke';
import * as swUpdate from './swUpdateFlow.smoke';
import * as regression from './regressionPack.smoke';
import type { SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

export async function runAllAuthSmokeTests(): Promise<void> {
  console.group('🔑 Auth/Session — All smoke tests (H1+I3+J1+J2)');
  const t0 = performance.now();
  await identity.runAll();
  await session.runAll();
  await runtime.runAll();
  await swUpdate.runAll();
  await regression.runAll();
  const dt = Math.round(performance.now() - t0);
  console.log(`✅ Auth прогон завершён за ${dt} мс`);
  console.groupEnd();
}

export async function collectAuthSmokeResults(): Promise<SmokeSuiteResult[]> {
  return Promise.all([
    identity.runAllCollect(),
    session.runAllCollect(),
    runtime.runAllCollect(),
    swUpdate.runAllCollect(),
    regression.runAllCollect(),
  ]);
}

export { identity, session, runtime, swUpdate, regression };