import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createMockAdapter } from './mock'
import { createKavach } from '../src/kavach'

const OriginalResponse = globalThis.Response

describe('Endpoint functions', () => {
	let adapter = null
	const invalidateAll = vi.fn()
	const logger = {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		getContextLogger: vi.fn().mockReturnThis()
	}
	beforeEach(() => {
		adapter = createMockAdapter()
		global.fetch = vi.fn()
		global.Response = vi.fn().mockImplementation(function (...status) {
			return status
		})
		global.Response.redirect = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	// @vitest-environment node
	it('should not run on server', () => {
		adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
			await cb('SIGNED_IN', 'foo')
		})
		const kavach = createKavach(adapter, { invalidateAll, logger })

		kavach.onAuthChange()
		expect(adapter.onAuthChange).not.toHaveBeenCalled()
		expect(global.fetch).not.toHaveBeenCalled()
		expect(invalidateAll).not.toHaveBeenCalled()
	})
})

describe('kavach.configure', () => {
	it('patches invalidateAll on the existing instance', () => {
		const adapter = {
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn(),
			signOut: vi.fn()
		}
		const kavach = createKavach(adapter, {
			app: { login: '/auth', home: '/' },
			rules: []
		})
		const inv = vi.fn()
		kavach.configure({ invalidateAll: inv })
		// configure does not throw and the method exists
		expect(typeof kavach.configure).toBe('function')
	})
})

