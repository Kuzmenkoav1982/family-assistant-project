// Smoke-тесты для identity adapter (H1 auth/session guardrails).
//
// readNormalizedIdentityFromStorage — pure функция с инжектируемым storage reader.
// Тестируем без DOM, без React, без localStorage.
//
// Сценарии:
//   - пустой storage → все поля null
//   - canonical keys (userData / authToken)
//   - legacy keys (user_data / auth_token, user / auth_token)
//   - member_id vs memberId (оба формата)
//   - family_id vs familyId (оба формата)
//   - user_id legacy alias для actorUserId
//   - невалидный JSON → null, не бросает исключение
//   - приоритет ключей (userData первым, если оба есть)

import { readNormalizedIdentityFromStorage } from '@/lib/identity';
import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStorage(data: Record<string, string>): (key: string) => string | null {
  return (key: string) => data[key] ?? null;
}

function makeUser(fields: Record<string, unknown>): string {
  return JSON.stringify(fields);
}

// ─── пустой storage ───────────────────────────────────────────────────────────

export function testEmptyStorage(): TestResult[] {
  const id = readNormalizedIdentityFromStorage(makeStorage({}));
  return [
    assert(id.actorUserId === null, 'пустой storage → actorUserId null'),
    assert(id.actorMemberId === null, 'пустой storage → actorMemberId null'),
    assert(id.actorFamilyId === null, 'пустой storage → actorFamilyId null'),
    assert(id.authToken === null, 'пустой storage → authToken null'),
    assert(id.userSourceKey === null, 'пустой storage → userSourceKey null'),
    assert(id.tokenSourceKey === null, 'пустой storage → tokenSourceKey null'),
  ];
}

// ─── canonical keys ───────────────────────────────────────────────────────────

export function testCanonicalKeys(): TestResult[] {
  const store = makeStorage({
    userData: makeUser({ id: 'u1', member_id: 'm1', family_id: 'f1' }),
    authToken: 'tok-abc',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === 'u1', 'canonical userData → actorUserId'),
    assert(id.actorMemberId === 'm1', 'canonical userData → actorMemberId'),
    assert(id.actorFamilyId === 'f1', 'canonical userData → actorFamilyId'),
    assert(id.authToken === 'tok-abc', 'canonical authToken → authToken'),
    assert(id.userSourceKey === 'userData', 'userSourceKey = "userData"'),
    assert(id.tokenSourceKey === 'authToken', 'tokenSourceKey = "authToken"'),
  ];
}

// ─── legacy keys ──────────────────────────────────────────────────────────────

export function testLegacyUserDataKey(): TestResult[] {
  const store = makeStorage({
    user_data: makeUser({ id: 'u2', member_id: 'm2' }),
    auth_token: 'tok-legacy',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === 'u2', 'legacy user_data → actorUserId'),
    assert(id.actorMemberId === 'm2', 'legacy user_data → actorMemberId'),
    assert(id.authToken === 'tok-legacy', 'legacy auth_token → authToken'),
    assert(id.userSourceKey === 'user_data', 'userSourceKey = "user_data"'),
    assert(id.tokenSourceKey === 'auth_token', 'tokenSourceKey = "auth_token"'),
  ];
}

export function testLegacyUserKey(): TestResult[] {
  const store = makeStorage({
    user: makeUser({ id: 'u3', member_id: 'm3' }),
    authToken: 'tok-u3',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === 'u3', 'legacy "user" key → actorUserId'),
    assert(id.actorMemberId === 'm3', 'legacy "user" key → actorMemberId'),
    assert(id.userSourceKey === 'user', 'userSourceKey = "user"'),
  ];
}

// ─── приоритет ключей ─────────────────────────────────────────────────────────

export function testUserKeyPriority(): TestResult[] {
  // userData должен победить user_data и user
  const store = makeStorage({
    userData: makeUser({ id: 'canonical', member_id: 'mc' }),
    user_data: makeUser({ id: 'legacy1', member_id: 'ml1' }),
    user: makeUser({ id: 'legacy2', member_id: 'ml2' }),
    authToken: 'tok',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === 'canonical', 'userData приоритетнее user_data и user'),
    assert(id.userSourceKey === 'userData', 'userSourceKey = "userData" (первый найденный)'),
  ];
}

export function testTokenKeyPriority(): TestResult[] {
  const store = makeStorage({
    userData: makeUser({ id: 'u', member_id: 'm' }),
    authToken: 'canonical-token',
    auth_token: 'legacy-token',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.authToken === 'canonical-token', 'authToken приоритетнее auth_token'),
    assert(id.tokenSourceKey === 'authToken', 'tokenSourceKey = "authToken"'),
  ];
}

// ─── member_id алиасы ─────────────────────────────────────────────────────────

