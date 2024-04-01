import { pick } from 'ramda'
import createAuth0Client from '@auth0/auth0-spa-js'

/**
 * Adapts Auth0 functionality to the expected adapter interface.
 *
 * @param {Object} options Configuration options for Auth0.
 * @returns The adapter exposing methods for signIn, signUp, signOut, and related functionalities.
 */
export async function getAdapter(options) {
	const auth0 = await createAuth0Client(
		pick(['domain', 'clientId', 'redirectUri'], options)
	)

	const signIn = async () => {
		// Redirect the user to Auth0 login page
		await auth0.loginWithRedirect()
	}

	const signUp = async () => {
		// For Auth0, signUp process can be similar, but you may want to use a different action after redirect
		await auth0.loginWithRedirect({
			screen_hint: 'signup'
		})
	}

	const signOut = async () => {
		await auth0.logout({
			returnTo: window.location.origin
		})
	}

	const onAuthChange = () => {
		// For detecting authentication changes, you can periodically check isAuthenticated state
		// or use your own logic to trigger callback upon authentication status change.
	}

	// Utility function for error handling

	return {
		signIn,
		signUp,
		signOut,
		handleAuthCallback: () => handleAuthCallback(auth0),
		parseUrlError: () => null, // Implement as needed based on your URL error handling
		onAuthChange,
		client: auth0,
		db: () => null // Placeholder, Auth0 does not manage database directly.
	}
}

function handleError(error) {
	return {
		type: 'error',
		message: error.message || 'An unknown error occurred',
		code: error.error || error.code,
		data: null
	}
}

const handleAuthCallback = async (auth0) => {
	// When the user returns to the app after authentication, handle the authentication tokens
	try {
		await auth0.handleRedirectCallback()
		const isAuthenticated = await auth0.isAuthenticated()
		if (isAuthenticated) {
			// User is authenticated, you can get the user profile or tokens as needed
			const user = await auth0.getUser()
			return { type: 'success', data: user }
		}
	} catch (error) {
		return handleError(error)
	}
}
