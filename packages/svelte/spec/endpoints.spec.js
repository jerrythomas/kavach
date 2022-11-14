import { describe, expect, it, vi } from 'vitest'
import { createMockEvent, createMockAdapter } from './mock'
import { sessionEndpoint, signInEndpoint } from '../src/endpoints'

describe('Endpoint functions', () => {
	// const adapter = { setSession: vi.fn(), signIn: vi.fn() }
	const deflector = { page: { login: '/auth', home: '/home' } }
	const adapter = createMockAdapter()

	beforeEach(() => {
		global.Response = vi.fn()
		global.Response.redirect = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})
	it('should call adapter.setSession', async () => {
		let event = createMockEvent({ json: {} })
		await sessionEndpoint(event, adapter)
		expect(adapter.setSession).toHaveBeenCalledWith(undefined)
		expect(global.Response).toHaveBeenCalledWith(200)

		event = createMockEvent({ json: { session: 'foo' } })
		await sessionEndpoint(event, adapter)
		expect(adapter.setSession).toHaveBeenCalledWith('foo')
		expect(global.Response).toHaveBeenCalledWith(200)
	})
	it('should call adapter.signIn and redirect on success', async () => {
		let adapter = {
			setSession: vi.fn(),
			signIn: vi.fn().mockImplementation(() => ({ data: 'ok' }))
		}
		let event = createMockEvent({
			json: { email: 'foo@bar.com', mode: 'otp' },
			origin: 'http://localhost:5173',
			headers: { accept: 'application/json' }
		})
		await signInEndpoint(event, adapter, deflector)
		expect(global.Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth?mode=otp&email=foo@bar.com&data=ok',
			301
		)
		event = createMockEvent({
			json: { email: 'foo@bar.com', mode: 'otp' },
			origin: 'http://localhost:5173',
			headers: { accept: 'formdata' },
			method: 'POST'
		})
		await signInEndpoint(event, adapter, deflector)
		expect(global.Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth?mode=otp&email=foo@bar.com&data=ok',
			303
		)
	})

	it('should call adapter.signIn and redirect on error', async () => {
		let adapter = {
			setSession: vi.fn(),
			signIn: vi.fn().mockImplementation(() => ({ error: 'foo' }))
		}
		let event = createMockEvent({
			json: { email: 'foo@bar.com', mode: 'otp' },
			origin: 'http://localhost:5173',
			headers: { accept: 'application/json' }
		})
		await signInEndpoint(event, adapter, deflector)
		expect(global.Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth?mode=otp&email=foo@bar.com&error=foo',
			301
		)
		event = createMockEvent({
			json: { email: 'foo@bar.com', mode: 'otp' },
			origin: 'http://localhost:5173',
			headers: { accept: 'formdata' },
			method: 'POST'
		})
		await signInEndpoint(event, adapter, deflector)
		expect(global.Response.redirect).toHaveBeenCalledWith(
			'http://localhost:5173/auth?mode=otp&email=foo@bar.com&error=foo',
			303
		)
	})
})
