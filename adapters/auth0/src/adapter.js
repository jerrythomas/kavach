import { pick } from 'ramda'
import createAuth0Client from '@auth0/auth0-spa-js'

/**
 * Adapts Auth0 functionality to the expected adapter interface.
 *
 * @param {Object} options Configuration options for Auth0.
 * @returns The adapter exposing methods for signIn, signUp, signOut, and related functionalities.
 */
export async function getAdapter(options) {
	const client = await createAuth0Client(
		pick(['domain', 'clientId', 'redirectUri'], options)
	)

	const signIn = async () => {
		// Redirect the user to Auth0 login page
		await client.loginWithRedirect()
	}

	const signUp = async () => {
		// For Auth0, signUp process can be similar, but you may want to use a different action after redirect
		await client.loginWithRedirect({
			screen_hint: 'signup'
		})
	}

	const signOut = async () => {
		await client.logout({
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
		handleAuthCallback: () => handleAuthCallback(client),
		parseUrlError: () => null, // Implement as needed based on your URL error handling
		onAuthChange,
		client,
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

/**
 * Handles the authentication callback from Auth0.
 *
 * @param {Object} client The Auth0 client instance.
 */
async function handleAuthCallback(client) {
	// When the user returns to the app after authentication, handle the authentication tokens
	try {
		await client.handleRedirectCallback()
		const isAuthenticated = await client.isAuthenticated()
		if (isAuthenticated) {
			// User is authenticated, you can get the user profile or tokens as needed
			const user = await client.getUser()
			return Promise.resolve({ type: 'success', data: user })
		}
	} catch (error) {
		return Promise.resolve(handleError(error))
	}
}
