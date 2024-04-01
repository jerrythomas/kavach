import { pick } from 'ramda'
import { zeroLogger } from '@kavach/logger'
import { createDeflector } from '@kavach/deflector'
import { getUserInfo, setHeaderCookies } from '@kavach/core'
import { getRequestData } from './request'
import { RUNNING_ON } from './constants'
import { writable } from 'svelte/store'

const pass = async () => {
	/* Used as a placeholder */
}
export const authStatus = writable()
// eslint-disable-next-line
export function createKavach(adapter, options) {
	const deflector = createDeflector(options)
	const logger = options?.logger ?? zeroLogger
	const invalidateAll = options?.invalidateAll ?? pass

	const signIn = async (credentials) => {
		const result = await adapter.signIn(credentials)
		authStatus.set(result)
		// invalidateAll()
		// invalidate(APP_AUTH_CONTEXT)
		return result
	}
	const signUp = async (credentials) => {
		const result = await adapter.signUp(credentials)
		authStatus.set(result)
		// invalidateAll()
		// invalidate(APP_AUTH_CONTEXT)
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

	// eslint-disable-next-line
	const onAuthChange = (url) => {
		if (RUNNING_ON !== 'browser') {
			logger.error({
				message: 'onAuthChange should only be called from browser',
				module: 'kavach',
				method: 'onAuthChange',
				path: url
			})
			return
		}
		adapter.onAuthChange(async (event, session) => {
			if (url) {
				authStatus.set(adapter.parseUrlError(url))
				logger.debug({
					message: 'onAuthChange, message in url',
					module: 'kavach',
					method: 'onAuthChange',
					path: url,
					data: adapter.parseUrlError(url)
				})
			}

			const result = await fetch(deflector.page.session, {
				method: 'POST',
				body: JSON.stringify({
					event,
					session
				})
			})

			if (result.status === 200) {
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

		if (pathname !== event.url.pathname) {
			return new Response(
				{},
				{ status: 303, headers: { location: event.url.origin + pathname } }
			)
		}
		return resolve(event)
	}

	function deflectedPath(url) {
		return deflector.redirect(url.pathname)
	}

	const handle = async ({ event, resolve }) => {
		const cookieSession = event.cookies.get('session')

		event.locals.session =
			cookieSession && cookieSession !== 'undefined'
				? JSON.parse(cookieSession)
				: null

		deflector.setSession(event.locals.session)

		if (event.url.pathname.startsWith(deflector.page.session)) {
			return handleSessionSync(event, adapter, deflector)
		}

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
			{
				session: {
					...pick(['refresh_token', 'access_token'], session),
					user: getUserInfo(session.user)
				}
			},
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

	if (data.session) {
		const result = await adapter.synchronize(data.session)

		if (!result.error) {
			session = result.data.session
		} else {
			status = 500
			error = result.error
		}
	} else {
		await adapter.signOut()
	}
	deflector.setSession(session)
	const headers = setCookieFromSession(session)
	return new Response({ session, error }, { status, headers })
}
