/**
 * Transforms Convex result into kavach AuthResult format
 *
 * @param {Object} result
 * @param {Object} credentials
 * @returns {import('kavach').AuthResult}
 */
export function transformResult({ data, error }, credentials) {
	if (error) {
		const message = error.message || 'An error occurred'
		return {
			type: 'error',
			error: { message },
			message
		}
	}

	if (credentials.provider === 'magic') {
		return {
			type: 'info',
			data,
			credentials,
			message: `Magic link has been sent to "${credentials.email}".`
		}
	}

	return { type: 'success', data, credentials }
}

/**
 * Gets the auth mode from credentials
 *
 * @param {import('kavach').AuthCredentials} credentials
 * @returns {string}
 */
function getAuthMode(credentials) {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
}

/**
 * Creates an auth adapter for Convex
 *
 * @param {Object} convexAuth - The Convex auth instance from useConvexAuth or similar
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(convexAuth) {
	async function signIn(credentials) {
		const mode = getAuthMode(credentials)
		try {
			const signInActions = {
				magic: () =>
					convexAuth.signIn('resend-otp', {
						email: credentials.email
					}),
				password: () =>
					convexAuth.signIn('password', {
						email: credentials.email,
						password: credentials.password,
						flow: 'signIn'
					}),
				oauth: () => convexAuth.signIn(credentials.provider)
			}
			const data = await signInActions[mode]()
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function signUp(credentials) {
		try {
			const data = await convexAuth.signIn('password', {
				email: credentials.email,
				password: credentials.password,
				flow: 'signUp'
			})
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	async function signOut() {
		await convexAuth.signOut()
	}

	async function synchronize(session) {
		return { data: { session }, error: null }
	}

	function onAuthChange(callback) {
		// Convex handles auth state internally via its reactive system.
		// The consumer should use Convex's useConvexAuth() hook for state changes.
		// This is a no-op placeholder for the interface contract.
	}

	return {
		signIn,
		signUp,
		signOut,
		synchronize,
		onAuthChange
	}
}
