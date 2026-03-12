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
