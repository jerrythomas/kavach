import { omit } from 'ramda'

/**
 * Transforms an Auth0 result into kavach AuthResult format
 *
 * @param {Object} result - { data, error }
 * @param {Object} credentials
 * @returns {import('kavach').AuthResult}
 */
export function transformResult({ data, error }, credentials) {
	const creds = omit(['password'], credentials)

	if (error) {
		const code = error.code || undefined
		const message = error.message || 'An error occurred'
		return {
			type: 'error',
			error: { message, code },
			message
		}
	}

	if (creds.provider === 'magic') {
		const message = `Magic link has been sent to "${creds.email}".`
		return { type: 'info', data, credentials: creds, message }
	}

	return { type: 'success', data, credentials: creds }
}

/**
 * Gets the authentication mode based on the credentials provided
 *
 * @param {import('kavach').AuthCredentials} credentials
 * @returns {'magic' | 'password' | 'oauth'}
 */
export function getAuthMode(credentials) {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
}

/**
 * Parses the URL query params to check if there is an error
 *
 * @param {URL} url
 * @returns {import('kavach').AuthError | null}
 */
export function parseUrlError(url) {
	try {
		const params = new URLSearchParams(url?.search)
		const errorCode = params.get('error')
		const errorMessage = params.get('error_description')

		if (errorCode) {
			return {
				code: errorCode,
				message: errorMessage || errorCode
			}
		}
	} catch {
		// invalid URL, return null
	}
	return null
}

/**
 * Creates an auth adapter for Auth0
 *
 * @param {import('@auth0/auth0-spa-js').Auth0Client} client - Auth0 Client instance
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(client) {
	/**
	 * Handles sign in based on the credentials provided.
	 * Auth0 SPA SDK is redirect-based for ALL flows.
	 * Returns { data: null, error: null } before redirect.
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async function handleSignIn(credentials) {
		const { email, provider } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				password: async () => {
					await client.loginWithRedirect({
						authorizationParams: {
							connection: 'Username-Password-Authentication',
							login_hint: email
						}
					})
					return null
				},
				oauth: async () => {
					await client.loginWithRedirect({
						authorizationParams: {
							connection: provider
						}
					})
					return null
				},
				magic: async () => {
					await client.loginWithRedirect({
						authorizationParams: {
							connection: 'email',
							login_hint: email
						}
					})
					return null
				}
			}

			const data = await signInActions[mode]()
			return transformResult({ data }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	/**
	 * Handles sign up by redirecting to Auth0 with signup screen_hint
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async function handleSignUp(credentials) {
		try {
			await client.loginWithRedirect({
				authorizationParams: {
					screen_hint: 'signup'
				}
			})
			return transformResult({ data: null }, credentials)
		} catch (error) {
			return transformResult({ error }, credentials)
		}
	}

	/**
	 * Signs out the current user
	 *
	 * @returns {Promise<void>}
	 */
	async function handleSignOut() {
		await client.logout({
			logoutParams: {
				returnTo: window.location.origin
			}
		})
	}

	/**
	 * Synchronizes the current session by refreshing the token and getting user info
	 *
	 * @returns {Promise<{data: {user: Object} | null, error: {message: string} | null}>}
	 */
	async function synchronize() {
		try {
			await client.getTokenSilently()
			const user = await client.getUser()
			return { data: { user }, error: null }
		} catch (error) {
			return { data: null, error: { message: error.message || 'An error occurred' } }
		}
	}

	/**
	 * No-op — Auth0 SPA SDK has no native auth state listener
	 *
	 * @param {import('kavach').AuthCallback} callback
	 * @returns {void}
	 */
	function onAuthChange() {
		// Auth0 SPA SDK has no native auth state listener
	}

	return {
		signIn: handleSignIn,
		signUp: handleSignUp,
		signOut: handleSignOut,
		synchronize,
		onAuthChange,
		parseUrlError
	}
}
