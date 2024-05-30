import { getUserInfo, setHeaderCookies } from '@kavach/core'
import { createDeflector } from '@kavach/deflector'
import { zeroLogger } from '@kavach/logger'
import { pick } from 'ramda'
import { writable } from 'svelte/store'
import { HTTP_STATUS_MESSAGE, RUNNING_ON } from './constants'
import { getRequestData } from './request'

const pass = async () => {
	/* Used as a placeholder */
}
export const authStatus = writable()

/**
 * Create Kavach instance
 *
 * @param {object} adapter
 * @param {object} options
 * @returns {object} kavach
 */
export function createKavach(adapter, options) {
	const agents = {
		logger: options?.logger ?? zeroLogger,
		deflector: createDeflector(options),
		invalidateAll: options?.invalidateAll ?? pass
	}

	return {
		signIn: (credentials) => adapter.signIn(credentials),
		signUp: (credentials) => adapter.signUp(credentials),
		signOut: () => handleSignOut(adapter, agents),
		onAuthChange: () => handleAuthChange(adapter, agents),
		handle: (request) => handleRouteProtection(adapter, agents, request),
		client: adapter.client
	}
}

/**
 * Handle route protection
 *
 * @param {object} adapter
 * @param {object} agents
 * @param {object} request
 * @returns {Promise<void>}
 */
function handleRouteProtection(adapter, agents, { event, resolve }) {
	const { deflector } = agents
	event.locals.session = parseSessionFromCookies(event)
	deflector.setSession(event.locals.session)

	if (event.url.pathname.startsWith(deflector.app.session)) {
		return handleSessionSync(event, adapter, deflector)
	}

	return handleUnauthorizedAccess(agents, { event, resolve })
}
/**
 * Handle auth change
 *
 * @param {object} adapter
 * @param {object} agents
 */
function handleAuthChange(adapter, agents) {
	const { invalidateAll, logger } = agents
	if (RUNNING_ON !== 'browser') return

	adapter.onAuthChange(async (event, session) => {
		logger.debug({
			message: 'onAuthChange',
			data: { module: 'kavach', method: 'onAuthChange', event }
		})

		const result = await syncSessionWithServer(agents, event, session)
		if (result.status === 200) invalidateAll()

		return result
	})
}

/**
 * Handle sign out
 *
 * @param {object} adapter
 * @param {object} deflector
 * @param {function} invalidateAll
 * @returns {Promise<void>}
 */
async function handleSignOut(adapter, agents) {
	await adapter.signOut()
	syncSessionWithServer(agents, 'SIGNED_OUT')
	agents.invalidateAll()
}

/**
 * Handle unauthorized access
 *
 * @param {object} deflector
 * @param {object} request
 * @returns {Response}
 */
function handleUnauthorizedAccess(agents, { event, resolve }) {
	const result = agents.deflector.protect(event.url.pathname)

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

/**
 * Parse session from cookies
 *
 * @param {object} event
 * @returns {object} session
 */
function parseSessionFromCookies(event) {
	const cookieSession = event.cookies.get('session')

	return cookieSession && cookieSession !== 'undefined'
		? JSON.parse(cookieSession)
		: null
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
 * Send sign in status and session to server
 *
 * @param {object} deflector
 * @param {object} event
 * @param {object} session
 */
async function syncSessionWithServer(agents, event, session = null) {
	const result = await fetch(agents.deflector.app.session, {
		method: 'POST',
		body: JSON.stringify({ event, session })
	})
	return result
}
