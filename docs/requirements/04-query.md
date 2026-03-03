# 04 — Query

## What

The query package (`@kavach/query`) provides adapter-agnostic query filter parsing. It:

- **Parses filters** — converts PostgREST-style `{ column: "op.value" }` strings into a structured intermediate representation
- **Parses ordering** — handles `order` specs for sorting results
- **Parses query params** — combines filters, ordering, pagination, and count into a single parsed object
- **Validates operators** — ensures only supported operators are used
- **Sanitizes errors** — strips sensitive fields from error objects before sending to clients

## Why

Data operations need filtering, sorting, and pagination. Rather than each adapter implementing its own query parsing, this package provides a shared IR (intermediate representation) that any adapter can consume:

1. **Consistency** — same filter syntax (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`, `is`) across all adapters
2. **Security** — validates column names and operators, preventing injection attacks
3. **Separation** — query parsing is decoupled from query execution; adapters translate the IR to their native query API

## Scope

### In scope
- `parseFilter(filter)` — `{ name: "eq.john" }` → `[{ column: 'name', op: 'eq', value: 'john' }]`
- `parseOrder(order)` — ordering spec to structured form
- `parseQueryParams(params)` — full query parsing (filter + order + limit + offset + count)
- `sanitizeError(error)` — strip sensitive fields, return `{ message, code?, status? }`
- Operator validation: `isValidOperator(op)`, `isValidColumnName(col)`
- Operator sets: core (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`) and extended (`like`, `ilike`, `in`, `is`)

### Out of scope
- Query execution (adapter responsibility)
- Logical operators `or`, `not` (planned, not implemented)
- Join/relation queries

## Operators

| Category | Operators | Required |
|----------|-----------|----------|
| Core | eq, neq, gt, gte, lt, lte | All adapters |
| Extended | like, ilike, in, is | Adapter-specific |

## Filter Format

```
Input:  { status: "in.(active,pending)", age: "gte.18" }
Output: [
  { column: 'status', op: 'in', value: ['active', 'pending'] },
  { column: 'age',    op: 'gte', value: '18' }
]
```

## Dependencies

None — standalone package with no kavach dependencies.
