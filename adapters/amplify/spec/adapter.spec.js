import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
	mockSignIn,
	mockSignUp,
	mockSignOut,
	mockFetchAuthSession,
	mockSignInWithRedirect,
	mockGetCurrentUser,
	mockHubListen
} from './mock.js'

vi.mock('aws-amplify/auth', () => ({
	signIn: (...args) => mockSignIn(...args),
	signUp: (...args) => mockSignUp(...args),
	signOut: (...args) => mockSignOut(...args),
	fetchAuthSession: (...args) => mockFetchAuthSession(...args),
	signInWithRedirect: (...args) => mockSignInWithRedirect(...args),
	getCurrentUser: (...args) => mockGetCurrentUser(...args)
}))

vi.mock('aws-amplify/utils', () => ({
	Hub: { listen: (...args) => mockHubListen(...args) }
}))

import { getAdapter, transformResult, getAuthMode, AmplifyAuthAdapter } from '../src/adapter.js'

describe('getAdapter', () => {
	let adapter

	beforeEach(() => {
		vi.clearAllMocks()
		mockSignIn.mockResolvedValue({
			isSignedIn: true,
			nextStep: { signInStep: 'DONE' }
		})
		mockSignUp.mockResolvedValue({
			isSignUpComplete: true,
			userId: 'mock-user-id',
			nextStep: { signUpStep: 'DONE' }
		})
		mockSignOut.mockResolvedValue(undefined)
		mockFetchAuthSession.mockResolvedValue({
			tokens: {
				accessToken: { toString: () => 'mock-access-token' },
				idToken: { toString: () => 'mock-id-token' }
			}
		})
		mockSignInWithRedirect.mockResolvedValue(undefined)
		mockGetCurrentUser.mockResolvedValue({
			userId: 'mock-user-id',
			username: 'test@example.com'
		})
		mockHubListen.mockReturnValue(() => {})
		adapter = getAdapter()
	})

	it('should return an instance of AmplifyAuthAdapter with all methods', () => {
		expect(adapter).toBeInstanceOf(AmplifyAuthAdapter)
		expect(adapter.signIn).toBeInstanceOf(Function)
		expect(adapter.signUp).toBeInstanceOf(Function)
		expect(adapter.signOut).toBeInstanceOf(Function)
		expect(adapter.synchronize).toBeInstanceOf(Function)
		expect(adapter.onAuthChange).toBeInstanceOf(Function)
		expect(adapter.parseUrlError).toBeInstanceOf(Function)
	})

	it('should take no arguments (no client parameter)', () => {
		const result = getAdapter()
		expect(result).not.toBeInstanceOf(Promise)
		expect(result.signIn).toBeInstanceOf(Function)
	})

	describe('signIn', () => {
		it('should handle password sign in by calling signIn with username and password', async () => {
			const credentials = { email: 'a@b.com', password: 'secret123' }
			const result = await adapter.signIn(credentials)

			expect(mockSignIn).toHaveBeenCalledWith({ username: 'a@b.com', password: 'secret123' })
			expect(result.type).toBe('success')
			expect(result.data).toEqual({
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' }
			})
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should handle OAuth sign in via signInWithRedirect with provider', async () => {
			const credentials = { provider: 'google' }
			const result = await adapter.signIn(credentials)

			expect(mockSignInWithRedirect).toHaveBeenCalledWith({ provider: 'google' })
			expect(result.type).toBe('success')
			expect(result.data).toBeNull()
		})

		it('should handle magic link sign in via signIn with USER_AUTH flow', async () => {
			mockSignIn.mockResolvedValue(null)
			const credentials = { provider: 'magic', email: 'a@b.com' }
			const result = await adapter.signIn(credentials)

			expect(mockSignIn).toHaveBeenCalledWith({
				username: 'a@b.com',
				options: { authFlowType: 'USER_AUTH' }
			})
			expect(result.type).toBe('info')
			expect(result.message).toBe('Magic link has been sent to "a@b.com".')
		})

		it('should return info result for magic link sign in', async () => {
			mockSignIn.mockResolvedValue(null)
			const credentials = { provider: 'magic', email: 'user@test.com' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('info')
			expect(result.data).toBeNull()
			expect(result.credentials).toEqual({ provider: 'magic', email: 'user@test.com' })
			expect(result.message).toBe('Magic link has been sent to "user@test.com".')
		})

		it('should return success result for password sign in', async () => {
			const credentials = { email: 'a@b.com', password: 'secret' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('success')
			expect(result.data).toEqual({
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' }
			})
			expect(result.credentials).toEqual({ email: 'a@b.com' })
		})

		it('should return error result on sign in failure', async () => {
			mockSignIn.mockRejectedValue({
				code: 'NotAuthorizedException',
				message: 'Incorrect username or password'
			})

			const credentials = { email: 'a@b.com', password: 'wrong' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Incorrect username or password')
			expect(result.error.code).toBe('NotAuthorizedException')
		})
	})

	describe('signUp', () => {
		it('should call signUp with username and password', async () => {
			const credentials = { email: 'new@b.com', password: 'newpass123' }
			const result = await adapter.signUp(credentials)

			expect(mockSignUp).toHaveBeenCalledWith({ username: 'new@b.com', password: 'newpass123' })
			expect(result.type).toBe('success')
			expect(result.data).toEqual({
				isSignUpComplete: true,
				userId: 'mock-user-id',
				nextStep: { signUpStep: 'DONE' }
			})
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should return error result on sign up failure', async () => {
			mockSignUp.mockRejectedValue({
				code: 'UsernameExistsException',
				message: 'An account with the given email already exists'
			})

			const credentials = { email: 'existing@b.com', password: 'pass123' }
			const result = await adapter.signUp(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toBe('An account with the given email already exists')
			expect(result.error.code).toBe('UsernameExistsException')
		})
	})

	describe('signOut', () => {
		it('should call amplify signOut with no arguments', async () => {
			await adapter.signOut()

			expect(mockSignOut).toHaveBeenCalledWith()
		})
	})

	describe('synchronize', () => {
		it('should return session and user when authenticated', async () => {
			const result = await adapter.synchronize()

			expect(mockFetchAuthSession).toHaveBeenCalled()
			expect(mockGetCurrentUser).toHaveBeenCalled()
			expect(result).toEqual({
				type: 'success',
				data: {
					session: {
						tokens: {
							accessToken: { toString: expect.any(Function) },
							idToken: { toString: expect.any(Function) }
						}
					},
					user: {
						userId: 'mock-user-id',
						username: 'test@example.com'
					}
				}
			})
		})

		it('should return error when not authenticated', async () => {
			mockFetchAuthSession.mockRejectedValue(new Error('No current user'))

			const result = await adapter.synchronize()

			expect(result).toEqual({
				type: 'error',
				message: 'No current user'
			})
		})
	})

	describe('onAuthChange', () => {
		it('should register a Hub listener on the auth channel', () => {
			const callback = () => {}
			adapter.onAuthChange(callback)

			expect(mockHubListen).toHaveBeenCalledWith('auth', expect.any(Function))
		})

		it('should return an unsubscribe function', () => {
			const unsubFn = () => {}
			mockHubListen.mockReturnValue(unsubFn)

			const result = adapter.onAuthChange(() => {})

			expect(result).toBe(unsubFn)
		})

		it('should map signedIn event to SIGNED_IN', () => {
			let hubCallback
			mockHubListen.mockImplementation((channel, cb) => {
				hubCallback = cb
				return () => {}
			})

			const callback = vi.fn()
			adapter.onAuthChange(callback)

			hubCallback({ payload: { event: 'signedIn', data: { userId: 'user-1' } } })

			expect(callback).toHaveBeenCalledWith('SIGNED_IN', { userId: 'user-1' })
		})

		it('should map other events to SIGNED_OUT', () => {
			let hubCallback
			mockHubListen.mockImplementation((channel, cb) => {
				hubCallback = cb
				return () => {}
			})

			const callback = vi.fn()
			adapter.onAuthChange(callback)

			hubCallback({ payload: { event: 'signedOut', data: undefined } })

			expect(callback).toHaveBeenCalledWith('SIGNED_OUT', undefined)
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
				type: 'error',
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
		const data = { isSignedIn: true, userId: 'user-1' }
		const result = transformResult({ data }, { provider: 'google', email: 'a@b.com' })

		expect(result).toEqual({
			type: 'success',
			data: { isSignedIn: true, userId: 'user-1' },
			credentials: { provider: 'google', email: 'a@b.com' }
		})
	})

	it('should transform an error result with code', () => {
		const error = { code: 'NotAuthorizedException', message: 'Invalid credentials' }
		const result = transformResult(
			{ error },
			{ provider: 'password', email: 'a@b.com', password: 'wrong' }
		)

		expect(result).toEqual({
			type: 'error',
			error: { message: 'Invalid credentials', code: 'NotAuthorizedException' },
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
		const data = { isSignedIn: true }
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
