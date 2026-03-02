# Enhanced Query Capabilities for `get()` — Design

**Date:** 2026-03-01
**Status:** Approved
**Backlog:** #1 — Enhanced Query Capabilities for `get()` action
**Driver:** Future-proofing data access, primarily server-side usage

---

## Problem

`get()` currently uses `.match(filter)` which only supports exact equality:

```js
actions.get('tasks', { filter: { status: 'success' } })
// → .from('tasks').select('*').match({ status: 'success' })
```

Real applications need comparison operators, ordering, pagination, and aggregation.

## Decision Summary

- **API shape:** Option A — PostgREST-style string operators in filter values
- **Backward compatibility:** Not required (only Strategos consumes this today)
- **Parser location:** Shared `packages/query` package (adapter-agnostic IR)
- **Delivery:** Incremental phases

## Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Comparison operators (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`, `is`) | Current |
| 2 | Ordering & pagination (`order`, `limit`, `offset`) | Planned |
| 3 | Aggregation (`count`) | Planned |
| 4 | Logical operators (`or`, `not`) | Planned |

## API Shape

```js
// Comparison operators
actions.get('tasks', {
  filter: { status: 'eq.success', cost: 'gt.0.01' }
})

// Pattern matching
actions.get('tasks', {
  filter: { name: 'ilike.%deploy%' }
})

// In-list
actions.get('tasks', {
  filter: { status: 'in.(success,pending)' }
})

// Null checks
actions.get('tasks', {
  filter: { deleted_at: 'is.null' }
})

// Columns
actions.get('tasks', {
  columns: 'id,name,status',
  filter: { status: 'eq.active' }
})
```

## Architecture

### Shared parser: `packages/query`

Parses `'op.value'` filter strings into an intermediate representation (IR) that any adapter can consume.

```
packages/query/
  src/
    index.js        — public API (parseFilter, OPERATORS)
    parser.js       — parse 'op.value' strings into IR
    operators.js    — operator whitelist and classification
  spec/
    parser.spec.js  — unit tests
  package.json
```

### Intermediate Representation (IR)

`parseFilter(filterObject)` returns an array of filter descriptors:

```js
// Input
{ status: 'eq.success', cost: 'gt.0.01' }

// Output
[
  { column: 'status', op: 'eq', value: 'success' },
  { column: 'cost', op: 'gt', value: '0.01' }
]
```

Special cases:

- `in`: `{ status: 'in.(a,b)' }` → `{ column: 'status', op: 'in', value: ['a', 'b'] }`
- `is`: `{ deleted_at: 'is.null' }` → `{ column: 'deleted_at', op: 'is', value: null }`

### Operator classification

```js
export const OPERATORS = {
  core: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'],
  extended: ['like', 'ilike', 'in', 'is']
}
```

- **Core:** All adapters must support these
- **Extended:** Adapter-specific; adapters validate and throw `UnsupportedOperator` if not supported

### Adapter consumption

**Supabase** — direct method mapping (supabase-js methods match operator names):

```js
import { parseFilter } from '@kavach/query'

async function get(entity, data) {
  const { columns = '*', filter = {} } = data ?? {}
  let query = schemaClient.from(entity).select(columns)

  for (const { column, op, value } of parseFilter(filter)) {
    query = query[op](column, value)
  }

  return await query
}
```

**Convex** (future) — maps IR to filter builder:

```js
query.filter(q => {
  const conditions = filters.map(({ column, op, value }) =>
    q[op](q.field(column), value)
  )
  return q.and(...conditions)
})
```

### URL pass-through

The `[...slug]/+server.js` route is unchanged. URL params are already key-value pairs:

```
/data/public/tasks?status=eq.success&cost=gt.0.01&:select=id,name
```

The route passes `{ status: 'eq.success', cost: 'gt.0.01' }` as the filter object. The adapter parses the strings.

## Affected Files

| File | Change |
|------|--------|
| `packages/query/` (new) | Shared parser package |
| `adapters/supabase/src/actions.js` | `get()` uses `parseFilter` instead of `.match()` |
| `adapters/supabase/spec/actions.spec.js` | Updated tests for operator-based filtering |
| `packages/auth/src/types.js` | Document filter shape in `Action` typedef |
| `sites/supabase/.../[...slug]/+server.js` | No change needed (pass-through works as-is) |

## Cross-Adapter Compatibility

| Operator | Supabase | Convex | Notes |
|----------|----------|--------|-------|
| eq | `.eq()` | `q.eq()` | Universal |
| neq | `.neq()` | `q.neq()` | Universal |
| gt | `.gt()` | `q.gt()` | Universal |
| gte | `.gte()` | `q.gte()` | Universal |
| lt | `.lt()` | `q.lt()` | Universal |
| lte | `.lte()` | `q.lte()` | Universal |
| like | `.like()` | Unsupported | Supabase/SQL only |
| ilike | `.ilike()` | Unsupported | Supabase/SQL only |
| in | `.in()` | `q.or(q.eq(...), ...)` | Convex polyfills via OR |
| is | `.is()` | `q.eq(field, null)` | Convex maps to equality |
