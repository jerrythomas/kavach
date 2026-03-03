# Plugin Architecture & Convex Adapter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate auth from data in kavach's adapter architecture, refactor supabase adapter, and build a Convex auth adapter.

**Architecture:** AuthAdapter handles authentication only. DataAdapter is a function `(schema?) => ServerActions` passed as an option to `createKavach`. Both adapters can share the same underlying SDK client. The Convex adapter implements auth only (password, OAuth, OTP/magic link).

**Tech Stack:** JavaScript (JSDoc types), Vitest, Bun workspace monorepo, `@convex-dev/auth`, `convex`

---

### Task 1: Add DataAdapter typedef and update AuthAdapter typedef

**Files:**
- Modify: `solution/packages/auth/src/types.js:162-185`

**Step 1: Write the typedef changes**

In `solution/packages/auth/src/types.js`, add `DataAdapter` typedef after `ServerActions` (after line 170), and remove `proxy` and `actions` from `AuthAdapter`:

```js
/**
 * @typedef ServerActions
 * @property {Action} get
 * @property {Action} put
 * @property {Action} post
 * @property {Action} delete
 * @property {Action} patch
 * @property {Action} call
 */

/**
 * @typedef {function(Schema=): ServerActions} DataAdapter
 */

/**
 * @typedef AuthAdapter
 * @property {(credentials: AuthCredentials) => Promise<AuthResult>}     signIn
 * @property {(credentials: PasswordCredentials) => Promise<AuthResult>} signUp
 * @property {() => Promise<*>}                                          signOut
 * @property {(session: AuthSession) => Promise<AuthResult>}             synchronize
 * @property {(callback: AuthCallback) => void}                          onAuthChange
 * @property {(credentials: OtpCredentials) => Promise<void>}            [verifyOtp]
 * @property {() => Promise<void>}                                       [resetPassword]
 * @property {(credentials: PasswordCredentials) => Promise<void>}       [updatePassword]
 * @property {(url: Object) => AuthResult}                               [parseUrlError]
 */
```

Note: `proxy` and `actions` removed from AuthAdapter. `DataAdapter` added as a new type.

**Step 2: Run tests to verify nothing breaks**

Run: `cd solution && bun test:ci`
Expected: All 244 tests still pass (typedef-only change, no runtime impact yet)

**Step 3: Commit**

```bash
git add solution/packages/auth/src/types.js
git commit -m "feat: add DataAdapter typedef, remove proxy/actions from AuthAdapter"
```

---

### Task 2: Update createKavach to accept `data` option

**Files:**
- Modify: `solution/packages/auth/src/kavach.js:253-281`
- Test: `solution/packages/auth/spec/kavach-browser.spec.js:36-53`

**Step 1: Write the failing test**

In `solution/packages/auth/spec/kavach-browser.spec.js`, update the existing test at line 36 to remove `proxy` and `actions` from expected shape, and update the `server actions` test to use the `data` option:

Replace the test at line 36-53 with:

```js
	it('should create kavach using an adapter', () => {
		const kavach = createKavach(adapter)
		expect(kavach).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			onAuthChange: expect.any(Function),
			handle: expect.any(Function),
			actions: expect.any(Function)
		})
	})

	it('should return the server actions using data option', () => {
		const mockData = vi.fn().mockImplementation((schema) => ({ connection: `${schema} connection` }))
		const kavach = createKavach(adapter, { data: mockData })
		expect(kavach.actions('public')).toEqual({ connection: 'public connection' })
		expect(mockData).toHaveBeenCalledWith('public')
	})

	it('should return undefined actions when no data option provided', () => {
		const kavach = createKavach(adapter)
		expect(kavach.actions()).toBeUndefined()
	})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && bun vitest run packages/auth/spec/kavach-browser.spec.js`
Expected: FAIL — kavach still returns `proxy`, and `actions` still delegates to `adapter.actions()`

**Step 3: Update createKavach implementation**

In `solution/packages/auth/src/kavach.js`, modify `createKavach` (lines 272-281):

```js
	return {
		signIn: (credentials) => handleSignIn(adapter, agents, credentials),
		signUp: (credentials) => handleSignUp(adapter, agents, credentials),
		signOut: () => handleSignOut(adapter, agents),
		onAuthChange: () => handleAuthChange(adapter, agents),
		handle: (request) => handleRouteProtection(adapter, agents, request),
		actions: (schema) => options.data?.(schema)
	}
```

