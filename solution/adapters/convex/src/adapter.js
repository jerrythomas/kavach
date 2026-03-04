/**
 * Convex adapter - class-based implementation
 *
 * Converts the previous factory-style adapter into a class that implements
 * the same behavior. Exports:
 *  - transformResult(result, credentials)
 *  - getAdapter(convexAuth) -> returns new ConvexAuthAdapter(convexAuth)
 *  - class ConvexAuthAdapter
 */

/**
 * Transforms Convex result into kavach AuthResult format
 *
 * @param {Object} result
 * @param {Object} credentials
 * @returns {import('kavach').AuthResult}
 */
export function transformResult({ data, error } = {}, credentials = {}) {
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
 * @returns {'magic'|'password'|'oauth'}
 */
function getAuthMode(credentials = {}) {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
}

/**
 * Class-based Convex adapter
 *
 * @implements {import('kavach').AuthAdapter}
 */
export class ConvexAuthAdapter {
	/**
	 * @param {object} convexAuth - Convex auth client
	 * @param {object} [options]
	 */
	constructor(convexAuth, options = {}) {
		this.client = convexAuth
		this.options = options
	}

	/**
	 * signIn implementation
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async signIn(credentials = {}) {
		const mode = getAuthMode(credentials)
		try {
			const signInActions = {
				magic: async () =>
					this.client.signIn('resend-otp', {
						email: credentials.email
					}),
				password: async () =>
					this.client.signIn('password', {
						email: credentials.email,
						password: credentials.password,
						flow: 'signIn'
					}),
				oauth: async () => this.client.signIn(credentials.provider)
			}
			const data = await signInActions[mode]()
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	/**
	 * signUp implementation
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async signUp(credentials = {}) {
		try {
			const data = await this.client.signIn('password', {
				email: credentials.email,
				password: credentials.password,
				flow: 'signUp'
			})
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	/**
	 * signOut implementation
	 *
	 * @returns {Promise<void>}
	 */
	async signOut() {
		await this.client.signOut()
	}

	/**
	 * synchronize implementation (best-effort)
	 *
	 * @param {unknown} session
	 * @returns {Promise<{data: {session: unknown}, error: null}>}
	 */
	async synchronize(session) {
		// Convex adapter currently doesn't need to set session; return session back.
		return { data: { session }, error: null }
	}

	/**
	 * onAuthChange - placeholder / no-op for Convex
	 *
	 * @param {(user: any) => void} callback
	 */
	onAuthChange(_callback) {
		// Convex provides reactive hooks in app code; keep no-op for adapter contract.
		return () => {}
	}
}

/**
 * Factory function returning the class instance
 *
 * @param {object} convexAuth
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(convexAuth) {
	return new ConvexAuthAdapter(convexAuth)
}
