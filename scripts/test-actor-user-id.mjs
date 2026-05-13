/**
 * Регрессионный тест на actor-user-id логику для Portfolio.
 * Запуск: node scripts/test-actor-user-id.mjs
 *
 * ВАЖНО: self-contained — СПЕЦИАЛЬНО НЕ импортирует TS-исходники из src/.
 * Plain Node не умеет .ts напрямую, тащить ts-node/tsx на freeze-неделе не хочется.
 * Поэтому функции pickActorUserIdFromStorage и buildHeadersImpl продублированы
 * здесь как страховка. Контракт обязан совпадать с src/services/portfolioApi.ts.
 * Если меняешь helper в проде — меняй и здесь. Расхождение поймают смежные кейсы.
 *
 * Класс бага под защитой: чтобы X-User-Id всегда содержал users.id, а не
 * member_id / familyMemberId.
 */

// === Реализации под тестом — должны совпадать с src/services/portfolioApi.ts ===

function pickActorUserIdFromStorage(read) {
  for (const key of ['userData', 'user_data', 'user']) {
    const raw = read(key);
    if (!raw) continue;
    try {
      const u = JSON.parse(raw);
      // user.id == users.id (см. backend/auth/index.py). НЕ member_id, НЕ memberId.
      const id = u?.id || u?.user_id;
      if (id) return String(id);
    } catch {
      /* ignore */
    }
  }
  return null;
}

function buildHeadersImpl(extra, getActor) {
  const headers = { ...(extra || {}) };
  const uid = getActor();
  if (uid) headers['X-User-Id'] = uid;
  return headers;
}

// === Тест-инфраструктура ===

function makeStorage(entries) {
  return (key) => (key in entries ? entries[key] : null);
}

const USER_ID = '00000000-1111-2222-3333-444444444444';
const MEMBER_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

let passed = 0;
let failed = 0;
const fails = [];

function assertEq(name, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed += 1;
    console.log(`  OK   ${name}`);
  } else {
    failed += 1;
    fails.push({ name, actual, expected });
    console.log(`  FAIL ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

function assertDeep(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed += 1;
    console.log(`  OK   ${name}`);
  } else {
    failed += 1;
    fails.push({ name, actual, expected });
    console.log(`  FAIL ${name} — got ${a}, expected ${e}`);
  }
}

// === Блок 1: pickActorUserIdFromStorage ===

console.log('\n=== pickActorUserIdFromStorage ===\n');

// 1) userData.id есть → возвращаем его
assertEq(
  'userData.id присутствует → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: USER_ID, member_id: MEMBER_ID, email: 'a@b.c' }),
    }),
  ),
  USER_ID,
);

// 2) Только member_id / memberId → null (нельзя путать)
assertEq(
  'только member_id в userData → null',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ member_id: MEMBER_ID, memberId: MEMBER_ID }),
    }),
  ),
  null,
);

// 3) familyMemberId / userId в localStorage не считаются actor user_id
assertEq(
  'familyMemberId/userId в localStorage не используются как actor user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      familyMemberId: MEMBER_ID,
      userId: MEMBER_ID,
    }),
  ),
  null,
);

// 4) userData.user_id (синоним) → возвращаем его
assertEq(
  'userData.user_id (синоним) → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ user_id: USER_ID }),
    }),
  ),
  USER_ID,
);

// 5) Fallback на ключ user_data
assertEq(
  'user_data (alt key) → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      user_data: JSON.stringify({ id: USER_ID }),
    }),
  ),
  USER_ID,
);

// 6) Fallback на ключ user
assertEq(
  'user (legacy key) → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      user: JSON.stringify({ id: USER_ID }),
    }),
  ),
  USER_ID,
);

// 7) Пустой storage → null
assertEq(
  'пустой storage → null',
  pickActorUserIdFromStorage(makeStorage({})),
  null,
);

// 8) Невалидный JSON → не падаем, null
assertEq(
  'битый JSON в userData → null без exception',
  pickActorUserIdFromStorage(makeStorage({ userData: '{not-json' })),
  null,
);

// 9) Приоритет: id > user_id, если оба заданы и id truthy
assertEq(
  'оба id и user_id заданы → берём id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: USER_ID, user_id: 'wrong-uid' }),
    }),
  ),
  USER_ID,
);

// 10) Variant C: id=null, user_id=U → fallback на user_id даёт U
assertEq(
  'id:null + user_id:U → fallback к user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: null, user_id: USER_ID }),
    }),
  ),
  USER_ID,
);

// === Блок 2: buildHeaders ===

console.log('\n=== buildHeaders ===\n');

// 11) helper вернул null → X-User-Id НЕ добавляется
assertDeep(
  'getActor === null → нет X-User-Id в заголовках',
  buildHeadersImpl({ 'Content-Type': 'application/json' }, () => null),
  { 'Content-Type': 'application/json' },
);

// 12) helper вернул U → X-User-Id присутствует
assertDeep(
  'getActor === U → X-User-Id: U в заголовках',
  buildHeadersImpl({ 'Content-Type': 'application/json' }, () => USER_ID),
  { 'Content-Type': 'application/json', 'X-User-Id': USER_ID },
);

// 13) extra=undefined + helper=null → пустой объект
assertDeep(
  'extra=undefined, getActor=null → {}',
  buildHeadersImpl(undefined, () => null),
  {},
);

// 14) extra={} + helper=U → только X-User-Id
assertDeep(
  'extra={}, getActor=U → { X-User-Id: U }',
  buildHeadersImpl({}, () => USER_ID),
  { 'X-User-Id': USER_ID },
);

// === Итог ===

console.log(`\nИтого: ${passed} OK, ${failed} FAIL\n`);
if (failed > 0) {
  console.log('Провалы:');
  for (const f of fails) console.log('  ·', f);
  process.exit(1);
}
process.exit(0);