Changes:
- Remove `proxy: (schema) => adapter.proxy(schema)`
- Change `actions` from `adapter.actions(schema)` to `options.data?.(schema)`

**Step 4: Run test to verify it passes**

Run: `cd solution && bun vitest run packages/auth/spec/kavach-browser.spec.js`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/auth/src/kavach.js solution/packages/auth/spec/kavach-browser.spec.js
git commit -m "feat: createKavach accepts data option, removes proxy"
```

---

### Task 3: Update mock adapter and remaining kavach tests

**Files:**
- Modify: `solution/packages/auth/spec/mock/adapter.js`

**Step 1: Update mock adapter to remove proxy and actions**

In `solution/packages/auth/spec/mock/adapter.js`, remove `proxy` and `actions`:

```js
import { vi } from 'vitest'

function mockSignIn(credentials) {
	return credentials.provider === 'magic' ? { data: 'success' } : { error: 'invalid data' }
}

export function createMockAdapter(options) {
	return {
		signIn: vi.fn().mockImplementation(mockSignIn),
		signOut: vi.fn(),
		synchronize: vi.fn().mockImplementation((session) => {
			if (options?.invalidSession) return { error: 'invalid session' }
			else
				return {
					data: {
						session
					},
					error: null
				}
		}),
		verifyOtp: vi.fn(),
		onAuthChange: vi.fn(),
		parseUrlError: vi.fn(),
		signUp: vi.fn()
	}
}
```

**Step 2: Run all tests to verify**

Run: `cd solution && bun test:ci`
Expected: All 244 tests pass (all references to `adapter.proxy`/`adapter.actions` have been removed)

**Step 3: Commit**

```bash
git add solution/packages/auth/spec/mock/adapter.js
git commit -m "refactor: remove proxy and actions from mock adapter"
```

---

### Task 4: Refactor supabase adapter — remove actions and proxy, accept client

**Files:**
- Modify: `solution/adapters/supabase/src/adapter.js:182-211`
- Modify: `solution/adapters/supabase/src/index.js`
- Test: `solution/adapters/supabase/spec/adapter.spec.js`

**Step 1: Write the failing test updates**

In `solution/adapters/supabase/spec/adapter.spec.js`:

a) Update the shape test (line 56-68) — remove `proxy` and `actions`, expect only auth methods:

```js
	it('should create a client and define auth functions', () => {
		const adapter = getAdapter(options)
		expect(adapter).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			synchronize: expect.any(Function),
			onAuthChange: expect.any(Function),
			parseUrlError: expect.any(Function)
		})
	})
```

b) Remove the entire `describe('actions', ...)` block (lines 70-98) — these tests belong to `actions.spec.js` now.

c) Remove the test at line 100-103 that tests `adapter.actions()` across schemas.

d) In all sign-in/sign-up/sign-out tests, replace `adapter.actions().connection.auth.xxx` with a direct reference. The tests currently call `adapter.actions().connection` to access the underlying client's auth — this path no longer exists. Instead, import `createClient` from the mock and access it directly.

The sign-in tests (lines 105-210) call things like:
```js
expect(adapter.actions().connection.auth.signInWithOtp).toHaveBeenCalledWith(...)
```

Since `adapter.actions()` will no longer exist, these assertions need to use the mocked `createClient` return value directly. The mock at line 10 already creates the client — we just need to capture it:

Add after the mock definition (after line 48):
```js
import { createClient } from '@supabase/supabase-js'
```

Then replace every `adapter.actions().connection.auth` with a reference to the mock client. Since `createClient` is mocked to return a specific object, we can get it:

```js
const mockClient = createClient()
```

And use `mockClient.auth.signInWithOtp` etc. in assertions.

e) Remove the test at line 100-103 (`should create adapters without multiple clients`).

**Step 2: Run test to verify it fails**

Run: `cd solution && bun vitest run adapters/supabase/spec/adapter.spec.js`
Expected: FAIL — adapter still returns `proxy` and `actions`

**Step 3: Update adapter implementation**

In `solution/adapters/supabase/src/adapter.js`:

a) Remove `getActions` import (line 4):
```js
// Remove: import { getActions } from './actions'
```

b) Update `getAdapter` return (lines 201-211) — remove `proxy` and `actions`:

```js
	return {
		signIn: (credentials) => handleSignIn(client, credentials),
		signUp: (credentials) => handleSignUp(client, credentials),
		signOut: () => client.auth.signOut(),
		synchronize,
		onAuthChange: (callback) => handleAuthChange(client, callback),
		parseUrlError
	}
