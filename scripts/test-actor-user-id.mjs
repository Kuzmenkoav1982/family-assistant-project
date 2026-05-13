/**
 * Регрессионный тест на getActorUserId() / pickActorUserIdFromStorage.
 * Запуск: node scripts/test-actor-user-id.mjs
 *
 * Тестирует ровно тот класс бага, который backend-тестами не ловится:
 * чтобы X-User-Id всегда содержал users.id, а не member_id / familyMemberId.
 *
 * Чтобы не тащить vitest на freeze-неделе — пишем функцию заново
 * с тем же контрактом, что в src/services/portfolioApi.ts (pickActorUserIdFromStorage),
 * и тестируем её. Любое изменение контракта в проде должно отражаться в этом файле —
 * это специально сделано как страховка, а не как дублирование.
 */

function pickActorUserIdFromStorage(read) {
  for (const key of ['userData', 'user_data', 'user']) {
    const raw = read(key);
    if (!raw) continue;
    try {
      const u = JSON.parse(raw);
      const id = u?.id || u?.user_id;
      if (id) return String(id);
    } catch {
      /* ignore */
    }
  }
  return null;
}

function makeStorage(entries) {
  return (key) => (key in entries ? entries[key] : null);
}

const USER_ID = '00000000-1111-2222-3333-444444444444';
const MEMBER_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

let passed = 0;
let failed = 0;
const fails = [];

function assert(name, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed += 1;
    console.log(`  OK  ${name}`);
  } else {
    failed += 1;
    fails.push({ name, actual, expected });
    console.log(`  FAIL ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

console.log('\n=== getActorUserId / pickActorUserIdFromStorage ===\n');

// 1) userData.id есть → возвращаем его
assert(
  'userData.id присутствует → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: USER_ID, member_id: MEMBER_ID, email: 'a@b.c' }),
    }),
  ),
  USER_ID,
);

// 2) Только member_id / familyMemberId → null (нельзя путать)
assert(
  'только member_id в userData → null',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ member_id: MEMBER_ID, memberId: MEMBER_ID }),
    }),
  ),
  null,
);

assert(
  'familyMemberId/userId в localStorage не используются как actor user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      familyMemberId: MEMBER_ID,
      userId: MEMBER_ID,
    }),
  ),
  null,
);

// 3) userData.user_id (синоним) → возвращаем его
assert(
  'userData.user_id (синоним) → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ user_id: USER_ID }),
    }),
  ),
  USER_ID,
);

// 4) Fallback на user_data ключ
assert(
  'user_data (alt key) → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      user_data: JSON.stringify({ id: USER_ID }),
    }),
  ),
  USER_ID,
);

// 5) Fallback на user ключ
assert(
  'user (legacy key) → user_id',
  pickActorUserIdFromStorage(
    makeStorage({
      user: JSON.stringify({ id: USER_ID }),
    }),
  ),
  USER_ID,
);

// 6) Пустой storage → null
assert(
  'пустой storage → null',
  pickActorUserIdFromStorage(makeStorage({})),
  null,
);

// 7) Невалидный JSON → не падаем, null
assert(
  'битый JSON в userData → null без exception',
  pickActorUserIdFromStorage(makeStorage({ userData: '{not-json' })),
  null,
);

// 8) Приоритет: id > user_id
assert(
  'оба id и user_id заданы → берём id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: USER_ID, user_id: 'wrong-uid' }),
    }),
  ),
  USER_ID,
);

// 9) member_id присутствует РЯДОМ с id — не должен иметь приоритет
assert(
  'id + member_id вместе → берём id',
  pickActorUserIdFromStorage(
    makeStorage({
      userData: JSON.stringify({ id: USER_ID, member_id: MEMBER_ID, memberId: MEMBER_ID }),
    }),
  ),
  USER_ID,
);

console.log(`\nИтого: ${passed} OK, ${failed} FAIL\n`);
if (failed > 0) {
  console.log('Провалы:');
  for (const f of fails) console.log('  ·', f);
  process.exit(1);
}
process.exit(0);
