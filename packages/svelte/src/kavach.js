import { pick } from 'ramda'
import { createDeflector, setHeaderCookies, zeroLogger } from '@kavach/core'
import { getRequestData } from './request'
import { APP_AUTH_CONTEXT, RUNNING_ON } from './constants'

export function createKavach(adapter, options) {
	const deflector = createDeflector(options)
	const logger = options?.logger ?? zeroLogger
	const invalidate = options?.invalidate ?? (() => {})
	const invalidateAll = options?.invalidateAll ?? (() => {})
	// const goto = options?.goto ?? (() => {})

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
		await fetch(deflector.page.session, {
			method: 'POST',
			body: JSON.stringify({ event: 'SIGNED_OUT' })
		})
		// deflector.setSession(null)
		invalidateAll()
		// invalidate(APP_AUTH_CONTEXT)
	}

	const onAuthChange = () => {
		if (RUNNING_ON !== 'browser') {
			logger.error('onAuthChange should only be called from browser')
			return
		}
		adapter.onAuthChange(async (event, session) => {
			// console.log('auth changed')
			const result = await fetch(deflector.page.session, {
				method: 'POST',
				body: JSON.stringify({
					event,
					session
				})
			})

			if (result.status == 200) {
				invalidateAll()
				// invalidate(APP_AUTH_CONTEXT)
				// deflector.setSession(session)
				// const location =
				// 	event === 'SIGNED_IN' ? deflector.page.home : deflector.page.login
				// goto(location)
			}
			return result
		})
	}
	async function handleUnauthorizedAccess({ event, resolve }) {
		const pathname = deflectedPath(event.url)

		// console.log(
		// 	pathname,
		// 	event.locals.session,
		// 	event.url.pathname,
		// 	deflector.isAuthenticated,
		// 	deflector.authorizedRoutes
		// )
		if (pathname !== event.url.pathname) {
			return new Response(
				{},
				{ status: 303, headers: { location: event.url.origin + pathname } }
			)
		}
		return resolve(event)
	}

	function deflectedPath(url) {
		// console.log(deflector)
		return deflector.redirect(url.pathname)
	}

	const handle = async ({ event, resolve }) => {
		const cookieSession = event.cookies.get('session')

		event.locals['session'] =
			cookieSession && cookieSession !== 'undefined'
				? JSON.parse(cookieSession)
				: null

		deflector.setSession(event.locals['session'])
		// console.log(
		// 	event.url.pathname,
		// 	deflector.isAuthenticated,
		// 	deflector.authorizedRoutes
		// )
		if (event.url.pathname.startsWith(deflector.page.session)) {
			return handleSessionSync(event, adapter, deflector)
		}

		// handleUnauthorizedAccess
		return handleUnauthorizedAccess({ event, resolve })
		// return resolve(event)
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
	// console.log(deflector.page.session, data.event, data.session)
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
