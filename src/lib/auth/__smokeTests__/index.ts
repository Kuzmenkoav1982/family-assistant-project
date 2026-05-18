// Umbrella-runner для smoke-тестов auth/session (H1 guardrails).
//
// Использование в консоли браузера:
//   await window.__smoke.auth()

import * as identity from './identityResolver.smoke';
import * as session from './sessionDecisions.smoke';

export async function runAllAuthSmokeTests(): Promise<void> {
  console.group('🔑 Auth/Session — All smoke tests (H1)');
  const t0 = performance.now();
  await identity.runAll();
  await session.runAll();
  const dt = Math.round(performance.now() - t0);
  console.log(`✅ Auth прогон завершён за ${dt} мс`);
  console.groupEnd();
}

export { identity, session };
