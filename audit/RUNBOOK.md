# Activation runbook

Single-screen runbook to activate the vendor guard and run the test
foundation for the first time. Run from the repository root. Does
**not** require editing `package.json`.

## 1. Install browser for Playwright

```bash
bunx playwright install chromium
```

## 2. Capture the current baseline for the vendor guard

```bash
node scripts/audit-hardcoded-api.mjs --update
```

## 3. Verify the guard and run all tests

```bash
node scripts/audit-hardcoded-api.mjs && bunx vitest run && bunx playwright test
```

If `playwright.config.ts` does not perform `build` automatically in
your environment, use the explicit variant:

```bash
node scripts/audit-hardcoded-api.mjs && bunx vitest run && bun run build && bunx playwright test
```

## Success criteria

- chromium installed without errors;
- `audit/functions-poehali.baseline.json` updated after `--update`;
- plain `node scripts/audit-hardcoded-api.mjs` exits green (no new
  violations);
- vitest is green;
- playwright smoke is green.

## Important — after step 2

Review the diff of `audit/functions-poehali.baseline.json` before
committing. By committing this file you are explicitly accepting the
current state of `functions.poehali.dev` hardcodes as the starting
point of the guard.
