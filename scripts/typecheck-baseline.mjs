/**
 * Храповик по TypeScript-ошибкам.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  Запуск:    node scripts/typecheck-baseline.mjs           # проверить
 *             node scripts/typecheck-baseline.mjs --update  # зафиксировать
 *  Exit code: 0 — не хуже baseline, 1 — регресс.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ЗАЧЕМ
 *
 * В проекте ~977 существующих ошибок типов. Пока их столько, `tsc --noEmit`
 * бесполезен как сигнал: новая ошибка тонет в старом шуме, и фраза
 * «в проекте и раньше было столько ошибок» превращается в разрешение
 * добавлять новые. При этом чинить всё разом внутри задачи по авторизации —
 * не тот размен: это недели работы и огромный диффф ровно там, где сейчас
 * нужна максимальная обозримость изменений.
 *
 * Поэтому храповик:
 *   1. общее число ошибок не имеет права расти;
 *   2. в security-критичных файлах ошибок не должно быть ВООБЩЕ —
 *      это единственная часть кода, где «примерно типизировано»
 *      означает «неизвестно, кто и что получит»;
 *   3. baseline двигается только вниз и обновляется явной командой.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASELINE_FILE = 'scripts/typecheck-baseline.json';

/**
 * Файлы, отвечающие за то, КТО пользователь и ЧТО ему можно.
 * Ошибка типов здесь — потенциальный обход проверки прав, а не косметика.
 */
const STRICT_PATHS = [
  'src/lib/apiHeaders.ts',
  'src/lib/identity.ts',
  'src/lib/authStorage.ts',
  'src/lib/auth-context.tsx',
  'src/lib/permissions.ts',
  'src/lib/auth/',
  'src/hooks/usePermissions',
  'src/hooks/useCapabilities',
  'src/services/healthApi.ts',
  'src/components/payment/',
];

function collectErrors() {
  let output = '';
  try {
    output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    // tsc выходит с ненулевым кодом при наличии ошибок — это ожидаемо.
    output = `${err.stdout || ''}${err.stderr || ''}`;
  }
  return output
    .split('\n')
    .filter((line) => /error TS\d+/.test(line))
    .map((line) => line.trim());
}

function isStrict(line) {
  return STRICT_PATHS.some((p) => line.startsWith(p));
}

const errors = collectErrors();
const total = errors.length;
const strictErrors = errors.filter(isStrict);

if (process.argv.includes('--update')) {
  if (strictErrors.length > 0) {
    console.error('Нельзя зафиксировать baseline: есть ошибки в security-файлах.');
    strictErrors.forEach((e) => console.error('  ' + e));
    process.exit(1);
  }
  writeFileSync(
    BASELINE_FILE,
    JSON.stringify({ total, updatedAt: new Date().toISOString() }, null, 2) + '\n',
  );
  console.log(`baseline зафиксирован: ${total} ошибок`);
  process.exit(0);
}

if (!existsSync(BASELINE_FILE)) {
  console.error(`Нет ${BASELINE_FILE}. Выполните: node scripts/typecheck-baseline.mjs --update`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
let failed = false;

if (strictErrors.length > 0) {
  failed = true;
  console.error(`FAIL: ошибки типов в security-файлах (${strictErrors.length}):`);
  strictErrors.forEach((e) => console.error('  ' + e));
} else {
  console.log('PASS: security-файлы проходят строгую проверку типов');
}

if (total > baseline.total) {
  failed = true;
  console.error(`FAIL: ошибок стало больше — ${total} против baseline ${baseline.total}.`);
  console.error('      Почините новые ошибки; baseline поднимать нельзя.');
} else if (total < baseline.total) {
  console.log(`PASS: ошибок стало меньше — ${total} против ${baseline.total}.`);
  console.log('      Зафиксируйте прогресс: node scripts/typecheck-baseline.mjs --update');
} else {
  console.log(`PASS: число ошибок не изменилось (${total}).`);
}

process.exit(failed ? 1 : 0);
