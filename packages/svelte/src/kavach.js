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
 * @param {import('@kavach/core').AuthAdapter} adapter
 * @param {object} options
 * @returns {object} kavach
 */
export function createKavach(adapter, options = {}) {
	const { page } = options
	const agents = {
		logger: options.logger ?? zeroLogger,
		deflector: createDeflector(options),
		invalidateAll: options.invalidateAll ?? pass
	}
	if (page && RUNNING_ON === 'browser') {
		page.subscribe(({ url }) => {
			handleAuthUrlError(adapter, agents, url)
		})
	}

	return {
		signIn: (credentials) => handleSignIn(adapter, agents, credentials),
		signUp: (credentials) => handleSignUp(adapter, agents, credentials),
		signOut: () => handleSignOut(adapter, agents),
		onAuthChange: () => handleAuthChange(adapter, agents),
		handle: (request) => handleRouteProtection(adapter, agents, request),
		// client: (schema) => adapter.client(schema),
		server: (schema) => adapter.server(schema)
	}
}

/**
  * Parse auth errors from url, log them and provide error to callback
  *
  * @param {import('@kavach/core').AuthAdapter} adapter
  * @param {import('./types').KavachAgents}     agents
  * @param {import('./types').CompositeURL}     url

*/
function handleAuthUrlError(adapter, agents, url) {
	const error = adapter.parseUrlError(url)
	if (error) {
		agents.logger.error({
			message: error.message,
			data: { module: 'kavach', method: 'handleAuthUrlError', url },
			error
		})
		authStatus.set({ error, message: error.message })
	}
}

/**
 * Handle route protection
 *
 * @param {import('@kavach/core').AuthAdapter} adapter
 * @param {import('./types').KavachAgents}     agents
 * @param {object}                             request
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
 * @param {import('@kavach/core').AuthAdapter} adapter
 * @param {import('./types').KavachAgents}     agents
 */
function handleAuthChange(adapter, agents) {
	const { invalidateAll, logger } = agents
	if (RUNNING_ON !== 'browser') return

	adapter.onAuthChange(async (event, session) => {
		logger.debug({
			message: 'authentication state changed',
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
 * @param {import('@kavach/core').AuthAdapter} adapter
 * @param {import('./types').KavachAgents}     agents
 * @returns {Promise<void>}
 */
async function handleSignOut(adapter, agents) {
	await adapter.signOut()
	syncSessionWithServer(agents, 'SIGNED_OUT')
	agents.invalidateAll()
	authStatus.set(null)
}

/**
 * Handle sign in using adapter
 *
 * @param {import('@kavach/core').AuthAdapter}     adapter
 * @param {import('./types').KavachAgents}         agents
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignIn(adapter, agents, credentials) {
	const result = await adapter.signIn(credentials)
	authStatus.set(result)
	logAuthError(agents.logger, result, 'handleSignIn')
	return result
}

/**
 * Handle sign up using adapter
 *
 * @param {import('@kavach/core').AuthAdapter}     adapter
 * @param {import('./types').KavachAgents}         agents
 * @param {import('@kavach/core').AuthCredentials} credentials
 * @returns {Promise<import('@kavach/core').AuthResponse>}
 */
async function handleSignUp(adapter, agents, credentials) {
	const result = await adapter.signUp(credentials)
	authStatus.set(result)
	logAuthError(agents.logger, result, 'handleSignUp')
	return result
}

/**
 * Log error if result has error
 *
 * @param {import('@kavach/logger').Logger}     logger
 * @param {import('@kavach/core').AuthResponse} result
 * @param {string} method
 */
export function logAuthError(logger, result, method) {
	if (result.error) {
		logger.error({
			message: result.error.message,
			data: { module: 'kavach', method },
			error: result.error
		})
	}
}
/**
 * Handle unauthorized access
 *
 * @param {import('@kavach/core').Deflector} deflector
 * @param {object}                           request
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
 * @param {import('@kavach/core').AuthAdapter} adapter
 * @param {import('@kavach/core').Deflector}   deflector
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
 * @param {object}   event
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
 * @param {import('@kavach/core').Deflector} deflector
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
