# Enhanced Query Capabilities — Implementation Plan (Phase 1)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comparison operator support to `get()` via a shared query parser package.

**Architecture:** New `packages/query` package parses PostgREST-style filter strings (`'eq.value'`) into adapter-agnostic IR. Supabase adapter consumes IR by calling matching supabase-js methods (`.eq()`, `.gt()`, etc.) instead of `.match()`.

**Tech Stack:** JavaScript (ESM), vitest, bun workspaces, JSDoc types

---

### Task 1: Create `packages/query` package scaffold

**Files:**
- Create: `packages/query/package.json`
- Create: `packages/query/src/index.js`

**Step 1: Create package.json**

```json
{
  "name": "@kavach/query",
  "version": "1.0.0-next.29",
  "description": "Adapter-agnostic query filter parser for kavach",
  "author": "Jerry Thomas <me@jerrythomas.name>",
  "license": "MIT",
  "module": "src/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "repository": {
    "type": "git",
    "url": "https://github.com/jerrythomas/kavach",
    "directory": "packages/query"
  },
  "prettier": "@jerrythomas/prettier-config",
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "prepublishOnly": "bun clean && bun tsc --project tsconfig.build.json",
    "clean": "rm -rf dist",
    "build": "bun prepublishOnly"
  },
  "files": [
    "src/**/*.js",
    "dist/**/*.d.ts",
    "README.md",
    "package.json"
  ],
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./src/index.js"
    }
  }
}
```

**Step 2: Create empty index.js with placeholder exports**

```js
export { OPERATORS } from './operators.js'
export { parseFilter } from './parser.js'
```

**Step 3: Install dependencies**

Run: `cd /Users/Jerry/Developer/kavach && bun install`
Expected: Resolves workspace, no errors

**Step 4: Commit**

```bash
git add packages/query/package.json packages/query/src/index.js
git commit -m "chore: scaffold @kavach/query package"
```

---

### Task 2: Implement operator definitions

**Files:**
- Create: `packages/query/src/operators.js`
- Test: `packages/query/spec/operators.spec.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest'
import { OPERATORS, ALL_OPERATORS, isValidOperator } from '../src/operators.js'

describe('operators', () => {
	it('should define core operators', () => {
		expect(OPERATORS.core).toEqual(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])
	})

	it('should define extended operators', () => {
		expect(OPERATORS.extended).toEqual(['like', 'ilike', 'in', 'is'])
	})

	it('should export all operators as flat array', () => {
		expect(ALL_OPERATORS).toEqual(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is'])
	})

	it('should validate known operators', () => {
		expect(isValidOperator('eq')).toBe(true)
		expect(isValidOperator('gt')).toBe(true)
		expect(isValidOperator('in')).toBe(true)
		expect(isValidOperator('is')).toBe(true)
	})

	it('should reject unknown operators', () => {
		expect(isValidOperator('foo')).toBe(false)
		expect(isValidOperator('match')).toBe(false)
		expect(isValidOperator('')).toBe(false)
	})
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run packages/query/spec/operators.spec.js`
Expected: FAIL — module not found

**Step 3: Write implementation**

```js
/**
 * Core operators — all adapters must support these
 * Extended operators — adapter-specific support
 */
export const OPERATORS = {
	core: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'],
	extended: ['like', 'ilike', 'in', 'is']
}

export const ALL_OPERATORS = [...OPERATORS.core, ...OPERATORS.extended]

/**
 * @param {string} op
 * @returns {boolean}
 */
export function isValidOperator(op) {
	return ALL_OPERATORS.includes(op)
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run packages/query/spec/operators.spec.js`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/query/src/operators.js packages/query/spec/operators.spec.js
git commit -m "feat(query): add operator definitions and validation"
```

---

### Task 3: Implement filter parser — core operators

**Files:**
- Create: `packages/query/src/parser.js`
- Test: `packages/query/spec/parser.spec.js`

**Step 1: Write the failing tests for core operators**

```js
import { describe, expect, it } from 'vitest'
import { parseFilter } from '../src/parser.js'

