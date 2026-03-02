# Fix Remaining Adapters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor Firebase, Auth0, and Amplify adapters to the plugin architecture with current SDK versions and comprehensive tests.

**Architecture:** Each adapter exports `getAdapter(client)` accepting a pre-created SDK client, returning only `AuthAdapter` methods. SDK responses normalize to `AuthResult` via `transformResult`. Tests mock the SDK client/modules.

**Tech Stack:** Firebase v10 (`firebase/auth`), Auth0 (`@auth0/auth0-spa-js`), Amplify v6 (`aws-amplify/auth`), Vitest, Ramda

**Design doc:** [docs/design/01-adapters.md](../design/01-adapters.md)

---

### Task 1: Firebase — Scaffold mock and write adapter shape test

**Files:**
- Create: `solution/adapters/firebase/spec/mock.js`
- Create: `solution/adapters/firebase/spec/adapter.spec.js`
- Modify: `solution/vitest.config.js:39` — add firebase project

**Step 1: Add firebase to vitest projects**

In `solution/vitest.config.js`, add after the convex project entry (line 40):

```js
{ extends: true, test: { name: 'firebase', root: 'adapters/firebase' } },
```

**Step 2: Create the mock**

Create `solution/adapters/firebase/spec/mock.js`:

```js
import { vi } from 'vitest'

export function createMockAuth() {
	return {
		currentUser: {
			uid: 'mock-uid',
			email: 'test@example.com',
			displayName: 'Test User'
		}
	}
}

export const mockSignInWithEmailAndPassword = vi.fn().mockResolvedValue({
	user: { uid: 'mock-uid', email: 'test@example.com', displayName: 'Test User' }
})

export const mockCreateUserWithEmailAndPassword = vi.fn().mockResolvedValue({
	user: { uid: 'mock-uid', email: 'test@example.com', displayName: 'Test User' }
})

export const mockSignInWithPopup = vi.fn().mockResolvedValue({
	user: { uid: 'mock-uid', email: 'test@example.com', displayName: 'Test User' }
})

export const mockSendSignInLinkToEmail = vi.fn().mockResolvedValue(undefined)

export const mockSignOut = vi.fn().mockResolvedValue(undefined)

export const mockOnAuthStateChanged = vi.fn().mockImplementation((auth, callback) => {
	const unsubscribe = vi.fn()
	return unsubscribe
})
```

**Step 3: Write the adapter shape test**

Create `solution/adapters/firebase/spec/adapter.spec.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
	createMockAuth,
	mockSignInWithEmailAndPassword,
	mockCreateUserWithEmailAndPassword,
	mockSignInWithPopup,
	mockSendSignInLinkToEmail,
	mockSignOut,
	mockOnAuthStateChanged
} from './mock.js'

vi.mock('firebase/auth', () => ({
	signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
	createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
	signInWithPopup: (...args) => mockSignInWithPopup(...args),
	sendSignInLinkToEmail: (...args) => mockSendSignInLinkToEmail(...args),
	signOut: (...args) => mockSignOut(...args),
	onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
	GoogleAuthProvider: class GoogleAuthProvider {
		addScope() {}
		setCustomParameters() {}
	},
	GithubAuthProvider: class GithubAuthProvider {
		addScope() {}
		setCustomParameters() {}
	},
	TwitterAuthProvider: class TwitterAuthProvider {
		addScope() {}
		setCustomParameters() {}
	},
	FacebookAuthProvider: class FacebookAuthProvider {
		addScope() {}
		setCustomParameters() {}
	},
	OAuthProvider: class OAuthProvider {
		constructor(providerId) {
			this.providerId = providerId
		}
		addScope() {}
		setCustomParameters() {}
	}
}))

import { getAdapter, transformResult } from '../src/adapter.js'

describe('getAdapter', () => {
	let mockAuth

	beforeEach(() => {
		vi.clearAllMocks()
		mockAuth = createMockAuth()
	})

	it('should create an adapter with auth functions', () => {
		const adapter = getAdapter(mockAuth)
		expect(adapter).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			synchronize: expect.any(Function),
			onAuthChange: expect.any(Function),
			parseUrlError: expect.any(Function)
		})
	})
})
```

**Step 4: Run the test to verify it fails**

Run: `cd solution && bun vitest run --project firebase`
Expected: FAIL — `getAdapter` does not exist in `../src/adapter.js` (currently `adapter()` in `index.js`)

**Step 5: Commit**

```bash
git add solution/adapters/firebase/spec/ solution/vitest.config.js
git commit -m "test: scaffold firebase adapter mock and shape test"
```

---

### Task 2: Firebase — Implement adapter.js

**Files:**
- Create: `solution/adapters/firebase/src/adapter.js`
- Modify: `solution/adapters/firebase/src/index.js`
- Modify: `solution/adapters/firebase/package.json`

