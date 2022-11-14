import { vi } from 'vitest'

function mockSignIn(mode, credentials, options) {
	return mode === 'otp' ? { data: 'success' } : { error: 'invalid data' }
}

export function createMockAdapter() {
	return {
		signIn: vi.fn().mockImplementation(mockSignIn),
		signOut: vi.fn(),
		setSession: vi.fn().mockImplementation((session) => session),
		verifyOtp: vi.fn(),
		onAuthChange: vi.fn()
	}
}
