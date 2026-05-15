// Smoke-tests для PortfolioSection (Sprint B.2).
//
// Контрактные инварианты обёртки (без DOM-рендера — проверяем чистые
// правила, чтобы при будущем рефакторе никто случайно не убрал якорь
// или не начал выводить лейбл «впустую»).

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

/**
 * Решение «рисовать ли шапку секции». В компоненте выражается через
 * `{label && (...)}`. Здесь воспроизводим ту же логику для контроля
 * регрессий: пустые/undefined значения не должны давать «пустую» шапку.
 */
export function shouldRenderHeader(label?: string): boolean {
  return !!label;
}

/**
 * Решение «использовать ли иконку». Иконка имеет смысл только если есть
 * label (без шапки она «висит» в воздухе).
 */
export function shouldRenderIcon(label?: string, icon?: string): boolean {
  return !!label && !!icon;
}

/**
 * Решение «связывать ли section с шапкой через aria-labelledby».
 * Только если есть и id, и label (иначе связывать не с чем).
 */
export function shouldAriaLink(id?: string, label?: string): boolean {
  return !!id && !!label;
}

export function testHeaderVisibility(): TestResult[] {
  return [
    assert(shouldRenderHeader('Ключевые акценты') === true, 'есть label → шапка'),
    assert(shouldRenderHeader('') === false, 'пустой label → нет шапки'),
    assert(shouldRenderHeader(undefined) === false, 'undefined → нет шапки'),
  ];
}

export function testIconVisibility(): TestResult[] {
  return [
    assert(
      shouldRenderIcon('Ключевые акценты', 'Sparkles') === true,
      'label + icon → иконка',
    ),
    assert(
      shouldRenderIcon(undefined, 'Sparkles') === false,
      'icon без label → не рисуем (висячая иконка)',
    ),
    assert(
      shouldRenderIcon('Ключевые акценты', undefined) === false,
      'label без icon → ок, иконки нет',
    ),
    assert(
      shouldRenderIcon(undefined, undefined) === false,
      'ничего → ничего',
    ),
  ];
}

export function testAriaLink(): TestResult[] {
  return [
    assert(
      shouldAriaLink('radar', 'Радар сфер') === true,
      'id + label → aria-labelledby связан',
    ),
    assert(
      shouldAriaLink('radar', undefined) === false,
      'id без label → aria-связи нет (нечего связывать)',
    ),
    assert(
      shouldAriaLink(undefined, 'Радар сфер') === false,
      'label без id → aria-связи нет (нечем адресовать)',
    ),
    assert(
      shouldAriaLink(undefined, undefined) === false,
      'ничего → нет связи',
    ),
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'section: header visibility', results: testHeaderVisibility() },
    { title: 'section: icon visibility', results: testIconVisibility() },
    { title: 'section: aria-labelledby link', results: testAriaLink() },
  ];
  let passed = 0;
  let failed = 0;
   
  console.group('PortfolioSection contract smoke (Sprint B.2)');
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
