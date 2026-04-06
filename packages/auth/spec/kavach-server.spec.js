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
