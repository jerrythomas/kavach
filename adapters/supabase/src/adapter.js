import { createClient, AuthApiError } from '@supabase/supabase-js'
import { urlHashToParams } from '@kavach/core'
import { defaultOrigin } from './constants'

/**
 * Get an adapter for Supabase authentication
 *
 * @param {import('./types').SupabaseConfig} options
 * @returns {import('./types').AuthAdapter}
 */
// eslint-disable-next-line max-lines-per-function
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)
	const clients = createClientsForSchemas(
		options.url,
		options.anonKey,
		options.schemas
	)

	const signIn = (credentials) => handleSignIn(client, credentials)

	const signUp = async ({ email, password, redirectTo }) => {
		const result = await client.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo }
		})
		return transformResult(result)
	}

	const signOut = () => client.auth.signOut()
	const synchronize = async (session) => {
		await synchronizeClients(session, clients)
		return client.auth.setSession(session)
	}

	const onAuthChange = (callback) => {
		const {
			data: { subscription }
		} = client.auth.onAuthStateChange(async (event, session) => {
			await synchronize(session)
			await callback(event, session)
		})
		return () => {
			subscription.unsubscribe()
		}
	}

	return {
		signIn,
		signUp,
		signOut,
		synchronize,
		onAuthChange,
		parseUrlError,
		client,
		db: (schema = null) => (schema in clients ? clients[schema] : client)
	}
}

/**
 * Handles sign in based on the credentials provided
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResult>}
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
 * Parses error from URL hash
 *
 * @param {URL} url
 * @returns {import('@kavach/core').AuthResult}
 */
export function parseUrlError(url) {
	const result = urlHashToParams(url?.hash)

	if (result.error) {
		return {
			type: 'error',
			status: result.error_code,
			name: result.error,
			message: result.error_description
		}
	}
	return null
}

/**
 * Transforms supabase result into a structure that can be used by kavach
 *
 * @param {*} result
 * @returns {import('@kavach/core').AuthResult}
 */
export function transformResult({ data, error, credentials }) {
	let message = ''
	if (!error) {
		if (data.provider === 'magic')
			return {
				type: 'success',
				message: `Magic link has been sent to "${credentials.email}".`,
				data
			}
		return null
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
			[schema]: createClient(url, anonKey, { schema })
		}),
		{}
	)

	return clients
}

/**
 * Synchronizes the session with all clients
 *
 * @param {*} session
 * @param {*} clients
 * @returns {Promise<void>}
 */
function synchronizeClients(session, clients) {
	const result = Object.keys(clients).map((schema) =>
		clients[schema].auth.setSession(session)
	)
	return Promise.all(result)
}
