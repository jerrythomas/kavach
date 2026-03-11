import { describe, expect, it, beforeEach } from 'vitest'
import { getAdapter, transformResult, ConvexAuthAdapter } from '../src/adapter.js'
import { createMockConvexAuth } from './mock.js'

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

	describe('synchronize', () => {
		it('should return session data', async () => {
			const session = { access_token: 'xyz', refresh_token: 'abc' }
			const adapter = getAdapter(mockAuth)
			const result = await adapter.synchronize(session)
			expect(result).toEqual({ data: { session }, error: null })
		})
	})

	describe('onAuthChange', () => {
		it('should be a function', () => {
			const adapter = getAdapter(mockAuth)
			expect(adapter.onAuthChange).toEqual(expect.any(Function))
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
