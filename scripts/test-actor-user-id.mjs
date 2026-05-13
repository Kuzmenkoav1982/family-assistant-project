/**
 * Регрессионный тест на actor-id selection логику.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Запуск:    node scripts/test-actor-user-id.mjs
 *  Exit code: 0 — все OK, 1 — есть FAIL.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Покрытие (Stage 4.4 — regression net):
 *
 *  Блок 1. pickActorUserIdFromStorage         — старый portfolio helper (компат)
 *  Блок 2. buildHeaders                       — компоновка заголовков portfolio
 *  Блок 3. readNormalizedIdentityFromStorage  — identity adapter (src/lib/identity.ts)
 *  Блок 4. identity helpers                   — readActorUserId / readActorMemberId / ...
 *  Блок 5. portfolio transport contract       — X-User-Id == users.id
 *  Блок 6. health transport contract          — X-User-Id == family_members.id (KE-health)
 *  Блок 7. life-road actor contract           — X-User-Id == family_members.id (KE-life-road)
 *
 * Какие классы багов под защитой:
 *  - portfolio: X-User-Id всегда users.id, а не member_id / familyMemberId.
 *  - identity adapter: actorUserId / actorMemberId / actorFamilyId различают
 *    разные сущности и никогда не подменяют одно другим.
 *  - health: никаких fallback на '1' или selectedProfile.id; X-User-Id строго
 *    == family_members.id, иначе вообще не отправляется.
 *  - life-road: при отсутствии member_id — explicit throw, не silent fall-back
 *    на users.id.
 *
 * Источник истины в проде (если что менять):
 *  - src/lib/identity.ts           — identity adapter
 *  - src/services/portfolioApi.ts  — portfolio buildHeaders / actor selection
 *  - src/services/healthApi.ts     — health buildHeaders (KE-health)
 *  - src/components/life-road/api.ts + useLifeEvents.ts (KE-life-road)
 *
 * Self-contained: СПЕЦИАЛЬНО НЕ импортирует TS-исходники из src/. Plain Node
 * не умеет .ts напрямую, тащить ts-node/tsx не хочется. Все проверяемые
 * функции продублированы здесь как страховка от расхождения контракта.
 * Если меняешь helper в проде — синхронизируй соответствующий блок здесь.
 *
 * Ожидаемый вывод при зелёном прогоне (сокращённо):
 *   === pickActorUserIdFromStorage ===
 *     OK   userData.id присутствует → user_id
 *     OK   только member_id в userData → null
 *     ... (10 кейсов)
 *   === buildHeaders ===
 *     ... (4 кейса)
 *   === identity adapter (readNormalizedIdentityFromStorage) ===
 *     ... (16 кейсов)
 *   === identity helpers ===
 *     ... (6 кейсов)
 *   === portfolio transport contract ===
 *     ... (3 кейса)
 *   === health transport contract ===
 *     ... (4 кейса)
 *   === life-road actor contract ===
 *     ... (4 кейса, включая 3 throw-кейса)
 *
 *   Итого: 47 OK, 0 FAIL
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

// 24) битый JSON в userData → не падаем, всё null
assertDeep(
  'битый JSON в userData → safe fallback на пустой identity',
  readNormalizedIdentityFromStorage(makeStorage({ userData: '{broken' })),
  {
    actorUserId: null,
    actorMemberId: null,
    actorFamilyId: null,
    authToken: null,
    userSourceKey: null,
    tokenSourceKey: null,
  },
);

// 25) битый JSON в userData, но валидный user_data → берём user_data
assertEq(
  'userData битый → fallback на user_data',
  readNormalizedIdentityFromStorage(
    makeStorage({
      userData: '{broken',
      user_data: JSON.stringify({ id: USER_ID }),
    }),
  ).actorUserId,
  USER_ID,
);

// 26) legacy ключ user (самый старый alias)
assertEq(
  'legacy ключ user (последний в цепочке)',
  readNormalizedIdentityFromStorage(
    makeStorage({ user: JSON.stringify({ id: USER_ID, member_id: MEMBER_ID }) }),
  ).actorUserId,
  USER_ID,
);

// 27) family_id alias: familyId
assertEq(
  'familyId (camelCase alias) → actorFamilyId',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ familyId: FAMILY_ID }) }),
  ).actorFamilyId,
  FAMILY_ID,
);

// 28) member_id alias: memberId
assertEq(
  'memberId (camelCase alias) → actorMemberId',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ memberId: MEMBER_ID }) }),
  ).actorMemberId,
  MEMBER_ID,
);

// 29) user_id (snake_case alias для users.id)
assertEq(
  'user_id (legacy alias) → actorUserId',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ user_id: USER_ID }) }),
  ).actorUserId,
  USER_ID,
);

// 30) пустые строки трактуются как отсутствие
assertEq(
  'id === "" → actorUserId == null (не пустая строка)',
  readNormalizedIdentityFromStorage(
    makeStorage({ userData: JSON.stringify({ id: '', user_id: USER_ID }) }),
  ).actorUserId,
  USER_ID,
);

// === Блок 4: identity helpers (тонкие обёртки) ===
//
// Закрепляем поведение readActorUserId / readActorMemberId / readActorFamilyId /
// readAuthToken через тот же adapter. В проде это публичный API src/lib/identity.ts.

function readActorUserId(read) {
  return readNormalizedIdentityFromStorage(read).actorUserId;
}
function readActorMemberId(read) {
  return readNormalizedIdentityFromStorage(read).actorMemberId;
}
function readActorFamilyId(read) {
  return readNormalizedIdentityFromStorage(read).actorFamilyId;
}
function readAuthToken(read) {
  return readNormalizedIdentityFromStorage(read).authToken;
}

console.log('\n=== identity helpers ===\n');

const FULL_STORAGE = makeStorage({
  userData: JSON.stringify({ id: USER_ID, member_id: MEMBER_ID, family_id: FAMILY_ID }),
  authToken: TOKEN,
});

assertEq('readActorUserId(full)', readActorUserId(FULL_STORAGE), USER_ID);
assertEq('readActorMemberId(full)', readActorMemberId(FULL_STORAGE), MEMBER_ID);
assertEq('readActorFamilyId(full)', readActorFamilyId(FULL_STORAGE), FAMILY_ID);
assertEq('readAuthToken(full)', readAuthToken(FULL_STORAGE), TOKEN);

// КРИТИЧНЫЕ инварианты — порознь.
const ONLY_USER = makeStorage({ userData: JSON.stringify({ id: USER_ID }) });
const ONLY_MEMBER = makeStorage({ userData: JSON.stringify({ member_id: MEMBER_ID }) });

assertEq('inv: только id → readActorMemberId == null', readActorMemberId(ONLY_USER), null);
assertEq('inv: только member_id → readActorUserId == null', readActorUserId(ONLY_MEMBER), null);

// === Блок 5: portfolio transport contract ===
//
// portfolioApi.ts → buildHeaders шлёт X-User-Id = readActorUserId().
// Проверяем сложение helper-ов так же, как в проде.

function portfolioBuildHeaders(read, extra) {
  const headers = { ...(extra || {}) };
  const uid = readActorUserId(read);
  if (uid) headers['X-User-Id'] = uid;
  return headers;
}

console.log('\n=== portfolio transport contract ===\n');

// 1) Каноничный flow: actorUserId присутствует → header X-User-Id = users.id
assertDeep(
  'portfolio: X-User-Id == users.id из userData.id',
  portfolioBuildHeaders(FULL_STORAGE, { 'Content-Type': 'application/json' }),
  { 'Content-Type': 'application/json', 'X-User-Id': USER_ID },
);

// 2) Только member_id есть, users.id нет → portfolio НЕ должен послать member_id в X-User-Id.
//    Это самый опасный класс бага из stage-3.
assertDeep(
  'inv: portfolio не подменяет member_id на X-User-Id',
  portfolioBuildHeaders(ONLY_MEMBER),
  {},
);

// 3) Пустой storage → X-User-Id отсутствует, не fake значение
assertDeep(
  'inv: пустой storage → portfolio не шлёт fake X-User-Id',
  portfolioBuildHeaders(makeStorage({})),
  {},
);

// === Блок 6: health transport contract (KE-health) ===
//
// healthApi.ts → buildHeaders шлёт X-User-Id = readActorMemberId() (KE-health).
// Внутри также Authorization: Bearer + token из readAuthToken().

function healthBuildHeaders(read, extra) {
  const headers = { ...(extra || {}) };
  const memberId = readActorMemberId(read);
  if (memberId) headers['X-User-Id'] = memberId;
  const token = readAuthToken(read);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

console.log('\n=== health transport contract ===\n');

// 1) Каноничный flow: actorMemberId + token
assertDeep(
  'health: X-User-Id == family_members.id + Bearer token',
  healthBuildHeaders(FULL_STORAGE, { 'Content-Type': 'application/json' }),
  {
    'Content-Type': 'application/json',
    'X-User-Id': MEMBER_ID,
    Authorization: `Bearer ${TOKEN}`,
  },
);

// 2) КРИТИЧНО: health НЕ ДОЛЖЕН подменять member_id на users.id, если member_id отсутствует.
//    Иначе вернётся старый баг — actor с user_id "1" / users.id вместо member_id.
assertDeep(
  'inv: health не подменяет users.id на X-User-Id, если member_id нет',
  healthBuildHeaders(ONLY_USER),
  {},
);

// 3) КРИТИЧНО: нет fallback на "1" / fake value.
assertDeep(
  'inv: health на пустом storage → нет X-User-Id, нет fake "1"',
  healthBuildHeaders(makeStorage({})),
  {},
);

// 4) Health может работать без actor, но с token (теоретически — sanity).
//    На практике backend упадёт с 401 — но это его дело, не клиента.
assertDeep(
  'health: только token, без actor → только Authorization',
  healthBuildHeaders(makeStorage({ authToken: TOKEN })),
  { Authorization: `Bearer ${TOKEN}` },
);

// === Блок 7: life-road actor contract (KE-life-road) ===
//
// life-road/api.ts → call() читает X-User-Id через readActorMemberId().
// Если member_id нет — бросает явную ошибку, X-User-Id НЕ отправляется как пустой/fake.

function lifeRoadActorOrThrow(read) {
  const id = readActorMemberId(read);
  if (!id) throw new Error('Не найден member_id. Войдите в аккаунт заново.');
  return id;
}

function assertThrows(name, fn) {
  let threw = false;
  let message = '';
  try {
    fn();
  } catch (e) {
    threw = true;
    message = e?.message || String(e);
  }
  if (threw) {
    passed += 1;
    console.log(`  OK   ${name} (throw: ${message})`);
  } else {
    failed += 1;
    fails.push({ name, actual: 'no throw', expected: 'throw' });
    console.log(`  FAIL ${name} — не было исключения`);
  }
}

console.log('\n=== life-road actor contract ===\n');

// 1) Каноничный flow: member_id → возвращается
assertEq(
  'life-road: member_id есть → возвращается как actor',
  lifeRoadActorOrThrow(FULL_STORAGE),
  MEMBER_ID,
);

// 2) КРИТИЧНО: life-road НЕ ДОЛЖЕН подменять member_id на users.id.
//    backend ждёт family_members.id; users.id вернёт 404 (см. KE-life-road в docs).
assertThrows(
  'inv: life-road бросает ошибку при отсутствии member_id (не fall-back на user_id)',
  () => lifeRoadActorOrThrow(ONLY_USER),
);

// 3) Пустой storage → ошибка, не fake значение
assertThrows(
  'inv: life-road на пустом storage → throw, не fake actor',
  () => lifeRoadActorOrThrow(makeStorage({})),
);

// 4) Битый JSON в userData → throw (а не silent null)
assertThrows(
  'inv: битый JSON userData → throw',
  () => lifeRoadActorOrThrow(makeStorage({ userData: '{broken' })),
);

// === Итог ===

console.log(`\nИтого: ${passed} OK, ${failed} FAIL\n`);
if (failed > 0) {
  console.log('Провалы:');
  for (const f of fails) console.log('  ·', f);
  process.exit(1);
}
process.exit(0);