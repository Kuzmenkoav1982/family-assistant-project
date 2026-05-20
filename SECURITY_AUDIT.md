# Security Audit Log

## SEC-1.5 — Audience-aware banner filtering (server-side viewer resolution)

**Status:** CLOSED ✅  
**Closed:** 2026-05-20  
**Commit:** b6cfc4b

### Scope

Public read endpoint (`status-banners-public`) и admin CRUD (`admin-status-banners`).

### Changes

| File | Change |
|---|---|
| `backend/status-banners-public/index.py` | `_resolve_viewer()` — viewer определяется ТОЛЬКО по валидным сессиям в БД. Query params / body / X-Admin-Token / isDemoMode игнорируются. |
| `backend/status-banners-public/index.py` | `_fetch_banners(allowed_audiences)` — SQL-фильтр строится из серверного списка. Python defense-in-depth поверх SQL. |
| `backend/status-banners-public/index.py` | `Cache-Control: private, no-store` для всех ответов (единый URL, разные данные по сессии — shared cache leakage исключён). |
| `backend/admin-status-banners/index.py` | `_verify_session_in_db()` — actor берётся только из верифицированной сессии. X-Admin-Actor из запроса игнорируется. |
| `backend/admin-status-banners/index.py` | CORS `Access-Control-Allow-Headers` не включает `X-Admin-Token` — legacy header заблокирован на уровне preflight. |

### Audience policy (server_resolved_v2)

```
viewer=public        → allowed: [all/public]
viewer=authenticated → allowed: [all/public, authenticated]
viewer=admin         → allowed: [all/public, authenticated, admins/admin]
```

### Truth table (verified live 2026-05-20)

| Check | Method | Result | Status |
|---|---|---|---|
| anonymous → public only | browser fetch | viewer=public, только SEC15_PUBLIC | ✅ |
| spoof ?viewer=admin | browser fetch | viewer=public | ✅ |
| legacy X-Admin-Token header | curl (non-browser) | viewer=public, только public-баннер | ✅ |
| X-Admin-Token в браузере | browser preflight | CORS block (405 preflight) | ✅ |
| valid user session | browser fetch | viewer=authenticated, PUBLIC+AUTH, без ADMIN | ✅ |
| valid admin session | browser fetch | viewer=admin, все три баннера | ✅ |
| invalid/fake token | browser fetch | viewer=public | ✅ |
| user token → admin CRUD | curl (non-browser) | 401 | ✅ |
| no token → admin CRUD | browser fetch | 401 | ✅ |
| admin token → admin CRUD | browser fetch | 200 | ✅ |
| Cache-Control | browser fetch | private, no-store (все ответы) | ✅ |

### curl evidence (non-browser, 2026-05-20)

**A. Legacy X-Admin-Token spoof:**
```
curl -s -H "X-Admin-Token: admin_authenticated" \
  "https://functions.poehali.dev/386b715a-41ad-4dbc-bfbd-a814d91d23ca"

→ viewer: "public", banners: [SEC15_PUBLIC only]
```

**B. User token on admin CRUD:**
```
curl -s -o NUL -w "%{http_code}" \
  -H "X-Auth-Token: <user_token>" \
  "https://functions.poehali.dev/cdbbdf7d-d94f-46d8-8356-105ff32484e0"

→ 401
```

### Live audience filter evidence (browser, 2026-05-20)

Test banners created: SEC15_PUBLIC (all), SEC15_AUTH (authenticated), SEC15_ADMIN (admins).

```
anonymous  | viewer: public        | banners: ['SEC15_PUBLIC']
user       | viewer: authenticated | banners: ['SEC15_AUTH', 'SEC15_PUBLIC']
admin      | viewer: admin         | banners: ['SEC15_ADMIN', 'SEC15_AUTH', 'SEC15_PUBLIC']
```

Deleted after verification.

---

## SEC-1.3 — Admin session token (hashed storage)

**Status:** CLOSED ✅  
**Note:** admin_sessions.token_hash = SHA-256. Plaintext не хранится.
