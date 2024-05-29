import { pick, omit } from 'ramda'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdapter, parseUrlError, transformResult } from '../src/adapter.js'
import { AuthApiError } from '@supabase/supabase-js'

let subscription = null

vi.mock('@supabase/supabase-js', async (importOriginal) => ({
	...(await importOriginal()),
	createClient: vi.fn().mockReturnValue({
		auth: {
			signInWithOtp: vi.fn().mockImplementation((input) => {
				return {
					data: pick(['provider'], input),
					credentials: pick(['email', 'provider'], input)
				}
			}),
			signInWithPassword: vi.fn().mockImplementation((input) => {
				return {
					data: pick(['provider'], input),
					credentials: pick(['email', 'phone', 'password'], input)
				}
			}),
			signInWithOAuth: vi.fn().mockImplementation((input) => {
				return {
					data: pick(['provider'], input)
				}
			}),
			signUp: vi.fn().mockImplementation((input) => ({
				data: pick(['provider'], input),
				credentials: pick(['email', 'password'], input)
			})),
			signOut: vi.fn(),
			onAuthStateChange: vi.fn((callback) => {
				subscription = { unsubscribe: vi.fn() }
				// Trigger the callback to simulate an auth event
				setTimeout(() => {
					callback('SIGNED_IN', { user: 'test user' })
				}, 100)
				// Return an object that has a data property containing subscription
				return { data: { subscription } }
			}),
			setSession: vi.fn()
		}
	})
}))

describe('getAdapter', () => {
	const options = {
		url: 'http://localhost',
		anonKey: 'key',
		schemas: ['public']
	}
	it('should create a client and define auth functions', () => {
		const adapter = getAdapter(options)
		expect(Object.keys(adapter)).toEqual([
			'signIn',
			'signUp',
			'signOut',
			'synchronize',
			'onAuthChange',
			'parseUrlError',
			'client',
			'db'
		])
	})

	it('should create adapters without multiple clients', () => {
		const adapter = getAdapter(omit(['schemas'], options))

		expect(adapter.db()).toEqual(adapter.client)
		expect(adapter.db('public')).toEqual(adapter.client)
	})
	it('should handle sign in using magic link', async () => {
		const adapter = getAdapter(options)
		const credentials = { provider: 'magic', email: 'a@b.com' }
		const result = await adapter.signIn(credentials)
		expect(adapter.client.auth.signInWithOtp).toHaveBeenCalledWith({
			email: 'a@b.com'
		})
		// expect(result).toBeNull()
		expect(result).toEqual({
			type: 'info',
			data: {},
			message: ''
		})
	})

	it('should handle sign in using email & password', async () => {
		const adapter = getAdapter(options)
		const credentials = {
			provider: 'password',
			email: 'a@b.com',
			password: '123456'
		}
		const result = await adapter.signIn(credentials)
		expect(adapter.client.auth.signInWithPassword).toHaveBeenCalledWith({
			email: 'a@b.com',
			password: '123456',
			options: { emailRedirectTo: 'http://localhost:3000' }
		})
		// expect(result).toBeNull()
		expect(result).toEqual({
			type: 'info',
			data: {},
			message: ''
		})
	})

	it('should handle sign in using phone & password', async () => {
		const adapter = getAdapter(options)
		const credentials = {
			provider: 'password',
			phone: '1234567890',
			password: '123456'
		}
		const result = await adapter.signIn(credentials)
		expect(adapter.client.auth.signInWithPassword).toHaveBeenCalledWith({
			phone: '1234567890',
			password: '123456',
			options: { emailRedirectTo: 'http://localhost:3000' }
		})
		// expect(result).toBeNull()
		expect(result).toEqual({
			type: 'info',
			data: {},
			message: ''
		})
	})

	it('should handle sign in using oAuth', async () => {
		const adapter = getAdapter(options)
		const credentials = {
			provider: 'gmail'
		}
		const result = await adapter.signIn(credentials)
		expect(adapter.client.auth.signInWithOAuth).toHaveBeenCalledWith({
			provider: 'gmail',
			options: { scopes: '', redirectTo: 'http://localhost:3000' }
		})
		// expect(result).toBeNull()
		expect(result).toEqual({
			type: 'info',
			data: { provider: 'gmail' },
			message: ''
		})
	})

	it('should handle sign up', async () => {
		const adapter = getAdapter(options)
		const credentials = {
			provider: 'password',
			email: 'a@b.com',
			password: '123456'
		}
		const result = await adapter.signUp(credentials)
		expect(adapter.client.auth.signUp).toHaveBeenCalledWith({
			email: 'a@b.com',
			password: '123456',
			options: { emailRedirectTo: undefined }
		})
		// expect(result).toBeNull()
		expect(result).toEqual({
			type: 'info',
			data: {},
			message: ''
		})
	})

	it('should handle sign out', async () => {
		const adapter = getAdapter(options)
		await adapter.signOut()
		expect(adapter.client.auth.signOut).toHaveBeenCalled()
	})

	it('should synchronize session', async () => {
		const adapter = getAdapter(options)
		await adapter.synchronize({ mock: 'session' })
		expect(adapter.db('public').auth.setSession).toHaveBeenCalledWith({
			mock: 'session'
		})
		expect(adapter.client.auth.setSession).toHaveBeenCalledWith({
			mock: 'session'
		})
	})
})