**Step 1: Update package.json dependencies**

In `solution/adapters/firebase/package.json`, replace dependencies:

```json
"dependencies": {
    "firebase": "^11.0.0",
    "kavach": "workspace:*",
    "ramda": "^0.30.1"
}
```

Remove `@firebase/app` and `@firebase/auth`.

**Step 2: Create adapter.js**

Create `solution/adapters/firebase/src/adapter.js`:

```js
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	sendSignInLinkToEmail,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	GithubAuthProvider,
	TwitterAuthProvider,
	FacebookAuthProvider,
	OAuthProvider
} from 'firebase/auth'
import { omit } from 'ramda'

const authProviders = {
	apple: () => new OAuthProvider('apple.com'),
	facebook: () => new FacebookAuthProvider(),
	github: () => new GithubAuthProvider(),
	google: () => new GoogleAuthProvider(),
	twitter: () => new TwitterAuthProvider(),
	microsoft: () => new OAuthProvider('microsoft.com'),
	yahoo: () => new OAuthProvider('yahoo')
}

/**
 * Transforms Firebase result into kavach AuthResult format
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
			error: { message, code: error.code },
			message
		}
	}

	if (credentials?.provider === 'magic') {
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
 * Gets the authentication mode based on the credentials provided
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
 * Creates an auth adapter for Firebase
 *
 * @param {import('firebase/auth').Auth} auth - Firebase Auth instance
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(auth) {
	async function handleSignIn(credentials) {
		const { email, password, provider, scopes = [], redirectTo } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				magic: async () => {
					await sendSignInLinkToEmail(auth, email, {
						url: redirectTo || window.location.origin,
						handleCodeInApp: true
					})
					return null
				},
				password: async () => {
					const result = await signInWithEmailAndPassword(auth, email, password)
					return result.user
				},
				oauth: async () => {
					const providerFactory = authProviders[provider]
					if (!providerFactory) throw new Error(`Unsupported provider: ${provider}`)
					const authProvider = providerFactory()
					if (scopes?.length) scopes.forEach((scope) => authProvider.addScope(scope))
					const result = await signInWithPopup(auth, authProvider)
					return result.user
				}
			}
			const data = await signInActions[mode]()
			return transformResult({ data }, omit(['password'], credentials))
		} catch (error) {
			return transformResult({ error }, omit(['password'], credentials))
		}
	}

	async function handleSignUp(credentials) {
		const { email, password } = credentials
		try {
			const result = await createUserWithEmailAndPassword(auth, email, password)
			return transformResult({ data: result.user }, omit(['password'], credentials))
		} catch (error) {
			return transformResult({ error }, omit(['password'], credentials))
		}
	}

	async function handleSignOut() {
		await signOut(auth)
	}

	function synchronize() {
		const user = auth.currentUser
		if (user) {
			return { data: { user }, error: null }
		}
		return { data: null, error: null }
	}

	function handleAuthChange(callback) {
		return onAuthStateChanged(auth, (user) => {
			const event = user ? 'SIGNED_IN' : 'SIGNED_OUT'
			callback(event, { user })
		})
	}

	function parseUrlError(url) {
		const params = new URLSearchParams(url?.search || '')
		const error = params.get('error')
		if (error) {
			return {
				status: params.get('error_code'),
				name: error,
				message: params.get('error_description')
			}
		}
		return null
	}

	return {
		signIn: (credentials) => handleSignIn(credentials),
		signUp: (credentials) => handleSignUp(credentials),
		signOut: handleSignOut,
		synchronize,
		onAuthChange: (callback) => handleAuthChange(callback),
		parseUrlError
	}
}
```

**Step 3: Update index.js**

Rewrite `solution/adapters/firebase/src/index.js`:

```js
export { getAdapter, transformResult } from './adapter'
```

**Step 4: Run the shape test**

Run: `cd solution && bun vitest run --project firebase`
Expected: PASS — shape test passes

**Step 5: Commit**

```bash
git add solution/adapters/firebase/
git commit -m "feat: rewrite firebase adapter to plugin pattern with v10 modular SDK"
```

---

### Task 3: Firebase — Write full test suite

**Files:**
- Modify: `solution/adapters/firebase/spec/adapter.spec.js`

**Step 1: Add signIn tests**

Add inside the `describe('getAdapter')` block, after the shape test:

```js
describe('signIn', () => {
	it('should handle password sign in', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
		await adapter.signIn(credentials)
		expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'a@b.com', '123456')
	})

	it('should return success result on password sign in', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('success')
		expect(result.data).toEqual({
			uid: 'mock-uid',
			email: 'test@example.com',
			displayName: 'Test User'
		})
	})

	it('should handle OAuth sign in', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'google' }
		await adapter.signIn(credentials)
		expect(mockSignInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(Object))
	})

	it('should return success result on OAuth sign in', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'google' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('success')
	})

	it('should handle magic link sign in', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'magic', email: 'a@b.com', redirectTo: 'http://localhost:3000' }
		await adapter.signIn(credentials)
		expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(mockAuth, 'a@b.com', {
			url: 'http://localhost:3000',
			handleCodeInApp: true
		})
	})

	it('should return info result on magic link sign in', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'magic', email: 'a@b.com' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('info')
		expect(result.message).toBe('Magic link has been sent to "a@b.com".')
	})

	it('should return error result on failure', async () => {
		mockSignInWithEmailAndPassword.mockRejectedValueOnce(
			new Error('Invalid credentials')
		)
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'password', email: 'a@b.com', password: 'wrong' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('error')
		expect(result.error.message).toBe('Invalid credentials')
	})

	it('should throw error for unsupported provider', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { provider: 'unsupported' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('error')
		expect(result.error.message).toContain('Unsupported provider')
	})
})
```

**Step 2: Add signUp, signOut, synchronize, onAuthChange, parseUrlError tests**

```js
describe('signUp', () => {
	it('should handle sign up with email and password', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { email: 'a@b.com', password: '123456' }
		await adapter.signUp(credentials)
		expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
			mockAuth,
			'a@b.com',
			'123456'
		)
	})

	it('should return success result', async () => {
		const adapter = getAdapter(mockAuth)
		const credentials = { email: 'a@b.com', password: '123456' }
		const result = await adapter.signUp(credentials)
		expect(result.type).toBe('success')
	})

	it('should return error result on failure', async () => {
		mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(
			new Error('Email already exists')
		)
		const adapter = getAdapter(mockAuth)
		const credentials = { email: 'a@b.com', password: '123456' }
		const result = await adapter.signUp(credentials)
		expect(result.type).toBe('error')
		expect(result.error.message).toBe('Email already exists')
	})
})

describe('signOut', () => {
	it('should call firebase signOut', async () => {
		const adapter = getAdapter(mockAuth)
		await adapter.signOut()
		expect(mockSignOut).toHaveBeenCalledWith(mockAuth)
	})
})

describe('synchronize', () => {
	it('should return current user when authenticated', () => {
		const adapter = getAdapter(mockAuth)
		const result = adapter.synchronize()
		expect(result).toEqual({
			data: { user: mockAuth.currentUser },
			error: null
		})
	})

	it('should return null when not authenticated', () => {
		mockAuth.currentUser = null
		const adapter = getAdapter(mockAuth)
		const result = adapter.synchronize()
		expect(result).toEqual({ data: null, error: null })
	})
})

describe('onAuthChange', () => {
	it('should register auth state listener', () => {
		const adapter = getAdapter(mockAuth)
		const callback = vi.fn()
		adapter.onAuthChange(callback)
		expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function))
	})

	it('should return unsubscribe function', () => {
		const adapter = getAdapter(mockAuth)
		const unsubscribe = adapter.onAuthChange(vi.fn())
		expect(unsubscribe).toEqual(expect.any(Function))
	})
})

describe('parseUrlError', () => {
	it('should return null when no error in URL', () => {
		const adapter = getAdapter(mockAuth)
		const result = adapter.parseUrlError({ search: '' })
		expect(result).toBeNull()
	})

	it('should parse error from URL query params', () => {
		const adapter = getAdapter(mockAuth)
		const result = adapter.parseUrlError({
			search: '?error=access_denied&error_code=403&error_description=Access%20denied'
		})
		expect(result).toEqual({
			status: '403',
			name: 'access_denied',
			message: 'Access denied'
		})
	})
})
```

**Step 3: Add transformResult tests**

```js
describe('transformResult', () => {
	it('should transform successful result', () => {
		const result = transformResult({ data: { uid: '123' } }, { provider: 'password', email: 'a@b.com' })
		expect(result).toEqual({
			type: 'success',
			data: { uid: '123' },
			credentials: { provider: 'password', email: 'a@b.com' }
		})
	})

	it('should transform error result', () => {
		const error = { message: 'Auth failed', code: 'auth/invalid-email' }
		const result = transformResult({ error }, { provider: 'password' })
		expect(result).toEqual({
			type: 'error',
			error: { message: 'Auth failed', code: 'auth/invalid-email' },
			message: 'Auth failed'
		})
	})

	it('should transform magic link result', () => {
		const result = transformResult({ data: null }, { provider: 'magic', email: 'a@b.com' })
		expect(result).toEqual({
			type: 'info',
			data: null,
			credentials: { provider: 'magic', email: 'a@b.com' },
			message: 'Magic link has been sent to "a@b.com".'
		})
	})
})
```