describe('parseFilter', () => {
	it('should return empty array for empty filter', () => {
		expect(parseFilter({})).toEqual([])
	})

	it('should return empty array for undefined/null', () => {
		expect(parseFilter(undefined)).toEqual([])
		expect(parseFilter(null)).toEqual([])
	})

	it('should parse eq operator', () => {
		expect(parseFilter({ status: 'eq.success' })).toEqual([
			{ column: 'status', op: 'eq', value: 'success' }
		])
	})

	it('should parse neq operator', () => {
		expect(parseFilter({ status: 'neq.failed' })).toEqual([
			{ column: 'status', op: 'neq', value: 'failed' }
		])
	})

	it('should parse gt operator', () => {
		expect(parseFilter({ cost: 'gt.0.01' })).toEqual([
			{ column: 'cost', op: 'gt', value: '0.01' }
		])
	})

	it('should parse gte operator', () => {
		expect(parseFilter({ cost: 'gte.100' })).toEqual([
			{ column: 'cost', op: 'gte', value: '100' }
		])
	})

	it('should parse lt operator', () => {
		expect(parseFilter({ age: 'lt.18' })).toEqual([
			{ column: 'age', op: 'lt', value: '18' }
		])
	})

	it('should parse lte operator', () => {
		expect(parseFilter({ age: 'lte.65' })).toEqual([
			{ column: 'age', op: 'lte', value: '65' }
		])
	})

	it('should parse multiple filters', () => {
		expect(parseFilter({ status: 'eq.active', cost: 'gt.0' })).toEqual([
			{ column: 'status', op: 'eq', value: 'active' },
			{ column: 'cost', op: 'gt', value: '0' }
		])
	})

	it('should preserve dots in value after operator', () => {
		expect(parseFilter({ cost: 'gt.0.01' })).toEqual([
			{ column: 'cost', op: 'gt', value: '0.01' }
		])
	})

	it('should throw on unknown operator', () => {
		expect(() => parseFilter({ status: 'foo.bar' })).toThrow('Unknown operator: foo')
	})
})
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run packages/query/spec/parser.spec.js`
Expected: FAIL — module not found

**Step 3: Write implementation**

```js
import { isValidOperator } from './operators.js'

/**
 * @typedef {Object} FilterDescriptor
 * @property {string} column
 * @property {string} op
 * @property {string|string[]|null} value
 */

/**
 * Parse a filter object with PostgREST-style operator strings into IR.
 *
 * @param {Record<string, string>} [filter]
 * @returns {FilterDescriptor[]}
 */
export function parseFilter(filter) {
	if (!filter) return []

	return Object.entries(filter).map(([column, raw]) => {
		const dotIndex = raw.indexOf('.')
		if (dotIndex === -1) {
			throw new Error(`Invalid filter value for "${column}": expected "op.value" format`)
		}

		const op = raw.slice(0, dotIndex)
		const rawValue = raw.slice(dotIndex + 1)

		if (!isValidOperator(op)) {
			throw new Error(`Unknown operator: ${op}`)
		}

		return { column, op, value: parseValue(op, rawValue) }
	})
}

/**
 * @param {string} op
 * @param {string} raw
 * @returns {string|string[]|null}
 */
function parseValue(op, raw) {
	if (op === 'in') {
		const inner = raw.replace(/^\(/, '').replace(/\)$/, '')
		return inner.split(',').map((s) => s.trim())
	}
	if (op === 'is') {
		return raw === 'null' ? null : raw
	}
	return raw
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run packages/query/spec/parser.spec.js`
Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add packages/query/src/parser.js packages/query/spec/parser.spec.js
git commit -m "feat(query): implement filter parser for core operators"
```

---

### Task 4: Add extended operator tests (like, ilike, in, is)

**Files:**
- Modify: `packages/query/spec/parser.spec.js`

**Step 1: Add failing tests for extended operators**

Append to the `parseFilter` describe block in `packages/query/spec/parser.spec.js`:

```js
	it('should parse like operator', () => {
		expect(parseFilter({ name: 'like.%deploy%' })).toEqual([
			{ column: 'name', op: 'like', value: '%deploy%' }
		])
	})

	it('should parse ilike operator', () => {
		expect(parseFilter({ name: 'ilike.%Deploy%' })).toEqual([
			{ column: 'name', op: 'ilike', value: '%Deploy%' }
		])
	})

	it('should parse in operator with list', () => {
		expect(parseFilter({ status: 'in.(success,pending)' })).toEqual([
			{ column: 'status', op: 'in', value: ['success', 'pending'] }
		])
	})

	it('should parse in operator with single value', () => {
		expect(parseFilter({ status: 'in.(active)' })).toEqual([
			{ column: 'status', op: 'in', value: ['active'] }
		])
	})

	it('should parse is.null', () => {
		expect(parseFilter({ deleted_at: 'is.null' })).toEqual([
			{ column: 'deleted_at', op: 'is', value: null }
		])
	})

	it('should parse is.true', () => {
		expect(parseFilter({ active: 'is.true' })).toEqual([
			{ column: 'active', op: 'is', value: 'true' }
		])
	})

	it('should parse is.false', () => {
		expect(parseFilter({ active: 'is.false' })).toEqual([
			{ column: 'active', op: 'is', value: 'false' }
		])
	})
```

**Step 2: Run tests**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run packages/query/spec/parser.spec.js`
Expected: PASS — implementation from Task 3 already handles these

**Step 3: Commit**

```bash
git add packages/query/spec/parser.spec.js
git commit -m "test(query): add extended operator test coverage"
```

---

### Task 5: Update supabase adapter to use parseFilter

**Files:**
- Modify: `adapters/supabase/src/actions.js`
- Modify: `adapters/supabase/package.json`

**Step 1: Add @kavach/query dependency to supabase adapter**

In `adapters/supabase/package.json`, add to dependencies:

```json
"@kavach/query": "workspace:*"
```

Run: `cd /Users/Jerry/Developer/kavach && bun install`

**Step 2: Update get() implementation**

Replace the `get` function in `adapters/supabase/src/actions.js`:

```js
import { parseFilter } from '@kavach/query'

// ... inside getActions():

async function get(entity, data) {
	const { columns = '*', filter = {} } = data ?? {}
	let query = schemaClient.from(entity).select(columns)

	for (const { column, op, value } of parseFilter(filter)) {
		query = query[op](column, value)
	}

	return await query
}
```

**Step 3: Commit**

```bash
git add adapters/supabase/src/actions.js adapters/supabase/package.json
git commit -m "feat(supabase): use parseFilter in get() action"
```

---

### Task 6: Update supabase adapter tests

**Files:**
- Modify: `adapters/supabase/spec/actions.spec.js`

**Step 1: Update mock to support chained operator methods**

The mock currently returns `{ match: result }` from `select()`. We need it to support chained `.eq()`, `.gt()`, etc. Each operator method returns the query itself (for chaining), and the query is thenable (resolves to result).

Replace the client mock at the top of `actions.spec.js`:

```js
import { describe, expect, it, vi } from 'vitest'
import { getActions } from '../src/actions'

describe('actions', () => {
	const result = { status: 200 }

	function createClient() {
		const query = {
			match: vi.fn().mockResolvedValue(result),
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
			then: vi.fn((resolve) => resolve(result))
		}
		return {
			from: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnValue(query),
			insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			upsert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			update: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) }),
			delete: vi.fn().mockReturnValue({ match: vi.fn().mockResolvedValue(result) }),
			rpc: vi.fn().mockResolvedValue(result),
			schema: vi.fn().mockReturnThis(),
			_query: query
		}
	}
