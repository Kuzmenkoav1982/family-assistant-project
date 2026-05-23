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

## Workflow

Initial baseline generation (run once after creating the guard):

```bash
node scripts/audit-hardcoded-api.mjs --update
```

Regular check:

```bash
node scripts/audit-hardcoded-api.mjs
```

Legitimate baseline refresh after a migration batch that reduced
or relocated occurrences:

```bash
node scripts/audit-hardcoded-api.mjs --update
```

Commit the updated `audit/functions-poehali.baseline.json` together
with the migration commit.

## New code

Do NOT add new hardcoded `functions.poehali.dev` URLs. Use:

```ts
import { API_BASE_URL, apiUrl } from '@/lib/apiBase';
```
