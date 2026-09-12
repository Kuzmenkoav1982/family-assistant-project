#!/usr/bin/env node
/**
 * Проверка карты функций относительно манифеста релиза.
 *
 * Зачем: наблюдался деплой, после которого backend/func2url.json терял
 * работающие URL. Функция при этом не падает — она просто перестаёт быть
 * доступной клиенту, и часть приложения молча уходит в нерабочее состояние.
 * Ручное восстановление карты — не решение: оно повторится при следующем
 * релизе и однажды не будет замечено.
 *
 * Правило: если обязательная функция исчезла из карты или её URL пуст,
 * релиз считается неуспешным.
 *
 * Использование:
 *   node scripts/check-deploy-manifest.mjs              # проверить
 *   node scripts/check-deploy-manifest.mjs --update     # принять новый состав
 *   node scripts/check-deploy-manifest.mjs --smoke      # + HTTP-проверки
 *
 * Exit code 0 — релиз валиден, 1 — релиз неуспешен.
 */

import { readFileSync, writeFileSync } from 'fs';

const MANIFEST = 'audit/release-manifest.json';
const MAP = 'backend/func2url.json';

const args = process.argv.slice(2);
const doUpdate = args.includes('--update');
const doSmoke = args.includes('--smoke');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf-8'));

let map;
try {
  map = readJson(MAP);
} catch (e) {
  console.error(`FAIL: не удалось прочитать ${MAP}: ${e.message}`);
  process.exit(1);
}

if (doUpdate) {
  const manifest = readJson(MANIFEST);
  manifest.required_functions = Object.keys(map).sort();
  manifest.total_expected = Object.keys(map).length;
  manifest.generated_at = new Date().toISOString();
  const stillMissing = manifest.critical_functions.filter((f) => !map[f]);
  if (stillMissing.length) {
    console.error(
      `FAIL: нельзя принять состав — отсутствуют критические функции: ${stillMissing.join(', ')}`,
    );
    process.exit(1);
  }
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`OK: манифест обновлён (${manifest.total_expected} функций)`);
  process.exit(0);
}

const manifest = readJson(MANIFEST);
const problems = [];

// 1. Обязательные функции не должны исчезать.
for (const name of manifest.required_functions) {
  if (!(name in map)) {
    problems.push(`исчезла функция: ${name}`);
  } else if (!map[name] || !String(map[name]).trim()) {
    problems.push(`пустой URL: ${name}`);
  }
}

// 2. Критические — отдельной строкой, они блокируют релиз всегда.
const criticalMissing = manifest.critical_functions.filter(
  (f) => !map[f] || !String(map[f]).trim(),
);

// 3. URL должен быть похож на рабочий адрес функции.
for (const [name, url] of Object.entries(map)) {
  if (!/^https:\/\/functions\.poehali\.dev\/[a-f0-9-]{36}$/.test(String(url))) {
    problems.push(`подозрительный URL у ${name}: ${url}`);
  }
}

const added = Object.keys(map).filter(
  (k) => !manifest.required_functions.includes(k),
);

console.log(`Манифест: ${manifest.required_functions.length} обязательных, ` +
  `${manifest.critical_functions.length} критических`);
console.log(`Карта:    ${Object.keys(map).length} функций`);
if (added.length) console.log(`Новые функции (не ошибка): ${added.join(', ')}`);

if (criticalMissing.length) {
  console.error(`\nКРИТИЧНО: ${criticalMissing.join(', ')}`);
}

if (problems.length) {
  console.error('\nFAIL: релиз неуспешен');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nОткатите релиз. Не восстанавливайте карту вручную.');
  process.exit(1);
}

if (!doSmoke) {
  console.log('\nOK: состав релиза соответствует манифесту');
  process.exit(0);
}

// ---------- POST-DEPLOY SMOKE ----------
// Проверяем не «страница открылась», а что защита реально работает:
// критический API без сессии обязан отвечать 401, а не 200.
const NO_AUTH_MUST_DENY = [
  'family-members',
  'family-invites',
  'health-profiles',
  'health-records',
  'health-medications',
  'children-data',
  'data-export',
  // Геолокация — после инцидента SEC-2026-001 весь блок под наблюдением.
  // Три из пяти функций этого раздела не имели аутентификации вообще,
  // и заметить это можно было только таким запросом.
  'location-history',
  'family-tracker',
  'family-tracker-members',
  'geofences',
  // Согласие на геоданные: анонимно нельзя ни узнать статус, ни — что
  // важнее — «согласиться» за кого-то. Согласие без установленной
  // личности не является согласием.
  'location-consent',
];

// Служебные обработчики: сессии у них нет, вход закрыт CRON_SECRET.
// Проверяем, что без секрета они не выполняют работу.
const CRON_MUST_DENY = [
  { name: 'geofence-notifications', method: 'POST' },
  // Очистка координат по истечении срока хранения: запуск посторонним
  // не должен быть возможен — это операция над персональными данными.
  { name: 'location-retention-cron', method: 'POST' },
];

const failures = [];

for (const name of NO_AUTH_MUST_DENY) {
  const url = map[name];
  if (!url) continue;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status !== 401 && res.status !== 403) {
      failures.push(`${name}: без сессии вернул ${res.status}, ожидался 401/403`);
    } else {
      console.log(`  OK  ${name} → ${res.status} без сессии`);
    }
  } catch (e) {
    failures.push(`${name}: запрос не выполнен (${e.message})`);
  }
}

// OPTIONS должен работать, иначе браузер не сможет обратиться к функции.
for (const name of NO_AUTH_MUST_DENY) {
  const url = map[name];
  if (!url) continue;
  try {
    const res = await fetch(url, { method: 'OPTIONS' });
    if (res.status !== 200) {
      failures.push(`${name}: OPTIONS вернул ${res.status}, ожидался 200`);
    }
  } catch (e) {
    failures.push(`${name}: OPTIONS не выполнен (${e.message})`);
  }
}

// Служебные cron-обработчики: без секрета — 401/403, но не 200.
// geofence-notifications отдавал 200 любому: он запускал рассылку
// уведомлений о выходе ребёнка из геозоны без всякой проверки.
for (const { name, method } of CRON_MUST_DENY) {
  const url = map[name];
  if (!url) continue;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? '{}' : undefined,
    });
    if (res.status !== 401 && res.status !== 403) {
      failures.push(
        `${name}: ${method} без cron-секрета вернул ${res.status}, ожидался 403`,
      );
    } else {
      console.log(`  OK  ${name} → ${res.status} без cron-секрета`);
    }
  } catch (e) {
    failures.push(`${name}: запрос не выполнен (${e.message})`);
  }
}

if (failures.length) {
  console.error('\nFAIL: post-deploy smoke не пройден');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\nOK: манифест и post-deploy smoke пройдены');
process.exit(0);