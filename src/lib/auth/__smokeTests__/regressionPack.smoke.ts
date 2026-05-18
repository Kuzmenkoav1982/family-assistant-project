// J2 — Top-flow regression pack.
//
// Покрывает самые рискованные продуктовые сценарии как pure state-machine тесты:
//   1. login/logout: saveAuthSession / clearAuthSession / hasAuthSession
//   2. same-tab + cross-tab: AUTH_SESSION_EVENT + storage event эмиссия
//   3. memory: guard перед getActorMemberId (кидает, если нет member_id)
//   4. traditions: buildHeaders с/без userId
//   5. medications polling: guard + re-check после login
//   6. member/event section: entry flow guard (нужен memberId или eventId)
// Без DOM, без HTTP, без React.

import {
  saveAuthSession,
  clearAuthSession,
  hasAuthSession,
  AUTH_SESSION_EVENT,
  type AuthSession,
} from '@/lib/authStorage';
import { readNormalizedIdentityFromStorage } from '@/lib/identity';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeSession(fields: Record<string, unknown> = {}): AuthSession {
  return {
    token: 'test-tok-abc',
    user: { id: 'u1', member_id: 'm1', family_id: 'f1', ...fields },
  };
}

// ─── 1. login / logout flow ───────────────────────────────────────────────────

export function testLoginFlow(): TestResult[] {
  clearAuthSession();

  const before = hasAuthSession();
  saveAuthSession(makeSession());
  const after = hasAuthSession();

  return [
    assert(!before, 'до логина: hasAuthSession = false'),
    assert(after, 'после saveAuthSession: hasAuthSession = true'),
  ];
}

export function testLogoutFlow(): TestResult[] {
  saveAuthSession(makeSession());
  clearAuthSession();

  return [
    assert(!hasAuthSession(), 'после clearAuthSession: hasAuthSession = false'),
  ];
}

export function testSaveSessionWritesAllKeys(): TestResult[] {
  clearAuthSession();
  saveAuthSession(makeSession({ id: 'u99', member_id: 'mx' }));

  const read = (k: string) =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;

  const id = readNormalizedIdentityFromStorage(read);

  return [
    assert(id.actorUserId === 'u99', 'saveAuthSession → actorUserId читается'),
    assert(id.actorMemberId === 'mx', 'saveAuthSession → actorMemberId читается'),
    assert(id.authToken === 'test-tok-abc', 'saveAuthSession → authToken читается'),
  ];
}

export function testClearSessionRemovesAllKeys(): TestResult[] {
  saveAuthSession(makeSession());
  clearAuthSession();

  const read = (k: string) =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;

  const id = readNormalizedIdentityFromStorage(read);

  return [
    assert(id.actorUserId === null, 'clearAuthSession → actorUserId null'),
    assert(id.actorMemberId === null, 'clearAuthSession → actorMemberId null'),
    assert(id.authToken === null, 'clearAuthSession → authToken null'),
  ];
}

export function testIncompleteSessionRejected(): TestResult[] {
  const results: TestResult[] = [];
  clearAuthSession();

  // Нет token
  saveAuthSession({ token: '', user: { id: 'u1' } } as AuthSession);
  results.push(assert(!hasAuthSession(), 'пустой token → сессия не сохранена'));

  // Нет user
  saveAuthSession({ token: 'tok', user: null as unknown as AuthSession['user'] });
  results.push(assert(!hasAuthSession(), 'null user → сессия не сохранена'));

  return results;
}

// ─── 2. AUTH_SESSION_EVENT эмиссия ────────────────────────────────────────────

export function testAuthEventEmitted(): TestResult[] {
  if (typeof window === 'undefined') {
    return [assert(false, 'window не доступен')];
  }

  const events: string[] = [];
  const handler = (e: Event) => events.push((e as CustomEvent).type);

  window.addEventListener(AUTH_SESSION_EVENT, handler);

  saveAuthSession(makeSession());
  clearAuthSession();

  window.removeEventListener(AUTH_SESSION_EVENT, handler);

  return [
    assert(events.length >= 2, `AUTH_SESSION_EVENT отправлен минимум 2 раза (получено: ${events.length})`),
    assert(events.every(t => t === AUTH_SESSION_EVENT), 'все события — AUTH_SESSION_EVENT'),
  ];
}

// ─── 3. memory guard: getActorMemberId ────────────────────────────────────────
// Воспроизводим логику из memory/api.ts

function getActorMemberIdGuard(read: (k: string) => string | null): string {
  const id = readNormalizedIdentityFromStorage(read).actorMemberId;
  if (!id) throw new Error('Не найден member_id. Войдите в аккаунт заново.');
  return id;
}

