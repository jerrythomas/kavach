import { vi } from 'vitest'

/**
 * Build a minimal JWT-like token from a payload object.
 * Header is a dummy; only the payload matters for decodeJwtPayload().
 *
 * @param {object} payload
 * @returns {string}
 */
function makeJwt(payload) {
	const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64')
	const body = Buffer.from(JSON.stringify(payload)).toString('base64')
	return `${header}.${body}.`
}

/** Default payload used by the mock's fetchAccessToken. */
const MOCK_PAYLOAD = {
	sub: 'user-convex-001',
	email: 'test@test.com',
	role: 'user',
	user_metadata: {}
}

/**
 * Create a mock Convex auth client for tests.
 *
 * @param {object} [overrides]
 * @returns {object}
 */
export function createMockConvexAuth(overrides = {}) {
	return {
		signIn: vi.fn().mockResolvedValue({ signingIn: true }),
		signOut: vi.fn().mockResolvedValue(undefined),
		isAuthenticated: vi.fn().mockReturnValue(true),
		isLoading: vi.fn().mockReturnValue(false),
		fetchAccessToken: vi.fn().mockResolvedValue(makeJwt(MOCK_PAYLOAD)),
		...overrides
	}
}
