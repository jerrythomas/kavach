import { describe, expect, it, beforeEach, vi } from 'vitest'
import { getAdapter, transformResult, decodeJwtPayload, ConvexAuthAdapter } from '../src/adapter.js'
import { createMockConvexAuth } from './mock.js'

describe('decodeJwtPayload', () => {
	it('should decode a valid JWT payload', () => {
		const payload = { sub: 'u1', email: 'a@b.com', role: 'admin' }
		const token = `x.${Buffer.from(JSON.stringify(payload)).toString('base64')}.y`
		expect(decodeJwtPayload(token)).toEqual(payload)
	})

	it('should return null for an invalid token', () => {
		expect(decodeJwtPayload('not-a-jwt')).toBeNull()
	})

	it('should return null for an empty string', () => {
		expect(decodeJwtPayload('')).toBeNull()
	})
})

describe('getAdapter', () => {
	let mockAuth

	beforeEach(() => {
		mockAuth = createMockConvexAuth()
	})

	it('should create an adapter with auth functions', () => {
		const adapter = getAdapter(mockAuth)
		expect(adapter).toBeInstanceOf(ConvexAuthAdapter)
		expect(adapter.signIn).toBeInstanceOf(Function)
		expect(adapter.signUp).toBeInstanceOf(Function)
		expect(adapter.signOut).toBeInstanceOf(Function)
		expect(adapter.synchronize).toBeInstanceOf(Function)
		expect(adapter.onAuthChange).toBeInstanceOf(Function)
	})

	describe('signIn', () => {
		it('should handle password sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
			await adapter.signIn(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('password', {
				email: 'a@b.com',
				password: '123456',
				flow: 'signIn'
			})
		})

		it('should handle OAuth sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'github' }
			await adapter.signIn(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('github')
		})

		it('should handle magic link / OTP sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'magic', email: 'a@b.com' }
			await adapter.signIn(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('resend-otp', {
				email: 'a@b.com'
			})
		})

		it('should return success result on password sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('success')
		})

		it('should return session with user on password sign in when authenticated', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('success')
			expect(result.data.user).toBeDefined()
			expect(result.data.user.id).toBe('user-convex-001')
			expect(result.data.user.email).toBe('test@test.com')
			expect(result.data.session).toBeDefined()
			expect(result.data.session.access_token).toBeDefined()
		})

		it('should return info result on magic link sign in', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'magic', email: 'a@b.com' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('info')
			expect(result.message).toBe('Magic link has been sent to "a@b.com".')
		})

		it('should return error result on failure', async () => {
			mockAuth.signIn.mockRejectedValue(new Error('Invalid credentials'))
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'password', email: 'a@b.com', password: 'wrong' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Invalid credentials')
		})

		it('should return current shape on OAuth sign in (before redirect)', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { provider: 'github' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('success')
			// OAuth resolves before redirect; no session returned
			expect(result.data).toEqual({ signingIn: true })
		})

		it('should return error when client is null', async () => {
			const adapter = getAdapter(null)
			const credentials = { provider: 'password', email: 'a@b.com', password: '123456' }
			const result = await adapter.signIn(credentials)
			expect(result.type).toBe('error')
			expect(result.message).toBe('Convex auth client not initialized')
		})
	})

	describe('signUp', () => {
		it('should handle password sign up', async () => {
			const adapter = getAdapter(mockAuth)
			const credentials = { email: 'a@b.com', password: '123456' }
			await adapter.signUp(credentials)
			expect(mockAuth.signIn).toHaveBeenCalledWith('password', {
				email: 'a@b.com',
				password: '123456',
				flow: 'signUp'
			})
		})

		it('should return error result on failure', async () => {
			mockAuth.signIn.mockRejectedValue(new Error('Email already exists'))
			const adapter = getAdapter(mockAuth)
			const credentials = { email: 'a@b.com', password: '123456' }
			const result = await adapter.signUp(credentials)
			expect(result.type).toBe('error')
			expect(result.error.message).toBe('Email already exists')
		})
	})

	describe('signOut', () => {
		it('should call signOut on the auth client', async () => {
			const adapter = getAdapter(mockAuth)
			await adapter.signOut()
			expect(mockAuth.signOut).toHaveBeenCalled()
		})
	})

	describe('fetchSession', () => {
		it('should return null when not authenticated', async () => {
			const auth = createMockConvexAuth({ isAuthenticated: () => false })
			const adapter = getAdapter(auth)
			const session = await adapter.fetchSession()
			expect(session).toBeNull()
		})

		it('should return null when token fetch fails', async () => {
			const auth = createMockConvexAuth({ fetchAccessToken: vi.fn().mockResolvedValue(null) })
			const adapter = getAdapter(auth)
			const session = await adapter.fetchSession()
			expect(session).toBeNull()
		})

		it('should return session with decoded user from JWT', async () => {
			const adapter = getAdapter(mockAuth)
			const session = await adapter.fetchSession()
			expect(session).toBeDefined()
			expect(session.user.id).toBe('user-convex-001')
			expect(session.user.email).toBe('test@test.com')
			expect(session.user.role).toBe('user')
			expect(session.access_token).toBeDefined()
			expect(session.expires_in).toBe(3600)
		})

		it('should return null when client is null', async () => {
			const adapter = getAdapter(null)
			const session = await adapter.fetchSession()
			expect(session).toBeNull()
		})
	})

	describe('synchronize', () => {
		it('should return session data', async () => {
			const session = { access_token: 'xyz', refresh_token: 'abc' }
			const adapter = getAdapter(mockAuth)
			const result = await adapter.synchronize(session)
			expect(result).toEqual({ data: { session }, error: null })
		})

		it('should pass through a full session with user', () => {
			const session = {
				access_token: 'xyz',
				refresh_token: '',
				user: { id: 'u1', email: 'a@b.com', role: 'user' },
				expires_in: 3600
			}
			const adapter = getAdapter(mockAuth)
			const result = adapter.synchronize(session)
			expect(result.data.session).toBe(session)
		})
	})

	describe('onAuthChange', () => {
		it('should be a function', () => {
			const adapter = getAdapter(mockAuth)
			expect(adapter.onAuthChange).toEqual(expect.any(Function))
		})

		it('should call callback with SIGNED_IN when authenticated on mount', async () => {
			vi.useFakeTimers()
			const adapter = getAdapter(mockAuth)
			const callback = vi.fn()

			adapter.onAuthChange(callback)
			await vi.advanceTimersByTimeAsync(0)

			expect(callback).toHaveBeenCalledWith(
				'SIGNED_IN',
				expect.objectContaining({
					access_token: expect.any(String),
					user: expect.objectContaining({ id: 'user-convex-001', email: 'test@test.com' })
				})
			)
			vi.useRealTimers()
		})

		it('should not call callback when not authenticated', async () => {
			vi.useFakeTimers()
			const auth = createMockConvexAuth({ isAuthenticated: () => false })
			const adapter = getAdapter(auth)
			const callback = vi.fn()

			adapter.onAuthChange(callback)
			await vi.advanceTimersByTimeAsync(0)

			expect(callback).not.toHaveBeenCalled()
			vi.useRealTimers()
		})

		it('should return a cleanup function', () => {
			const adapter = getAdapter(mockAuth)
			const cleanup = adapter.onAuthChange(() => {})
			expect(typeof cleanup).toBe('function')
		})

		it('should return no-op cleanup when client is null', () => {
			const adapter = getAdapter(null)
			const cleanup = adapter.onAuthChange(() => {})
			expect(typeof cleanup).toBe('function')
		})
	})
})

describe('transformResult', () => {
	it('should transform successful result', () => {
		const result = transformResult({ data: { user: 'test' } }, { provider: 'password' })
		expect(result).toEqual({
			type: 'success',
			data: { user: 'test' },
			credentials: { provider: 'password' }
		})
	})

	it('should transform error result', () => {
		const error = new Error('Something failed')
		const result = transformResult({ error }, { provider: 'password' })
		expect(result).toEqual({
			type: 'error',
			error: { message: 'Something failed' },
			message: 'Something failed'
		})
	})

	it('should transform magic link result', () => {
		const result = transformResult({ data: {} }, { provider: 'magic', email: 'a@b.com' })
		expect(result).toEqual({
			type: 'info',
			data: {},
			credentials: { provider: 'magic', email: 'a@b.com' },
			message: 'Magic link has been sent to "a@b.com".'
		})
	})
})