```

c) Update `solution/adapters/supabase/src/index.js` — export `getActions`:

```js
// skipcq: JS-E1004 - Needed for exposing JS Doc types
export * from './types'
export { getLogWriter } from './writer'
export { getAdapter } from './adapter'
export { getActions } from './actions'
```

**Step 4: Run test to verify it passes**

Run: `cd solution && bun vitest run adapters/supabase/spec/adapter.spec.js`
Expected: PASS

**Step 5: Run full test suite**

Run: `cd solution && bun test:ci`
Expected: All tests pass

**Step 6: Commit**

```bash
git add solution/adapters/supabase/src/adapter.js solution/adapters/supabase/src/index.js solution/adapters/supabase/spec/adapter.spec.js
git commit -m "refactor: supabase adapter returns auth only, exports getActions separately"
```

---

### Task 5: Update supabase site consumer code

**Files:**
- Modify: `solution/sites/supabase/src/lib/auth.js`

**Step 1: Update consumer to use new pattern**

In `solution/sites/supabase/src/lib/auth.js`:

```js
import { createKavach } from 'kavach'
import { getLogger } from '@kavach/logger'
import { getLogWriter, getAdapter, getActions } from '@kavach/adapter-supabase'
import { createClient } from '@supabase/supabase-js'
import { appConfig } from './config'
import { routes } from './routes'
import { goto, invalidateAll, invalidate } from '$app/navigation'

const client = createClient(appConfig.supabase.url, appConfig.supabase.anonKey)
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const writer = getLogWriter(appConfig.supabase, appConfig.logging)
export const logger = getLogger(writer, appConfig.logging)
export const kavach = createKavach(adapter, {
	data,
	logger,
	...routes,
	goto,
	invalidate,
	invalidateAll
})
```

Changes:
- Import `getActions` from adapter-supabase
- Import `createClient` from `@supabase/supabase-js`
- Create `client` explicitly
- Pass `client` to `getAdapter()` (not config object)
- Create `data` function wrapping `getActions`
- Pass `data` option to `createKavach`

**Step 2: Update getAdapter to accept client instead of config**

In `solution/adapters/supabase/src/adapter.js`, update `getAdapter` signature (line 182):

```js
/**
 * Creates an adapter for supabase
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(client) {
```

Remove the `createClient` call inside (line 183):
```js
// Remove: const client = createClient(options.url, options.anonKey)
```

Also remove the `createClient` import from the top of the file since it's no longer needed by `getAdapter` (but `AuthApiError` is still used):
```js
import { AuthApiError } from '@supabase/supabase-js'
```

**Step 3: Update adapter test to pass mock client directly**

In `solution/adapters/supabase/spec/adapter.spec.js`, the `createClient` mock returns a mock client. Tests call `getAdapter(options)` where options is `{ url, anonKey }`. After the change, tests should call `getAdapter(mockClient)` where `mockClient` is the return value of the mocked `createClient`.

Update the test setup:
```js
import { createClient } from '@supabase/supabase-js'

// After mock setup, get the mock client:
const mockClient = createClient()

describe('getAdapter', () => {
	it('should define auth functions', () => {
		const adapter = getAdapter(mockClient)
		expect(adapter).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			synchronize: expect.any(Function),
			onAuthChange: expect.any(Function),
			parseUrlError: expect.any(Function)
		})
	})
	// ... all remaining tests use getAdapter(mockClient) instead of getAdapter(options)
	// ... all assertions use mockClient.auth.xxx instead of adapter.actions().connection.auth.xxx
```

**Step 4: Run tests**

Run: `cd solution && bun test:ci`
Expected: All tests pass

**Step 5: Commit**

```bash
git add solution/adapters/supabase/src/adapter.js solution/adapters/supabase/spec/adapter.spec.js solution/sites/supabase/src/lib/auth.js
git commit -m "refactor: supabase getAdapter accepts client, consumer creates client"
```

---

### Task 6: Build Convex auth adapter — package scaffold

**Files:**
- Create: `solution/adapters/convex/package.json`
- Create: `solution/adapters/convex/src/index.js`
- Create: `solution/adapters/convex/src/types.js`
- Create: `solution/adapters/convex/src/constants.js`

**Step 1: Create package.json**

Create `solution/adapters/convex/package.json`:

```json
{
  "name": "@kavach/adapter-convex",
  "version": "1.0.0-next.1",
  "description": "Adapter to use Convex with kavach.",
  "author": "Jerry Thomas <me@jerrythomas.name>",
  "license": "MIT",
  "main": "index.js",
  "module": "src/index.js",
  "type": "module",
  "repository": {
    "type": "git",
    "url": "https://github.com/jerrythomas/kavach",
    "directory": "adapters/convex"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "kavach": "workspace:*",
    "@convex-dev/auth": "^0.0.80",
    "convex": "^1.21.0"
  },
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "import": "./src/index.js",
      "svelte": "./src/index.js"
    }
  }
}
```

**Step 2: Create types file**

Create `solution/adapters/convex/src/types.js`:

```js
/**
 * @typedef ConvexConfig
 * @property {import('convex/browser').ConvexReactClient} client - Convex client instance
 * @property {Object} [providers] - Provider configuration
 * @property {boolean} [providers.password] - Enable password auth
 * @property {string[]} [providers.oauth] - OAuth provider names
 * @property {boolean} [providers.otp] - Enable OTP/magic link auth
 */
