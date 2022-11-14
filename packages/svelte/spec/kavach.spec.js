import { describe, expect, it, vi } from 'vitest'
import { createEvent } from './mock/event'
import { createKavach } from '../src/kavach'
import { APP_AUTH_CONTEXT } from '../src/constants'
describe('Endpoint functions', () => {
	let adapter
	const resolve = vi.fn()

	beforeEach(() => {
		global.fetch = vi.fn()
		global.Response = vi.fn().mockImplementation((...status) => status)
		global.Response.redirect = vi.fn()
		adapter = {
			signIn: vi.fn().mockImplementation(mockSignIn),
			signOut: vi.fn(),
			setSession: vi.fn().mockImplementation((session) => session),
			verifyOtp: vi.fn(),
			onAuthChange: vi.fn()
		}
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should create kavach using an adapter', () => {
		const kavach = createKavach(adapter)
		expect(Object.keys(kavach)).toEqual(['session', 'handlers', 'onAuthChange'])
		expect(kavach.handlers.length).toEqual(4)
		expect(kavach.session).toBeFalsy()
	})

	it('should bypass signin handler', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/' }
		})
		await kavach.handlers[0]({ event, resolve })
		expect(resolve).toHaveBeenCalledWith(event)
		expect(Response.redirect).not.toHaveBeenCalled()
	})
	it('should process signin endpoint using handler', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/auth/signin', origin: 'http://localhost:5173' },
			form: { mode: 'otp' }
		})

		await kavach.handlers[0]({ event, resolve })
		expect(resolve).not.toHaveBeenCalled()
		expect(Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth?mode=otp&data=success',
			301
		)
	})

	it('should bypass the sign out handler', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/' }
		})

		await kavach.handlers[1]({ event, resolve })
		expect(resolve).toHaveBeenCalledWith(event)
		expect(adapter.signOut).not.toHaveBeenCalled()
	})
	it('should process sign out endpoint using handler', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/auth/signout', origin: 'http://localhost:5173' },
			locals: { session: 'foo' }
		})

		await kavach.handlers[1]({ event, resolve })
		expect(adapter.signOut).toHaveBeenCalled()
		expect(event.locals.session).toBeFalsy()
		expect(Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth',
			301
		)
		expect(resolve).not.toHaveBeenCalled()
	})

	it('should bypass the session handler', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/' }
		})

		await kavach.handlers[2]({ event, resolve })
		expect(resolve).toHaveBeenCalledWith(event)
		expect(Response).not.toHaveBeenCalled()
	})

	it('should process session endpoint using handler', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			json: { session: 'foo' },
			url: { pathname: '/auth/session', origin: 'http://localhost:5173' }
		})

		await kavach.handlers[2]({ event, resolve })
		// expect(adapter.signOut).toHaveBeenCalled()
		expect(event.locals.session).toEqual('foo')
		expect(Response).toHaveBeenCalledWith(200)
		expect(resolve).not.toHaveBeenCalled()
	})

	it('should allow public path', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/auth' }
		})

		await kavach.handlers[3]({ event, resolve })
		expect(resolve).toHaveBeenCalledWith(event)
		expect(Response.redirect).not.toHaveBeenCalled()
	})

	it('should redirect access on protected path', async () => {
		const kavach = createKavach(adapter)
		let event = createEvent({
			url: { pathname: '/', origin: 'http://localhost:5173' }
		})

		await kavach.handlers[3]({ event, resolve })
		expect(resolve).not.toHaveBeenCalledWith()
		expect(Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth',
			301
		)
	})

	/**
	 * @vitest-environment jsdom
	 */
	it('should handle auth changes on browser', async () => {
		let invalidate = vi.fn()

		adapter.onAuthChange = vi.fn().mockImplementation(async (cb) => {
			await cb('SIGNED_IN', 'foo')
		})
		const kavach = createKavach(adapter, { invalidate })

		kavach.onAuthChange()
		expect(adapter.onAuthChange).toHaveBeenCalled()
		expect(global.fetch).toHaveBeenCalledWith('/auth/session', {
			body: '{"event":"SIGNED_IN","session":"foo"}',
			method: 'POST'
		})
		expect(invalidate).toHaveBeenCalledWith(APP_AUTH_CONTEXT)
	})
})

function mockSignIn(mode, credentials, options) {
	return mode === 'otp' ? { data: 'success' } : { error: 'invalid data' }
}
