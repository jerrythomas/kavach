import { vi } from 'vitest'

export const mockSignInWithEmailAndPassword = vi.fn()
export const mockSignInWithPopup = vi.fn()
export const mockSendSignInLinkToEmail = vi.fn()
export const mockCreateUserWithEmailAndPassword = vi.fn()
export const mockSignOut = vi.fn()
export const mockOnAuthStateChanged = vi.fn()

export const mockGoogleAuthProvider = vi.fn()
export const mockGithubAuthProvider = vi.fn()
export const mockTwitterAuthProvider = vi.fn()
export const mockFacebookAuthProvider = vi.fn()
export const mockOAuthProvider = vi.fn()

vi.mock('firebase/auth', () => {
	class GoogleAuthProvider {}
	class GithubAuthProvider {}
	class TwitterAuthProvider {}
	class FacebookAuthProvider {}
	class OAuthProvider {
		constructor(providerId) {
			this.providerId = providerId
		}
	}

	mockGoogleAuthProvider.mockImplementation(() => new GoogleAuthProvider())
	mockGithubAuthProvider.mockImplementation(() => new GithubAuthProvider())
	mockTwitterAuthProvider.mockImplementation(() => new TwitterAuthProvider())
	mockFacebookAuthProvider.mockImplementation(() => new FacebookAuthProvider())
	mockOAuthProvider.mockImplementation((id) => new OAuthProvider(id))

	return {
		signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
		signInWithPopup: mockSignInWithPopup,
		sendSignInLinkToEmail: mockSendSignInLinkToEmail,
		createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
		signOut: mockSignOut,
		onAuthStateChanged: mockOnAuthStateChanged,
		GoogleAuthProvider,
		GithubAuthProvider,
		TwitterAuthProvider,
		FacebookAuthProvider,
		OAuthProvider
	}
})

export function createMockAuth() {
	return {
		currentUser: { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' }
	}
}

export function resetMocks() {
	mockSignInWithEmailAndPassword.mockReset()
	mockSignInWithPopup.mockReset()
	mockSendSignInLinkToEmail.mockReset()
	mockCreateUserWithEmailAndPassword.mockReset()
	mockSignOut.mockReset()
	mockOnAuthStateChanged.mockReset()
	mockGoogleAuthProvider.mockClear()
	mockGithubAuthProvider.mockClear()
	mockTwitterAuthProvider.mockClear()
	mockFacebookAuthProvider.mockClear()
	mockOAuthProvider.mockClear()
}
