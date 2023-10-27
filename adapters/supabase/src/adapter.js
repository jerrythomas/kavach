import { createClient, AuthApiError } from '@supabase/supabase-js'
import { urlHashToParams } from '@kavach/core'

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
		const { email } = credentials
		result = await client.auth.signInWithOtp({ email })
		result = { ...result, credentials: { provider, email } }
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
	return transformResult(result)
}

function parseUrlError(url) {
	let error = { isError: false }
	let result = urlHashToParams(url.hash)
	if (result.error) {
		error = {
			isError: true,
			status: result.error_code,
			name: result.error,
			message: result.error_description.replaceAll('+', '')
		}
	}
	return error
}

/** @type {import('./types').GetSupabaseAdapter}  */
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)
	const signIn = async (credentials) => {
		return handleSignIn(client, credentials)
	}

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
			await callback(event, session)
		})
		return () => {
			subscription.unsubscribe()
		}
	}
	const synchronize = async (session) => {
		return client.auth.setSession(session)
	}

	return {
		signIn,
		signUp,
		signOut,
		synchronize,
		onAuthChange,
		parseUrlError,
		client
	}
}

/**
 * Transforms supabase result into a structure that can be used by kavach
 * @param {*} result
 * @returns
 */
export function transformResult({ data, error, credentials }) {
	let message = ''
	if (!error) {
		message =
			credentials.provider == 'magic'
				? `Magic link has been sent to "${credentials.email}".`
				: ''
		return { type: 'info', data, message }
	}
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