export function testMemberIdAliases(): TestResult[] {
  const store1 = makeStorage({
    userData: makeUser({ id: 'u', member_id: 'mid-snake' }),
    authToken: 'tok',
  });
  const store2 = makeStorage({
    userData: makeUser({ id: 'u', memberId: 'mid-camel' }),
    authToken: 'tok',
  });
  const id1 = readNormalizedIdentityFromStorage(store1);
  const id2 = readNormalizedIdentityFromStorage(store2);
  return [
    assert(id1.actorMemberId === 'mid-snake', 'member_id (snake_case) → actorMemberId'),
    assert(id2.actorMemberId === 'mid-camel', 'memberId (camelCase) → actorMemberId'),
  ];
}

// ─── family_id алиасы ────────────────────────────────────────────────────────

export function testFamilyIdAliases(): TestResult[] {
  const store1 = makeStorage({
    userData: makeUser({ id: 'u', family_id: 'fid-snake' }),
    authToken: 'tok',
  });
  const store2 = makeStorage({
    userData: makeUser({ id: 'u', familyId: 'fid-camel' }),
    authToken: 'tok',
  });
  const id1 = readNormalizedIdentityFromStorage(store1);
  const id2 = readNormalizedIdentityFromStorage(store2);
  return [
    assert(id1.actorFamilyId === 'fid-snake', 'family_id (snake_case) → actorFamilyId'),
    assert(id2.actorFamilyId === 'fid-camel', 'familyId (camelCase) → actorFamilyId'),
  ];
}

// ─── user_id legacy alias для actorUserId ────────────────────────────────────

export function testUserIdLegacyAlias(): TestResult[] {
  const store = makeStorage({
    userData: makeUser({ user_id: 'uid-legacy' }), // нет поля id
    authToken: 'tok',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === 'uid-legacy', 'user_id legacy alias → actorUserId'),
  ];
}

// ─── невалидный / пустой JSON ─────────────────────────────────────────────────

export function testInvalidJson(): TestResult[] {
  const store = makeStorage({
    userData: '{not valid json}',
    authToken: 'tok',
  });
  let threw = false;
  let id;
  try {
    id = readNormalizedIdentityFromStorage(store);
  } catch {
    threw = true;
  }
  return [
    assert(!threw, 'невалидный JSON → не бросает исключение'),
    assert(id?.actorUserId === null, 'невалидный JSON → actorUserId null'),
    assert(id?.authToken === 'tok', 'authToken читается независимо от userData'),
  ];
}

export function testEmptyStringJson(): TestResult[] {
  const store = makeStorage({
    userData: '',
    authToken: 'tok',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === null, 'пустая строка userData → actorUserId null'),
    assert(id.authToken === 'tok', 'authToken читается'),
  ];
}

export function testNonObjectJson(): TestResult[] {
  const store = makeStorage({
    userData: '"just a string"',
    authToken: 'tok',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === null, 'JSON-строка вместо объекта → actorUserId null'),
  ];
}

// ─── пользователь без семьи (нет member_id) ──────────────────────────────────

export function testUserWithoutFamily(): TestResult[] {
  const store = makeStorage({
    userData: makeUser({ id: 'u-solo' }), // нет member_id, нет family_id
    authToken: 'tok',
  });
  const id = readNormalizedIdentityFromStorage(store);
  return [
    assert(id.actorUserId === 'u-solo', 'actorUserId есть'),
    assert(id.actorMemberId === null, 'нет member_id → actorMemberId null'),
    assert(id.actorFamilyId === null, 'нет family_id → actorFamilyId null'),
    assert(id.authToken === 'tok', 'authToken есть'),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'identity: пустой storage', results: testEmptyStorage() },
    { title: 'identity: canonical keys', results: testCanonicalKeys() },
    { title: 'identity: legacy user_data key', results: testLegacyUserDataKey() },
    { title: 'identity: legacy "user" key', results: testLegacyUserKey() },
    { title: 'identity: приоритет userData', results: testUserKeyPriority() },
    { title: 'identity: приоритет authToken', results: testTokenKeyPriority() },
    { title: 'identity: member_id алиасы', results: testMemberIdAliases() },
    { title: 'identity: family_id алиасы', results: testFamilyIdAliases() },
    { title: 'identity: user_id legacy alias', results: testUserIdLegacyAlias() },
    { title: 'identity: невалидный JSON', results: testInvalidJson() },
    { title: 'identity: пустая строка JSON', results: testEmptyStringJson() },
    { title: 'identity: JSON-строка вместо объекта', results: testNonObjectJson() },
    { title: 'identity: пользователь без семьи', results: testUserWithoutFamily() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('identity-resolver', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();
  let passed = 0;
  let failed = 0;
  console.group('🔑 Auth — identity resolver smoke');
  for (const g of groups) {
    console.group(g.title);
    for (const r of g.results) {
      if (r.ok) { passed++; console.log(`  ✓ ${r.name}`); }
      else { failed++; console.error(`  ✗ ${r.name}${r.details ? ' — ' + r.details : ''}`); }
    }
    console.groupEnd();
  }
  console.log(`Итого: ${passed} прошло, ${failed} упало`);
  console.groupEnd();
}