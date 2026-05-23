# Audit baseline

## functions-poehali.baseline.json

Snapshot of all files containing the literal `functions.poehali.dev`,
with the number of occurrences per file.

The guard at `scripts/audit-hardcoded-api.mjs` compares the current
state of the repository against this baseline and fails ONLY if:

- a new file with `functions.poehali.dev` appeared, OR
- an existing file gained more occurrences than recorded.

Existing hardcoded call-sites are intentionally allowed — they are
migrated separately, in small batches, through `src/lib/apiBase.ts`
(`API_BASE_URL` / `apiUrl`).

## How to add a new API call

For any new request, use `apiUrl()` from `@/lib/apiBase` instead of
hardcoding the vendor domain:

- correct: `apiUrl('/my-endpoint')`
- wrong:   `https://functions.poehali.dev/my-endpoint`

This keeps `VITE_API_BASE_URL` as the single source of truth and
prevents vendor-specific URLs from spreading across the codebase.

```ts
import { apiUrl } from '@/lib/apiBase';

await fetch(apiUrl('/my-endpoint'), { method: 'POST', body });
```

## What the guard checks

`scripts/audit-hardcoded-api.mjs` tracks occurrences of
`functions.poehali.dev` and fails only when:

- a new file with the hardcoded literal appears, OR
- the number of occurrences in a known file grows above baseline.

Existing technical debt does not break the guard as long as it is
recorded in the baseline.

## First run

The guard starts protecting the repo only **after** the baseline is
captured. Run once to record the current state:

```bash
node scripts/audit-hardcoded-api.mjs --update
```

This creates / refreshes `audit/functions-poehali.baseline.json` with
the current per-file occurrence counts.

Until this is done, the guard runs in bootstrap mode: it prints a
warning and exits 0, so it does not block CI but also does not
actually defend the codebase.

## Regular check

```bash
node scripts/audit-hardcoded-api.mjs
```

Returns non-zero only when a new hardcoded URL was introduced.

## When to refresh the baseline

Refresh the baseline only as an explicit, intentional commit when the
state of the technical debt has legitimately changed, for example:

- you migrated some hardcoded URLs to `apiUrl()`;
- you removed dead direct calls;
- you completed a mass cleanup batch.

**Important:** after every reduction in the number of hardcodes, the
baseline should be refreshed too. Otherwise the guard "softens": if
a file went from 5 → 3 but the baseline still says 5, someone could
silently bring it back to 4 and the guard would not catch it.

Commit the updated `audit/functions-poehali.baseline.json` together
with the migration commit.

## When NOT to refresh the baseline

Do **not** refresh the baseline automatically after every run.

If the guard reports a new hardcode — fix the code first (switch to
`apiUrl()`), do not silence the guard by overwriting the baseline.

Baseline updates are an explicit acceptance of a new allowed state,
not a way to make the warning go away.
