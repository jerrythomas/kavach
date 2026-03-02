import {
	signIn,
	signUp,
	signOut,
	fetchAuthSession,
	signInWithRedirect,
	getCurrentUser
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

/**
 * Strips specified keys from an object (simple omit without ramda)
 *
 * @param {string[]} keys - Keys to remove
 * @param {Object} obj - Source object
 * @returns {Object} New object without the specified keys
 */
function omit(keys, obj) {
	const result = { ...obj }
	for (const key of keys) {
		delete result[key]
	}
	return result
}

/**
 * Transforms an Amplify result into kavach AuthResult format
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
 * Creates an auth adapter for AWS Amplify v6
 * No client parameter — Amplify v6 uses module-level configuration via Amplify.configure()
 *
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter() {
	/**
	 * Handles sign in based on the credentials provided
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async function handleSignIn(credentials) {
		const { email, password, provider } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				password: async () => {
					const result = await signIn({ username: email, password })
					return result
				},
				oauth: async () => {
					await signInWithRedirect({ provider })
					return null
				},
				magic: async () => {
					await signIn({ username: email, options: { authFlowType: 'USER_AUTH' } })
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
	 * Handles sign up with email and password
	 *
	 * @param {import('kavach').PasswordCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async function handleSignUp(credentials) {
		const { email, password } = credentials
		try {
			const result = await signUp({ username: email, password })
			return transformResult({ data: result }, credentials)
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
		await signOut()
	}

	/**
	 * Synchronizes the current session by fetching session and user info
	 *
	 * @returns {Promise<{data: {session: Object, user: Object} | null, error: {message: string} | null}>}
	 */
	async function synchronize() {
		try {
			const session = await fetchAuthSession()
			const user = await getCurrentUser()
			return { data: { session, user }, error: null }
		} catch (error) {
			return { data: null, error: { message: error.message || 'An error occurred' } }
		}
	}

	/**
	 * Registers a callback for auth state changes via Amplify Hub
	 *
	 * @param {import('kavach').AuthCallback} callback
	 * @returns {() => void} unsubscribe function
	 */
	function onAuthChange(callback) {
		const unsubscribe = Hub.listen('auth', ({ payload }) => {
			const event = payload.event === 'signedIn' ? 'SIGNED_IN' : 'SIGNED_OUT'
			callback(event, payload.data)
		})
		return unsubscribe
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
