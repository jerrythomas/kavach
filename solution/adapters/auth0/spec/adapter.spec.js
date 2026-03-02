import { describe, expect, it, beforeEach } from 'vitest'
import { createMockAuth0Client } from './mock.js'
import { getAdapter, transformResult, getAuthMode, parseUrlError } from '../src/adapter.js'

describe('getAdapter', () => {
	let mockClient
	let adapter

	beforeEach(() => {
		mockClient = createMockAuth0Client()
		adapter = getAdapter(mockClient)
	})

	it('should return an adapter with all 6 AuthAdapter methods', () => {
		expect(adapter).toEqual({
			signIn: expect.any(Function),
			signUp: expect.any(Function),
			signOut: expect.any(Function),
			synchronize: expect.any(Function),
			onAuthChange: expect.any(Function),
			parseUrlError: expect.any(Function)
		})
	})

	it('should be synchronous (not return a promise)', () => {
		const result = getAdapter(mockClient)
		expect(result).not.toBeInstanceOf(Promise)
		expect(result.signIn).toBeInstanceOf(Function)
	})

	describe('signIn', () => {
		it('should handle password sign in via loginWithRedirect with Username-Password-Authentication connection', async () => {
			const credentials = { email: 'a@b.com', password: 'secret123' }
			const result = await adapter.signIn(credentials)

			expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
				authorizationParams: {
					connection: 'Username-Password-Authentication',
					login_hint: 'a@b.com'
				}
			})
			expect(result.type).toBe('success')
			expect(result.data).toBeNull()
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should handle OAuth sign in (github) via loginWithRedirect with connection', async () => {
			const credentials = { provider: 'github' }
			const result = await adapter.signIn(credentials)

			expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
				authorizationParams: {
					connection: 'github'
				}
			})
			expect(result.type).toBe('success')
			expect(result.data).toBeNull()
		})

		it('should handle magic link sign in via loginWithRedirect with email connection', async () => {
			const credentials = { provider: 'magic', email: 'a@b.com' }
			const result = await adapter.signIn(credentials)

			expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
				authorizationParams: {
					connection: 'email',
					login_hint: 'a@b.com'
				}
			})
			expect(result.type).toBe('info')
			expect(result.message).toBe('Magic link has been sent to "a@b.com".')
		})

		it('should return info result for magic link sign in', async () => {
			const credentials = { provider: 'magic', email: 'user@test.com' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('info')
			expect(result.data).toBeNull()
			expect(result.credentials).toEqual({ provider: 'magic', email: 'user@test.com' })
			expect(result.message).toBe('Magic link has been sent to "user@test.com".')
		})

		it('should return success result for non-magic sign in with null data (redirect-based)', async () => {
			const credentials = { email: 'a@b.com', password: 'secret' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('success')
			expect(result.data).toBeNull()
			expect(result.credentials).toEqual({ email: 'a@b.com' })
		})

		it('should return error result on sign in failure', async () => {
			mockClient.loginWithRedirect.mockRejectedValue({
				code: 'auth/network-error',
				message: 'Network error occurred'
			})

			const credentials = { email: 'a@b.com', password: 'wrong' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Network error occurred')
			expect(result.error.code).toBe('auth/network-error')
		})
	})

	describe('signUp', () => {
		it('should redirect with signup screen_hint via loginWithRedirect', async () => {
			const credentials = { email: 'new@b.com', password: 'newpass123' }
			const result = await adapter.signUp(credentials)

			expect(mockClient.loginWithRedirect).toHaveBeenCalledWith({
				authorizationParams: {
					screen_hint: 'signup'
				}
			})
			expect(result.type).toBe('success')
			expect(result.data).toBeNull()
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should return error result on sign up failure', async () => {
			mockClient.loginWithRedirect.mockRejectedValue({
				code: 'auth/signup-disabled',
				message: 'Sign up is disabled'
			})

			const credentials = { email: 'new@b.com', password: 'pass123' }
			const result = await adapter.signUp(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Sign up is disabled')
			expect(result.error.code).toBe('auth/signup-disabled')
		})
	})

	describe('signOut', () => {
		it('should call client.logout with logoutParams returnTo', async () => {
			await adapter.signOut()

			expect(mockClient.logout).toHaveBeenCalledWith({
				logoutParams: {
					returnTo: window.location.origin
				}
			})
		})
	})

	describe('synchronize', () => {
		it('should return user when authenticated', async () => {
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
			mockClient.getTokenSilently.mockRejectedValue(new Error('Login required'))

			const result = await adapter.synchronize()

			expect(result).toEqual({
				data: null,
				error: { message: 'Login required' }
			})
		})
	})

	describe('onAuthChange', () => {
		it('should be a function (no-op)', () => {
			expect(adapter.onAuthChange).toBeInstanceOf(Function)
		})

		it('should not throw when called', () => {
			expect(() => adapter.onAuthChange(() => {})).not.toThrow()
		})
	})

	describe('parseUrlError', () => {
		it('should return null for clean URLs', () => {
			const url = new URL('http://localhost:3000/callback')
			const result = adapter.parseUrlError(url)
			expect(result).toBeNull()
		})

		it('should parse error params from URL query string', () => {
			const url = new URL(
				'http://localhost:3000/callback?error=access_denied&error_description=User+denied+access'
			)
			const result = adapter.parseUrlError(url)
			expect(result).toEqual({
				code: 'access_denied',
				message: 'User denied access'
			})
		})

		it('should return null for null/undefined URL', () => {
			expect(adapter.parseUrlError(null)).toBeNull()
			expect(adapter.parseUrlError(undefined)).toBeNull()
		})
	})
})