**Step 2: Run all firebase tests**

Run: `cd solution && bun vitest run --project firebase`
Expected: PASS — all ~18 tests

**Step 3: Run full test suite**

Run: `cd solution && bun vitest run`
Expected: PASS — all 275+ tests (257 existing + ~18 new)

**Step 4: Commit**

```bash
git add solution/adapters/firebase/
git commit -m "test: add comprehensive firebase adapter test suite"
```

---

### Task 4: Auth0 — Scaffold mock and write adapter shape test

**Files:**
- Create: `solution/adapters/auth0/spec/mock.js`
- Create: `solution/adapters/auth0/spec/adapter.spec.js`
- Modify: `solution/vitest.config.js` — add auth0 project

**Step 1: Add auth0 to vitest projects**

In `solution/vitest.config.js`, add after the firebase project entry:

```js
{ extends: true, test: { name: 'auth0', root: 'adapters/auth0' } },
```

**Step 2: Create the mock**

Create `solution/adapters/auth0/spec/mock.js`:

```js
import { vi } from 'vitest'

export function createMockAuth0Client() {
	return {
		loginWithRedirect: vi.fn().mockResolvedValue(undefined),
		logout: vi.fn().mockResolvedValue(undefined),
		handleRedirectCallback: vi.fn().mockResolvedValue({ appState: {} }),
		isAuthenticated: vi.fn().mockResolvedValue(true),
		getUser: vi.fn().mockResolvedValue({
			sub: 'auth0|123',
			email: 'test@example.com',
			name: 'Test User'
		}),
		getTokenSilently: vi.fn().mockResolvedValue('mock-access-token')
	}
}
```

**Step 3: Write the shape test**

Create `solution/adapters/auth0/spec/adapter.spec.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getAdapter, transformResult } from '../src/adapter.js'
import { createMockAuth0Client } from './mock.js'

describe('getAdapter', () => {
	let mockClient

	beforeEach(() => {
		vi.clearAllMocks()
		mockClient = createMockAuth0Client()
	})

	it('should create an adapter with auth functions', () => {
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
})
```

**Step 4: Run the test to verify it fails**

Run: `cd solution && bun vitest run --project auth0`
Expected: FAIL — current `getAdapter` is async and has wrong export shape

**Step 5: Commit**

```bash
git add solution/adapters/auth0/spec/ solution/vitest.config.js
git commit -m "test: scaffold auth0 adapter mock and shape test"
```

---

### Task 5: Auth0 — Implement adapter.js

**Files:**
- Modify: `solution/adapters/auth0/src/adapter.js`
- Modify: `solution/adapters/auth0/package.json`

**Step 1: Update package.json dependencies**

In `solution/adapters/auth0/package.json`, add auth0 SDK:

```json
"dependencies": {
    "@auth0/auth0-spa-js": "^2.1.3",
    "kavach": "workspace:*"
}
```

**Step 2: Rewrite adapter.js**

Rewrite `solution/adapters/auth0/src/adapter.js`:

```js
/**
 * Transforms Auth0 result into kavach AuthResult format
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
			error: { message, code: error.code || error.error },
			message
		}
	}

	if (credentials?.provider === 'magic') {
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
 * Gets the authentication mode based on the credentials provided
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
 * Creates an auth adapter for Auth0
 *
 * @param {import('@auth0/auth0-spa-js').Auth0Client} client - Auth0 client instance
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(client) {
	async function signIn(credentials) {
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				magic: () =>
					client.loginWithRedirect({
						authorizationParams: { connection: 'email', login_hint: credentials.email }
					}),
				password: () =>
					client.loginWithRedirect({
						authorizationParams: {
							connection: 'Username-Password-Authentication',
							login_hint: credentials.email
						}
					}),
				oauth: () =>
					client.loginWithRedirect({
						authorizationParams: { connection: credentials.provider }
					})
			}

			await signInActions[mode]()
			// Auth0 is redirect-based — returns before auth completes
			return transformResult({ data: null }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function signUp(credentials) {
		try {
			await client.loginWithRedirect({
				authorizationParams: { screen_hint: 'signup' }
			})
			return transformResult({ data: null }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function handleSignOut() {
		await client.logout({ logoutParams: { returnTo: window.location.origin } })
	}

	async function synchronize() {
		try {
			await client.getTokenSilently()
			const user = await client.getUser()
			return { data: { user }, error: null }
		} catch (error) {
			return { data: null, error: { message: error.message } }
		}
	}

	function onAuthChange() {
		// Auth0 SPA SDK does not have a native auth state listener.
		// Session state is checked via synchronize() on page load.
	}

	function parseUrlError(url) {
		const params = new URLSearchParams(url?.search || '')
		const error = params.get('error')
		if (error) {
			return {
				status: params.get('error_code'),
				name: error,
				message: params.get('error_description')
			}
		}
		return null
	}

	return {
		signIn,
		signUp,
		signOut: handleSignOut,
		synchronize,
		onAuthChange,
		parseUrlError
	}
}
```

