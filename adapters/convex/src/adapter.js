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
 * Decode a JWT payload (base64url) without crypto.
 * Returns null on any parse failure.
 *
 * @param {string} token
 * @returns {object|null}
 */
export function decodeJwtPayload(token) {
	try {
		const base64Url = token.split('.')[1]
		if (!base64Url) return null
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		// atob is a browser global; eslint doesn't see the browser env.
		const jsonPayload = decodeURIComponent(
			atob(base64) // eslint-disable-line no-undef
				.split('')
				.map((c) => `%${`0${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
				.join('')
		)
		return JSON.parse(jsonPayload)
	} catch {
		return null
	}
}

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
	 * Fetch the current session from the Convex auth client.
	 * Returns null if not authenticated or token unavailable.
	 *
	 * @returns {Promise<{user: object, session: object}|null>}
	 */
	async fetchSession() {
		if (!this.client?.isAuthenticated()) return null
		const token = await this.client.fetchAccessToken()
		if (!token) return null
		const payload = decodeJwtPayload(token)
		const user = {
			id: payload?.sub ?? '',
			email: payload?.email ?? '',
			role: payload?.role ?? 'user',
			user_metadata: payload?.user_metadata ?? {}
		}
		return {
			access_token: token,
			refresh_token: '',
			user,
			expires_in: 3600
		}
	}

	/**
	 * signIn implementation
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async signIn(credentials = {}) {
		if (!this.client) {
			return {
				type: 'error',
				error: { message: 'Convex auth client not initialized' },
				message: 'Convex auth client not initialized'
			}
		}
		const mode = getAuthMode(credentials)
		try {
			const signInActions = {
				magic: () =>
					this.client.signIn('resend-otp', {
						email: credentials.email
					}),
				password: () =>
					this.client.signIn('password', {
						email: credentials.email,
						password: credentials.password,
						flow: 'signIn'
					}),
				oauth: () => this.client.signIn(credentials.provider)
			}
			const data = await signInActions[mode]()

			// Password flows resolve synchronously — the client IS authenticated
			// when the promise resolves. Fetch the session so handleSignIn can
			// sync the cookie before the app navigates to a protected route.
			if (mode !== 'oauth' && mode !== 'magic' && this.client.isAuthenticated()) {
				const session = await this.fetchSession()
				if (session) {
					return { type: 'success', data: { user: session.user, session }, credentials }
				}
			}

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
		if (!this.client) {
			return {
				type: 'error',
				error: { message: 'Convex auth client not initialized' },
				message: 'Convex auth client not initialized'
			}
		}
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
		if (this.client) {
			await this.client.signOut()
		}
	}

	/**
	 * synchronize implementation
	 *
	 * Convex sessions are opaque tokens managed by the Convex client SDK.
	 * The session object sent by the browser (from fetchSession / handleSignIn)
	 * already has the correct shape, so we pass it through.
	 *
	 * @param {unknown} session
	 * @returns {{data: {session: unknown}, error: null}}
	 */
	synchronize(session) {
		return { data: { session }, error: null }
	}

	/**
	 * onAuthChange — check auth state on mount and sync the session.
	 *
	 * Convex doesn't expose a subscription-based listener; instead we check
	 * auth state once after mount. This covers:
	 *  - OAuth redirect return (page loads → Convex client is already authenticated)
	 *  - Page reload while authenticated
	 *
	 * @param {(event: string, session: object) => void} callback
	 * @returns {() => void} cleanup
	 */
	/* eslint-disable no-undef -- setTimeout is a browser global */
	onAuthChange(callback) {
		if (!this.client) return () => {}

		// Fire after the current render cycle so the Convex client has time
		// to process any pending auth state (e.g. OAuth redirect callback).
		setTimeout(async () => {
			try {
				if (this.client.isAuthenticated()) {
					const session = await this.fetchSession()
					if (session) {
						callback('SIGNED_IN', session)
					}
				}
			} catch {
				// Auth state not ready or token fetch failed — silently ignore.
			}
		}, 0)

		return () => {}
	}
	/* eslint-enable no-undef */
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
