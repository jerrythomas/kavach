import { describe, expect, it, beforeEach } from 'vitest'
import {
	createMockAuth,
	resetMocks,
	mockSignInWithEmailAndPassword,
	mockSignInWithPopup,
	mockSendSignInLinkToEmail,
	mockCreateUserWithEmailAndPassword,
	mockSignOut,
	mockOnAuthStateChanged
} from './mock.js'
import { FirebaseAuthAdapter, getAdapter, getAuthMode, transformResult } from '../src/adapter.js'

describe('getAdapter', () => {
	let mockAuth
	let adapter

	beforeEach(() => {
		resetMocks()
		mockAuth = createMockAuth()
		adapter = getAdapter(mockAuth)
	})

	it('should return an instance of FirebaseAuthAdapter with all methods', () => {
		expect(adapter).toBeInstanceOf(FirebaseAuthAdapter)
		expect(adapter.signIn).toBeInstanceOf(Function)
		expect(adapter.signUp).toBeInstanceOf(Function)
		expect(adapter.signOut).toBeInstanceOf(Function)
		expect(adapter.synchronize).toBeInstanceOf(Function)
		expect(adapter.onAuthChange).toBeInstanceOf(Function)
		expect(adapter.parseUrlError).toBeInstanceOf(Function)
		expect(adapter.capabilities).toBeInstanceOf(Array)
		expect(adapter.capabilities).toContain('passkey')
	})

	it('should declare passkey in capabilities', () => {
		expect(adapter.capabilities).toContain('passkey')
	})

	describe('signIn', () => {
		it('should handle password sign in via signInWithEmailAndPassword', async () => {
			const mockUser = { uid: 'user-1', email: 'a@b.com' }
			mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

			const credentials = { email: 'a@b.com', password: 'secret123' }
			const result = await adapter.signIn(credentials)

			expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'a@b.com', 'secret123')
			expect(result.type).toBe('success')
			expect(result.data).toEqual(mockUser)
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should handle OAuth sign in (google) via signInWithPopup', async () => {
			const mockUser = { uid: 'user-2', email: 'user@gmail.com' }
			mockSignInWithPopup.mockResolvedValue({ user: mockUser })

			const credentials = { provider: 'google' }
			const result = await adapter.signIn(credentials)

			expect(mockSignInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(Object))
			expect(result.type).toBe('success')
			expect(result.data).toEqual(mockUser)
		})

		it('should handle magic link sign in via sendSignInLinkToEmail', async () => {
			mockSendSignInLinkToEmail.mockResolvedValue(undefined)

			const credentials = { provider: 'magic', email: 'a@b.com', redirectTo: 'http://localhost:3000' }
			const result = await adapter.signIn(credentials)

			expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith(mockAuth, 'a@b.com', {
				url: 'http://localhost:3000',
				handleCodeInApp: true
			})
			expect(result.type).toBe('info')
			expect(result.message).toBe('Magic link has been sent to "a@b.com".')
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should return error result on sign in failure', async () => {
			mockSignInWithEmailAndPassword.mockRejectedValue({
				code: 'auth/invalid-credential',
				message: 'Invalid credentials'
			})

			const credentials = { email: 'a@b.com', password: 'wrong' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Invalid credentials')
			expect(result.error.code).toBe('auth/invalid-credential')
		})

		it('should return error for unsupported OAuth provider', async () => {
			const credentials = { provider: 'unsupported' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toContain('Unsupported provider')
		})

		it('should handle OAuth sign in with github provider', async () => {
			const mockUser = { uid: 'user-3', email: 'user@github.com' }
			mockSignInWithPopup.mockResolvedValue({ user: mockUser })

			const credentials = { provider: 'github' }
			const result = await adapter.signIn(credentials)

			expect(mockSignInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(Object))
			expect(result.type).toBe('success')
			expect(result.data).toEqual(mockUser)
		})

		it('should return error result for passkey sign in (not yet supported)', async () => {
			const credentials = { mode: 'passkey', email: 'a@b.com' }
			const result = await adapter.signIn(credentials)

			expect(result.type).toBe('error')
			expect(result.error.code).toBe('auth/passkey-not-supported')
			expect(result.error.message).toContain('not yet supported')
		})
	})

	describe('signUp', () => {
		it('should handle email/password sign up via createUserWithEmailAndPassword', async () => {
			const mockUser = { uid: 'new-user', email: 'new@b.com' }
			mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })

			const credentials = { email: 'new@b.com', password: 'newpass123' }
			const result = await adapter.signUp(credentials)

			expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'new@b.com', 'newpass123')
			expect(result.type).toBe('success')
			expect(result.data).toEqual(mockUser)
			expect(result.credentials).not.toHaveProperty('password')
		})

		it('should return error result on sign up failure', async () => {
			mockCreateUserWithEmailAndPassword.mockRejectedValue({
				code: 'auth/email-already-in-use',
				message: 'Email already in use'
			})

			const credentials = { email: 'existing@b.com', password: 'pass123' }
			const result = await adapter.signUp(credentials)

			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Email already in use')
			expect(result.error.code).toBe('auth/email-already-in-use')
		})
	})

	describe('signOut', () => {
		it('should call firebase signOut with auth', async () => {
			mockSignOut.mockResolvedValue(undefined)

			await adapter.signOut()

			expect(mockSignOut).toHaveBeenCalledWith(mockAuth)
		})
	})

	describe('synchronize', () => {
		it('should return currentUser when authenticated', () => {
			const result = adapter.synchronize()
			expect(result).toEqual({
				uid: 'user-123',
				email: 'test@example.com',
				displayName: 'Test User'
			})
		})

		it('should return null when not authenticated', () => {
			const unauthMock = { currentUser: null }
			const unauthAdapter = getAdapter(unauthMock)
			const result = unauthAdapter.synchronize()
			expect(result).toBeNull()
		})
	})

	describe('onAuthChange', () => {
		it('should register a listener via onAuthStateChanged', () => {
			const callback = async () => {}
			mockOnAuthStateChanged.mockReturnValue(() => {})

			adapter.onAuthChange(callback)

			expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function))
		})

		it('should return an unsubscribe function', () => {
			const unsubFn = () => {}
			mockOnAuthStateChanged.mockReturnValue(unsubFn)

			const result = adapter.onAuthChange(async () => {})

			expect(result).toBe(unsubFn)
		})

		it('should call callback with SIGNED_IN when user exists', async () => {
			const callback = vi.fn()
			const mockUser = { uid: 'user-1', email: 'a@b.com' }

			mockOnAuthStateChanged.mockImplementation((auth, cb) => {
				cb(mockUser)
				return () => {}
			})

			adapter.onAuthChange(callback)

			expect(callback).toHaveBeenCalledWith('SIGNED_IN', mockUser)
		})

		it('should call callback with SIGNED_OUT when user is null', async () => {
			const callback = vi.fn()

			mockOnAuthStateChanged.mockImplementation((auth, cb) => {
				cb(null)
				return () => {}
			})

			adapter.onAuthChange(callback)

			expect(callback).toHaveBeenCalledWith('SIGNED_OUT', null)
		})
	})

	describe('parseUrlError', () => {
		it('should return null for clean URLs', () => {
			const url = new URL('http://localhost:3000/callback')
			const result = adapter.parseUrlError(url)
			expect(result).toBeNull()
		})

		it('should parse error params from URL query string', () => {
			const url = new URL('http://localhost:3000/callback?error=access_denied&error_description=User+denied+access')
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
		const data = { uid: 'user-1', email: 'a@b.com' }
		const result = transformResult({ data }, { provider: 'password', email: 'a@b.com' })

		expect(result).toEqual({
			type: 'success',
			data: { uid: 'user-1', email: 'a@b.com' },
			credentials: { provider: 'password', email: 'a@b.com' }
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
		const data = { uid: 'user-1' }
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
	it('should return passkey when mode is passkey', () => {
		expect(getAuthMode({ mode: 'passkey' })).toBe('passkey')
	})

	it('should return magic when provider is magic', () => {
		expect(getAuthMode({ provider: 'magic', email: 'a@b.com' })).toBe('magic')
	})

	it('should return password when password is provided', () => {
		expect(getAuthMode({ email: 'a@b.com', password: 'secret' })).toBe('password')
	})

	it('should return oauth by default', () => {
		expect(getAuthMode({ provider: 'google' })).toBe('oauth')
	})
})