**Step 3: Run the shape test**

Run: `cd solution && bun vitest run --project auth0`
Expected: PASS — shape test passes

**Step 4: Commit**

```bash
git add solution/adapters/auth0/
git commit -m "feat: rewrite auth0 adapter to plugin pattern"
```

---

### Task 6: Auth0 — Write full test suite

**Files:**
- Modify: `solution/adapters/auth0/spec/adapter.spec.js`

**Step 1: Add all Auth0 tests**

Add inside the `describe('getAdapter')` block, after the shape test:

```js
describe('signIn', () => {
	it('should handle password sign in via redirect', async () => {
		const adapter = getAdapter(mockClient)
		const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
		await adapter.signIn(credentials)
		expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
			authorizationParams: {
				connection: 'Username-Password-Authentication',
				login_hint: 'a@b.com'
			}
		})
	})

	it('should handle OAuth sign in via redirect', async () => {
		const adapter = getAdapter(mockClient)
		const credentials = { provider: 'github' }
		await adapter.signIn(credentials)
		expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
			authorizationParams: { connection: 'github' }
		})
	})

	it('should handle magic link sign in', async () => {
		const adapter = getAdapter(mockClient)
		const credentials = { provider: 'magic', email: 'a@b.com' }
		await adapter.signIn(credentials)
		expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
			authorizationParams: { connection: 'email', login_hint: 'a@b.com' }
		})
	})

	it('should return info result for magic link', async () => {
		const adapter = getAdapter(mockClient)
		const credentials = { provider: 'magic', email: 'a@b.com' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('info')
		expect(result.message).toBe('Magic link has been sent to "a@b.com".')
	})

	it('should return success result for non-magic sign in', async () => {
		const adapter = getAdapter(mockClient)
		const credentials = { provider: 'github' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('success')
	})

	it('should return error result on failure', async () => {
		mockClient.loginWithRedirect.mockRejectedValueOnce(new Error('Network error'))
		const adapter = getAdapter(mockClient)
		const credentials = { provider: 'github' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('error')
		expect(result.error.message).toBe('Network error')
	})
})

describe('signUp', () => {
	it('should redirect with signup screen hint', async () => {
		const adapter = getAdapter(mockClient)
		await adapter.signUp({ email: 'a@b.com', password: '123456' })
		expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
			authorizationParams: { screen_hint: 'signup' }
		})
	})

	it('should return error on failure', async () => {
		mockClient.loginWithRedirect.mockRejectedValueOnce(new Error('Signup failed'))
		const adapter = getAdapter(mockClient)
		const result = await adapter.signUp({ email: 'a@b.com', password: '123456' })
		expect(result.type).toBe('error')
	})
})

describe('signOut', () => {
	it('should call auth0 logout', async () => {
		const adapter = getAdapter(mockClient)
		await adapter.signOut()
		expect(mockClient.logout).toHaveBeenCalled()
	})
})

describe('synchronize', () => {
	it('should return user data when authenticated', async () => {
		const adapter = getAdapter(mockClient)
		const result = await adapter.synchronize()
		expect(mockClient.getTokenSilently).toHaveBeenCalled()
		expect(mockClient.getUser).toHaveBeenCalled()
		expect(result).toEqual({
			data: {
				user: {
					sub: 'auth0|123',
					email: 'test@example.com',
					name: 'Test User'
				}
			},
			error: null
		})
	})

	it('should return error when token refresh fails', async () => {
		mockClient.getTokenSilently.mockRejectedValueOnce(new Error('Login required'))
		const adapter = getAdapter(mockClient)
		const result = await adapter.synchronize()
		expect(result).toEqual({
			data: null,
			error: { message: 'Login required' }
		})
	})
})

describe('onAuthChange', () => {
	it('should be a function (no-op)', () => {
		const adapter = getAdapter(mockClient)
		expect(adapter.onAuthChange).toEqual(expect.any(Function))
	})
})

describe('parseUrlError', () => {
	it('should return null when no error', () => {
		const adapter = getAdapter(mockClient)
		expect(adapter.parseUrlError({ search: '' })).toBeNull()
	})

	it('should parse error from URL query params', () => {
		const adapter = getAdapter(mockClient)
		const result = adapter.parseUrlError({
			search: '?error=unauthorized&error_code=401&error_description=Unauthorized'
		})
		expect(result).toEqual({
			status: '401',
			name: 'unauthorized',
			message: 'Unauthorized'
		})
	})
})
```

