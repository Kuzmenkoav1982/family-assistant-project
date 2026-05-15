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

  // 1. Валидный source_type возвращает target с правильным pathname.
  const moodTarget = resolveRecommendationTarget(MEMBER, 'children_mood_entries');
  results.push(
    assert(
      moodTarget !== null && moodTarget.pathname === '/health',
      'mood_entries → /health',
      moodTarget ? `pathname=${moodTarget.pathname}` : 'null',
    ),
  );

  // 2. href содержит member, action, tab, from=portfolio.
  results.push(
    assert(
      !!moodTarget &&
        moodTarget.href.includes(`member=${MEMBER}`) &&
        moodTarget.href.includes('action=add-mood-entry') &&
        moodTarget.href.includes('tab=history') &&
        moodTarget.href.includes('from=portfolio'),
      'mood href contains all query params',
      moodTarget?.href,
    ),
  );

  // 3. BUG D.1.0: family_rituals больше НЕ ведёт на /family-policy.
  const ritualsTarget = resolveRecommendationTarget(MEMBER, 'family_rituals');
  results.push(
    assert(
      ritualsTarget !== null && ritualsTarget.pathname !== '/family-policy',
      'family_rituals NOT /family-policy (bugfix)',
      ritualsTarget?.pathname,
    ),
  );

  // 4. family_rituals ведёт на /family-matrix/rituals.
  results.push(
    assert(
      ritualsTarget !== null && ritualsTarget.pathname === '/family-matrix/rituals',
      'family_rituals → /family-matrix/rituals',
      ritualsTarget?.pathname,
    ),
  );

  // 5. family_traditions — то же самое.
  const traditionsTarget = resolveRecommendationTarget(MEMBER, 'family_traditions');
  results.push(
    assert(
      traditionsTarget !== null &&
        traditionsTarget.pathname === '/family-matrix/rituals' &&
        traditionsTarget.action === 'add-tradition',
      'family_traditions → /family-matrix/rituals + add-tradition',
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

  // 10. Ни один CTA не ведёт на /family-policy после bugfix.
  let leaksToFamilyPolicy = false;
  let leakSource = '';
  for (const [sourceType, entry] of Object.entries(SOURCES_REGISTRY)) {
    if (entry.route === '/family-policy') {
      leaksToFamilyPolicy = true;
      leakSource = sourceType;
      break;
    }
  }
  results.push(
    assert(
      !leaksToFamilyPolicy,
      'no source still routes to /family-policy',
      leakSource,
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