export function testMemoryApiGuard(): TestResult[] {
  const withMember = (k: string) =>
    ({ userData: JSON.stringify({ id: 'u', member_id: 'mx' }), authToken: 'tok' } as Record<string, string>)[k] ?? null;
  const noMember = (k: string) =>
    ({ userData: JSON.stringify({ id: 'u' }), authToken: 'tok' } as Record<string, string>)[k] ?? null;
  const noSession = (_k: string) => null;

  let threw1 = false, threw2 = false;
  let result = '';
  try { result = getActorMemberIdGuard(withMember); } catch { threw1 = true; }
  try { getActorMemberIdGuard(noMember); } catch { threw2 = true; }
  let threw3 = false;
  try { getActorMemberIdGuard(noSession); } catch { threw3 = true; }

  return [
    assert(!threw1 && result === 'mx', 'есть member_id → возвращает id без ошибки'),
    assert(threw2, 'нет member_id → кидает ошибку'),
    assert(threw3, 'нет сессии → кидает ошибку'),
  ];
}

// ─── 4. traditions: buildHeaders ─────────────────────────────────────────────

function buildTraditionsHeaders(read: (k: string) => string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const uid = readNormalizedIdentityFromStorage(read).actorUserId;
  if (uid) headers['X-User-Id'] = uid;
  return headers;
}

export function testTraditionsHeaders(): TestResult[] {
  const withUser = (k: string) =>
    ({ userData: JSON.stringify({ id: 'uid-1' }), authToken: 'tok' } as Record<string, string>)[k] ?? null;
  const noUser = (_k: string) => null;

  const h1 = buildTraditionsHeaders(withUser);
  const h2 = buildTraditionsHeaders(noUser);

  return [
    assert(h1['X-User-Id'] === 'uid-1', 'есть userId → X-User-Id в заголовках'),
    assert(h1['Content-Type'] === 'application/json', 'Content-Type всегда присутствует'),
    assert(!('X-User-Id' in h2), 'нет userId → X-User-Id отсутствует (запрос вернёт 401)'),
  ];
}

// ─── 5. medications polling guard ────────────────────────────────────────────

interface PollingState { lastCheck: string; }

function simulateCheck(state: PollingState, hasMemberId: boolean, minute: string): 'blocked' | 'skipped' | 'ran' {
  if (!hasMemberId) return 'blocked';
  if (state.lastCheck === minute) return 'skipped';
  state.lastCheck = minute;
  return 'ran';
}

function simulateAuthChange(state: PollingState): void {
  state.lastCheck = '';
}

export function testMedicationsPollingRegression(): TestResult[] {
  const state: PollingState = { lastCheck: '' };

  // Без логина — polling заблокирован
  const r1 = simulateCheck(state, false, '10:00');
  const r2 = simulateCheck(state, false, '10:01');

  // Логин — сброс и немедленный check
  simulateAuthChange(state);
  const r3 = simulateCheck(state, true, '10:01'); // та же минута — теперь должна пройти

  // Следующий тик в той же минуте — пропускается
  const r4 = simulateCheck(state, true, '10:01');

  // Следующая минута — проходит
  const r5 = simulateCheck(state, true, '10:02');

  return [
    assert(r1 === 'blocked', '10:00 без auth → blocked'),
    assert(r2 === 'blocked', '10:01 без auth → blocked'),
    assert(r3 === 'ran', 'после логина + onAuthChanged → 10:01 проходит'),
    assert(r4 === 'skipped', 'второй check в 10:01 → skipped (same minute)'),
    assert(r5 === 'ran', '10:02 → ran (новая минута)'),
  ];
}

// ─── 6. member/event section entry guard ─────────────────────────────────────

function validateMemorySection(memberId: number | null, eventId: string | null): string | null {
  if (!memberId && !eventId) return 'Нужен memberId или eventId';
  return null;
}

export function testMemberEventSectionGuard(): TestResult[] {
  return [
    assert(validateMemorySection(1, null) === null, 'memberId задан → section ok'),
    assert(validateMemorySection(null, 'evt-1') === null, 'eventId задан → section ok'),
    assert(validateMemorySection(1, 'evt-1') === null, 'оба заданы → section ok'),
    assert(
      validateMemorySection(null, null) === 'Нужен memberId или eventId',
      'нет ни memberId, ни eventId → guard срабатывает',
    ),
    assert(
      validateMemorySection(0, null) === 'Нужен memberId или eventId',
      'memberId = 0 (falsy) → guard срабатывает',
    ),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

export async function runAll(): Promise<void> {
  const groups = [
    { title: 'regression: login flow', results: testLoginFlow() },
    { title: 'regression: logout flow', results: testLogoutFlow() },
    { title: 'regression: saveSession writes all keys', results: testSaveSessionWritesAllKeys() },
    { title: 'regression: clearSession removes all keys', results: testClearSessionRemovesAllKeys() },
    { title: 'regression: incomplete session rejected', results: testIncompleteSessionRejected() },
    { title: 'regression: AUTH_SESSION_EVENT эмиссия', results: testAuthEventEmitted() },
    { title: 'regression: memory api guard', results: testMemoryApiGuard() },
    { title: 'regression: traditions headers', results: testTraditionsHeaders() },
    { title: 'regression: medications polling', results: testMedicationsPollingRegression() },
    { title: 'regression: member/event section guard', results: testMemberEventSectionGuard() },
  ];

  let passed = 0;
  let failed = 0;

  console.group('🧪 J2 — Top-flow regression pack');
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
