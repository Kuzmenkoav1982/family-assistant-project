// Smoke-тесты для session-dependent decisions (H1 auth/session guardrails).
//
// Тестируем pure-логику принятия решений на основе session:
//   - shouldFetchWithIdentity: когда идти в сеть, когда нет
//   - onAuthChanged: сброс lastCheck + немедленный re-check
//   - guard-поведение medicationNotifications
//   - guard-поведение familyTraditions
// Без DOM, без React, без localStorage.

import { readNormalizedIdentityFromStorage } from '@/lib/identity';
import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

function makeStorage(data: Record<string, string>): (key: string) => string | null {
  return (key: string) => data[key] ?? null;
}

function makeUserJson(fields: Record<string, unknown>): string {
  return JSON.stringify(fields);
}

// ─── shouldFetchWithMemberId: логика healthApi / medicationNotifications ───────
// Воспроизводим guard: if (!readActorMemberId()) return

function shouldFetchForHealth(read: (k: string) => string | null): boolean {
  const id = readNormalizedIdentityFromStorage(read);
  return id.actorMemberId !== null;
}

export function testHealthGuard(): TestResult[] {
  const withMember = makeStorage({
    userData: makeUserJson({ id: 'u1', member_id: 'm1' }),
    authToken: 'tok',
  });
  const withoutMember = makeStorage({
    userData: makeUserJson({ id: 'u1' }),
    authToken: 'tok',
  });
  const noSession = makeStorage({});
  const memberIdIsEmpty = makeStorage({
    userData: makeUserJson({ id: 'u1', member_id: '' }),
    authToken: 'tok',
  });

  return [
    assert(shouldFetchForHealth(withMember) === true, 'есть member_id → fetch разрешён'),
    assert(shouldFetchForHealth(withoutMember) === false, 'нет member_id → fetch запрещён (guard)'),
    assert(shouldFetchForHealth(noSession) === false, 'нет сессии → fetch запрещён'),
    assert(shouldFetchForHealth(memberIdIsEmpty) === false, 'пустой member_id → fetch запрещён'),
  ];
}

// ─── shouldFetchWithUserId: логика familyTraditions ───────────────────────────
// Воспроизводим guard: if (!readActorUserId()) return

function shouldFetchForTraditions(read: (k: string) => string | null): boolean {
  const id = readNormalizedIdentityFromStorage(read);
  return id.actorUserId !== null;
}

export function testTraditionsGuard(): TestResult[] {
  const withUser = makeStorage({
    userData: makeUserJson({ id: 'u1' }),
    authToken: 'tok',
  });
  const withLegacyUserId = makeStorage({
    userData: makeUserJson({ user_id: 'u2' }),
    authToken: 'tok',
  });
  const noUser = makeStorage({
    userData: makeUserJson({ member_id: 'm1' }), // только member, нет id
    authToken: 'tok',
  });
  const noSession = makeStorage({});

  return [
    assert(shouldFetchForTraditions(withUser) === true, 'есть id → fetch разрешён'),
    assert(shouldFetchForTraditions(withLegacyUserId) === true, 'user_id legacy → fetch разрешён'),
    assert(shouldFetchForTraditions(noUser) === false, 'нет id и нет user_id → fetch запрещён'),
    assert(shouldFetchForTraditions(noSession) === false, 'нет сессии → fetch запрещён'),
  ];
}

// ─── onAuthChanged: сброс lastCheck ───────────────────────────────────────────
// Воспроизводим логику onAuthChanged() без зависимости от класса

interface MockNotificationState {
  lastCheck: string;
  checkCalledCount: number;
}

function simulateOnAuthChanged(state: MockNotificationState): void {
  state.lastCheck = '';
  state.checkCalledCount++;
}

function simulateCheckReminders(
  state: MockNotificationState,
  currentMinute: string,
  hasMemberId: boolean,
): 'skipped-no-auth' | 'skipped-same-minute' | 'checked' {
  if (!hasMemberId) return 'skipped-no-auth';
  if (state.lastCheck === currentMinute) return 'skipped-same-minute';
  state.lastCheck = currentMinute;
  return 'checked';
}

