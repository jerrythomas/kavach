import { createClient, AuthApiError } from '@supabase/supabase-js'
import { urlHashToParams } from '@kavach/core'

const defaultOrigin =
	typeof window !== 'undefined' ? window.location.origin : ''

/**
 * Handles sign in based on the credentials provided
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignIn(client, credentials) {
	const { email, phone, password, provider, scopes } = credentials
	const redirectTo = credentials.redirectTo ?? defaultOrigin

	let result
	if (provider === 'magic') {
		const { email } = credentials
		result = await client.auth.signInWithOtp({ email })
		result = { ...result, credentials: { provider, email } }
	} else if (password) {
		const options = { emailRedirectTo: redirectTo }
		const creds = email
			? { email, password, options }
			: { phone, password, options }

		result = await client.auth.signInWithPassword(creds)
	} else {
		result = await client.auth.signInWithOAuth({
			provider,
			options: {
				scopes: scopes.join(' '),
				redirectTo
			}
		})
	}
	return transformResult(result)
}

export function parseUrlError(url) {
	let error = { isError: false }
	let result = urlHashToParams(url.hash)
	if (result.error) {
		error = {
			isError: true,
			status: result.error_code,
			name: result.error,
			message: result.error_description
		}
	}
	return error
}

/** @type {import('./types').GetSupabaseAdapter}  */
// eslint-disable-next-line max-lines-per-function
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)
	const clients = createClientsForSchemas(
		options.url,
		options.anonKey,
		options.schema
	)

	const signIn = async (credentials) => handleSignIn(client, credentials)

	const signUp = async ({ email, password, redirectTo }) => {
		let result = await client.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo }
		})
		return transformResult(result)
	}

	const signOut = () => {
		return client.auth.signOut()
	}

	const onAuthChange = (callback) => {
		const {
			data: { subscription }
		} = client.auth.onAuthStateChange(async (event, session) => {
			await synchronizeClients(session)
			await callback(event, session)
		})
		return () => {
			subscription.unsubscribe()
		}
	}

	const synchronizeClients = async (session) => {
		const result = Object.keys(clients).map(async (schema) =>
			clients[schema].auth.setSession(session)
		)
		return Promise.all(result)
	}
	const synchronize = async (session) => {
		await synchronizeClients(session)
		return client.auth.setSession(session)
	}

	return {
		signIn,
		signUp,
		signOut,
		synchronize,
		onAuthChange,
		parseUrlError,
		client,
		db: (schema = null) => (schema ? clients[schema] : client)
	}
}

/**
 * Transforms supabase result into a structure that can be used by kavach
 *
 * @param {*} result
 * @returns
 */
export function transformResult({ data, error, credentials }) {
	let message = ''
	if (!error) {
		message =
			data.provider === 'magic'
				? `Magic link has been sent to "${credentials.email}".`
				: ''
		return { type: 'info', data, message }
	} else {
		message =
			error instanceof AuthApiError && error.status === 400
				? 'Invalid credentials.'
				: 'Server error. Try again later.'
		return {
			type: 'error',
			...error,
			message,
			data
		}
	}
}

/**
 * Generates clients for each schema. This is required to support multiple schemas with supabase
 *
 * @param {string} url            The url of the supabase server
 * @param {string} anonKey        The anon key of the supabase server
 * @param {Array<string>} schemas An array of schemas to create clients for
 * @returns
 */
function createClientsForSchemas(url, anonKey, schemas = []) {
	const clients = schemas.map((schema) => ({
		[schema]: createClient(url, anonKey, { schema })
	}))

	return clients
}
