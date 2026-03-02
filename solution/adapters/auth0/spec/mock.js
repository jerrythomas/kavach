import { vi } from 'vitest'

export function createMockAuth0Client() {
	return {
		loginWithRedirect: vi.fn().mockResolvedValue(undefined),
		logout: vi.fn().mockResolvedValue(undefined),
		handleRedirectCallback: vi.fn().mockResolvedValue({ appState: {} }),
		isAuthenticated: vi.fn().mockResolvedValue(true),
		getUser: vi.fn().mockResolvedValue({
			sub: 'auth0|123',
			email: 'test@example.com',
			name: 'Test User'
		}),
		getTokenSilently: vi.fn().mockResolvedValue('mock-access-token')
	}
}
