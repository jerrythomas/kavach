# Enhanced Query Phase 2 — Ordering, Pagination & Count Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `order`, `limit`, `offset`, and `count` support to `get()` across the query parser, Supabase adapter, and CRUD route.

**Architecture:** Extend `@kavach/query` with `parseOrder()` and `parseQueryParams()` parsers. Update the Supabase adapter's `get()` to apply ordering, pagination, and count via the parsed output. Update the CRUD route to extract reserved `:order`, `:limit`, `:offset`, `:count` URL params.

**Tech Stack:** JavaScript, Vitest, Supabase JS client, SvelteKit

---

### Task 1: Add `parseOrder` to `@kavach/query`

**Files:**
- Create: `solution/packages/query/src/order.js`
- Test: `solution/packages/query/spec/order.spec.js`

**Step 1: Write the failing tests**

Add `solution/packages/query/spec/order.spec.js`:

```js
import { describe, expect, it } from 'vitest'
import { parseOrder } from '../src/order.js'

describe('parseOrder', () => {
	it('should return empty array for undefined', () => {
		expect(parseOrder(undefined)).toEqual([])
	})

	it('should return empty array for empty string', () => {
		expect(parseOrder('')).toEqual([])
	})

	it('should parse single column ascending', () => {
		expect(parseOrder('name.asc')).toEqual([
			{ column: 'name', ascending: true }
		])
	})

	it('should parse single column descending', () => {
		expect(parseOrder('created_at.desc')).toEqual([
			{ column: 'created_at', ascending: false }
		])
	})

	it('should default to ascending when direction omitted', () => {
		expect(parseOrder('name')).toEqual([
			{ column: 'name', ascending: true }
		])
	})

	it('should parse multiple columns', () => {
		expect(parseOrder('status.asc,created_at.desc')).toEqual([
			{ column: 'status', ascending: true },
			{ column: 'created_at', ascending: false }
		])
	})

	it('should handle mixed explicit and default directions', () => {
		expect(parseOrder('name,created_at.desc')).toEqual([
			{ column: 'name', ascending: true },
			{ column: 'created_at', ascending: false }
		])
	})

	it('should throw on invalid direction', () => {
		expect(() => parseOrder('name.up')).toThrow('Invalid order direction')
	})
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && bun vitest run packages/query/spec/order.spec.js`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

Add `solution/packages/query/src/order.js`:

```js
/**
 * @typedef {Object} OrderDescriptor
 * @property {string} column
 * @property {boolean} ascending
 */

/**
 * Parse an order string into descriptors.
 * Format: 'column.direction,column.direction'
 * Direction defaults to 'asc' if omitted.
 *
 * @param {string} [order]
 * @returns {OrderDescriptor[]}
 */
export function parseOrder(order) {
	if (!order) return []

	return order.split(',').map((part) => {
		const trimmed = part.trim()
		const dotIndex = trimmed.lastIndexOf('.')
		const suffix = dotIndex !== -1 ? trimmed.slice(dotIndex + 1) : null

		if (suffix === 'asc' || suffix === 'desc') {
			return {
				column: trimmed.slice(0, dotIndex),
				ascending: suffix === 'asc'
			}
		}

		if (suffix !== null && suffix !== 'asc' && suffix !== 'desc') {
			// Could be column name with dots (e.g., 'table.column') or invalid direction
			// Check if suffix looks like a direction attempt
			if (/^[a-z]+$/.test(suffix) && suffix !== trimmed.slice(0, dotIndex)) {
				throw new Error(`Invalid order direction: "${suffix}" (expected "asc" or "desc")`)
			}
		}

		return { column: trimmed, ascending: true }
	})
}
```

**Step 4: Run test to verify it passes**

Run: `cd solution && bun vitest run packages/query/spec/order.spec.js`
Expected: PASS — all 8 tests

**Step 5: Commit**

```bash
git add solution/packages/query/src/order.js solution/packages/query/spec/order.spec.js
git commit -m "feat(query): add parseOrder for order string parsing"
```