**Step 2: Add transformResult tests**

```js
describe('transformResult', () => {
	it('should transform successful result', () => {
		const result = transformResult({ data: { user: 'test' } }, { provider: 'github' })
		expect(result).toEqual({
			type: 'success',
			data: { user: 'test' },
			credentials: { provider: 'github' }
		})
	})

	it('should transform error result', () => {
		const error = { message: 'Auth failed', error: 'access_denied' }
		const result = transformResult({ error }, { provider: 'github' })
		expect(result).toEqual({
			type: 'error',
			error: { message: 'Auth failed', code: 'access_denied' },
			message: 'Auth failed'
		})
	})

	it('should transform magic link result', () => {
		const result = transformResult({ data: null }, { provider: 'magic', email: 'a@b.com' })
		expect(result).toEqual({
			type: 'info',
			data: null,
			credentials: { provider: 'magic', email: 'a@b.com' },
			message: 'Magic link has been sent to "a@b.com".'
		})
	})
})
```

**Step 2: Run all auth0 tests**

Run: `cd solution && bun vitest run --project auth0`
Expected: PASS — all ~15 tests

**Step 3: Run full test suite**

Run: `cd solution && bun vitest run`
Expected: PASS — all 290+ tests

**Step 4: Commit**

```bash
git add solution/adapters/auth0/
git commit -m "test: add comprehensive auth0 adapter test suite"
```

---

### Task 7: Amplify — Scaffold mock and write adapter shape test

**Files:**
- Create: `solution/adapters/amplify/spec/mock.js`
- Create: `solution/adapters/amplify/spec/adapter.spec.js`
- Modify: `solution/vitest.config.js` — add amplify project

**Step 1: Add amplify to vitest projects**

In `solution/vitest.config.js`, add after the auth0 project entry:

```js
{ extends: true, test: { name: 'amplify', root: 'adapters/amplify' } },
```

**Step 2: Create the mock**

Create `solution/adapters/amplify/spec/mock.js`:

```js
import { vi } from 'vitest'

export const mockSignIn = vi.fn().mockResolvedValue({
	isSignedIn: true,
	nextStep: { signInStep: 'DONE' }
})

export const mockSignUp = vi.fn().mockResolvedValue({
	isSignUpComplete: true,
	userId: 'mock-user-id',
	nextStep: { signUpStep: 'DONE' }
})

export const mockSignOut = vi.fn().mockResolvedValue(undefined)

export const mockFetchAuthSession = vi.fn().mockResolvedValue({
	tokens: {
		accessToken: { toString: () => 'mock-access-token' },
		idToken: { toString: () => 'mock-id-token' }
	}
})

export const mockSignInWithRedirect = vi.fn().mockResolvedValue(undefined)

export const mockGetCurrentUser = vi.fn().mockResolvedValue({
	userId: 'mock-user-id',
	username: 'test@example.com'
})

export const mockHubListen = vi.fn().mockReturnValue(() => {})
```

**Step 3: Write the shape test**

Create `solution/adapters/amplify/spec/adapter.spec.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
	mockSignIn,
	mockSignUp,
	mockSignOut,
	mockFetchAuthSession,
	mockSignInWithRedirect,
	mockGetCurrentUser,
	mockHubListen
} from './mock.js'

vi.mock('aws-amplify/auth', () => ({
	signIn: (...args) => mockSignIn(...args),
	signUp: (...args) => mockSignUp(...args),
	signOut: (...args) => mockSignOut(...args),
	fetchAuthSession: (...args) => mockFetchAuthSession(...args),
	signInWithRedirect: (...args) => mockSignInWithRedirect(...args),
	getCurrentUser: (...args) => mockGetCurrentUser(...args)
}))

vi.mock('aws-amplify/utils', () => ({
	Hub: {
		listen: (...args) => mockHubListen(...args)
	}
}))

import { getAdapter, transformResult } from '../src/adapter.js'

describe('getAdapter', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should create an adapter with auth functions', () => {
		const adapter = getAdapter()
		expect(adapter).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			synchronize: expect.any(Function),
			onAuthChange: expect.any(Function),
			parseUrlError: expect.any(Function)
		})
	})
})
```

**Step 4: Run the test to verify it fails**

Run: `cd solution && bun vitest run --project amplify`
Expected: FAIL — current `getAdapter` has wrong imports and shape

**Step 5: Commit**

```bash
git add solution/adapters/amplify/spec/ solution/vitest.config.js
git commit -m "test: scaffold amplify adapter mock and shape test"
```

---

### Task 8: Amplify — Implement adapter.js

**Files:**
- Modify: `solution/adapters/amplify/src/adapter.js`
- Modify: `solution/adapters/amplify/src/index.js` (if needed)

