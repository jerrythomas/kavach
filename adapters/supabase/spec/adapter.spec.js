import { getAdapter, transformResult, parseUrlError } from '../src/adapter.js'

import { describe, it, expect, vi } from 'vitest'
import { pick } from 'ramda'
// import { createClient } from '@supabase/supabase-js'
// import { getAdapter, transformResult, handleSignIn, parseUrlError } from './yourModule' // replace with the actual file name

// Mocks
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
			signInWithPassword: vi.fn(),
			signInWithOAuth: vi.fn(),
			signUp: vi.fn(),
			signOut: vi.fn(),
			onAuthStateChange: vi.fn(() => ({
				data: { subscription: { unsubscribe: vi.fn() } }
			})),
			setSession: vi.fn()
		}
	})
}))

// vi.mock('@kavach/core', () => ({
//   urlHashToParams: vi.fn(),
// }))

describe('getAdapter', () => {
	it('should create a client and define auth functions', () => {
		const options = {
			url: 'http://localhost',
			anonKey: 'key',
			schema: ['public']
		}
		const adapter = getAdapter(options)
		expect(adapter).toHaveProperty('signIn')
		expect(adapter).toHaveProperty('signUp')
		expect(adapter).toHaveProperty('signOut')
		expect(adapter).toHaveProperty('synchronize')
		expect(adapter).toHaveProperty('onAuthChange')
		expect(adapter).toHaveProperty('parseUrlError')
		// expect(adapter).toHaveProperty('client')
		expect(adapter).toHaveProperty('db')
		expect(Object.keys(adapter)).toHaveLength(7)
	})

	it('should handle sign in', async () => {
		const options = {
			url: 'http://localhost',
			anonKey: 'key',
			schema: ['public']
		}
		const adapter = getAdapter(options)
		const credentials = { provider: 'magic', email: 'a@b.com' }
		const expectedResponse = { data: {}, message: '', type: 'info' }
		const result = await adapter.signIn(credentials)
		expect(result).toEqual(expectedResponse)
	})
})

describe('transformResult', () => {
	it('should transform result for successful response', () => {
		const result = {
			data: { provider: 'email' },
			credentials: { email: 'test@example.com' }
		}
		const transformed = transformResult(result)
		expect(transformed).toEqual({
			type: 'info',
			data: result.data,
			message: ''
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
})

describe('parseUrlError', () => {
	it('should return no error if URL hash contains no error information', () => {
		const url = { hash: '' }
		const result = parseUrlError(url)
		expect(result).toEqual({ isError: false })
	})

	it('should correctly parse the error from URL hash', () => {
		const url = {
			hash: '#error=invalid_request&error_code=400&error_description=The%20request%20is%20missing%20a%20required%20parameter.'
		}
		const result = parseUrlError(url)
		expect(result).toEqual({
			isError: true,
			status: '400',
			name: 'invalid_request',
			message: 'The request is missing a required parameter.'
		})
	})
})

// ... Additional tests for each function