---

### Task 2: Add `parseQueryParams` to `@kavach/query`

**Files:**
- Create: `solution/packages/query/src/queryParams.js`
- Test: `solution/packages/query/spec/queryParams.spec.js`
- Modify: `solution/packages/query/src/index.js`

**Step 1: Write the failing tests**

Add `solution/packages/query/spec/queryParams.spec.js`:

```js
import { describe, expect, it } from 'vitest'
import { parseQueryParams } from '../src/queryParams.js'

describe('parseQueryParams', () => {
	it('should return defaults for undefined input', () => {
		const result = parseQueryParams(undefined)
		expect(result).toEqual({
			columns: '*',
			filters: [],
			orders: [],
			limit: undefined,
			offset: undefined,
			count: undefined
		})
	})

	it('should return defaults for empty object', () => {
		const result = parseQueryParams({})
		expect(result).toEqual({
			columns: '*',
			filters: [],
			orders: [],
			limit: undefined,
			offset: undefined,
			count: undefined
		})
	})

	it('should pass through columns', () => {
		const result = parseQueryParams({ columns: 'id,name' })
		expect(result.columns).toBe('id,name')
	})

	it('should parse filters', () => {
		const result = parseQueryParams({ filter: { status: 'eq.active' } })
		expect(result.filters).toEqual([
			{ column: 'status', op: 'eq', value: 'active' }
		])
	})

	it('should parse order string', () => {
		const result = parseQueryParams({ order: 'created_at.desc' })
		expect(result.orders).toEqual([
			{ column: 'created_at', ascending: false }
		])
	})

	it('should pass through limit as number', () => {
		expect(parseQueryParams({ limit: 50 }).limit).toBe(50)
	})

	it('should coerce string limit to number', () => {
		expect(parseQueryParams({ limit: '50' }).limit).toBe(50)
	})

	it('should pass through offset as number', () => {
		expect(parseQueryParams({ offset: 100 }).offset).toBe(100)
	})

	it('should coerce string offset to number', () => {
		expect(parseQueryParams({ offset: '100' }).offset).toBe(100)
	})

	it('should pass through count', () => {
		expect(parseQueryParams({ count: 'exact' }).count).toBe('exact')
	})

	it('should parse all options together', () => {
		const result = parseQueryParams({
			columns: 'id,name',
			filter: { status: 'eq.active', cost: 'gt.0' },
			order: 'created_at.desc,status.asc',
			limit: 50,
			offset: 100,
			count: 'exact'
		})
		expect(result).toEqual({
			columns: 'id,name',
			filters: [
				{ column: 'status', op: 'eq', value: 'active' },
				{ column: 'cost', op: 'gt', value: '0' }
			],
			orders: [
				{ column: 'created_at', ascending: false },
				{ column: 'status', ascending: true }
			],
			limit: 50,
			offset: 100,
			count: 'exact'
		})
	})
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && bun vitest run packages/query/spec/queryParams.spec.js`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

Add `solution/packages/query/src/queryParams.js`:

```js
import { parseFilter } from './parser.js'
import { parseOrder } from './order.js'

/**
 * @typedef {Object} QueryParams
 * @property {string} columns
 * @property {import('./parser.js').FilterDescriptor[]} filters
 * @property {import('./order.js').OrderDescriptor[]} orders
 * @property {number} [limit]
 * @property {number} [offset]
 * @property {string} [count]
 */

/**
 * Parse a flat query options object into structured params.
 *
 * @param {Object} [data]
 * @returns {QueryParams}
 */
export function parseQueryParams(data) {
	const { columns = '*', filter, order, limit, offset, count } = data ?? {}

	return {
		columns,
		filters: parseFilter(filter),
		orders: parseOrder(order),
		limit: limit !== undefined ? Number(limit) : undefined,
		offset: offset !== undefined ? Number(offset) : undefined,
		count: count || undefined
	}
}
```

**Step 4: Update exports**

Modify `solution/packages/query/src/index.js`:

```js
export { OPERATORS, ALL_OPERATORS, isValidOperator } from './operators.js'
export { parseFilter } from './parser.js'
export { parseOrder } from './order.js'
export { parseQueryParams } from './queryParams.js'
```

**Step 5: Run test to verify it passes**

Run: `cd solution && bun vitest run packages/query/spec/queryParams.spec.js`
Expected: PASS — all 11 tests

**Step 6: Run all query tests**

Run: `cd solution && bun vitest run packages/query/`
Expected: PASS — all tests (existing parser + operators + new order + queryParams)

**Step 7: Commit**

```bash
git add solution/packages/query/src/queryParams.js solution/packages/query/spec/queryParams.spec.js solution/packages/query/src/order.js solution/packages/query/src/index.js
git commit -m "feat(query): add parseQueryParams for order, limit, offset, count"
```

---

### Task 3: Update Supabase adapter `get()` to use `parseQueryParams`

**Files:**
- Modify: `solution/adapters/supabase/src/actions.js`
- Modify: `solution/adapters/supabase/spec/actions.spec.js`

**Step 1: Update the mock client**

In `solution/adapters/supabase/spec/actions.spec.js`, add `order`, `limit`, and `range` to the `query` object inside `createClient()`:

```js
const query = {
	eq: vi.fn().mockReturnThis(),
	neq: vi.fn().mockReturnThis(),
	gt: vi.fn().mockReturnThis(),
	gte: vi.fn().mockReturnThis(),
	lt: vi.fn().mockReturnThis(),
	lte: vi.fn().mockReturnThis(),
	like: vi.fn().mockReturnThis(),
	ilike: vi.fn().mockReturnThis(),
	in: vi.fn().mockReturnThis(),
	is: vi.fn().mockReturnThis(),
	order: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
	range: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	then: vi.fn((resolve) => resolve(result))
}
```

**Step 2: Add tests for order, limit, offset, count**

Add these tests inside the existing `describe('get', ...)` block:

```js
it('should apply order', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', { order: 'created_at.desc' })
	expect(client._query.order).toHaveBeenCalledWith('created_at', { ascending: false })
})

it('should apply multiple orders', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', { order: 'status.asc,created_at.desc' })
	expect(client._query.order).toHaveBeenCalledTimes(2)
	expect(client._query.order).toHaveBeenCalledWith('status', { ascending: true })
	expect(client._query.order).toHaveBeenCalledWith('created_at', { ascending: false })
})

it('should apply limit', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', { limit: 50 })
	expect(client._query.limit).toHaveBeenCalledWith(50)
})

it('should apply offset via range', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', { limit: 50, offset: 100 })
	expect(client._query.range).toHaveBeenCalledWith(100, 149)
})

it('should apply offset with default limit', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', { offset: 100 })
	expect(client._query.range).toHaveBeenCalledWith(100, 1099)
})

it('should pass count option to select', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', { count: 'exact' })
	expect(client.select).toHaveBeenCalledWith('*', { count: 'exact' })
})

it('should not pass count option when not specified', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity')
	expect(client.select).toHaveBeenCalledWith('*', undefined)
})

it('should apply all options together', async () => {
	const client = createClient()
	const actions = getActions(client)
	await actions.get('entity', {
		columns: 'id,name',
		filter: { status: 'eq.active' },
		order: 'created_at.desc',
		limit: 25,
		offset: 50,
		count: 'exact'
	})
	expect(client.select).toHaveBeenCalledWith('id,name', { count: 'exact' })
	expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
	expect(client._query.order).toHaveBeenCalledWith('created_at', { ascending: false })
	expect(client._query.limit).toHaveBeenCalledWith(25)
	expect(client._query.range).toHaveBeenCalledWith(50, 74)
})
```

**Step 3: Run tests to verify new ones fail**

Run: `cd solution && bun vitest run adapters/supabase/spec/actions.spec.js`
Expected: FAIL — new tests fail (order/limit/range not called)

**Step 4: Update `get()` implementation**

Replace the `get` function in `solution/adapters/supabase/src/actions.js`:

```js
import { parseFilter, parseQueryParams } from '@kavach/query'

// ... inside getActions():

async function get(entity, data) {
	const { columns, filters, orders, limit, offset, count } = parseQueryParams(data)

	let query = schemaClient.from(entity).select(columns, count ? { count } : undefined)

	for (const { column, op, value } of filters) {
		query = query[op](column, value)
	}
	for (const { column, ascending } of orders) {
		query = query.order(column, { ascending })
	}
	if (limit !== undefined) query = query.limit(limit)
	if (offset !== undefined) query = query.range(offset, offset + (limit ?? 1000) - 1)

	return await query
}
```

Note: The existing `select` call `client.select('*')` changes to `client.select('*', undefined)` when no count. Update the test for `'should select data without input'` to expect `('*', undefined)` instead of just `('*')`.

**Step 5: Run tests to verify they pass**

Run: `cd solution && bun vitest run adapters/supabase/spec/actions.spec.js`
Expected: PASS — all tests (existing + 8 new)

**Step 6: Run full test suite**

Run: `cd solution && bun test:ci`
Expected: PASS — all 386+ tests

**Step 7: Commit**

```bash
git add solution/adapters/supabase/src/actions.js solution/adapters/supabase/spec/actions.spec.js
git commit -m "feat(supabase): add order, limit, offset, count support to get()"
```

---

### Task 4: Update types — add `count` to `ActionResponse`

**Files:**
- Modify: `solution/packages/auth/src/types.js`

**Step 1: Add count to ActionResponse typedef**

In `solution/packages/auth/src/types.js`, find the `ActionResponse` typedef and add `count`:

```js
/**
 * @typedef ActionResponse
 * @property {any}    [data]
 * @property {any}    [error]
 * @property {number} [count]
 * @property {number} status
 */
```

**Step 2: Run full test suite**

Run: `cd solution && bun test:ci`
Expected: PASS — no behavior change, just type docs

**Step 3: Commit**

```bash
git add solution/packages/auth/src/types.js
git commit -m "feat(auth): add count field to ActionResponse typedef"
```

---

### Task 5: Update CRUD route to extract query params from URL

**Files:**
- Modify: `solution/sites/supabase/src/routes/(server)/data/[...slug]/+server.js`

**Step 1: Update GET handler**

Replace the GET handler:

```js
const RESERVED = [':select', ':order', ':limit', ':offset', ':count']

export async function GET({ params, url }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = kavach.server(schema)
	const body = Object.fromEntries(url.searchParams.entries())

	const { data, error, count, status } = await actions.get(entity, {
		columns: body[':select'],
		order: body[':order'],
		limit: body[':limit'] ? Number(body[':limit']) : undefined,
		offset: body[':offset'] ? Number(body[':offset']) : undefined,
		count: body[':count'],
		filter: omit(RESERVED, body)
	})

	if (error) return json({ error }, { status })
	return json(count !== undefined ? { data, count } : data)
}
```

**Step 2: Run full test suite**

Run: `cd solution && bun test:ci`
Expected: PASS — route handler isn't unit tested, no breakage

**Step 3: Commit**

```bash
git add solution/sites/supabase/src/routes/\(server\)/data/\[...slug\]/+server.js
git commit -m "feat(site): wire order, limit, offset, count URL params in CRUD route"
```

---

### Task 6: Final verification

**Step 1: Run full test suite**

Run: `cd solution && bun test:ci`
Expected: PASS — all tests green

**Step 2: Verify exports**

Run: `cd solution && node -e "import('@kavach/query').then(m => console.log(Object.keys(m)))"`
Expected: `['OPERATORS', 'ALL_OPERATORS', 'isValidOperator', 'parseFilter', 'parseOrder', 'parseQueryParams']`

**Step 3: Verify backward compatibility**

Run: `cd solution && node -e "import('@kavach/query').then(({parseQueryParams: p}) => console.log(JSON.stringify(p())))"`
Expected: `{"columns":"*","filters":[],"orders":[]}`