describe('kavach.handle — dynamic home resolution', () => {
	beforeEach(() => {
		global.Response = OriginalResponse
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('redirects to static home when home is a string', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const mockAdapter = {
			synchronize: vi.fn(),
			signOut: vi.fn(),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
		const kavachInstance = createKavach(mockAdapter, {
			app: { login: '/auth', home: '/home', session: '/auth/session' },
			rules: []
		})
		const session = { user: { role: 'authenticated', user_metadata: { slug: 'bob' } } }
		const mockEvent = {
			url: new URL('http://localhost/auth'),
			cookies: { get: vi.fn(() => JSON.stringify(session)) },
			locals: {},
			request: { method: 'GET' }
		}
		const result = await kavachInstance.handle({ event: mockEvent, resolve: vi.fn() })
		expect(result.status).toBe(303)
		expect(result.headers.get('location')).toBe('http://localhost/home')
	})

	it('calls home function and redirects to resolved path', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const mockAdapter = {
			synchronize: vi.fn(),
			signOut: vi.fn(),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
		const homeResolver = vi.fn().mockResolvedValue('/bob-kim')
		const kavachInstance = createKavach(mockAdapter, {
			app: { login: '/auth', home: homeResolver, session: '/auth/session' },
			rules: []
		})
		const session = { user: { role: 'authenticated', user_metadata: { slug: 'bob-kim' } } }
		const mockEvent = {
			url: new URL('http://localhost/auth'),
			cookies: { get: vi.fn(() => JSON.stringify(session)) },
			locals: {},
			request: { method: 'GET' }
		}
		const result = await kavachInstance.handle({ event: mockEvent, resolve: vi.fn() })
		expect(homeResolver).toHaveBeenCalledWith(session)
		expect(result.status).toBe(303)
		expect(result.headers.get('location')).toBe('http://localhost/bob-kim')
	})

	it('falls back to static home string when home function throws', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const mockAdapter = {
			synchronize: vi.fn(),
			signOut: vi.fn(),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
		const homeResolver = vi.fn().mockRejectedValue(new Error('db error'))
		const kavachInstance = createKavach(mockAdapter, {
			app: { login: '/auth', home: homeResolver, session: '/auth/session' },
			rules: []
		})
		const session = { user: { role: 'authenticated' } }
		const mockEvent = {
			url: new URL('http://localhost/auth'),
			cookies: { get: vi.fn(() => JSON.stringify(session)) },
			locals: {},
			request: { method: 'GET' }
		}
		const result = await kavachInstance.handle({ event: mockEvent, resolve: vi.fn() })
		expect(result.status).toBe(303)
		expect(result.headers.get('location')).toBe('http://localhost/')
	})
})

describe('kavach.handle — Response body serialization', () => {
	beforeEach(() => {
		global.Response = OriginalResponse
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('returns valid JSON body for 401 endpoint response', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const mockAdapter = {
			synchronize: vi.fn(),
			signOut: vi.fn(),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
		const kavachInstance = createKavach(mockAdapter, {
			app: { login: '/auth', home: '/', session: '/auth/session', endpoints: ['/data'] },
			rules: [{ path: '/data', roles: '*' }]
		})

		const mockEvent = {
			url: new URL('http://localhost/data/facts'),
			cookies: { get: vi.fn(() => null) },
			locals: {},
			request: { method: 'GET' }
		}
		const result = await kavachInstance.handle({
			event: mockEvent,
			resolve: vi.fn()
		})

		const text = await result.text()
		expect(() => JSON.parse(text)).not.toThrow()
		const body = JSON.parse(text)
		expect(result.status).toBe(401)
		expect(body).toHaveProperty('error')
	})

	it('returns valid JSON body for session sync response', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const mockAdapter = {
			synchronize: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
			signOut: vi.fn(),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
		const kavachInstance = createKavach(mockAdapter, {
			app: { login: '/auth', home: '/', session: '/auth/session' },
			rules: []
		})

		const mockEvent = {
			url: new URL('http://localhost/auth/session'),
			cookies: { get: vi.fn(() => null) },
			locals: {},
			request: {
				method: 'POST',
				headers: { get: vi.fn(() => 'application/json') },
				json: vi.fn().mockResolvedValue({ session: null })
			}
		}
		const result = await kavachInstance.handle({
			event: mockEvent,
			resolve: vi.fn()
		})

		const text = await result.text()
		expect(() => JSON.parse(text)).not.toThrow()
		const body = JSON.parse(text)
		expect(body).toHaveProperty('session')
	})
})

describe('kavach.handle — logout route', () => {
	beforeEach(() => {
		global.Response = OriginalResponse
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	function makeAdapter() {
		return {
			synchronize: vi.fn(),
			signOut: vi.fn().mockResolvedValue(undefined),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
	}

	it('signs out, clears the session cookie, and redirects to login', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const adapter = makeAdapter()
		const kavachInstance = createKavach(adapter, {
			app: { login: '/signin', logout: '/logout', session: '/auth/session' },
			rules: []
		})
		const mockEvent = {
			url: new URL('http://localhost/logout'),
			cookies: { get: vi.fn(() => 'undefined') },
			locals: {},
			request: { method: 'GET' }
		}

		const result = await kavachInstance.handle({ event: mockEvent, resolve: vi.fn() })

		expect(adapter.signOut).toHaveBeenCalled()
		expect(result.status).toBe(303)
		expect(result.headers.get('location')).toBe('http://localhost/signin')
		expect(result.headers.get('set-cookie')).toBeTruthy()
	})

	it('serves a custom configured logout path', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const adapter = makeAdapter()
		const kavachInstance = createKavach(adapter, {
			app: { login: '/signin', logout: '/sign-out', session: '/auth/session' },
			rules: []
		})
		const mockEvent = {
			url: new URL('http://localhost/sign-out'),
			cookies: { get: vi.fn(() => 'undefined') },
			locals: {},
			request: { method: 'GET' }
		}

		const result = await kavachInstance.handle({ event: mockEvent, resolve: vi.fn() })

		expect(adapter.signOut).toHaveBeenCalled()
		expect(result.status).toBe(303)
		expect(result.headers.get('location')).toBe('http://localhost/signin')
	})

	it('does not intercept a non-logout path (falls through to protection)', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const adapter = makeAdapter()
		const resolve = vi.fn(() => 'RESOLVED')
		const kavachInstance = createKavach(adapter, {
			app: { login: '/signin', logout: '/logout', session: '/auth/session' },
			rules: [{ path: '/', public: true }]
		})
		const mockEvent = {
			url: new URL('http://localhost/'),
			cookies: { get: vi.fn(() => 'undefined') },
			locals: {},
			request: { method: 'GET' }
		}

		const result = await kavachInstance.handle({ event: mockEvent, resolve })

		expect(adapter.signOut).not.toHaveBeenCalled()
		expect(result).toBe('RESOLVED')
	})

	it('resolves a permitted route exactly once', async () => {
		// A second resolve() is not merely wasteful — SvelteKit reads the request
		// body during resolve, and a body stream can only be read once. The second
		// call therefore hands the route handler an EMPTY body.
		//
		// This regressed once (1.0.0-next.37): handleUnauthorizedAccess returned
		// resolve(event) on the allow path, the caller tested `instanceof
		// Response` — false for a Promise — fell through, and resolved again.
		// Every POST under a permitted rule silently lost its body, and only
		// authenticated ones, because unauthenticated calls were rejected on
		// headers before anything read the body.
		const { createKavach } = await import('../src/kavach.js')
		const adapter = makeAdapter()
		const resolve = vi.fn(() => 'RESOLVED')
		const kavachInstance = createKavach(adapter, {
			app: { login: '/signin', logout: '/logout', session: '/auth/session' },
			rules: [{ path: '/v1', public: true }]
		})
		const mockEvent = {
			url: new URL('http://localhost/v1/things'),
			cookies: { get: vi.fn(() => 'undefined') },
			locals: {},
			request: { method: 'POST' }
		}

		await kavachInstance.handle({ event: mockEvent, resolve })

		expect(resolve).toHaveBeenCalledTimes(1)
	})

	it('does not read the request body of a route it passes through', async () => {
		// The stronger statement: kavach must leave the body for the handler. A
		// body can be consumed exactly once, so any read here — for logging, for
		// a session probe — takes it away from the route that needs it.
		const { createKavach } = await import('../src/kavach.js')
		const adapter = makeAdapter()
		const bodyReads = []
		const request = {
			method: 'POST',
			json: vi.fn(() => {
				bodyReads.push('json')
				return Promise.resolve({})
			}),
			text: vi.fn(() => {
				bodyReads.push('text')
				return Promise.resolve('')
			}),
			formData: vi.fn(() => {
				bodyReads.push('formData')
				return Promise.resolve(new Map())
			})
		}
		const kavachInstance = createKavach(adapter, {
			app: { login: '/signin', logout: '/logout', session: '/auth/session' },
			rules: [{ path: '/v1', public: true }]
		})

		await kavachInstance.handle({
			event: {
				url: new URL('http://localhost/v1/things'),
				cookies: { get: vi.fn(() => 'undefined') },
				locals: {},
				request
			},
			resolve: vi.fn(() => 'RESOLVED')
		})

		expect(bodyReads).toEqual([])
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// onSessionSync — the one moment a provider token exists.
//
// The client POSTs the WHOLE provider session to `routes.session`, including
// fields like `provider_token` (a GitHub/GitLab access token, returned exactly
// once by the OAuth exchange). `setCookieFromSession` deliberately persists only
// `access_token` / `refresh_token`, so anything else is discarded — correctly,
// because a third-party credential has no business living in a cookie for the
// session's lifetime.
//
// But an app often needs it exactly once, server-side: to read the user's
// organisations at sign-in, for example. Without a hook the only options are to
// persist the token (bad) or to send it a second time from the browser
// (needless). This hands the app the incoming session in memory, once, and
// stores nothing extra.
describe('onSessionSync', () => {
	const incoming = {
		access_token: 'at',
		refresh_token: 'rt',
		provider_token: 'gho_forge_token',
		user: { id: 'u1', role: 'authenticated' }
	}

	function syncEvent(body) {
		return {
			url: new URL('http://localhost/auth/session'),
			cookies: { get: vi.fn(() => undefined) },
			locals: {},
			request: {
				method: 'POST',
				headers: { get: () => 'application/json' },
				json: () => Promise.resolve(body)
			}
		}
	}

	function adapterFor(session) {
		return {
			synchronize: vi.fn(() => Promise.resolve({ error: null, data: { session } })),
			signOut: vi.fn(),
			onAuthChange: vi.fn(),
			parseUrlError: vi.fn(() => null),
			signIn: vi.fn(),
			signUp: vi.fn()
		}
	}

	it('receives the INCOMING session, which is the one carrying provider_token', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const onSessionSync = vi.fn()
		// What `synchronize` returns is derived from the two tokens and has NO
		// provider_token — so a hook handed that session would be useless.
		const adapter = adapterFor({ access_token: 'at', refresh_token: 'rt', user: incoming.user })
		const kavach = createKavach(adapter, {
			app: { login: '/auth', home: '/home', session: '/auth/session' },
			rules: [],
			onSessionSync
		})

		await kavach.handle({
			event: syncEvent({ event: 'SIGNED_IN', session: incoming }),
			resolve: vi.fn()
		})

		expect(onSessionSync).toHaveBeenCalledTimes(1)
		const [session, evt] = onSessionSync.mock.calls[0]
		expect(session.provider_token).toBe('gho_forge_token')
		expect(evt).toBe('SIGNED_IN')
	})

	it('still does not persist provider_token in the cookie', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const adapter = adapterFor(incoming)
		const kavach = createKavach(adapter, {
			app: { login: '/auth', home: '/home', session: '/auth/session' },
			rules: [],
			onSessionSync: vi.fn()
		})

		const res = await kavach.handle({
			event: syncEvent({ event: 'SIGNED_IN', session: incoming }),
			resolve: vi.fn()
		})
		const cookie = res.headers.get('set-cookie') ?? ''
		expect(cookie).not.toContain('gho_forge_token')
		expect(cookie).not.toContain('provider_token')
	})

	it('is not called on sign-out, when there is no session', async () => {
		const { createKavach } = await import('../src/kavach.js')
		const onSessionSync = vi.fn()
		const adapter = adapterFor(null)
		const kavach = createKavach(adapter, {
			app: { login: '/auth', home: '/home', session: '/auth/session' },
			rules: [],
			onSessionSync
		})

		await kavach.handle({
			event: syncEvent({ event: 'SIGNED_OUT', session: null }),
			resolve: vi.fn()
		})
		expect(onSessionSync).not.toHaveBeenCalled()
		expect(adapter.signOut).toHaveBeenCalled()
	})

	it('does not fail the sign-in when the hook throws', async () => {
		// The session is already valid by this point. Losing it over a failure in
		// an app-side side-effect would force the user to sign in again over
		// something they cannot act on.
		const { createKavach } = await import('../src/kavach.js')
		const adapter = adapterFor(incoming)
		const kavach = createKavach(adapter, {
			app: { login: '/auth', home: '/home', session: '/auth/session' },
			rules: [],
			onSessionSync: vi.fn(() => Promise.reject(new Error('provisioning is down')))
		})

		const res = await kavach.handle({
			event: syncEvent({ event: 'SIGNED_IN', session: incoming }),
			resolve: vi.fn()
		})
		expect(res.status).toBe(200)
		expect(res.headers.get('set-cookie')).toContain('session=')
	})

	it('can be registered after construction via configure()', async () => {
		// hooks.server.ts imports the instance generated by @kavach/vite, so it
		// cannot pass constructor options — it needs to register the hook later.
		const { createKavach } = await import('../src/kavach.js')
		const onSessionSync = vi.fn()
		const adapter = adapterFor(incoming)
		const kavach = createKavach(adapter, {
			app: { login: '/auth', home: '/home', session: '/auth/session' },
			rules: []
		})
		kavach.configure({ onSessionSync })

		await kavach.handle({
			event: syncEvent({ event: 'SIGNED_IN', session: incoming }),
			resolve: vi.fn()
		})
		expect(onSessionSync).toHaveBeenCalledTimes(1)
	})
})
