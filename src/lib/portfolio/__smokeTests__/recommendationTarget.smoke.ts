// Smoke-tests для resolveRecommendationTarget (D.1 / Portfolio CTA → Form).
//
// Контракт:
//   - pure TS, без DOM
//   - проверяем: валидные source_type → корректный href с member/action/tab/from;
//     неизвестный source_type → null; route=null → null; bug-fix /family-policy
//     заменён на /family-matrix/rituals для семейных традиций/ритуалов.

import {
  resolveRecommendationTarget,
  SOURCES_REGISTRY,
} from '@/data/portfolioSourcesRegistry';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

const MEMBER = 'm-test-1';

function runTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Дневник настроения ведёт в /children (отдельный детский диалог), НЕ в /health.
  const moodTarget = resolveRecommendationTarget(MEMBER, 'children_mood_entries');
  results.push(
    assert(
      moodTarget !== null && moodTarget.pathname === '/children',
      'mood_entries → /children',
      moodTarget ? `pathname=${moodTarget.pathname}` : 'null',
    ),
  );

  // 2. href содержит member, childId, action, tab=diary, mode=child, from=portfolio.
  results.push(
    assert(
      !!moodTarget &&
        moodTarget.href.includes(`member=${MEMBER}`) &&
        moodTarget.href.includes(`childId=${MEMBER}`) &&
        moodTarget.href.includes('action=add-mood-entry') &&
        moodTarget.href.includes('tab=diary') &&
        moodTarget.href.includes('mode=child') &&
        moodTarget.href.includes('from=portfolio'),
      'mood href has childId alias, mode=child, tab=diary',
      moodTarget?.href,
    ),
  );

  // 3. BUG D.1.0: family_rituals НЕ ведёт на /family-policy и НЕ на /family-matrix/rituals
  //    (это «Ритуалы примирения» — про конфликты, не про семейные ритуалы).
  const ritualsTarget = resolveRecommendationTarget(MEMBER, 'family_rituals');
  results.push(
    assert(
      ritualsTarget !== null &&
        ritualsTarget.pathname !== '/family-policy' &&
        ritualsTarget.pathname !== '/family-matrix/rituals',
      'family_rituals NOT /family-policy and NOT /family-matrix/rituals',
      ritualsTarget?.pathname,
    ),
  );

  // 4. family_rituals ведёт на /culture (раздел "Традиции и культура").
  results.push(
    assert(
      ritualsTarget !== null && ritualsTarget.pathname === '/culture',
      'family_rituals → /culture',
      ritualsTarget?.pathname,
    ),
  );

  // 5. family_traditions — то же самое, /culture + add-tradition.
  const traditionsTarget = resolveRecommendationTarget(MEMBER, 'family_traditions');
  results.push(
    assert(
      traditionsTarget !== null &&
        traditionsTarget.pathname === '/culture' &&
        traditionsTarget.action === 'add-tradition',
      'family_traditions → /culture + add-tradition',
      traditionsTarget?.action,
    ),
  );

  // 6. Неизвестный source_type → null (no crash).
  const unknownTarget = resolveRecommendationTarget(MEMBER, 'unknown_source_xyz');
  results.push(
    assert(unknownTarget === null, 'unknown source_type → null', String(unknownTarget)),
  );

  // 7. source_type без route (parent_input, route=null) → null.
  const parentInputTarget = resolveRecommendationTarget(MEMBER, 'parent_input');
  results.push(
    assert(parentInputTarget === null, 'parent_input (route=null) → null', String(parentInputTarget)),
  );

  // 8. null memberId не должен ломать resolver.
  const noMember = resolveRecommendationTarget(null, 'children_vaccinations');
  results.push(
    assert(
      noMember !== null &&
        noMember.pathname === '/health' &&
        !noMember.href.includes('member='),
      'null memberId → target без member',
      noMember?.href,
    ),
  );

  // 9. Все CTA с route != null должны резолвиться без падений.
  let allResolved = true;
  let firstFailure = '';
  for (const [sourceType, entry] of Object.entries(SOURCES_REGISTRY)) {
    if (entry.route === null) continue;
    const t = resolveRecommendationTarget(MEMBER, sourceType);
    if (!t || t.pathname !== entry.route) {
      allResolved = false;
      firstFailure = sourceType;
      break;
    }
  }
  results.push(
    assert(allResolved, 'all actionable sources resolve to entry.route', firstFailure),
  );

  // 10. Ни один CTA не ведёт на /family-policy или /family-matrix/rituals (конфликтная страница).
  const FORBIDDEN_ROUTES = ['/family-policy', '/family-matrix/rituals'];
  let leakRoute = '';
  let leakSource = '';
  for (const [sourceType, entry] of Object.entries(SOURCES_REGISTRY)) {
    if (entry.route && FORBIDDEN_ROUTES.includes(entry.route)) {
      leakRoute = entry.route;
      leakSource = sourceType;
      break;
    }
  }
  results.push(
    assert(
      !leakRoute,
      'no source routes to /family-policy or /family-matrix/rituals',
      leakSource ? `${leakSource} → ${leakRoute}` : '',
    ),
  );

  return results;
}

export async function runAll(): Promise<void> {
   
  console.group('🎯 D.1 — resolveRecommendationTarget');
  const tests = runTests();
  let passed = 0;
  for (const t of tests) {
    if (t.ok) {
       
      console.log(`  ✅ ${t.name}`);
      passed++;
    } else {
       
      console.error(`  ❌ ${t.name}`, t.details ?? '');
    }
  }
   
  console.log(`  ${passed}/${tests.length} passed`);
   
  console.groupEnd();
}