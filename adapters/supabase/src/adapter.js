import { createClient, AuthApiError } from '@supabase/supabase-js'

/**
 * Handles sign in based on the credentials provided
 *
 * @param {*} client
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignIn(client, credentials) {
	const { email, phone, password, provider, scopes, redirectTo } = credentials

	let result
	if (provider === 'magic') {
		result = await client.auth.signInWithOtp({ email })
	} else if (password) {
		const creds = email
			? { email, password, options: { emailRedirectTo: redirectTo } }
			: { phone, password, options: { emailRedirectTo: redirectTo } }

		result = await client.auth.signInWithPassword(creds)
	} else {
		result = await client.auth.signInWithOAuth({
			provider,
			options: { scopes: scopes.join(' ') }
		})
	}
	if (result.error) {
		result.error = transformError(result.error)
	}
	return result
}

/** @type {import('./types').GetSupabaseAdapter}  */
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)

	const signIn = async (credentials) => {
		return handleSignIn(client, credentials)
	}

	const signUp = async ({ email, password, redirectTo }) => {
		const result = await client.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo }
		})
		if (result.error) {
			result.error = transformError(result.error)
		}
		return { data: result.data, error: result.error }
	}

	const signOut = () => {
		return client.auth.signOut()
	}

	const onAuthChange = (callback) => {
		const {
			data: { subscription }
		} = client.auth.onAuthStateChange(async (event, session) => {
			await callback(event, session)
		})
		return () => {
			subscription.unsubscribe()
		}
	}
	const synchronize = async (session) => {
		return client.auth.setSession(session)
	}

	return { signIn, signUp, signOut, synchronize, onAuthChange, client }
}

/**
 * Transforms supabase error into a structure that can be used by kavach
 * @param {*} error
 * @param {*} values
 * @returns
 */
export function transformError(error, values) {
	if (error instanceof AuthApiError && error.status === 400) {
		return {
			...error,
			error: 'Invalid credentials.',
			values
		}
	}

	return {
		...error,
		error: 'Server error. Try again later.',
		values
	}
}
