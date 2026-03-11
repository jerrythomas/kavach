import { vi } from 'vitest'

export function createMockConvexAuth() {
	return {
		signIn: vi.fn().mockResolvedValue({ signingIn: true }),
		signOut: vi.fn().mockResolvedValue(undefined),
		isAuthenticated: vi.fn().mockReturnValue(true),
		isLoading: vi.fn().mockReturnValue(false),
		fetchAccessToken: vi.fn().mockResolvedValue('mock-access-token')
	}
}
