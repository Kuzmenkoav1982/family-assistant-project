#!/usr/bin/env node
/**
 * Guard against new hardcoded `functions.poehali.dev` call-sites.
 *
 * Compares the current count of occurrences per file against
 * `audit/functions-poehali.baseline.json` and fails ONLY if:
 *   - a new file containing the pattern appeared, OR
 *   - an existing file gained more occurrences than the baseline.
 *
 * Existing 146 occurrences are allowed and tracked, but not migrated here.
 *
 * Usage:
 *   node scripts/audit-hardcoded-api.mjs            # check against baseline
 *   node scripts/audit-hardcoded-api.mjs --update   # rewrite baseline from current state
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASELINE_PATH = join(ROOT, 'audit', 'functions-poehali.baseline.json');
const PATTERN = 'functions.poehali.dev';

const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'playwright-report',
  'test-results',
  '.next',
  '.cache',
]);

const EXCLUDED_FILES = new Set([
  'bun.lockb',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'audit/functions-poehali.baseline.json',
]);

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp',
  '.svg',
  '.pdf', '.zip', '.gz', '.tgz', '.tar', '.7z', '.rar',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.mp3', '.wav', '.ogg', '.webm',
  '.lockb',
]);

function shouldSkipDir(name) {
  return EXCLUDED_DIRS.has(name) || name.startsWith('.') && name !== '.env.example';
}

function shouldSkipFile(relPath) {
  if (EXCLUDED_FILES.has(relPath.split(sep).join('/'))) return true;
  const lower = relPath.toLowerCase();
  for (const ext of BINARY_EXT) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (shouldSkipDir(entry)) continue;
      walk(full, acc);
    } else if (st.isFile()) {
      const rel = relative(ROOT, full);
      if (shouldSkipFile(rel)) continue;
      acc.push(rel);
    }
  }
  return acc;
}

function countOccurrences(text, needle) {
  if (!text.includes(needle)) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = text.indexOf(needle, idx)) !== -1) {
    count++;
    idx += needle.length;
  }
  return count;
}

function collectCurrent() {
  const files = walk(ROOT);
  const result = {};
  for (const rel of files) {
    let content;
    try {
      content = readFileSync(join(ROOT, rel), 'utf8');
    } catch {
      continue;
    }
    const n = countOccurrences(content, PATTERN);
    if (n > 0) {
      result[rel.split(sep).join('/')] = n;
    }
  }
  return result;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch (err) {
    console.error(`[audit] failed to parse baseline: ${err.message}`);
    process.exit(2);
  }
}

function writeBaseline(map) {
  const sorted = Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

function main() {
  const args = process.argv.slice(2);
  const update = args.includes('--update');

  const current = collectCurrent();
  const totalFiles = Object.keys(current).length;
  const totalOcc = Object.values(current).reduce((a, b) => a + b, 0);

  if (update) {
    writeBaseline(current);
    console.log(`[audit] baseline updated: ${totalFiles} files, ${totalOcc} occurrences`);
    return;
  }

  const baseline = loadBaseline();
  if (!baseline || Object.keys(baseline).length === 0) {
    console.warn(
      `[audit] baseline is empty or missing at ${relative(ROOT, BASELINE_PATH)}.\n` +
        `[audit] First-time setup: run \`node scripts/audit-hardcoded-api.mjs --update\` ` +
        `to record the current ${totalFiles} files / ${totalOcc} occurrences as the baseline.\n` +
        `[audit] Skipping check for now (exit 0).`,
    );
    return;
  }

  const newFiles = [];
  const grown = [];

  for (const [file, count] of Object.entries(current)) {
    const prev = baseline[file];
    if (prev === undefined) {
      newFiles.push({ file, count });
    } else if (count > prev) {
      grown.push({ file, count, prev });
    }
  }

  console.log(
    `[audit] current: ${totalFiles} files, ${totalOcc} occurrences. ` +
      `baseline: ${Object.keys(baseline).length} files.`,
  );

  if (newFiles.length === 0 && grown.length === 0) {
    console.log('[audit] OK — no new hardcoded functions.poehali.dev usages.');
    return;
  }

  if (newFiles.length > 0) {
    console.error('[audit] NEW files with hardcoded functions.poehali.dev:');
    for (const { file, count } of newFiles) {
      console.error(`  + ${file} (${count})`);
    }
  }
  if (grown.length > 0) {
    console.error('[audit] files with INCREASED count of functions.poehali.dev:');
    for (const { file, count, prev } of grown) {
      console.error(`  ~ ${file} (${prev} -> ${count})`);
    }
  }
  console.error(
    '[audit] FAIL — use src/lib/apiBase.ts (API_BASE_URL / apiUrl) for new code, ' +
      'or run with --update if migration legitimately changed the baseline.',
  );
  process.exit(1);
}

main();