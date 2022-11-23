import { createClient } from '@supabase/supabase-js'
import { omit, pick } from 'ramda'

/**
 * This is used to set the server side auth session using the client side auth session
 *
 * @param {*} session the session object from client side auth
 * @param {*} margin  minimum time limit for expiry
 * @returns
 */
async function setServerSession(handler, session, margin = 60) {
	let authSession
	if (session?.expires_at && session.expires_at + margin <= Date.now() / 1000) {
		authSession = await handler.auth.setSession(session)
	} else {
		authSession = null
	}
	return authSession
}

/**
 * https://github.com/supabase/gotrue-js/issues/518
 * https://github.com/supabase/gotrue-js/issues/313
 *
 * @param {*} handler
 * @param {*} callback
 */
async function handleAuthChange(handler, callback) {
	const {
		data: { session },
		error
	} = await handler.auth.getSession()

	if (!error) {
		const event = session ? 'SIGNED_IN' : 'SIGNED_OUT'
		callback(event, session)
	}

	const { data } = handler.auth.onAuthStateChange(async (event, session) => {
		console.log('auth state change', event, session)
		callback(event, session)
		data.subscription.unsubscribe()
	})
}

async function handleSignIn(handler, mode, credentials, options) {
	console.log('data sent to sign in', mode, credentials, options)
	const creds = addOptionsToCredentials(credentials, options)

	if (mode === 'otp') {
		return handler.auth.signInWithOtp(creds)
	} else if (mode === 'oauth') {
		return handler.auth.signInWithOAuth(creds)
	} else {
		return handler.auth.signInWithPassword(creds)
	}
}

/** @type {import('@kavach/core').GetAdapter}  */
export function getAdapter(config) {
	const handler = createClient(config.supabaseUrl, config.supabaseAnonKey)

	async function verifyOtp(credentials) {
		const { data, error } = await handler.auth.verifyOtp(credentials)
		return { data, error }
	}

	const signOut = async () => await handler.auth.signOut()
	const signIn = async (mode, credentials, options) => {
		return handleSignIn(handler, mode, credentials, options)
	}
	const onAuthChange = async (callback) => {
		await handleAuthChange(handler, callback)
	}
	const setSession = async (session) => await setServerSession(handler, session)

	return {
		signIn,
		signOut,
		verifyOtp,
		onAuthChange,
		setSession
	}
}

function addOptionsToCredentials(mode, credentials, options) {
	let creds = {
		...credentials,
		options: {}
	}
	if (mode === 'otp') {
		creds.options = { emailRedirectTo: options.redirectTo }
	} else if (mode === 'oauth') {
		creds.options = {
			...pick(['params', 'redirect'], options),
			scopes: options.scopes.join(' ')
		}
	}
	return creds
}
