import { createClient, AuthApiError } from '@supabase/supabase-js'
import { urlHashToParams } from '@kavach/core'
import { defaultOrigin } from './constants'
import { getActions } from './actions'
import { pick, omit } from 'ramda'

/**
 * Transforms supabase result into a structure that can be used by kavach
 *
 * @param {*} result
 * @returns {import('@kavach/core').AuthResult}
 */
export function transformResult({ data, error }, creds) {
	let message = ''
	const credentials = omit(['password'], creds)

	if (error) {
		message =
			error instanceof AuthApiError && error.status === 400
				? 'Invalid credentials.'
				: 'Server error. Try again later.'
		return {
			type: 'error',
			error: pick(['status', 'name', 'message'], error),
			message
		}
	} else if (credentials.provider === 'magic') {
		message = `Magic link has been sent to "${credentials.email}".`
		return { type: 'info', data, credentials, message }
	}
	return { type: 'success', data, credentials }
}

// /**
//  * Synchronizes the session across all clients
//  *
//  * @param {Record<string, import('@supabase/supabase-js').SupabaseClient>} clients
//  * @param {import('@supabase/supabase-js').Session} session
//  * @returns {Promise<void>}
//  */
// const synchronizeClients = (clients, session) => {
// 	// if (!session) return Promise.resolve()
// 	const result = Object.keys(clients).map((schema) => clients[schema].auth.setSession(session))
// 	return Promise.all(result)
// }

/**
 * Handles auth change
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthChangeCallback} callback
 * @returns {() => void} unsubscribe
 */
function handleAuthChange(client, callback) {
	const {
		data: { subscription }
	} = client.auth.onAuthStateChange(async (event, session) => {
		// await synchronizeClients(clients, session)
		await callback(event, session)
	})
	return () => {
		subscription.unsubscribe()
	}
}

/**
 * Gets the authentication mode based on the credentials provided
 *
 * @param {*} credentials
 * @returns
 */
function getAuthMode(credentials) {
	const { password, provider } = credentials
	if (provider === 'magic') return 'magic'
	if (password) return 'password'
	return 'oauth'
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
	let creds = null
	const signIn = {
		magic: async () => {
			creds = { email, options: { emailRedirectTo: redirectTo } }
			const result = await client.auth.signInWithOtp(creds)
			return result
		},
		password: async () => {
			creds = email ? { email, password } : { phone, password }
			const result = await client.auth.signInWithPassword(creds)
			return result
		},
		oauth: async () => {
			creds = { provider, options: { scopes: scopes.join(' '), redirectTo } }
			const result = await client.auth.signInWithOAuth(creds)
			return result
		}
	}
	const mode = getAuthMode(credentials)
	const result = await signIn[mode]()
	// let result = null
	// let creds = null

	// if (provider === 'magic') {
	// 	creds = { email, options: { emailRedirectTo: redirectTo } }
	// 	result = await client.auth.signInWithOtp(creds)
	// } else if (password) {
	// 	creds = email ? { email, password } : { phone, password }
	// 	result = await client.auth.signInWithPassword(creds)
	// } else {
	// 	creds = { provider, options: { scopes: scopes.join(' '), redirectTo } }
	// 	result = await client.auth.signInWithOAuth(creds)
	// }

	return transformResult(result, { ...creds, provider })
}

/**
 * Handles sign up based on the credentials provided
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignUp(client, credentials) {
	const result = await client.auth.signUp(pick(['email', 'password'], credentials))
	return transformResult(result, credentials)
}

/**
 * Parses the url hash to check if there is an error
 *
 * @param {URL} url
 * @returns {import('@kavach/core').AuthError}
 */
export function parseUrlError(url) {
	const result = urlHashToParams(url?.hash)
	if (result.error) {
		return {
			status: result.error_code,
			name: result.error,
			message: result.error_description
		}
	}
	return null
}

// /**
//  * Generates clients for each schema. This is required to support multiple schemas with supabase
//  *
//  * @param {string}        url     The url of the supabase server
//  * @param {string}        anonKey The anon key of the supabase server
//  * @param {Array<string>} schemas An array of schemas to create clients for
//  * @returns
//  */
// function createClientsForSchemas(url, anonKey, schemas = []) {
// 	const clients = schemas.reduce(
// 		(acc, schema) => ({
// 			...acc,
// 			[schema]: createClient(url, anonKey, { db: { schema } })
// 		}),
// 		{}
// 	)

// 	return clients
// }

/**
 * Creates an adapter for supabase
 *
 * @param {import('./types').SupabaseConfig} options
 * @returns {import('@kavach/core').AuthAdapter}
 */
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)
	// const clients = createClientsForSchemas(
	// 	options.url,
	// 	options.anonKey,
	// 	options.schemas
	// )

	/**
	 * Synchronizes the session with all the clients
	 *
	 * @param {any} session
	 * @returns {Promise<void>}
	 */
	const synchronize = (session) => {
		// await synchronizeClients(clients, session)
		return client.auth.setSession(session)
	}

	return {
		signIn: (credentials) => handleSignIn(client, credentials),
		signUp: (credentials) => handleSignUp(client, credentials),
		signOut: () => client.auth.signOut(),
		synchronize,
		onAuthChange: (callback) => handleAuthChange(client, callback),
		parseUrlError,
		proxy: (schema) => {
			schema ? client.schema(schema) : client
		},
		actions: () => getActions(client)
	}
}
