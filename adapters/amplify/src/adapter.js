import Amplify, { Auth } from 'aws-amplify'

/**
 * Handles the sign-in process based on the provided credentials.
 *
 * @param {*} credentials Credentials for signing in.
 * @returns {Promise<object>} Response object with appropriate fields.
 */
async function handleSignIn(credentials, Auth) {
	const { username, password } = credentials
	try {
		const user = await Auth.signIn(username, password)
		// Include more data manipulation as necessary.
		return { type: 'success', data: user }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Handles the sign-up process.
 *
 * @param {*} credentials Credentials for signing up.
 * @returns {Promise<object>} Response object with appropriate fields.
 */
async function handleSignUp(credentials, Auth) {
	const { username, password, attributes = {} } = credentials
	try {
		const newUser = await Auth.signUp({
			username,
			password,
			attributes
		})
		return { type: 'success', data: newUser }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Signs out the currently signed-in user.
 *
 * @returns {Promise<object>} Sign-out result.
 */
async function handleSignOut(Auth) {
	try {
		await Auth.signOut()
		return { type: 'success' }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * A helper function to format errors.
 *
 * @param {*} error The error object received from a failed operation.
 * @returns {object} The formatted error.
 */
function handleError(error) {
	return {
		type: 'error',
		message: error.message || 'An unknown error occurred',
		code: error.code,
		data: null
	}
}

/**
 * Adapts AWS Cognito functionality to the expected adapter interface.
 *
 * @param {Object} options Configuration options for AWS Amplify (Cognito).
 * @returns The adapter exposing methods for signIn, signUp, signOut, and related functionalities.
 */
export function getAdapter(options) {
	// Initialize AWS Amplify Auth with the provided options
	configure(options)

	// Since there's no direct "onAuthChange" equivalent in Cognito as with Supabase, you might need to handle session persistence manually.
	// Cognito handles session management internally, but for UI updates, consider using Amplify Hub or custom event listeners.
	const onAuthChange = () => {
		// Not directly applicable with Cognito without using additional services like Amplify Hub
		console.warn(
			'onAuthChange functionality needs custom implementation with AWS Amplify Hub or similar.'
		)
	}

	return {
		signIn: async (credentials) => await handleSignIn(credentials, Auth),
		signUp: async (credentials) => await handleSignUp(credentials, Auth),
		signOut: async () => await handleSignOut(Auth),
		onAuthChange,
		parseUrlError: () => null, // This function is specific to handling errors from URL parameters, commonly used in OAuth flows.
		client: null, // AWS Cognito does not have a direct equivalent to a "client" in the Supabase sense.
		db: () => null // Placeholder to maintain structural consistency. Database interactions would typically use other AWS services like DynamoDB.
	}
}

function configure(options) {
	Amplify.configure({
		Auth: {
			region: options.region,
			userPoolId: options.userPoolId,
			userPoolWebClientId: options.userPoolWebClientId,
			authenticationFlowType: options.authenticationFlowType || 'USER_SRP_AUTH'
		}
	})
}