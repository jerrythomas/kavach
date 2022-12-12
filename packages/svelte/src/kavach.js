import { pick } from 'ramda'
import { createDeflector, setHeaderCookies, zeroLogger } from '@kavach/core'
import { getRequestData } from './request'
import { APP_AUTH_CONTEXT, RUNNING_ON } from './constants'

export function createKavach(adapter, options) {
	const deflector = createDeflector(options)
	const logger = options?.logger ?? zeroLogger
	const invalidate = options?.invalidate ?? (() => {})
	const invalidateAll = options?.invalidateAll ?? (() => {})
	const goto = options?.goto ?? (() => {})
	const redirect = options?.redirect ?? (() => {})

	const signIn = async (credentials) => {
		const result = await adapter.signIn(credentials)
		invalidate(APP_AUTH_CONTEXT)
		return result
	}
	const signUp = async (credentials) => {
		const result = await adapter.signUp(credentials)
		invalidate(APP_AUTH_CONTEXT)
		return result
	}
	const signOut = async () => {
		await adapter.signOut()
		await fetch(deflector.endpoint.session, {
			method: 'POST',
			body: JSON.stringify({ event: 'SIGNED_OUT' })
		})
		deflector.setSession(null)
		invalidateAll()
		invalidate(APP_AUTH_CONTEXT)
	}

	const onAuthChange = () => {
		if (RUNNING_ON !== 'browser') {
			logger.error('OnAuthChange should only be called from browser')
			return
		}
		adapter.onAuthChange(async (event, session) => {
			// console.log('auth changed')
			const result = await fetch(deflector.endpoint.session, {
				method: 'POST',
				body: JSON.stringify({
					event,
					session
				})
			})

			if (result.status == 200) {
				invalidateAll()
				invalidate(APP_AUTH_CONTEXT)
				deflector.setSession(session)
				const location =
					event === 'SIGNED_IN' ? deflector.page.home : deflector.page.login
				goto(location)
			}
			return result
		})
	}
	async function handleUnauthorizedAccess({ event, resolve }) {
		const pathname = deflectedPath(event.url)
		// console.log(pathname, event.url.pathname)
		if (pathname !== event.url.pathname) {
			return new Response(301, {
				headers: { location: event.url.origin + pathname }
			})
		}
		return resolve(event)
	}

	function deflectedPath(url) {
		return deflector.redirect(url.pathname)
	}

	const handle = async ({ event, resolve }) => {
		const cookieSession = event.cookies.get('session')

		event.locals['session'] =
			cookieSession && cookieSession !== 'undefined'
				? JSON.parse(cookieSession)
				: null
		if (event.url.pathname.startsWith(deflector.endpoint.session)) {
			return handleSessionSync(event, adapter, deflector)
		}
		// console.log(deflector.redirect(event.url.pathname))
		// handleUnauthorizedAccess
		return handleUnauthorizedAccess({ event, resolve })
	}
	return {
		signIn,
		signUp,
		signOut,
		onAuthChange,
		handle,
		deflectedPath,
		client: adapter.client
	}
}

/**
 * Returns a cookie header using provided object and options
 *
 * @param {*} session
 * @returns {object} cookie header
 */
export function setCookieFromSession(session) {
	if (session) {
		const maxAge = session.expires_in ?? 3600 //* 1000

		return setHeaderCookies(
			{ session: pick(['refresh_token', 'access_token', 'user'], session) },
			{ maxAge }
		)
	}
	return setHeaderCookies({ session })
}

async function handleSessionSync(event, adapter, deflector) {
	const data = await getRequestData(event)
	let session = null
	let status = 200
	let error = null
	// console.log(deflector.endpoint.session, data.event, data.session)
	if (data.session) {
		const result = await adapter.synchronize(data.session)
		// console.log('synchronize result', result)
		if (!result.error) {
			session = result.data.session
		} else {
			status = 500
			error = result.error
		}
	} else {
		await adapter.signOut()
	}
	// console.log('after synchronize', session, status, error)
	deflector.setSession(session)
	const headers = setCookieFromSession(session)
	// console.log(headers)
	return new Response({ session, error }, { status, headers })
}
