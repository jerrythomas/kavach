import {
	signInWithEmailAndPassword,
	signInWithPopup,
	sendSignInLinkToEmail,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	GithubAuthProvider,
	TwitterAuthProvider,
	FacebookAuthProvider,
	OAuthProvider
} from 'firebase/auth'
import { omit } from 'ramda'

/**
 * OAuth provider map — returns a new provider instance for each supported provider
 */
const authProviders = {
	google: () => new GoogleAuthProvider(),
	github: () => new GithubAuthProvider(),
	twitter: () => new TwitterAuthProvider(),
	facebook: () => new FacebookAuthProvider(),
	apple: () => new OAuthProvider('apple.com'),
	microsoft: () => new OAuthProvider('microsoft.com'),
	yahoo: () => new OAuthProvider('yahoo.com')
}

/**
 * Transforms a Firebase result into kavach AuthResult format
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
 * Creates an auth adapter for Firebase
 *
 * @param {import('firebase/auth').Auth} auth - Firebase Auth instance
 * @returns {import('kavach').AuthAdapter}
 */
export function getAdapter(auth) {
	/**
	 * Handles sign in based on the credentials provided
	 *
	 * @param {import('kavach').AuthCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async function handleSignIn(credentials) {
		const { email, password, provider, redirectTo } = credentials
		const mode = getAuthMode(credentials)

		try {
			const signInActions = {
				password: async () => {
					const result = await signInWithEmailAndPassword(auth, email, password)
					return result.user
				},
				oauth: async () => {
					const providerFactory = authProviders[provider]
					if (!providerFactory) {
						throw { code: 'auth/unsupported-provider', message: `Unsupported provider: ${provider}` }
					}
					const authProvider = providerFactory()
					const result = await signInWithPopup(auth, authProvider)
					return result.user
				},
				magic: async () => {
					await sendSignInLinkToEmail(auth, email, {
						url: redirectTo || window.location.origin,
						handleCodeInApp: true
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
	 * Handles sign up with email and password
	 *
	 * @param {import('kavach').PasswordCredentials} credentials
	 * @returns {Promise<import('kavach').AuthResult>}
	 */
	async function handleSignUp(credentials) {
		const { email, password } = credentials
		try {
			const result = await createUserWithEmailAndPassword(auth, email, password)
			return transformResult({ data: result.user }, credentials)
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
		await signOut(auth)
	}

	/**
	 * Returns the current authenticated user
	 *
	 * @returns {import('firebase/auth').User | null}
	 */
	function synchronize() {
		return auth.currentUser
	}

	/**
	 * Registers a callback for auth state changes
	 *
	 * @param {import('kavach').AuthCallback} callback
	 * @returns {() => void} unsubscribe function
	 */
	function onAuthChange(callback) {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			const event = user ? 'SIGNED_IN' : 'SIGNED_OUT'
			await callback(event, user)
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