**Step 1: Rewrite adapter.js**

Rewrite `solution/adapters/amplify/src/adapter.js`:

```js
import {
	signIn,
	signUp,
	signOut,
	fetchAuthSession,
	signInWithRedirect,
	getCurrentUser
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

/**
 * Transforms Amplify result into kavach AuthResult format
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
			error: { message, code: error.name },
			message
		}
	}

	if (credentials?.provider === 'magic') {
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
 * Gets the authentication mode based on the credentials provided
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
 * Creates an auth adapter for AWS Amplify (Cognito)
 *
 * Amplify v6 uses module-level configuration via Amplify.configure().
 * The consumer must call Amplify.configure() before creating the adapter.
 *
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter() {
	async function handleSignIn(credentials) {
		const { email, password, provider } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				magic: () =>
					signIn({
						username: email,
						options: { authFlowType: 'USER_AUTH' }
					}),
				password: () =>
					signIn({ username: email, password }),
				oauth: () =>
					signInWithRedirect({ provider })
			}

			const data = await signInActions[mode]()
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function handleSignUp(credentials) {
		const { email, password } = credentials
		try {
			const data = await signUp({ username: email, password })
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function handleSignOut() {
		await signOut()
	}

	async function synchronize() {
		try {
			const session = await fetchAuthSession()
			const user = await getCurrentUser()
			return { data: { session, user }, error: null }
		} catch (error) {
			return { data: null, error: { message: error.message } }
		}
	}

	function onAuthChange(callback) {
		return Hub.listen('auth', ({ payload }) => {
			const event = payload.event === 'signedIn' ? 'SIGNED_IN' : 'SIGNED_OUT'
			callback(event, payload.data)
		})
	}

	function parseUrlError(url) {
		const params = new URLSearchParams(url?.search || '')
		const error = params.get('error')
		if (error) {
			return {
				status: params.get('error_code'),
				name: error,
				message: params.get('error_description')
			}
		}
		return null
	}

	return {
		signIn: (credentials) => handleSignIn(credentials),
		signUp: (credentials) => handleSignUp(credentials),
		signOut: handleSignOut,
		synchronize,
		onAuthChange,
		parseUrlError
	}
}
```

**Step 2: Verify index.js exports**

`solution/adapters/amplify/src/index.js` currently exports `{ getAdapter }` from `./adapter` — this is correct. No change needed.

**Step 3: Run the shape test**

Run: `cd solution && bun vitest run --project amplify`
Expected: PASS

**Step 4: Commit**

```bash
git add solution/adapters/amplify/
git commit -m "feat: rewrite amplify adapter to plugin pattern with v6 modular SDK"
```

---

### Task 9: Amplify — Write full test suite

**Files:**
- Modify: `solution/adapters/amplify/spec/adapter.spec.js`

**Step 1: Add all Amplify tests**

Add inside the `describe('getAdapter')` block, after the shape test:

