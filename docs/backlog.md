# Kavach Backlog

Living priority queue. Items are added when work is scoped out, deferred, or arrives as interrupts.
Reviewed and triaged between implementation phases.

---

## #1 — Enhanced Query Capabilities for `get()` action

**Priority:** High
**Requested by:** Strategos UI (analytics, admin panels)

### Problem

`get()` currently uses `.match(filter)` which only supports exact equality:

```js
actions.get('gateway_tasks', { filter: { status: 'success' } })
// → .from('gateway_tasks').select('*').match({ status: 'success' })
```

This is insufficient for real applications that need filtering, sorting, and pagination.

### Required Capabilities

**Comparison operators:**
- `eq`, `neq` — equals / not equals
- `gt`, `gte`, `lt`, `lte` — range comparisons
- `like`, `ilike` — pattern matching
- `in` — value in array
- `is` — null / not null checks

**Ordering & pagination:**
- `order` — sort by column(s), ascending/descending
- `limit` — max rows returned
- `offset` / `range` — pagination

**Aggregation:**
- `count` — row count (exact, planned, estimated)

**Logical operators:**
- `or` — OR conditions
- `not` — negate a filter

### Design Considerations

1. **Backward-compatible** — existing `{ columns, filter }` must keep working
2. **Adapter-agnostic** — the `ServerActions` interface is shared across adapters; the query DSL must not leak Supabase/PostgREST specifics
3. **URL-friendly** — the generic CRUD route (`/data/[...slug]`) passes query params as filters. Need a convention for operators in URL params (e.g., `?cost=gt.0.5` or `?:order=created_at.desc` or `?:limit=50`)
4. **Progressive** — simple cases stay simple; advanced filters opt-in

### Possible API Shapes

**Option A — PostgREST-style string operators in filter values:**

```js
actions.get('tasks', {
  filter: { status: 'eq.success', cost: 'gt.0.01' },
  order: 'created_at.desc',
  limit: 50
})
```

URL: `/data/public/tasks?status=eq.success&cost=gt.0.01&:order=created_at.desc&:limit=50`

**Option B — Structured filter objects:**

```js
actions.get('tasks', {
  filter: [
    { column: 'status', op: 'eq', value: 'success' },
    { column: 'cost', op: 'gt', value: 0.01 }
  ],
  order: [{ column: 'created_at', ascending: false }],
  limit: 50
})
```

**Option C — Chained builder (new method, keep `get` simple):**

```js
actions.query('tasks')
  .select('id, status, cost')
  .eq('status', 'success')
  .gt('cost', 0.01)
  .order('created_at', { ascending: false })
  .limit(50)
  .execute()
```

### Recommendation

Option A is the lightest touch — backward-compatible (bare values default to `eq`), URL-friendly, and maps naturally to PostgREST. The generic CRUD route already uses `:select` as a reserved prefix; extend with `:order`, `:limit`, `:offset`.

### Affected Files

- `packages/auth/src/types.js` — `ServerActions`, `Action` typedefs
- `adapters/supabase/src/actions.js` — `get()` implementation
- Any consuming app's `[...slug]/+server.ts` — URL param parsing

---

## #2 — PATCH action needs filter support

**Priority:** Medium

Currently `patch` takes `(entity, data)` and calls `.update(data).select()` — but there's no way to specify a WHERE clause. You have to include the match criteria in the body, which Supabase doesn't support for `.update()`.

```js
// Current — no filter, updates ALL rows (dangerous)
actions.patch('features', { enabled: true })

// Needed — update with filter
actions.patch('features', { enabled: true }, { id: 'some-uuid' })
// or
actions.patch('features', { data: { enabled: true }, filter: { id: 'some-uuid' } })
```

### Fix

Add optional filter parameter to `patch()`, apply via `.match(filter)` before `.update()`.

---

## #3 — DELETE action uses `.match()` on body

**Priority:** Low

`delete(entity, data)` passes the entire body to `.match()`. This works but is inconsistent with how `patch` and `get` handle filters. Consider aligning all write operations to accept `{ data, filter }`.

---

## #4 — `call()` (RPC) missing from `ServerActions` type

**Priority:** Low

The supabase adapter implements `call: (entity, data) => schemaClient.rpc(entity, data)` but `ServerActions` typedef only has `call` as optional (`[call]`). The generic CRUD route doesn't expose an RPC endpoint. Consider adding a convention like `POST /data/:schema/:fn/rpc` or similar.

---

## #5 — TypeScript Migration

**Priority:** Low (quality of life)

All kavach packages use JSDoc typedefs. Consider migrating to TypeScript for better DX, especially as the query DSL gets more complex.

---

## #6 — Convex Adapter (`@kavach/adapter-convex`)

**Priority:** Medium

**Context:** Strategos uses Convex as one of 4 pluggable backends. Kavach currently only has a Supabase adapter. Adding Convex support would enable Kavach-powered apps (like the Strategos UI) to use Convex for both auth and data.

### What exists
- `AuthAdapter` interface in `packages/auth/src/types.js`
- `@kavach/adapter-supabase` as reference implementation
- Convex Auth SDK available

### What's needed
- [ ] `@kavach/adapter-convex` package implementing `AuthAdapter`
- [ ] Convex `actions()` returning `ServerActions` (get/post/put/delete)
- [ ] Convex auth: signIn, signUp, signOut, onAuthChange, synchronize
- [ ] Tests + documentation

---

## #7 — Mix-and-Match Adapter Composition

**Priority:** Medium

**Context:** Some apps need one provider for auth and another for data. For example, Supabase Auth + Strategos store for data, or Supabase Auth + Convex for data.

### What exists
- `AuthAdapter` combines auth + data (`actions()`) in one interface
- `createKavach()` takes a single adapter

### What's needed
- [ ] `createCompositeAdapter(authAdapter, dataAdapter)` — combines two adapters
- [ ] Auth methods delegate to `authAdapter`
- [ ] `actions()` and `proxy()` delegate to `dataAdapter`
- [ ] Typing: `AuthOnlyAdapter` + `DataOnlyAdapter` interfaces

---

## #8 — Strategos Store Adapter (`@kavach/adapter-strategos`)

**Priority:** Low

**Context:** Strategos has a pluggable repository layer (`@strategos/store`) supporting 4 backends. A kavach adapter wrapping this would let the Strategos UI use `kavach.actions()` with any Strategos backend (Supabase, Postgres, Convex, JSON).

### What exists
- `ServerActions` interface: `{ get, put, post, delete, patch }`
- `@strategos/store` repository with `getUiRepository()`, `getCatalogRepository()`
- Existing `(server)/data/[...slug]` pattern in FizzBot/Strategos UI

### What's needed
- [ ] `@kavach/adapter-strategos` wrapping store repository as `ServerActions`
- [ ] Map `actions.get(entity, opts)` → repository `.list()` / `.get()`
- [ ] Map `actions.post(entity, body)` → repository `.create()`
- [ ] Map `actions.put(entity, body)` → repository `.update()`
- [ ] Map `actions.delete(entity, body)` → repository `.delete()`
- [ ] Backend selection via env var (`BACKEND=supabase|postgres|json|convex`)
- [ ] Would pair with mix-and-match (#7) for auth: Supabase, data: strategos/store
