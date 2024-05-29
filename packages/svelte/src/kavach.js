import { pick } from 'ramda'
import { zeroLogger } from '@kavach/logger'
import { createDeflector } from '@kavach/deflector'
import { getUserInfo, setHeaderCookies } from '@kavach/core'
import { getRequestData } from './request'
import { RUNNING_ON, HTTP_STATUS_MESSAGE } from './constants'
import { writable } from 'svelte/store'

const pass = async () => {
	/* Used as a placeholder */
}
export const authStatus = writable({})

// eslint-disable-next-line max-lines-per-function
export function createKavach(adapter, options) {
	const deflector = createDeflector(options)
	const logger = options?.logger ?? zeroLogger
	const invalidateAll = options?.invalidateAll ?? pass

	const signIn = async (credentials) => {
		const result = await adapter.signIn(credentials)
		authStatus.set(result)
	}
	const signUp = async (credentials) => {
		const result = await adapter.signUp(credentials)
		authStatus.set(result)
	}
	const signOut = async () => {
		await adapter.signOut()
		await fetch(deflector.app.session, {
			method: 'POST',
			body: JSON.stringify({ event: 'SIGNED_OUT' })
		})
		// deflector.setSession(null)
		invalidateAll()
		authStatus.set({})
		// invalidate(APP_AUTH_CONTEXT)
	}

	// eslint-disable-next-line
	const onAuthChange = (url) => {
		if (RUNNING_ON !== 'browser') return
		const result = adapter.parseUrlError(url)
		if (result?.type === 'error') authStatus.set(result)

		adapter.onAuthChange(async (event, session) => {
			const result = await fetch(deflector.app.session, {
				method: 'POST',
				body: JSON.stringify({ event, session })
			})

			if (result.status === 200) invalidateAll()
			logger.debug({
				data: { event, module: 'kavach', method: 'onAuthChange' },
				message: 'Auth changed'
			})
			return result
		})
	}

	const handle = ({ event, resolve }) => {
		event.locals.session = parsedCookieSession(event)
		deflector.setSession(event.locals.session)

		if (event.url.pathname.startsWith(deflector.app.session)) {
			return handleSessionSync(event, adapter, deflector)
		}

		return handleUnauthorizedAccess({ event, resolve }, deflector)
	}
	return {
		signIn,
		signUp,
		signOut,
		onAuthChange,
		handle,
		client: adapter.client
	}
}

/**
 * Parse session from event cookies
 *
 * @param {object}   event
 * @returns {object} session
 */
function parsedCookieSession(event) {
	const cookieSession = event.cookies.get('session')
	return cookieSession && cookieSession !== 'undefined'
		? JSON.parse(cookieSession)
		: null
}

/**
 * Handle unauthorized access
 *
 * @param {object}   request
 * @param {object}   deflector
 * @returns {object} response
 */
function handleUnauthorizedAccess({ event, resolve }, deflector) {
	const result = deflector.protect(event.url.pathname)

	if (result.status !== 200) {
		if (result.redirect) {
			return new Response(
				{},
				{
					status: 303,
					headers: { location: event.url.origin + result.redirect }
				}
			)
		} else {
			return new Response(
				{ error: HTTP_STATUS_MESSAGE[result.status] },
				{ status: result.status }
			)
		}
	}
	return resolve(event)
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

/**
 * Synchronize session with the server
 *
 * @param {object} event
 * @param {object} adapter
 * @param {object} deflector
 * @returns {object} response
 */
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