describe('transformResult', () => {
	it('should transform result for successful response', () => {
		const result = {
			data: { provider: 'email' },
			credentials: { email: 'test@example.com' }
		}
		const transformed = transformResult(result)
		// expect(transformed).toBeNull()
		expect(transformed).toEqual({
			type: 'info',
			data: { provider: 'email' },
			message: ''
		})
	})
	it('should transform result for magic link response', () => {
		const result = {
			data: { provider: 'magic' },
			credentials: { email: 'test@example.com' }
		}
		const transformed = transformResult(result)
		expect(transformed).toEqual({
			// type: 'success',
			type: 'info',
			message: 'Magic link has been sent to "test@example.com".',
			data: { provider: 'magic' }
		})
	})
	it('should transform result for error response', () => {
		const result = { error: { message: 'Error', status: 400 }, credentials: {} }
		const transformed = transformResult(result)
		expect(transformed).toEqual({
			type: 'error',
			...result.error,
			message: 'Server error. Try again later.',
			data: result.data
		})
	})
	it('should transform result for error response (AuthApiError)', () => {
		const error = new AuthApiError('Invalid credentials.', 400)
		const result = { error, credentials: {} }
		const transformed = transformResult(result)
		expect(transformed).toEqual({
			type: 'error',
			...error,
			message: 'Invalid credentials.',
			data: undefined // Assuming the data part should be undefined in the error case
		})
	})
})

describe('parseUrlError', () => {
	it('should return no error if URL hash contains no error information', () => {
		const url = { hash: '' }
		const result = parseUrlError(url)
		// expect(result).toBeNull()
		expect(result).toEqual({
			isError: false
		})
	})

	it('should correctly parse the error from URL hash', () => {
		const url = {
			hash: '#error=invalid_request&error_code=400&error_description=The%20request%20is%20missing%20a%20required%20parameter.'
		}
		const result = parseUrlError(url)
		expect(result).toEqual({
			// type: 'error',
			isError: true,
			status: '400',
			name: 'invalid_request',
			message: 'The request is missing a required parameter.'
		})
	})
})

describe('onAuthChange', () => {
	const options = {
		url: 'http://localhost',
		anonKey: 'key',
		schemas: ['public']
	}

	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should handle auth state changes', async () => {
		const adapter = getAdapter(options)
		const callback = vi.fn()

		// Subscribe to auth changes
		const unsubscribe = adapter.onAuthChange(callback)
		vi.advanceTimersByTime(100)
		await vi.runAllTimersAsync()
		expect(adapter.client.auth.onAuthStateChange).toHaveBeenCalled()

		// Ensure the callback was called with the expected arguments
		expect(callback).toHaveBeenCalledWith('SIGNED_IN', { user: 'test user' })

		// Test unsubscribe functionality
		unsubscribe()
		await vi.runAllTimersAsync()
		expect(subscription.unsubscribe).toHaveBeenCalled()
	})
})
