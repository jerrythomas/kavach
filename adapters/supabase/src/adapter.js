import { createClient } from '@supabase/supabase-js'
// import { omit, pick } from 'ramda'

// /**
//  * This is used to set the server side auth session using the client side auth session
//  *
//  * @param {*} session the session object from client side auth
//  * @param {*} margin  minimum time limit for expiry
//  * @returns
//  */
// async function setServerSession(handler, session, margin = 60) {
// 	let authSession
// 	if (session?.expires_at && session.expires_at + margin >= Date.now() / 1000) {
// 		const { data } = await handler.auth.setSession(session)
// 		authSession = data.session
// 	} else {
// 		authSession = null
// 	}

// 	return authSession
// }

// /**
//  * https://github.com/supabase/gotrue-js/issues/518
//  * https://github.com/supabase/gotrue-js/issues/313
//  *
//  * @param {*} handler
//  * @param {*} callback
//  */
// async function handleAuthChange(handler, callback) {
// 	const {
// 		data: { session },
// 		error
// 	} = await handler.auth.getSession()

// 	if (!error) {
// 		const event = session ? 'SIGNED_IN' : 'SIGNED_OUT'
// 		callback(event, session)
// 	}

// 	const { data } = handler.auth.onAuthStateChange(async (event, session) => {
// 		console.log('auth state change', event, session)
// 		callback(event, session)
// 		data.subscription.unsubscribe()
// 	})
// }

/**
 *
 * @param {*} client
 * @param {OAuthCredentials| OtpCredentials| EmailAuthCredentials| PhoneAuthCredentials} credentials
 * @returns
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

/** @type {import('@kavach/core').GetAdapter}  */
export function getAdapter(options) {
	const client = createClient(options.url, options.anonKey)

	const signIn = async (credentials) => {
		return handleSignIn(client, credentials)
	}

	/**
	 *
	 * @param {*} param0
	 * @returns
	 */
	const signUp = async ({ email, password, redirectTo }) => {
		const result = await client.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo }
		})
		if (result.error) {
			result.error = transformError(result.error)
		}
		return result
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
// export function getAdapter(config) {
// 	const handler = createClient(config.url, config.anonKey)

// 	async function verifyOtp(credentials) {
// 		const { data, error } = await handler.auth.verifyOtp(credentials)
// 		return { data, error }
// 	}

// 	const signOut = async () => await handler.auth.signOut()
// 	const signIn = async (mode, credentials, options) => {
// 		return handleSignIn(handler, mode, credentials, options)
// 	}
// 	const onAuthChange = async (callback) => {
// 		await handleAuthChange(handler, callback)
// 	}
// 	const setSession = async (client_session) => {
// 		return setServerSession(handler, client_session)
// 	}

// 	return {
// 		signIn,
// 		signOut,
// 		verifyOtp,
// 		onAuthChange,
// 		setSession
// 	}
// }

// function addOptionsToCredentials(mode, credentials, options) {
// 	let creds = {
// 		...credentials,
// 		options: {}
// 	}
// 	if (mode === 'otp') {
// 		creds.options = { emailRedirectTo: options.redirectTo }
// 	} else if (mode === 'oauth') {
// 		creds.options = {
// 			...pick(['params', 'redirect'], options),
// 			scopes: options.scopes.join(' ')
// 		}
// 	}
// 	return creds
// }