```js
describe('signIn', () => {
	it('should handle password sign in', async () => {
		const adapter = getAdapter()
		const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
		await adapter.signIn(credentials)
		expect(mockSignIn).toHaveBeenCalledWith({ username: 'a@b.com', password: '123456' })
	})

	it('should return success result on password sign in', async () => {
		const adapter = getAdapter()
		const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('success')
	})

	it('should handle OAuth sign in via redirect', async () => {
		const adapter = getAdapter()
		const credentials = { provider: 'Google' }
		await adapter.signIn(credentials)
		expect(mockSignInWithRedirect).toHaveBeenCalledWith({ provider: 'Google' })
	})

	it('should handle magic link sign in', async () => {
		const adapter = getAdapter()
		const credentials = { provider: 'magic', email: 'a@b.com' }
		await adapter.signIn(credentials)
		expect(mockSignIn).toHaveBeenCalledWith({
			username: 'a@b.com',
			options: { authFlowType: 'USER_AUTH' }
		})
	})

	it('should return info result for magic link', async () => {
		const adapter = getAdapter()
		const credentials = { provider: 'magic', email: 'a@b.com' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('info')
		expect(result.message).toBe('Magic link has been sent to "a@b.com".')
	})

	it('should return error result on failure', async () => {
		mockSignIn.mockRejectedValueOnce(new Error('User not found'))
		const adapter = getAdapter()
		const credentials = { provider: 'password', email: 'a@b.com', password: 'wrong' }
		const result = await adapter.signIn(credentials)
		expect(result.type).toBe('error')
		expect(result.error.message).toBe('User not found')
	})
})

describe('signUp', () => {
	it('should handle sign up', async () => {
		const adapter = getAdapter()
		const credentials = { email: 'a@b.com', password: '123456' }
		await adapter.signUp(credentials)
		expect(mockSignUp).toHaveBeenCalledWith({ username: 'a@b.com', password: '123456' })
	})

	it('should return success result', async () => {
		const adapter = getAdapter()
		const credentials = { email: 'a@b.com', password: '123456' }
		const result = await adapter.signUp(credentials)
		expect(result.type).toBe('success')
	})

	it('should return error on failure', async () => {
		mockSignUp.mockRejectedValueOnce(new Error('User already exists'))
		const adapter = getAdapter()
		const credentials = { email: 'a@b.com', password: '123456' }
		const result = await adapter.signUp(credentials)
		expect(result.type).toBe('error')
		expect(result.error.message).toBe('User already exists')
	})
})

describe('signOut', () => {
	it('should call amplify signOut', async () => {
		const adapter = getAdapter()
		await adapter.signOut()
		expect(mockSignOut).toHaveBeenCalled()
	})
})

describe('synchronize', () => {
	it('should return session and user when authenticated', async () => {
		const adapter = getAdapter()
		const result = await adapter.synchronize()
		expect(mockFetchAuthSession).toHaveBeenCalled()
		expect(mockGetCurrentUser).toHaveBeenCalled()
		expect(result.data).toBeDefined()
		expect(result.error).toBeNull()
	})

	it('should return error when not authenticated', async () => {
		mockFetchAuthSession.mockRejectedValueOnce(new Error('Not authenticated'))
		const adapter = getAdapter()
		const result = await adapter.synchronize()
		expect(result).toEqual({
			data: null,
			error: { message: 'Not authenticated' }
		})
	})
})

describe('onAuthChange', () => {
	it('should register Hub listener', () => {
		const adapter = getAdapter()
		const callback = vi.fn()
		adapter.onAuthChange(callback)
		expect(mockHubListen).toHaveBeenCalledWith('auth', expect.any(Function))
	})

	it('should return unsubscribe function', () => {
		const adapter = getAdapter()
		const unsubscribe = adapter.onAuthChange(vi.fn())
		expect(unsubscribe).toEqual(expect.any(Function))
	})
})

describe('parseUrlError', () => {
	it('should return null when no error', () => {
		const adapter = getAdapter()
		expect(adapter.parseUrlError({ search: '' })).toBeNull()
	})

	it('should parse error from URL query params', () => {
		const adapter = getAdapter()
		const result = adapter.parseUrlError({
			search: '?error=invalid_grant&error_code=400&error_description=Invalid%20grant'
		})
		expect(result).toEqual({
			status: '400',
			name: 'invalid_grant',
			message: 'Invalid grant'
		})
	})
})
```

**Step 2: Add transformResult tests**

```js
describe('transformResult', () => {
	it('should transform successful result', () => {
		const result = transformResult({ data: { isSignedIn: true } }, { provider: 'password' })
		expect(result).toEqual({
			type: 'success',
			data: { isSignedIn: true },
			credentials: { provider: 'password' }
		})
	})

	it('should transform error result', () => {
		const error = { message: 'User not found', name: 'UserNotFoundException' }
		const result = transformResult({ error }, { provider: 'password' })
		expect(result).toEqual({
			type: 'error',
			error: { message: 'User not found', code: 'UserNotFoundException' },
			message: 'User not found'
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

**Step 2: Run all amplify tests**

Run: `cd solution && bun vitest run --project amplify`
Expected: PASS — all ~18 tests

**Step 3: Run full test suite**

Run: `cd solution && bun vitest run`
Expected: PASS — all 305+ tests

**Step 4: Commit**

```bash
git add solution/adapters/amplify/
git commit -m "test: add comprehensive amplify adapter test suite"
```

---

### Task 10: Final verification and cleanup

**Files:**
- No new files

**Step 1: Install new dependencies**

Run: `cd /Users/Jerry/Developer/kavach && bun install`

This should resolve the new `firebase`, `@auth0/auth0-spa-js` dependencies.

**Step 2: Run full test suite**

Run: `cd solution && bun vitest run`
Expected: PASS — all ~305 tests across all projects

**Step 3: Verify no stale references**

Run: `cd solution && grep -r "from 'aws-amplify'" adapters/amplify/src/`
Expected: Only `aws-amplify/auth` and `aws-amplify/utils` (modular imports)

Run: `cd solution && grep -r "@firebase/app\|@firebase/auth" adapters/firebase/src/`
Expected: No results (old imports removed)

Run: `cd solution && grep -r "client: null\|db: () => null\|db:" adapters/*/src/`
Expected: No results (old pattern leftovers removed)

Run: `cd solution && grep -r "\.proxy\|\.actions" adapters/*/src/`
Expected: No results

**Step 4: Commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: final cleanup for adapter refactoring"
```