```

**Step 2: Rewrite get() tests for operator-based filtering**

```js
	describe('get', () => {
		it('should select data without input', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity')
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.select).toHaveBeenCalledWith('*')
		})

		it('should select specific columns', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { columns: 'a,b' })
			expect(client.select).toHaveBeenCalledWith('a,b')
		})

		it('should apply eq filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { status: 'eq.active' } })
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
		})

		it('should apply gt filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { cost: 'gt.100' } })
			expect(client._query.gt).toHaveBeenCalledWith('cost', '100')
		})

		it('should apply multiple filters', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', {
				filter: { status: 'eq.active', cost: 'gt.0' }
			})
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
			expect(client._query.gt).toHaveBeenCalledWith('cost', '0')
		})

		it('should apply in filter with array value', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { status: 'in.(a,b)' } })
			expect(client._query.in).toHaveBeenCalledWith('status', ['a', 'b'])
		})

		it('should apply is.null filter', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', { filter: { deleted_at: 'is.null' } })
			expect(client._query.is).toHaveBeenCalledWith('deleted_at', null)
		})

		it('should apply columns and filters together', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.get('entity', {
				columns: 'id,name',
				filter: { status: 'eq.active' }
			})
			expect(client.select).toHaveBeenCalledWith('id,name')
			expect(client._query.eq).toHaveBeenCalledWith('status', 'active')
		})
	})
```

**Step 3: Update remaining action tests to use createClient()**

The `put`, `post`, `patch`, `delete`, `call` tests need to use `createClient()` instead of the old shared `client`:

```js
	it('should return an object with actions', () => {
		const client = createClient()
		const actions = getActions(client)
		expect(actions).toEqual({
			get: expect.any(Function),
			put: expect.any(Function),
			post: expect.any(Function),
			patch: expect.any(Function),
			delete: expect.any(Function),
			call: expect.any(Function),
			connection: client
		})
	})

	describe('put', () => {
		it('should insert data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.put('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.insert).toHaveBeenCalledWith({ data: 'value' })
		})
	})

	describe('post', () => {
		it('should upsert data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.post('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.upsert).toHaveBeenCalledWith({ data: 'value' })
		})
	})

	describe('patch', () => {
		it('should update data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.patch('entity', { data: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
			expect(client.update).toHaveBeenCalledWith({ data: 'value' })
		})
	})

	describe('delete', () => {
		it('should delete data', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.delete('entity', { filter: 'value' })
			expect(client.from).toHaveBeenCalledWith('entity')
		})
	})

	describe('call', () => {
		it('should call a stored procedure', async () => {
			const client = createClient()
			const actions = getActions(client)
			await actions.call('entity', { data: 'value' })
			expect(client.rpc).toHaveBeenCalledWith('entity', { data: 'value' })
		})
	})
```

**Step 4: Run all tests**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run`
Expected: All tests pass (213+ tests)

**Step 5: Commit**

```bash
git add adapters/supabase/spec/actions.spec.js
git commit -m "test(supabase): update action tests for operator-based filtering"
```

---

### Task 7: Run full test suite and verify

**Step 1: Run all tests**

Run: `cd /Users/Jerry/Developer/kavach && bunx vitest run`
Expected: All tests pass, no regressions

**Step 2: Commit all remaining changes (if any)**

Ensure everything is committed and clean.
