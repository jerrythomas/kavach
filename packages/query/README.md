# @kavach/query

PostgREST-style query string parsing utilities for Kavach data routes.

## Installation

```bash
bun add @kavach/query
```

## Usage

```js
import { parseFilter, parseOrder, parseQueryParams } from '@kavach/query'

// Parse filter conditions
const filters = parseFilter({ name: 'eq.Alice', age: 'gte.18' })
// => [{ column: 'name', op: 'eq', value: 'Alice' }, { column: 'age', op: 'gte', value: '18' }]

// Parse order clauses
const order = parseOrder('name.asc,created_at.desc')
// => [{ column: 'name', direction: 'asc' }, { column: 'created_at', direction: 'desc' }]

// Parse all query params at once
const params = parseQueryParams({
  filter: { status: 'eq.active' },
  order: 'name.asc',
  limit: '10'
})
```

## API

| Export                     | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `parseFilter(filter)`      | Parse a PostgREST-style filter object into `{ column, op, value }[]` |
| `parseOrder(order)`        | Parse an order string into `{ column, direction }[]`                 |
| `parseQueryParams(params)` | Parse all query params (filter, order, limit, offset)                |
| `sanitizeError(error)`     | Normalize error objects for safe client exposure                     |
| `isValidColumnName(name)`  | Validate a column name against an allowlist                          |
| `isValidOperator(op)`      | Check if a string is a supported filter operator                     |
| `OPERATORS`                | Set of standard filter operators (`eq`, `neq`, `lt`, `gt`, etc.)     |
| `ALL_OPERATORS`            | Set of all supported operators including array operators             |

## Supported Operators

Standard: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `like`, `ilike`, `is`, `in`

Array: `cs`, `cd`, `ov`, `sl`, `sr`, `nxr`, `nxl`, `adj`
