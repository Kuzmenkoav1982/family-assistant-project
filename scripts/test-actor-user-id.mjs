/**
 * Регрессионный тест на actor-id selection логику.
 * Запуск: node scripts/test-actor-user-id.mjs
 *
 * Stage 4 (4.2.8): после введения единого identity adapter точкой истины
 * стал src/lib/identity.ts (readNormalizedIdentityFromStorage и обёртки
 * readActorUserId / readActorMemberId / readActorFamilyId / readAuthToken).
 *
 * src/services/portfolioApi.ts → pickActorUserIdFromStorage теперь делегирует
 * туда. Если меняешь identity adapter в проде — синхронизируй и блок 3 здесь.
 *
 * ВАЖНО: self-contained — СПЕЦИАЛЬНО НЕ импортирует TS-исходники из src/.
 * Plain Node не умеет .ts напрямую, тащить ts-node/tsx не хочется. Поэтому
 * pickActorUserIdFromStorage, buildHeadersImpl и readNormalizedIdentity
 * продублированы здесь как страховка от расхождения контракта.
 *
 * Классы багов под защитой:
 *  - portfolio: X-User-Id всегда users.id, а не member_id / familyMemberId.
 *  - identity adapter: actorUserId / actorMemberId / actorFamilyId различают
 *    разные сущности и никогда не подменяют одно другим.
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

// === Блок 3: identity adapter (src/lib/identity.ts) ===
//
// Локальная копия readNormalizedIdentityFromStorage. Контракт обязан совпадать
// с src/lib/identity.ts. Если меняешь там — синхронизируй здесь.

const USER_KEYS = ['userData', 'user_data', 'user'];
const TOKEN_KEYS = ['authToken', 'auth_token'];

function safeParse(raw) {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

function pickString(obj, ...candidates) {
  if (!obj) return null;
  for (const c of candidates) {
    const v = obj[c];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return null;
}

function readNormalizedIdentityFromStorage(read) {
  let userObj = null;
  let userSourceKey = null;
  for (const key of USER_KEYS) {
    const parsed = safeParse(read(key));
    if (parsed) {
      userObj = parsed;
      userSourceKey = key;
      break;
    }
  }
  let authToken = null;
  let tokenSourceKey = null;
  for (const key of TOKEN_KEYS) {
    const v = read(key);
    if (v) {
      authToken = v;
      tokenSourceKey = key;
      break;
    }
  }
  return {
    actorUserId: pickString(userObj, 'id', 'user_id'),
    actorMemberId: pickString(userObj, 'member_id', 'memberId'),
    actorFamilyId: pickString(userObj, 'family_id', 'familyId'),
    authToken,
    userSourceKey,
    tokenSourceKey,
  };
}

console.log('\n=== identity adapter (readNormalizedIdentityFromStorage) ===\n');

const FAMILY_ID = '99999999-aaaa-bbbb-cccc-dddddddddddd';
const TOKEN = 'jwt-token-abc';

// 15) полный shape: id + member_id + family_id + token
assertDeep(
  'полный userData + authToken → все поля',
  readNormalizedIdentityFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: USER_ID, member_id: MEMBER_ID, family_id: FAMILY_ID }),
      authToken: TOKEN,
    }),
  ),
  {
    actorUserId: USER_ID,
    actorMemberId: MEMBER_ID,
    actorFamilyId: FAMILY_ID,
    authToken: TOKEN,
    userSourceKey: 'userData',
    tokenSourceKey: 'authToken',
  },
);

// 16) member_id и user_id живут отдельно: дать только member_id — user_id остаётся null
assertEq(
  'только member_id → actorUserId == null',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ member_id: MEMBER_ID }) }),
  ).actorUserId,
  null,
);

// 17) и наоборот: только id → actorMemberId == null
assertEq(
  'только id → actorMemberId == null',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ id: USER_ID }) }),
  ).actorMemberId,
  null,
);

// 18) legacy ключ user_data + auth_token подхватываются
assertDeep(
  'user_data + auth_token (legacy keys)',
  readNormalizedIdentityFromStorage(
    makeStorage({
      user_data: JSON.stringify({ id: USER_ID, memberId: MEMBER_ID, familyId: FAMILY_ID }),
      auth_token: TOKEN,
    }),
  ),
  {
    actorUserId: USER_ID,
    actorMemberId: MEMBER_ID,
    actorFamilyId: FAMILY_ID,
    authToken: TOKEN,
    userSourceKey: 'user_data',
    tokenSourceKey: 'auth_token',
  },
);

// 19) пустой storage → все поля null
assertDeep(
  'пустой storage → всё null',
  readNormalizedIdentityFromStorage(makeStorage({})),
  {
    actorUserId: null,
    actorMemberId: null,
    actorFamilyId: null,
    authToken: null,
    userSourceKey: null,
    tokenSourceKey: null,
  },
);

// 20) приоритет authToken > auth_token: если есть оба, берём authToken
assertEq(
  'authToken приоритетнее auth_token',
  readNormalizedIdentityFromStorage(
    makeStorage({ authToken: 'A', auth_token: 'B' }),
  ).authToken,
  'A',
);

// 21) приоритет userData > user_data > user
assertEq(
  'userData приоритетнее user_data',
  readNormalizedIdentityFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: 'fromUserData' }),
      user_data: JSON.stringify({ id: 'fromUserDataAlt' }),
    }),
  ).actorUserId,
  'fromUserData',
);

// 22) КРИТИЧНЫЙ inv: не должно быть автоматического fallback member_id → user_id
//     (защита от старого бага в useHealthAPI: userData.member_id || '1')
assertEq(
  'inv: member_id никогда не подменяет user_id',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ member_id: MEMBER_ID }) }),
  ).actorUserId,
  null,
);

// 23) КРИТИЧНЫЙ inv: нет hardcoded fallback вроде '1'
assertEq(
  'inv: empty userData без id → actorUserId === null, не "1"',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ email: 'x@y.z' }) }),
  ).actorUserId,
  null,
);

// === Итог ===

console.log(`\nИтого: ${passed} OK, ${failed} FAIL\n`);
if (failed > 0) {
  console.log('Провалы:');
  for (const f of fails) console.log('  ·', f);
  process.exit(1);
}
process.exit(0);