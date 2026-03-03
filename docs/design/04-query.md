# 04 — Query Design

## Overview

The query package (`@kavach/query`) parses flat key-value query parameters into a structured intermediate representation (IR). It validates syntax and operators but does not execute queries — adapters translate the IR to their native query API.

## Internal Modules

| Module | Purpose |
|--------|---------|
| `parser.js` | Filter parsing — splits `column: "op.value"` into IR |
| `order.js` | Order clause parsing — `"col.desc"` to `{ column, ascending }` |
| `operators.js` | Operator registry and validation |
| `validation.js` | Column name validation (regex-based) |
| `queryParams.js` | Unified entry point — combines filter, order, limit, offset, count |
| `sanitize.js` | Error sanitization — strips internal fields before client exposure |

## Architecture

### Parsing Pipeline

```
parseQueryParams(data)
  ├─ Extract: columns, filter, order, limit, offset, count
  ├─ parseFilter(filter)
  │   └─ For each { column: value }:
  │       ├─ Validate column name (regex: /^[a-zA-Z_][a-zA-Z0-9_.]*$/)
  │       ├─ Split value at first '.' → operator + rawValue
  │       ├─ Validate operator against registry
  │       └─ parseValue(op, rawValue)
  │           ├─ 'in' → strip parens, split by ',' → string[]
  │           ├─ 'is' → convert null/true/false literals
  │           └─ else → return as string
  ├─ parseOrder(order)
  │   └─ For each comma-separated part:
  │       ├─ Find last '.' to detect direction suffix
  │       ├─ 'asc'/'desc' → use that; else default 'asc'
  │       └─ Validate column name
  └─ Returns: QueryParams { columns, filters, orders, limit, offset, count }
```

### Intermediate Representation

**FilterDescriptor:**
```
{ column: string, op: string, value: string | string[] | boolean | null }
```

**OrderDescriptor:**
```
{ column: string, ascending: boolean }
```

**QueryParams:**
```
{
  columns: string,               // column projection (default '*')
  filters: FilterDescriptor[],
  orders: OrderDescriptor[],
  limit: number | undefined,
  offset: number | undefined,
  count: 'exact' | 'estimated' | undefined
}
```

### Operator System

Two tiers ensure adapters can implement at their own pace:

| Tier | Operators | Contract |
|------|-----------|----------|
| Core | eq, neq, gt, gte, lt, lte | All adapters must support |
| Extended | like, ilike, in, is | Adapter-specific; may throw or degrade |

Operators are validated at parse time. Unknown operators throw immediately — no invalid IR reaches the adapter.

### Value Parsing

Special handling per operator:

- **`in`** — `"in.(active,pending)"` → strips parens, splits by comma → `['active', 'pending']`
- **`is`** — `"is.null"` → `null`, `"is.true"` → `true`, `"is.false"` → `false`
- **All others** — raw string passthrough, trimmed

### Column Validation

Regex: `/^[a-zA-Z_][a-zA-Z0-9_.]*$/`

- Must start with letter or underscore
- May contain letters, digits, underscore, dot (for joined/nested columns like `profile.name`)
- Rejects: `123col`, `col-name`, `col$name`, empty strings

### Error Sanitization

`sanitizeError(error)` strips potentially sensitive fields (stack traces, internal codes) before returning errors to clients:

```
Input:  { message, code, status, stack, hint, details, ... }
Output: { message, code?, status? }
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| String-based IR, not executed | Package stays adapter-agnostic; adapters translate IR to Supabase `.eq()`, Firebase `.where()`, etc. |
| Flat input format | Compatible with URL query strings and form data; no nested JSON needed |
| Two-tier operators | Core set guarantees cross-adapter compatibility; extended set allows adapter-specific features |
| Parse-time validation | Fail fast — invalid queries never reach the database |
| No semantic validation | No column existence checks — that's the adapter/database's job |
| PostgREST-style syntax | Familiar to Supabase users; concise string format avoids JSON nesting |