export function testOnAuthChangedResetsLastCheck(): TestResult[] {
  const state: MockNotificationState = { lastCheck: '14:30', checkCalledCount: 0 };
  simulateOnAuthChanged(state);
  return [
    assert(state.lastCheck === '', 'onAuthChanged сбрасывает lastCheck в ""'),
    assert(state.checkCalledCount === 1, 'onAuthChanged вызывает checkReminders'),
  ];
}

export function testLastCheckPreventsDoubleCheck(): TestResult[] {
  const state: MockNotificationState = { lastCheck: '', checkCalledCount: 0 };
  const result1 = simulateCheckReminders(state, '14:30', true);
  const result2 = simulateCheckReminders(state, '14:30', true);
  return [
    assert(result1 === 'checked', 'первый check в 14:30 → выполнен'),
    assert(result2 === 'skipped-same-minute', 'второй check в 14:30 → пропущен (same minute)'),
    assert(state.lastCheck === '14:30', 'lastCheck = "14:30" после первого check'),
  ];
}

export function testAfterAuthChangedImmediateRecheck(): TestResult[] {
  const state: MockNotificationState = { lastCheck: '14:30', checkCalledCount: 0 };

  // Прошёл check в 14:30
  simulateCheckReminders(state, '14:30', true);

  // Auth изменился (login) — сброс
  simulateOnAuthChanged(state);
  assert(state.lastCheck === '', 'после onAuthChanged lastCheck = ""');

  // Немедленный recheck в той же минуте теперь ДОЛЖЕН пройти
  const result = simulateCheckReminders(state, '14:30', true);

  return [
    assert(result === 'checked', 'после onAuthChanged() recheck проходит даже в той же минуте'),
    assert(state.checkCalledCount === 1, 'onAuthChanged вызвал checkReminders один раз'),
  ];
}

export function testGuardBlocksWhenNoMemberId(): TestResult[] {
  const state: MockNotificationState = { lastCheck: '', checkCalledCount: 0 };

  // Попытка check без member_id
  const result1 = simulateCheckReminders(state, '14:30', false);
  const result2 = simulateCheckReminders(state, '14:31', false);

  return [
    assert(result1 === 'skipped-no-auth', '14:30 без auth → пропущен'),
    assert(result2 === 'skipped-no-auth', '14:31 без auth → пропущен (guard срабатывает до lastCheck)'),
    assert(state.lastCheck === '', 'lastCheck НЕ обновляется при blocked check'),
  ];
}

export function testGuardAllowsAfterLogin(): TestResult[] {
  const state: MockNotificationState = { lastCheck: '', checkCalledCount: 0 };

  // До логина — блокируется
  const before = simulateCheckReminders(state, '14:30', false);

  // Auth изменился (login)
  simulateOnAuthChanged(state);

  // После логина — проходит
  const after = simulateCheckReminders(state, '14:30', true);

  return [
    assert(before === 'skipped-no-auth', 'до логина → blocked'),
    assert(after === 'checked', 'после onAuthChanged + login → check проходит'),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'session: health guard (member_id)', results: testHealthGuard() },
    { title: 'session: traditions guard (user_id)', results: testTraditionsGuard() },
    { title: 'session: onAuthChanged сбрасывает lastCheck', results: testOnAuthChangedResetsLastCheck() },
    { title: 'session: lastCheck предотвращает двойной check', results: testLastCheckPreventsDoubleCheck() },
    { title: 'session: после onAuthChanged — немедленный recheck', results: testAfterAuthChangedImmediateRecheck() },
    { title: 'session: guard блокирует без memberId', results: testGuardBlocksWhenNoMemberId() },
    { title: 'session: guard пропускает после логина', results: testGuardAllowsAfterLogin() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('session-decisions', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();

  let passed = 0;
  let failed = 0;

  console.group('🔐 Auth — session decisions smoke');
  for (const g of groups) {
    console.group(g.title);
    for (const r of g.results) {
      if (r.ok) {
        passed++;
        console.log(`  ✓ ${r.name}`);
      } else {
        failed++;
        console.error(`  ✗ ${r.name}${r.details ? ' — ' + r.details : ''}`);
      }
    }
    console.groupEnd();
  }
  console.log(`Итого: ${passed} прошло, ${failed} упало`);
  console.groupEnd();
}