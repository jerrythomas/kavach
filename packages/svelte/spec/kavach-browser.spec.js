import { describe, expect, it, vi } from 'vitest'
import { createMockAdapter, createMockEvent } from './mock'
import { createKavach } from '../src/kavach'
import { APP_AUTH_CONTEXT } from '../src/constants'

describe('kavach', () => {
	const resolve = vi.fn()
	const invalidate = vi.fn()
	const invalidateAll = vi.fn()
	const goto = vi.fn()

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
	let adapter

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
			'deflectedPath',
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

	it('should sign out on server when session is null', async () => {
		const kavach = createKavach(adapter)

		let event = createMockEvent({
			json: {},
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})

		await kavach.handle({ event, resolve })
		expect(event.locals.session).toBeFalsy()
		expect(adapter.synchronize).not.toHaveBeenCalled()
		expect(adapter.signOut).toHaveBeenCalled()
		// expect(Response).
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
		let session = {
			user: { id: 'foo', role: 'authenticated' }
		}
		let event = createMockEvent({
			json: {
				session
			},
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})
		adapter.synchronize = vi.fn().mockImplementationOnce((session) => ({
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

			let event = createMockEvent({
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
			// expect(Response).
			console.log()
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

		const kavach = createKavach(adapter, { invalidate })
		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }
		const result = await kavach.signIn(credentials)

		expect(adapter.signIn).toHaveBeenCalledWith(credentials)
		expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
		expect(result).toEqual({ input: credentials })
	})

	it('should sign up using adapter', async () => {
		adapter.signUp = vi.fn().mockImplementation((input) => ({ input }))

		const kavach = createKavach(adapter, { invalidate })
		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }
		const result = await kavach.signUp(credentials)

		expect(adapter.signUp).toHaveBeenCalledWith(credentials)
		expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
		expect(result).toEqual({ input: credentials })
	})

	it('should sign out using adapter', async () => {
		const kavach = createKavach(adapter, { invalidate, invalidateAll })
		const credentials = { email: 'foo@bar.com', passowrd: 'secret' }
		await kavach.signOut(credentials)

		expect(adapter.signOut).toHaveBeenCalledWith()
		expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
			body: JSON.stringify({ event: 'SIGNED_OUT' }),
			method: 'POST'
		})
		// expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
		expect(invalidateAll).toHaveBeenCalled()
	})

	it('should set event.locals', async () => {
		let event = createMockEvent({
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
	// it('should allow public path', async () => {
	// 	const kavach = createKavach(adapter)
	// 	let event = createMockEvent({
	// 		url: { pathname: '/auth' }
	// 	})

	// 	await kavach.handlers[3]({ event, resolve })
	// 	expect(resolve).toHaveBeenCalledWith(event)
	// 	expect(Response.redirect).not.toHaveBeenCalled()
	// })

	// it('should redirect access on protected path', async () => {
	// 	const kavach = createKavach(adapter)
	// 	let event = createMockEvent({
	// 		url: { pathname: '/', origin: 'http://localhost:5173' }
	// 	})

	// 	await kavach.handlers[3]({ event, resolve })
	// 	expect(resolve).not.toHaveBeenCalledWith()
	// 	expect(Response.redirect).toHaveBeenCalledWith(
	// 		'http://localhost:5173/auth',
	// 		301
	// 	)
	// })

	/**
	 * @vitest-environment jsdom
	 */
	it('should handle auth change to SIGNED_IN', async () => {
		global.fetch = vi.fn().mockImplementation(() => {
			return { status: 200 }
		})
		adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
			const result = await cb('SIGNED_IN', 'foo')
			expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
				body: '{"event":"SIGNED_IN","session":"foo"}',
				method: 'POST'
			})
			// expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
			expect(invalidateAll).toHaveBeenCalled()
			// expect(goto).toHaveBeenCalledWith('/')
			expect(result).toEqual({ status: 200 })
		})
		const kavach = createKavach(adapter, { invalidate, invalidateAll, goto })

		kavach.onAuthChange()
		expect(adapter.onAuthChange).toHaveBeenCalled()
	})
	it('should handle auth change to SIGNED_OUT', async () => {
		global.fetch = vi.fn().mockImplementation(() => {
			return { status: 200 }
		})
		adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
			const result = await cb('SIGNED_OUT', null)
			expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
				body: '{"event":"SIGNED_OUT","session":null}',
				method: 'POST'
			})
			// expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
			expect(invalidateAll).toHaveBeenCalled()
			// expect(goto).toHaveBeenCalledWith('/auth')
			expect(result).toEqual({ status: 200 })
		})
		const kavach = createKavach(adapter, { invalidate, invalidateAll, goto })

		kavach.onAuthChange()
		expect(adapter.onAuthChange).toHaveBeenCalled()
	})
})
