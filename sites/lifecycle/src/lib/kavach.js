import { config } from './config'
import { createClient } from '@supabase/supabase-js'
import { omit } from 'ramda'

const handler = createClient(config.supabaseUrl, config.supabaseAnonKey)

export const kavach = {
	onAuthChange: async (location) => await handleAuthChange(location),
	signIn: async (mode, credentials, options) => {
		console.log('data sent to sign in', credentials, options)
		options = {
			...omit(['redirect'], options),
			emailRedirectTo: options.redirect
		}
		credentials = { ...credentials, options }
		let result
		if (mode === 'otp') {
			result = await handler.auth.signInWithOtp(credentials)
		} else if (mode === 'oauth') {
			result = await handler.auth.signInWithOAuth(credentials)
		} else {
			result = await handler.auth.signInWithPassword(credentials)
		}

		return result
	}
}

async function handleAuthChange(location, callback) {
	console.info({
		when: new Date(),
		module: 'kavach',
		method: 'handleAuthChange',
		message: 'works now',
		data: { location }
	})
	const {
		data: { session }
	} = await handler.auth.getSession()

	if (session) {
		const event = 'SIGNED_IN'
		console.log(new Date(), event, session)
		// callback(event, session)
	}
	// const { data } = handler.auth.onAuthStateChange(async (event, session) => {
	// 	console.log(new Date(), event, session)
	// 	// invalidate('supabase:auth');
	// 	data.subscription.unsubscribe()
	// })
}
