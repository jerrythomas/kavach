import { vi } from 'vitest'

export const mockSignIn = vi.fn().mockResolvedValue({
	isSignedIn: true,
	nextStep: { signInStep: 'DONE' }
})
export const mockSignUp = vi.fn().mockResolvedValue({
	isSignUpComplete: true,
	userId: 'mock-user-id',
	nextStep: { signUpStep: 'DONE' }
})
export const mockSignOut = vi.fn().mockResolvedValue(undefined)
export const mockFetchAuthSession = vi.fn().mockResolvedValue({
	tokens: {
		accessToken: { toString: () => 'mock-access-token' },
		idToken: { toString: () => 'mock-id-token' }
	}
})
export const mockSignInWithRedirect = vi.fn().mockResolvedValue(undefined)
export const mockGetCurrentUser = vi.fn().mockResolvedValue({
	userId: 'mock-user-id',
	username: 'test@example.com'
})
export const mockHubListen = vi.fn().mockReturnValue(() => {})
