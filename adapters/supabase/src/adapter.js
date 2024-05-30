import { createClient, AuthApiError } from '@supabase/supabase-js'
import { urlHashToParams } from '@kavach/core'
import { defaultOrigin } from './constants'

/**
 * Creates an adapter for supabase
 *
 * @param {import('./types').AdapterOptions} options
 * @returns {import('@kavach/core').Adapter}
 */
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)
	const clients = createClientsForSchemas(
		options.url,
		options.anonKey,
		options.schemas
	)

	const synchronize = async (session) => {
		await synchronizeClients(clients, session)
		return client.auth.setSession(session)
	}

	// const onAuthChange = (callback) => {
	// 	const {
	// 		data: { subscription }
	// 	} = client.auth.onAuthStateChange(async (event, session) => {
	// 		await synchronizeClients(clients, session)
	// 		await callback(event, session)
	// 	})
	// 	return () => {
	// 		subscription.unsubscribe()
	// 	}
	// }

	return {
		signIn: (credentials) => handleSignIn(client, credentials),
		signUp: (credentials) => handleSignUp(client, credentials),
		signOut: () => client.auth.signOut(),
		synchronize,
		onAuthChange: (callback) => handleAuthChange(client, clients, callback),
		parseUrlError,
		client,
		db: (schema) => clients[schema] || client
	}
}

function handleAuthChange(client, clients, callback) {
	const {
		data: { subscription }
	} = client.auth.onAuthStateChange(async (event, session) => {
		await synchronizeClients(clients, session)
		await callback(event, session)
	})
	return () => {
		subscription.unsubscribe()
	}
}
/**
 * Handles sign in based on the credentials provided
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignIn(client, credentials) {
	const { email, phone, password, provider, scopes = [] } = credentials
	const redirectTo = credentials.redirectTo ?? defaultOrigin

	let result = null
	if (provider === 'magic') {
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

/**
 * Handles sign up based on the credentials provided
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignUp(client, { email, password, redirectTo }) {
	const result = await client.auth.signUp({
		email,
		password,
		options: { emailRedirectTo: redirectTo }
	})
	return transformResult(result)
}

/**
 * Parses the url hash to check if there is an error
 *
 * @param {URL} url
 * @returns {import('./types').AuthError}
 */
export function parseUrlError(url) {
	let error = { isError: false }
	const result = urlHashToParams(url.hash)
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
 * @param {string}        url     The url of the supabase server
 * @param {string}        anonKey The anon key of the supabase server
 * @param {Array<string>} schemas An array of schemas to create clients for
 * @returns
 */
function createClientsForSchemas(url, anonKey, schemas = []) {
	const clients = schemas.reduce(
		(acc, schema) => ({
			...acc,
			[schema]: createClient(url, anonKey, { db: { schema } })
		}),
		{}
	)

	return clients
}

/**
 * Synchronizes the session across all clients
 *
 * @param {Record<string, import('@supabase/supabase-js').SupabaseClient>} clients
 * @param {import('@supabase/supabase-js').Session} session
 * @returns {Promise<void>}
 */
const synchronizeClients = (clients, session) => {
	// if (!session) return Promise.resolve()
	const result = Object.keys(clients).map((schema) =>
		clients[schema].auth.setSession(session)
	)
	return Promise.all(result)
}