export default {}
```

**Step 3: Create constants file**

Create `solution/adapters/convex/src/constants.js`:

```js
export const AUTH_MODES = {
	PASSWORD: 'password',
	OAUTH: 'oauth',
	OTP: 'otp',
	MAGIC: 'magic'
}

export const DEFAULT_PROVIDERS = {
	password: true,
	oauth: [],
	otp: false
}
```

**Step 4: Create index.js**

Create `solution/adapters/convex/src/index.js`:

```js
// skipcq: JS-E1004 - Needed for exposing JS Doc types
export * from './types'
export { getAdapter } from './adapter'
```

**Step 5: Add to workspace**

In `solution/package.json`, the workspaces glob `adapters/*` should already include `adapters/convex`. Verify this.

**Step 6: Commit**

```bash
git add solution/adapters/convex/
git commit -m "feat: scaffold @kavach/adapter-convex package"
```

---

### Task 7: Build Convex auth adapter — implementation + tests

**Files:**
- Create: `solution/adapters/convex/src/adapter.js`
- Create: `solution/adapters/convex/spec/adapter.spec.js`
- Create: `solution/adapters/convex/spec/mock.js`

**Step 1: Create mock for Convex client**

Create `solution/adapters/convex/spec/mock.js`:

```js
import { vi } from 'vitest'

export function createMockConvexAuth() {
	return {
		signIn: vi.fn().mockResolvedValue({ signingIn: true }),
		signOut: vi.fn().mockResolvedValue(undefined),
		isAuthenticated: vi.fn().mockReturnValue(true),
		isLoading: vi.fn().mockReturnValue(false),
		fetchAccessToken: vi.fn().mockResolvedValue('mock-access-token')
	}
}

export function createMockConvexClient() {
	return {
		query: vi.fn(),
		mutation: vi.fn(),
		action: vi.fn()
	}
}
```

**Step 2: Write the failing tests**

Create `solution/adapters/convex/spec/adapter.spec.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getAdapter, transformResult } from '../src/adapter.js'
import { createMockConvexAuth } from './mock.js'

describe('getAdapter', () => {
	let mockAuth

	beforeEach(() => {
		mockAuth = createMockConvexAuth()
	})

	it('should create an adapter with auth functions', () => {
		const adapter = getAdapter(mockAuth)
		expect(adapter).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			synchronize: expect.any(Function),
			onAuthChange: expect.any(Function)
		})
	})

	describe('signIn', () => {
		it('should handle password sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
			await adapter.signIn(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('password', {
				email: 'a@b.com',
				password: '123456',
				flow: 'signIn'
			})
		})

		it('should handle OAuth sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'github' }
			await adapter.signIn(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('github')
		})

		it('should handle magic link / OTP sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'magic', email: 'a@b.com' }
			await adapter.signIn(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('resend-otp', {
				email: 'a@b.com'
			})
		})

		it('should return error result on failure', async () => {
			mockAuth.signIn.mockRejectedValue(new Error('Invalid credentials'))
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'password', email: 'a@b.com', password: 'wrong' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Invalid credentials')
		})
	})

	describe('signUp', () => {
		it('should handle password sign up', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { email: 'a@b.com', password: '123456' }
			await adapter.signUp(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('password', {
				email: 'a@b.com',
				password: '123456',
				flow: 'signUp'
			})
		})

		it('should return error result on failure', async () => {
			mockAuth.signIn.mockRejectedValue(new Error('Email already exists'))
			const adapter = getAdapter(mockAuth)
			const credentials = { email: 'a@b.com', password: '123456' }
			const result = await adapter.signUp(credentials)
			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Email already exists')
		})
	})

	describe('signOut', () => {
		it('should call signOut on the auth client', async () => {
			const adapter = getAdapter(mockAuth)
			await adapter.signOut()
			expect(mockAuth.signOut).toHaveBeenCalled()
		})
	})

	describe('synchronize', () => {
		it('should return session data', async () => {
			const session = { access_token: 'xyz', refresh_token: 'abc' }
			const adapter = getAdapter(mockAuth)
			const result = await adapter.synchronize(session)
			expect(result).toEqual({ data: { session }, error: null })
		})
	})

	describe('onAuthChange', () => {
		it('should be a function', () => {
			const adapter = getAdapter(mockAuth)
			expect(adapter.onAuthChange).toEqual(expect.any(Function))
		})
	})
})

describe('transformResult', () => {
	it('should transform successful result', () => {
		const result = transformResult({ data: { user: 'test' } }, { provider: 'password' })
		expect(result).toEqual({
			type: 'success',
			data: { user: 'test' },
			credentials: { provider: 'password' }
		})
	})

	it('should transform error result', () => {
		const error = new Error('Something failed')
		const result = transformResult({ error }, { provider: 'password' })
		expect(result).toEqual({
			type: 'error',
			error: { message: 'Something failed' },
			message: 'Something failed'
		})
	})

	it('should transform magic link result', () => {
		const result = transformResult({ data: {} }, { provider: 'magic', email: 'a@b.com' })
		expect(result).toEqual({
			type: 'info',
			data: {},
			credentials: { provider: 'magic', email: 'a@b.com' },
			message: 'Magic link has been sent to "a@b.com".'
		})
	})
})
```

**Step 3: Run test to verify it fails**

Run: `cd solution && bun vitest run adapters/convex/spec/adapter.spec.js`
Expected: FAIL — adapter.js doesn't exist yet

**Step 4: Implement the adapter**

Create `solution/adapters/convex/src/adapter.js`:

```js
/**
 * Transforms Convex result into kavach AuthResult format
 *
 * @param {Object} result
 * @param {Object} credentials
 * @returns {import('kavach').AuthResult}
 */
