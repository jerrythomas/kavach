import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createMockAdapter, createMockEvent } from './mock'
import { createKavach, authStatus } from '../src/kavach'
import { get } from 'svelte/store'

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
		global.Response = vi.fn().mockImplementation((...status) => status)
		global.Response.redirect = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should create kavach using an adapter', () => {
		const kavach = createKavach(adapter)
		expect(Object.keys(kavach)).toEqual([
			'signIn',
			'signUp',
			'signOut',
			'onAuthChange',
			'handle',
			'client'
		])
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
		expect(Response).toHaveBeenCalledWith(
			{},
			{
				headers: { location: 'http://localhost/auth' },
				status: 303
			}
		)
	})
	it('should return json response for unauthorized endpoint access', async () => {
		const kavach = createKavach(adapter)
		const event = createMockEvent({
			url: { pathname: '/api/xyz' }
		})
		await kavach.handle({ event, resolve })
		expect(Response).toHaveBeenCalledWith(
			{ error: 'Unauthorized' },
			{ status: 401 }
		)
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

		expect(Response).toHaveBeenCalledWith(
			{ error: null, session: null },
			{
				headers: {
					'Set-Cookie': [
						'session=null; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'
					]
				},
				status: 200
			}
		)
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
		expect(Response).toHaveBeenCalledWith(
			{ error, session: null },
			{
				headers: {
					'Set-Cookie': [
						'session=null; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'
					]
				},
				status: 500
			}
		)
		expect(resolve).not.toHaveBeenCalled()
	})

	it.each(sessions)(
		'should set session cookie when input is valid',
		async (session) => {
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

			expect(Response).toHaveBeenCalledWith(
				{ error: null, session },
				{
					headers: {
						'Set-Cookie': [
							`session=%7B%22refresh_token%22%3A%22zzz%22%2C%22access_token%22%3A%22xyz%22%2C%22user%22%3A%7B%22id%22%3A%22foo%22%2C%22role%22%3A%22authenticated%22%7D%7D; ${cookieOptions}`
						]
					},
					status: 200
				}
			)
			expect(resolve).not.toHaveBeenCalled()
		}
	)
	it('should sign in using adapter', async () => {
		adapter.signIn = vi.fn().mockImplementation((input) => ({ input }))

		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }

		const kavach = createKavach(adapter, { invalidateAll })
		await kavach.signIn(credentials)
		expect(adapter.signIn).toHaveBeenCalledWith(credentials)
		expect(get(authStatus)).toEqual({ input: credentials })
		// expect(invalidateAll).toHaveBeenCalled()
		// expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
		// expect(result).toEqual({ input: credentials })
	})

	it('should sign up using adapter', async () => {
		adapter.signUp = vi.fn().mockImplementation((input) => ({ input }))

		const kavach = createKavach(adapter, { invalidateAll })
		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }
		await kavach.signUp(credentials)

		expect(adapter.signUp).toHaveBeenCalledWith(credentials)
		expect(get(authStatus)).toEqual({ input: credentials })
		// expect(invalidateAll).toHaveBeenCalled()
		// expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
		// expect(result).toEqual({ input: credentials })
	})

	it.each([{ invalidateAll }, {}])(
		'should sign out using adapter',
		async (options) => {
			const kavach = createKavach(adapter, options)
			await kavach.signOut()

			expect(adapter.signOut).toHaveBeenCalledWith()
			expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
				body: JSON.stringify({ event: 'SIGNED_OUT' }),
				method: 'POST'
			})
			expect(get(authStatus)).toEqual({})
			// expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
			if (options.invalidateAll) {
				expect(invalidateAll).toHaveBeenCalled()
			}
		}
	)

	it('should set event.locals', () => {
		const event = createMockEvent({
			json: {},
			cookies: { session: JSON.stringify({ user: 'foo' }) },
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})

		const kavach = createKavach(adapter)
		kavach.handle({ event, resolve })
		expect(event.locals.session).toEqual(
			JSON.parse(event.cookies.get('session'))
		)
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
			expect(adapter.parseUrlError).toHaveBeenCalled()
			expect(adapter.onAuthChange).toHaveBeenCalled()
			expect(get(authStatus)).toEqual({})
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
			expect(adapter.parseUrlError).toHaveBeenCalled()
			expect(adapter.onAuthChange).toHaveBeenCalled()
			expect(get(authStatus)).toEqual({})
		})

		it('should handle error in url hash', () => {
			adapter.parseUrlError = vi
				.fn()
				.mockImplementation(() => ({ type: 'error', error: 'server_error' }))

			const kavach = createKavach(adapter, { invalidateAll })

			kavach.onAuthChange({
				hash: 'error=server_error&error_code=500&error_description=Unable+to+exchange+external+code'
			})
			expect(adapter.parseUrlError).toHaveBeenCalled()
			expect(adapter.onAuthChange).toHaveBeenCalled()
			expect(get(authStatus)).toEqual({ type: 'error', error: 'server_error' })
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
			expect(adapter.parseUrlError).toHaveBeenCalled()
			expect(adapter.onAuthChange).toHaveBeenCalled()
		})
	})
})
