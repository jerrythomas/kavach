# Kavach Backlog

Living priority queue. Items are added when work is scoped out, deferred, or arrives as interrupts.
Reviewed and triaged between implementation phases.

---

## Done

| # | Item | Status |
|---|------|--------|
| 1 | Enhanced Query — comparison operators (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`, `is`) | Done |
| 1 | Enhanced Query — ordering, pagination, count (`order`, `limit`, `offset`, `count`) | Done |
| 2 | PATCH action filter support (`{ data, filter }` with `parseFilter`) | Done |
| 3 | DELETE action filter support (`{ filter }` with `parseFilter`) | Done |
| 5 | Fix remaining adapters (Firebase, Auth0, Amplify) | Done |
| 6 | Clean test warnings (vitest 4.x upgrade, suppress punycode) | Done |
| 1a | Auth UI — cached login cards, smart layout, passkey contract | Done |

---

## Active

### #7 — Unified Test Site

**Priority:** High
**File:** `docs/backlog/07-unified-test-site.md`

Single example site where you can switch the adapter and run e2e tests across all adapters and data plugins.

---

## Planned

### #8 — Enhanced Query Phase 3 — Logical Operators (`or`, `not`)

**Priority:** Low
**Design:** `docs/plans/2026-03-01-enhanced-query-capabilities-design.md` (Phase 3)

Add `or` and `not` logical operators to the query DSL. Deferred until there's a concrete need.

---

### #9 — `call()` (RPC) Missing from `ServerActions` Type

**Priority:** Low

The supabase adapter implements `call: (entity, data) => schemaClient.rpc(entity, data)` but `ServerActions` typedef only has `call` as optional. The generic CRUD route doesn't expose an RPC endpoint. Consider adding a convention like `POST /data/:schema/:fn/rpc`.

---

### #10 — TypeScript Migration

**Priority:** Low (quality of life)

All kavach packages use JSDoc typedefs. Consider migrating to TypeScript for better DX, especially as the query DSL gets more complex.

---

### #11 — Convex Adapter (`@kavach/adapter-convex`)

**Priority:** Medium

Kavach currently has Supabase, Firebase, Auth0, and Amplify adapters. Adding Convex support would enable Kavach-powered apps to use Convex for both auth and data.

**What's needed:**
- [ ] `@kavach/adapter-convex` package implementing `AuthAdapter`
- [ ] Convex `actions()` returning `ServerActions` (get/post/put/delete)
- [ ] Convex auth: signIn, signUp, signOut, onAuthChange, synchronize
- [ ] Tests + documentation

---

### #12 — Mix-and-Match Adapter Composition

**Priority:** Medium

Some apps need one provider for auth and another for data (e.g., Supabase Auth + Convex for data).

**What's needed:**
- [ ] `createCompositeAdapter(authAdapter, dataAdapter)` — combines two adapters
- [ ] Auth methods delegate to `authAdapter`
- [ ] `actions()` and `proxy()` delegate to `dataAdapter`
- [ ] Typing: `AuthOnlyAdapter` + `DataOnlyAdapter` interfaces

---

### #13 — Storage Plugin (`@kavach/storage`)

**Priority:** Low

File upload support following the same plugin pattern as the data plugin. A storage adapter provides upload/download/delete operations, wired through kavach like `kavach.storage()`.

**What's needed:**
- [ ] `StorageAdapter` interface (upload, download, delete, list)
- [ ] Supabase Storage implementation as reference
- [ ] Plugin pattern matching `kavach.server(schema)` for data
- [ ] Could pair with mix-and-match (#12) for separate auth/storage providers