export function transformResult({ data, error }, credentials) {
	if (error) {
		const message = error.message || 'An error occurred'
		return {
			type: 'error',
			error: { message },
			message
		}
	}

	if (credentials.provider === 'magic') {
		return {
			type: 'info',
			data,
			credentials,
			message: `Magic link has been sent to "${credentials.email}".`
		}
	}

	return { type: 'success', data, credentials }
}

/**
 * Gets the auth mode from credentials
 *
 * @param {import('kavach').AuthCredentials} credentials
 * @returns {string}
 */
function getAuthMode(credentials) {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
}

/**
 * Creates an auth adapter for Convex
 *
 * @param {Object} convexAuth - The Convex auth instance from useConvexAuth or similar
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(convexAuth) {
	async function signIn(credentials) {
		const mode = getAuthMode(credentials)
		try {
			const signInActions = {
				magic: () =>
					convexAuth.signIn('resend-otp', {
						email: credentials.email
					}),
				password: () =>
					convexAuth.signIn('password', {
						email: credentials.email,
						password: credentials.password,
						flow: 'signIn'
					}),
				oauth: () => convexAuth.signIn(credentials.provider)
			}
			const data = await signInActions[mode]()
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function signUp(credentials) {
		try {
			const data = await convexAuth.signIn('password', {
				email: credentials.email,
				password: credentials.password,
				flow: 'signUp'
			})
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function signOut() {
		await convexAuth.signOut()
	}

	async function synchronize(session) {
		return { data: { session }, error: null }
	}

	function onAuthChange(callback) {
		// Convex handles auth state internally via its reactive system.
		// The consumer should use Convex's useConvexAuth() hook for state changes.
		// This is a no-op placeholder for the interface contract.
	}

	return {
		signIn,
		signUp,
		signOut,
		synchronize,
		onAuthChange
	}
}
```

**Step 5: Run test to verify it passes**

Run: `cd solution && bun vitest run adapters/convex/spec/adapter.spec.js`
Expected: PASS

**Step 6: Run full suite**

Run: `cd solution && bun test:ci`
Expected: All tests pass (244 existing + new convex tests)

**Step 7: Commit**

```bash
git add solution/adapters/convex/
git commit -m "feat: implement @kavach/adapter-convex auth adapter"
```

---

### Task 8: Write migration documentation

**Files:**
- Create: `docs/plans/2026-03-02-plugin-migration-guide.md`

**Step 1: Write the migration guide**

Create `docs/plans/2026-03-02-plugin-migration-guide.md`:

```markdown
# Migration Guide: Plugin Architecture

## Overview

kavach now separates authentication from data access. The `AuthAdapter` no longer includes
`actions()` or `proxy()`. Data access is provided via a `DataAdapter` passed as an option
to `createKavach`.

## Breaking Changes

1. `AuthAdapter.actions()` removed — use `DataAdapter` instead
2. `AuthAdapter.proxy()` removed — use the SDK client directly
3. `getAdapter()` in `@kavach/adapter-supabase` now accepts a Supabase client instead of config

## Migration Steps

### Before (monolithic adapter)

```js
import { getAdapter } from '@kavach/adapter-supabase'

const adapter = getAdapter({ url, anonKey })
const kavach = createKavach(adapter, { invalidateAll })

// Data access via adapter
const actions = kavach.actions(schema)
const proxy = kavach.proxy(schema)
```

### After (auth + data plugin)

```js
import { createClient } from '@supabase/supabase-js'
import { getAdapter, getActions } from '@kavach/adapter-supabase'

const client = createClient(url, anonKey)
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const kavach = createKavach(adapter, { data, invalidateAll })

// Data access via data option
const actions = kavach.actions(schema)

// Direct client access (replaces proxy)
const directAccess = client.schema('custom_schema')
```

### Key Differences

| Before | After |
|--------|-------|
| `getAdapter({ url, anonKey })` | `getAdapter(client)` |
| `kavach.proxy(schema)` | `client.schema(schema)` |
| `adapter.actions(schema)` | `getActions(client, schema)` |
| N/A | `createKavach(adapter, { data })` |
```

**Step 2: Commit**

```bash
git add docs/plans/2026-03-02-plugin-migration-guide.md
git commit -m "docs: add plugin architecture migration guide"
```

---

### Task 9: Final cleanup and verification

**Files:**
- Verify all files are consistent

**Step 1: Run full test suite**

Run: `cd solution && bun test:ci`
Expected: All tests pass

**Step 2: Check for any remaining references to old patterns**

Search for `adapter.proxy`, `adapter.actions` in source (non-test) files. There should be none.

Search for `kavach.proxy` in source files. There should be none.

**Step 3: Verify exports**

Verify `@kavach/adapter-supabase` exports both `getAdapter` and `getActions`.

**Step 4: Commit any final fixes**

If any issues found, fix and commit.

---

## Verification Checklist

- [ ] `DataAdapter` typedef exists in `types.js`
- [ ] `AuthAdapter` no longer has `proxy` or `actions`
- [ ] `createKavach` accepts `data` option
- [ ] `createKavach` no longer returns `proxy`
- [ ] Mock adapter has no `proxy` or `actions`
- [ ] Supabase `getAdapter` accepts client, not config
- [ ] Supabase `getAdapter` returns auth methods only
- [ ] `getActions` exported from `@kavach/adapter-supabase`
- [ ] Supabase site consumer uses new pattern
- [ ] Convex adapter implements all 4 auth modes
- [ ] Migration guide documented
- [ ] All tests pass
