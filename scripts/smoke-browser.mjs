/**
 * K1 — Browser smoke automation script.
 *
 * Открывает приложение в headless Chrome (Playwright) и запускает
 * window.__smoke.report() + window.__smoke.release().
 *
 * Использование:
 *   npx playwright install chromium --with-deps
 *   SMOKE_BASE_URL=https://your-app.poehali.dev node scripts/smoke-browser.mjs
 *
 * Или через npm script:
 *   npm run smoke:browser
 *   SMOKE_BASE_URL=http://localhost:5173 npm run smoke:browser
 *
 * Exit codes:
 *   0 — все тесты прошли
 *   1 — есть упавшие тесты или ошибка запуска
 *
 * CI пример (GitHub Actions):
 *   - run: SMOKE_BASE_URL=${{ env.DEPLOY_URL }} npm run smoke:browser
 */

import { chromium } from 'playwright';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5173';
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS || '30000', 10);
const HEADLESS = process.env.SMOKE_HEADLESS !== 'false';

console.log(`\n🧪 Browser smoke runner`);
console.log(`   URL:     ${BASE_URL}`);
console.log(`   Timeout: ${TIMEOUT_MS}ms`);
console.log(`   Mode:    ${HEADLESS ? 'headless' : 'headed'}\n`);

let browser;
let exitCode = 0;

try {
  browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage();

  // Перехватываем console для видимости прогона в CI
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') process.stderr.write(`  [browser:error] ${text}\n`);
    else if (type === 'warn') process.stderr.write(`  [browser:warn]  ${text}\n`);
    else if (text.includes('smoke') || text.includes('Smoke') || text.includes('✅') || text.includes('❌')) {
      process.stdout.write(`  [browser] ${text}\n`);
    }
  });

  // Открываем приложение
  console.log(`→ Opening ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });

  // Ждём инициализации smoke runner
  console.log(`→ Waiting for window.__smoke...`);
  await page.waitForFunction(
    () => typeof window.__smoke !== 'undefined' && typeof window.__smoke.report === 'function',
    { timeout: TIMEOUT_MS },
  );
  console.log(`✓ Smoke runner ready\n`);

  // Ждём build info
  const buildInfo = await page.evaluate(() => window.__APP_BUILD__ ?? null);
  if (buildInfo) {
    console.log(`📦 Build: commit=${buildInfo.commit} mode=${buildInfo.mode}`);
    console.log(`   startedAt=${buildInfo.startedAt}\n`);
  } else {
    console.warn(`⚠️  window.__APP_BUILD__ not found\n`);
  }

  // Запускаем report (machine-readable)
  console.log(`→ Running window.__smoke.report()...`);
  const report = await page.evaluate(async () => {
    return await window.__smoke.report();
  });

  // Печатаем сводку
  console.log(`\n📊 Smoke Report`);
  console.log(`   Total passed:  ${report.totalPassed}`);
  console.log(`   Total failed:  ${report.totalFailed}`);
  console.log(`   Duration:      ${report.totalDurationMs}ms`);
  console.log(`   Suites:        ${report.suites.length}\n`);

  // Таблица по сьютам
  for (const suite of report.suites) {
    const icon = suite.failed === 0 ? '✅' : '❌';
    console.log(`   ${icon} ${suite.suite.padEnd(25)} ${suite.passed}✓ ${suite.failed}✗ (${suite.durationMs}ms)`);
  }

  // Детали упавших
  if (report.totalFailed > 0) {
    console.error(`\n❌ Failed tests:\n`);
    for (const suite of report.suites) {
      for (const t of suite.tests.filter(x => !x.ok)) {
        console.error(`   [${suite.suite}] ${t.name}${t.details ? ' — ' + t.details : ''}`);
      }
    }
    exitCode = 1;
  }

  // Запускаем release checklist
  console.log(`\n→ Running window.__smoke.release()...`);
  const release = await page.evaluate(async () => {
    return await window.__smoke.release();
  });

  if (!release.ok) {
    console.error(`❌ Release checklist: ${release.failed} check(s) failed`);
    exitCode = 1;
  } else {
    console.log(`✅ Release checklist: all checks passed`);
  }

  // Финальный вердикт
  console.log(`\n${'─'.repeat(50)}`);
  if (exitCode === 0) {
    console.log(`✅ SMOKE PASSED — build is ready`);
  } else {
    console.error(`❌ SMOKE FAILED — do not release`);
  }
  console.log(`${'─'.repeat(50)}\n`);

} catch (err) {
  console.error(`\n💥 Smoke runner error: ${err.message}\n`);
  if (err.stack) console.error(err.stack);
  exitCode = 1;
} finally {
  if (browser) await browser.close();
}

process.exit(exitCode);
