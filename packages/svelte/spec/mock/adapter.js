import { vi } from 'vitest'

function mockSignIn(credentials) {
	return credentials.provider === 'magic'
		? { data: 'success' }
		: { error: 'invalid data' }
}

export function createMockAdapter(options) {
	return {
		signIn: vi.fn().mockImplementation(mockSignIn),
		signOut: vi.fn(),
		synchronize: vi.fn().mockImplementation((session) => {
			if (options?.invalidSession) return { error: 'invalid session' }
			else
				return {
					data: {
						session
					},
					error: null
				}
		}),
		verifyOtp: vi.fn(),
		onAuthChange: vi.fn(),
		parseUrlError: vi.fn()
	}
}
