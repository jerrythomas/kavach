import {
	createDeflector,
	redirect,
	setHeaderCookies,
	zeroLogger
} from '@kavach/core'
import { getRequestData, asURLWithParams, splitAuthData } from '@kavach/svelte'
import { pick } from 'ramda'
import { goto, invalidateAll } from '$app/navigation'

export function createKavach(adapter, options) {
	const deflector = createDeflector(options)
	const logger = options.logger ?? zeroLogger
	const { endpoint, page } = deflector

	function handleAuthChange() {
		const {
			data: { subscription }
		} = adapter.auth.onAuthStateChange(async (event, session) => {
			// invalidate('supabase:auth')
			// session = authSession
			logger.debug({
				method: 'handleAuthChange',
				module: '$lib/kavach',
				data: { session, event, url: window.location.href }
			})
			await fetch(endpoint.session, {
				method: 'POST',
				body: JSON.stringify({
					event,
					session
				})
			})
			deflector.setSession(session)
			invalidateAll()
			// invalidate('supabase:auth')
		})

		return () => {
			subscription.unsubscribe()
		}
	}

	async function signOut() {
		await adapter.auth.signOut()
		await fetch(endpoint.session, { method: 'POST', body: '{}' })
		deflector.setSession(null)
		invalidateAll()
		goto(page.login)
	}

	async function handle({ event, resolve }) {
		const cookieSession = event.cookies.get('session')
		logger.debug({
			method: 'handle',
			module: '$lib/kavach',
			data: { path: event.url.pathname, session: cookieSession }
		})
		event.locals['session'] =
			cookieSession && cookieSession !== 'undefined'
				? JSON.parse(cookieSession)
				: null

		if (event.url.pathname.startsWith(deflector.endpoint.login)) {
			return signInEndpoint(event, adapter, deflector)
			// const data = await getRequestData(event)
			// return redirect(303, deflector.page.home, { session: data })
		}

		if (event.url.pathname.startsWith(deflector.endpoint.logout)) {
			await adapter.auth.signOut()
			return redirect(303, deflector.page.login, { session: null })
		}

		if (event.url.pathname.startsWith(deflector.endpoint.session)) {
			const data = await getRequestData(event)
			const headers = setHeaderCookies(
				data.session
					? {
							session: pick(
								['refresh_token', 'access_token', 'user'],
								data.session
							)
					  }
					: { session: null }
			)
			await logger.debug({
				method: 'handle',
				module: '$lib/kavach',
				message: 'synchronize ',
				data: { data, headers }
			})

			if (data.session) {
				let result = await adapter.auth.setSession(data.session)

				await logger.debug({
					method: 'handle',
					module: '$lib/kavach',
					message: 'server session ',
					data: { session: result.data.session }
				})
			} else {
				adapter.auth.signOut()
			}
			deflector.setSession(data.session)
			return new Response(null, { status: 200, headers })
		}
		return resolve(event)
	}

	const actions = { handleAuthChange, endpoint, page, signOut, handle, adapter }

	return actions
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
			...pick(['redirect'], options),
			scopes: JSON.parse(options.scopes).join(' '),
			params: JSON.parse(options.params)
		}
	}
	return creds
}

export async function signInEndpoint(event, adapter, deflector) {
	const redirectTo = event.url.origin + deflector.page.login
	let { mode, credentials, options } = await splitAuthData(event)

	// logger.debug(mode, credentials, options)
	const result = await handleSignIn(adapter, mode, credentials, {
		...options,
		redirectTo
	})

	const { session } = result.data
	// logger.debug('result from signIn', result)
	const message = result.error ? { error: result.error } : {}
	const params = {
		mode,
		...pick(['email', 'provider'], credentials),
		...message
	}
	const url = asURLWithParams(event.url.origin, deflector.page.login, params)

	if (
		mode === 'otp' &&
		event.request.method !== 'GET' &&
		event.request.headers.get('accept') !== 'application/json'
	) {
		return redirect(303, url, { session })
		// Response.redirect(url, 303)
	}

	return redirect(303, url, { session }) //Response.redirect(url, 301)
}

function handleSignIn(adapter, mode, credentials, options) {
	const creds = addOptionsToCredentials(mode, credentials, options)
	// logger.debug('creds', creds)
	if (mode === 'otp') {
		return adapter.auth.signInWithOtp(creds)
	} else if (mode === 'oauth') {
		return adapter.auth.signInWithOAuth(creds)
	} else {
		return adapter.auth.signInWithPassword(creds)
	}
}
