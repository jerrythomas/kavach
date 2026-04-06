/* eslint-disable no-undef */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createMockAdapter, createMockEvent } from './mock'
import { createKavach } from '../src/kavach'

describe('kavach', () => {
	const resolve = vi.fn()
	const invalidateAll = vi.fn()

	const sessions = [
		{
			access_token: 'xyz',
			refresh_token: 'zzz',
			user: { id: 'foo', role: 'authenticated' }
		},
		{
			access_token: 'xyz',
			refresh_token: 'zzz',
			user: { id: 'foo', role: 'authenticated' },
			expires_in: 2000
		}
	]
	let adapter = null

	beforeEach(() => {
		adapter = createMockAdapter()
		global.fetch = vi.fn()

		const createMockResponse = function (body = {}, options = {}) {
			this.body = body
			this.status = options.status ?? 200
			this.headers = new Map(Object.entries(options.headers ?? {}))
		}
		createMockResponse.redirect = vi.fn(
			(url, status) =>
				new createMockResponse({}, { status: status ?? 302, headers: { location: url } })
		)

		global.Response = vi.fn().mockImplementation(createMockResponse)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should create kavach using an adapter', () => {
		const kavach = createKavach(adapter)
		expect(kavach).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			onAuthChange: expect.any(Function),
			handle: expect.any(Function),
			configure: expect.any(Function),
			actions: expect.any(Function),
			getCachedLogins: expect.any(Function),
			removeCachedLogin: expect.any(Function),
			clearCachedLogins: expect.any(Function)
		})
	})

	it('should return the server actions using data option', () => {
		const mockData = vi
			.fn()
			.mockImplementation((schema) => ({ connection: `${schema} connection` }))
		const kavach = createKavach(adapter, { data: mockData })
		expect(kavach.actions('public')).toEqual({ connection: 'public connection' })
		expect(mockData).toHaveBeenCalledWith('public')
	})

	it('should return undefined actions when no data option provided', () => {
		const kavach = createKavach(adapter)
		expect(kavach.actions()).toBeUndefined()
	})

	it('should bypass the session handler', async () => {
		const kavach = createKavach(adapter)
		let event = createMockEvent({
			url: { pathname: '/auth' }
		})

		await kavach.handle({ event, resolve })
		expect(resolve).toHaveBeenCalledWith(event)
		expect(Response).not.toHaveBeenCalled()

		event = createMockEvent({
			url: { pathname: '/', origin: 'http://localhost' }
		})

		await kavach.handle({ event, resolve })

		expect(resolve).not.toHaveBeenCalledWith(event)
		expect(Response).toHaveBeenCalledWith('', {
			headers: { location: 'http://localhost/auth' },
			status: 303
		})
	})
	it('should return json response for unauthorized endpoint access', async () => {
		const kavach = createKavach(adapter)
		const event = createMockEvent({
			url: { pathname: '/api/xyz' }
		})
		await kavach.handle({ event, resolve })
		expect(Response).toHaveBeenCalledWith(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		})
	})

	it('should sign out on server when session is null', async () => {
		const kavach = createKavach(adapter)

		const event = createMockEvent({
			json: {},
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})

		await kavach.handle({ event, resolve })
		expect(event.locals.session).toBeFalsy()
		expect(adapter.synchronize).not.toHaveBeenCalled()
		expect(adapter.signOut).toHaveBeenCalled()

		expect(Response).toHaveBeenCalledWith(JSON.stringify({ session: null, error: null }), {
			headers: {
				'Set-Cookie': ['session=null; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'],
				'Content-Type': 'application/json'
			},
			status: 200
		})
		expect(resolve).not.toHaveBeenCalled()
	})

	it('should return error when session is invalid', async () => {
		const kavach = createKavach(adapter)
		const error = 'Invalid session'
		const session = {
			user: { id: 'foo', role: 'authenticated' }
		}
		const event = createMockEvent({
			json: {
				session
			},
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})
		adapter.synchronize = vi.fn().mockImplementationOnce(() => ({
			error
		}))

		await kavach.handle({ event, resolve })
		expect(event.locals.session).toBeFalsy()
		expect(adapter.synchronize).toHaveBeenCalledWith(session)
		expect(adapter.signOut).not.toHaveBeenCalled()
		// expect(Response).
		expect(Response).toHaveBeenCalledWith(JSON.stringify({ session: null, error }), {
			headers: {
				'Set-Cookie': ['session=null; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'],
				'Content-Type': 'application/json'
			},
			status: 500
		})
		expect(resolve).not.toHaveBeenCalled()
	})

	it.each(sessions)('should set session cookie when input is valid', async (session) => {
		const maxAge = session.expires_in ? session.expires_in : 3600
		const cookieOptions = `Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`

		const event = createMockEvent({
			json: {
				session
			},
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})
		adapter.synchronize = vi.fn().mockImplementationOnce((session) => ({
			error: null,
			data: { session }
		}))

		const kavach = createKavach(adapter)
		await kavach.handle({ event, resolve })
		expect(event.locals.session).toBeFalsy()
		expect(adapter.synchronize).toHaveBeenCalledWith(session)
		expect(adapter.signOut).not.toHaveBeenCalled()

		expect(Response).toHaveBeenCalledWith(JSON.stringify({ session, error: null }), {
			headers: {
				'Set-Cookie': [
					`session=%7B%22refresh_token%22%3A%22zzz%22%2C%22access_token%22%3A%22xyz%22%2C%22user%22%3A%7B%22id%22%3A%22foo%22%2C%22role%22%3A%22authenticated%22%7D%7D; ${cookieOptions}`
				],
				'Content-Type': 'application/json'
			},
			status: 200
		})
		expect(resolve).not.toHaveBeenCalled()
	})
	it('should sign in using adapter', async () => {
		adapter.signIn = vi.fn().mockImplementation((input) => ({ input }))

		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }

		const kavach = createKavach(adapter, { invalidateAll })
		const result = await kavach.signIn(credentials)

		expect(adapter.signIn).toHaveBeenCalledWith(credentials)
		expect(result).toEqual({ input: credentials })
	})

	it('should sign up using adapter', async () => {
		adapter.signUp = vi.fn().mockImplementation((input) => ({ input }))

		const kavach = createKavach(adapter, { invalidateAll })
		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }
		const result = await kavach.signUp(credentials)

		expect(adapter.signUp).toHaveBeenCalledWith(credentials)
		expect(result).toEqual({ input: credentials })
	})

	it.each([{ invalidateAll }, {}])('should sign out using adapter', async (options) => {
		const kavach = createKavach(adapter, options)
		await kavach.signOut()

		expect(adapter.signOut).toHaveBeenCalledWith()
		expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
			body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
			method: 'POST'
		})

		if (options.invalidateAll) {
			expect(invalidateAll).toHaveBeenCalled()
		}
	})

	it('should set event.locals', () => {
		const event = createMockEvent({
			json: {},
			cookies: { session: JSON.stringify({ user: 'foo' }) },
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})

		const kavach = createKavach(adapter, { invalidateAll })
		kavach.handle({ event, resolve })
		expect(event.locals.session).toEqual(JSON.parse(event.cookies.get('session')))
	})

	describe('onAuthChange', () => {
		/**
		 * @vitest-environment jsdom
		 */
		beforeEach(() => {
			global.fetch = vi.fn().mockImplementation(() => {
				return { status: 200 }
			})
		})

		it('should handle auth change to SIGNED_IN', () => {
			adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
				const result = await cb('SIGNED_IN', 'foo')
				expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
					body: '{"event":"SIGNED_IN","session":"foo"}',
					method: 'POST'
				})

				expect(invalidateAll).toHaveBeenCalled()
				expect(result).toEqual({ status: 200 })
			})
			const kavach = createKavach(adapter, { invalidateAll })

			kavach.onAuthChange()
			expect(adapter.parseUrlError).not.toHaveBeenCalled()
			expect(adapter.onAuthChange).toHaveBeenCalled()
		})

		it('should handle error when fetching auth session', () => {
			global.fetch = vi.fn().mockImplementation(() => {
				return { status: 401 }
			})

			adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
				const result = await cb('SIGNED_IN', 'foo')
				expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
					body: '{"event":"SIGNED_IN","session":"foo"}',
					method: 'POST'
				})

				expect(invalidateAll).not.toHaveBeenCalled()
				expect(result).toEqual({ status: 401 })
			})
			const kavach = createKavach(adapter, { invalidateAll })

			kavach.onAuthChange()
			expect(adapter.parseUrlError).not.toHaveBeenCalled()
			expect(adapter.onAuthChange).toHaveBeenCalled()
		})

		it('should handle auth change to SIGNED_OUT', () => {
			adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
				const result = await cb('SIGNED_OUT', null)

				expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
					body: '{"event":"SIGNED_OUT","session":null}',
					method: 'POST'
				})
				expect(invalidateAll).toHaveBeenCalled()
				expect(result).toEqual({ status: 200 })
			})
			const kavach = createKavach(adapter, { invalidateAll })

			kavach.onAuthChange({ hash: '' })
			expect(adapter.onAuthChange).toHaveBeenCalled()
		})
	})

	describe('handleAuthUrlError', () => {
		const url = { pathname: '/auth/session', hash: '#' }
		const logger = {
			info: vi.fn(),
			debug: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			getContextLogger: () => logger
		}

		const page = {
			subscribe: vi.fn((callback) => {
				setTimeout(() => {
					callback({ url })
				}, 100)
				return () => {}
			})
		}

		beforeEach(() => {
			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it('should initiate the logger', () => {
			const logger = { getContextLogger: vi.fn() }
			const kavach = createKavach(adapter, { logger, page })
			expect(logger.getContextLogger).toHaveBeenCalledWith({
				package: '@kavach/svelte',
				module: 'kavach'
			})
			expect(kavach).toBeDefined()
		})

		it('should handle url error', async () => {
			const error = {
				code: 500,
				status: 'server error',
				message: 'Internal Server Error'
			}

			adapter.parseUrlError = vi.fn().mockImplementation(() => error)

			const kavach = createKavach(adapter, { logger, page })
			// expect(logger.getContextLogger).toHaveBeenCalledWith({
			// 	package: '@kavach/svelte',
			// 	module: 'kavach'
			// })

			expect(kavach).toBeDefined()

			vi.advanceTimersByTime(100)
			await vi.runAllTimersAsync()
			expect(adapter.parseUrlError).toHaveBeenCalledWith(url)
			expect(logger.error).toHaveBeenCalledWith({
				message: error.message,
				error,
				data: {
					url: { pathname: '/auth/session', hash: '#' }
				}
			})
		})

		it('should not call function when there is no error', async () => {
			adapter.parseUrlError = vi.fn().mockImplementation(() => null)

			url.hash = ''
			const kavach = createKavach(adapter, { logger, page })
			expect(kavach).toBeDefined()

			vi.advanceTimersByTime(100)
			await vi.runAllTimersAsync()
			expect(adapter.parseUrlError).toHaveBeenCalledWith(url)
			expect(logger.error).not.toHaveBeenCalledOnce()
		})
	})

	describe('loginCache integration', () => {
		beforeEach(() => {
			vi.stubGlobal('localStorage', {
				_store: {},
				getItem(key) {
					return this._store[key] ?? null
				},
				setItem(key, value) {
					this._store[key] = String(value)
				},
				removeItem(key) {
					delete this._store[key]
				},
				clear() {
					this._store = {}
				}
			})
		})

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('should cache login after successful signIn with user data', async () => {
			const user = {
				email: 'test@example.com',
				user_metadata: {
					full_name: 'Test User',
					avatar_url: 'https://example.com/avatar.png'
				}
			}
			adapter.signIn = vi.fn().mockResolvedValue({
				type: 'success',
				data: { user }
			})

			const kavach = createKavach(adapter)
			await kavach.signIn({ email: 'test@example.com', password: 'secret' })

			const cached = kavach.getCachedLogins()
			expect(cached).toHaveLength(1)
			expect(cached[0]).toMatchObject({
				email: 'test@example.com',
				name: 'Test User',
				avatar: 'https://example.com/avatar.png',
				provider: 'email',
				mode: 'email'
			})
			expect(cached[0].lastLogin).toEqual(expect.any(Number))
		})

		it('should set provider and mode from credentials when using oauth', async () => {
			const user = {
				email: 'oauth@example.com',
				user_metadata: {}
			}
			adapter.signIn = vi.fn().mockResolvedValue({
				type: 'success',
				data: { user }
			})

			const kavach = createKavach(adapter)
			await kavach.signIn({ provider: 'google' })

			const cached = kavach.getCachedLogins()
			expect(cached).toHaveLength(1)
			expect(cached[0]).toMatchObject({
				email: 'oauth@example.com',
				provider: 'google',
				mode: 'oauth'
			})
		})

		it('should derive name from email when full_name is missing', async () => {
			const user = {
				email: 'john.doe@example.com',
				user_metadata: {}
			}
			adapter.signIn = vi.fn().mockResolvedValue({
				type: 'success',
				data: { user }
			})

			const kavach = createKavach(adapter)
			await kavach.signIn({ email: 'john.doe@example.com', password: 'secret' })

			const cached = kavach.getCachedLogins()
			expect(cached[0].name).toBe('john.doe')
		})

		it('should not cache login on failed signIn', async () => {
			adapter.signIn = vi.fn().mockResolvedValue({
				type: 'error',
				error: { message: 'Invalid credentials' }
			})

			const kavach = createKavach(adapter)
			await kavach.signIn({ email: 'test@example.com', password: 'wrong' })

			expect(kavach.getCachedLogins()).toEqual([])
		})

		it('should not cache login when result has no user', async () => {
			adapter.signIn = vi.fn().mockResolvedValue({
				type: 'success',
				data: {}
			})

			const kavach = createKavach(adapter)
			await kavach.signIn({ email: 'test@example.com', password: 'secret' })

			expect(kavach.getCachedLogins()).toEqual([])
		})

		it('should remove a cached login by email', async () => {
			const user = { email: 'test@example.com', user_metadata: {} }
			adapter.signIn = vi.fn().mockResolvedValue({
				type: 'success',
				data: { user }
			})

			const kavach = createKavach(adapter)
			await kavach.signIn({ email: 'test@example.com', password: 'secret' })
			expect(kavach.getCachedLogins()).toHaveLength(1)

			kavach.removeCachedLogin('test@example.com')
			expect(kavach.getCachedLogins()).toEqual([])
		})

		it('should clear all cached logins', async () => {
			adapter.signIn = vi
				.fn()
				.mockResolvedValueOnce({
					type: 'success',
					data: { user: { email: 'a@test.com', user_metadata: {} } }
				})
				.mockResolvedValueOnce({
					type: 'success',
					data: { user: { email: 'b@test.com', user_metadata: {} } }
				})

			const kavach = createKavach(adapter)
			await kavach.signIn({ email: 'a@test.com', password: '1' })
			await kavach.signIn({ email: 'b@test.com', password: '2' })
			expect(kavach.getCachedLogins()).toHaveLength(2)

			kavach.clearCachedLogins()
			expect(kavach.getCachedLogins()).toEqual([])
		})
	})
})