describe('transformResult', () => {
	it('should transform a successful result', () => {
		const data = { sub: 'auth0|1', email: 'a@b.com' }
		const result = transformResult({ data }, { provider: 'github', email: 'a@b.com' })

		expect(result).toEqual({
			type: 'success',
			data: { sub: 'auth0|1', email: 'a@b.com' },
			credentials: { provider: 'github', email: 'a@b.com' }
		})
	})

	it('should transform an error result with code', () => {
		const error = { code: 'auth/invalid-credential', message: 'Invalid credentials' }
		const result = transformResult({ error }, { provider: 'password', email: 'a@b.com', password: 'wrong' })

		expect(result).toEqual({
			type: 'error',
			error: { message: 'Invalid credentials', code: 'auth/invalid-credential' },
			message: 'Invalid credentials'
		})
	})

	it('should transform a magic link result', () => {
		const result = transformResult({ data: null }, { provider: 'magic', email: 'a@b.com' })

		expect(result).toEqual({
			type: 'info',
			data: null,
			credentials: { provider: 'magic', email: 'a@b.com' },
			message: 'Magic link has been sent to "a@b.com".'
		})
	})

	it('should strip password from credentials', () => {
		const data = { sub: 'auth0|1' }
		const result = transformResult({ data }, { email: 'a@b.com', password: 'secret' })

		expect(result.credentials).not.toHaveProperty('password')
		expect(result.credentials).toEqual({ email: 'a@b.com' })
	})

	it('should handle error without code', () => {
		const error = { message: 'Something went wrong' }
		const result = transformResult({ error }, { provider: 'password' })

		expect(result.type).toBe('error')
		expect(result.error.code).toBeUndefined()
		expect(result.error.message).toBe('Something went wrong')
	})
})

describe('getAuthMode', () => {
	it('should return magic when provider is magic', () => {
		expect(getAuthMode({ provider: 'magic', email: 'a@b.com' })).toBe('magic')
	})

	it('should return password when password is provided', () => {
		expect(getAuthMode({ email: 'a@b.com', password: 'secret' })).toBe('password')
	})

	it('should return oauth for provider-based auth', () => {
		expect(getAuthMode({ provider: 'github' })).toBe('oauth')
	})
})
