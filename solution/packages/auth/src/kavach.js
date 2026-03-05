/* eslint-disable no-undef */
import { createGuardian } from '@kavach/guardian'
import { zeroLogger } from '@kavach/logger'
import { sanitizeError } from '@kavach/query'
import { pick } from 'ramda'
import { writable } from 'svelte/store'
import { HTTP_STATUS_MESSAGES, MESSAGES } from './messages'
import { RUNNING_ON } from './constants'
import { setHeaderCookies } from './internal'
import * as loginCache from './loginCache'
import { getUserInfo } from './provider'
import { getRequestData } from './request'

const pass = async () => {
	/* Used as a placeholder */
}
export const authStatus = writable()

/**
  * Parse auth errors from url, log them and provide error to callback
  *
  * @param {import('kavach').AuthAdapter} adapter
  * @param {import('./types').KavachAgents}     agents
  * @param {import('./types').CompositeURL}     url

*/
function handleAuthUrlError(adapter, agents, url) {
	const logger = agents.logger.getContextLogger({
		method: 'handleAuthUrlError'
	})
	const error = adapter.parseUrlError(url)
	if (error) {
		logger.error({
			message: error.message,
			data: { url },
			error
		})
		authStatus.set({ error, message: error.message })
	}
}

/**
 * Handle sign in using adapter
 *
 * @param {import('kavach').AuthAdapter}     adapter
 * @param {import('./types').KavachAgents}         agents
 * @param {import('kavach').AuthCredentials} credentials
 * @returns {Promise<import('kavach').AuthResponse>}
 */
async function handleSignIn(adapter, agents, credentials) {
	const logger = agents.logger.getContextLogger({ method: 'handleSignIn' })
	const result = await adapter.signIn(credentials)
	authStatus.set(result)
	if (result.error) logger.error({ message: result.error.message, error: result.error })
	if (RUNNING_ON === 'browser' && result.type === 'success' && result.data?.user) {
		cacheLogin(result.data.user, credentials)
	}
	return result
}

/**
 * Cache login info after a successful sign-in.
 *
 * @param {object} user       - user object from auth result
 * @param {object} credentials - the credentials passed to signIn
 */
function cacheLogin(user, credentials) {
	const email = user.email
	if (!email) return

	const meta = user.user_metadata || {}
	const name = meta.full_name || email.split('@')[0]
	const avatar = meta.avatar_url || null
	const provider = credentials.provider || 'email'
	const mode = credentials.provider && credentials.provider !== 'email' ? 'oauth' : 'email'

	loginCache.set({
		email,
		name,
		avatar,
		provider,
		mode,
		lastLogin: Date.now()
	})
}

/**
 * Handle sign up using adapter
 *
 * @param {import('kavach').AuthAdapter}     adapter
 * @param {import('./types').KavachAgents}         agents
 * @param {import('kavach').AuthCredentials} credentials
 * @returns {Promise<import('kavach').AuthResponse>}
 */
async function handleSignUp(adapter, agents, credentials) {
	const logger = agents.logger.getContextLogger({ method: 'handleSignUp' })
	const result = await adapter.signUp(credentials)
	authStatus.set(result)
	if (result.error) logger.error({ message: result.error.message, error: result.error })
	return result
}

/**
 * Handle unauthorized access
 *
 * @param {import('kavach').Guardian} guardian
 * @param {object}                          request
 * @returns {Response}
 */
function handleUnauthorizedAccess(agents, { event, resolve }) {
	const result = agents.guardian.protect(event.url.pathname)

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
			return new Response({ error: HTTP_STATUS_MESSAGES[result.status] }, { status: result.status })
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
 * @param {import('kavach').AuthAdapter} adapter
 * @param {import('kavach').Guardian}   guardian
 * @returns {object} response
 */
async function handleSessionSync(event, adapter, guardian) {
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

	guardian.setSession(session)
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

	return cookieSession && cookieSession !== 'undefined' ? JSON.parse(cookieSession) : null
}

/**
 * Send sign in status and session to server
 *
 * @param {import('kavach').Guardian} guardian
 * @param {object} event
 * @param {object} session
 */
async function syncSessionWithServer(agents, event, session = null) {
	const result = await fetch(agents.guardian.app.session, {
		method: 'POST',
		body: JSON.stringify({ event, session })
	})
	return result
}

/**
 * Handle route protection
 *
 * @param {import('kavach').AuthAdapter} adapter
 * @param {import('./types').KavachAgents}     agents
 * @param {object}                             request
 * @returns {Promise<void>}
 */
function handleRouteProtection(adapter, agents, { event, resolve }) {
	const { guardian } = agents
	event.locals.session = parseSessionFromCookies(event)
	guardian.setSession(event.locals.session)

	if (event.url.pathname.startsWith(guardian.app.session)) {
		return handleSessionSync(event, adapter, guardian)
	}

	const protection = handleUnauthorizedAccess(agents, { event, resolve })
	
	// If protection returns a Response (redirect or error), return it immediately
	if (protection instanceof Response) {
		// Check for data/rpc routes before returning error response
		const { pathname } = event.url
		const dataRoute = guardian.app.data
		const rpcRoute = guardian.app.rpc
		
		// Only handle data/rpc routes if the request would otherwise be allowed
		if (protection.status === 200 || protection.status === undefined) {
			// Handle data route if configured
			if (dataRoute && isDataRoute(pathname, dataRoute)) {
				return handleDataRoute(agents, { event }, dataRoute, agents.dataFn)
			}
			
			// Handle RPC route if configured
			if (rpcRoute && isRpcRoute(pathname, rpcRoute)) {
				return handleRpcRoute(agents, { event }, rpcRoute)
			}
		}
		
		return protection
	}

	// Route is allowed - check for data/rpc routes
	const { pathname } = event.url
	const dataRoute = guardian.app.data
	const rpcRoute = guardian.app.rpc

	// Handle data route if configured
	if (dataRoute && isDataRoute(pathname, dataRoute)) {
		return handleDataRoute(agents, { event }, dataRoute, agents.dataFn)
	}

	// Handle RPC route if configured
	if (rpcRoute && isRpcRoute(pathname, rpcRoute)) {
		return handleRpcRoute(agents, { event }, rpcRoute)
	}

	return resolve(event)
}
/**
 * Handle auth change
 *
 * @param {import('kavach').AuthAdapter} adapter
 * @param {import('./types').KavachAgents}     agents
 */
function handleAuthChange(adapter, agents) {
	const { invalidateAll } = agents
	const logger = agents.logger.getContextLogger({ method: 'handleAuthChange' })
	if (RUNNING_ON !== 'browser') return

	adapter.onAuthChange(async (event, session) => {
		logger.debug({
			message: 'authentication state changed',
			data: { event }
		})

		const result = await syncSessionWithServer(agents, event, session)
		if (result.status === 200) invalidateAll()

		return result
	})
}

/**
 * Handle sign out
 *
 * @param {import('kavach').AuthAdapter} adapter
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
 * Check if request is for a data route
 *
 * @param {string} pathname
 * @param {string|string[]|undefined} dataRoute
 * @returns {boolean}
 */
function isDataRoute(pathname, dataRoute) {
	if (!dataRoute) return false
	const routes = Array.isArray(dataRoute) ? dataRoute : [dataRoute]
	return routes.some((route) => pathname.startsWith(route))
}

/**
 * Check if request is for an RPC route
 *
 * @param {string} pathname
 * @param {string|string[]|undefined} rpcRoute
 * @returns {boolean}
 */
function isRpcRoute(pathname, rpcRoute) {
	if (!rpcRoute) return false
	const routes = Array.isArray(rpcRoute) ? rpcRoute : [rpcRoute]
	return routes.some((route) => pathname.startsWith(route))
}

/**
 * Extract entity from data route path
 *
 * @param {string} pathname
 * @param {string} baseRoute
 * @returns {string}
 */
function getEntityFromPath(pathname, baseRoute) {
	const entity = pathname.slice(baseRoute.length)
	return entity.startsWith('/') ? entity.slice(1) : entity
}

/**
 * Handle data routes - CRUD operations
 *
 * @param {import('./types').KavachAgents} agents
 * @param {object} request
 * @param {string|string[]|undefined} dataRoute
 * @param {Function} dataFn
 * @returns {Promise<Response>}
 */
async function handleDataRoute(agents, { event }, dataRoute, dataFn) {
	const { pathname, searchParams } = event.url
	const entity = getEntityFromPath(pathname, dataRoute)

	if (!dataFn) {
		return new Response(JSON.stringify({ error: { message: MESSAGES.DATA_NOT_SUPPORTED } }), {
			status: 501,
			headers: { 'Content-Type': 'application/json' }
		})
	}

	const actions = dataFn()
	if (!actions) {
		return new Response(JSON.stringify({ error: { message: MESSAGES.DATA_NOT_SUPPORTED } }), {
			status: 501,
			headers: { 'Content-Type': 'application/json' }
		})
	}

	const method = event.request.method
	const RESERVED = [':select', ':order', ':limit', ':offset', ':count']

	try {
		let result

		if (method === 'GET') {
			const body = Object.fromEntries(searchParams.entries())
			const filter = Object.fromEntries(
				Object.entries(body).filter(([k]) => !RESERVED.includes(k))
			)
			result = await actions.get(entity, {
				columns: body[':select'],
				order: body[':order'],
				limit: body[':limit'] ? Number(body[':limit']) : undefined,
				offset: body[':offset'] ? Number(body[':offset']) : undefined,
				count: body[':count'],
				filter
			})
		} else {
			const body = await event.request.json()
			const lowerMethod = method.toLowerCase()
			result = await actions[lowerMethod](entity, body)
		}

		const { data, error, count, status } = result

		if (error) {
			return new Response(JSON.stringify({ error: sanitizeError(error) }), {
				status: status || 500,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		const response = count !== undefined ? { data, count } : { data }
		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (err) {
		return new Response(JSON.stringify({ error: sanitizeError(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		})
	}
}

/**
 * Handle RPC routes
 *
 * @param {import('./types').KavachAgents} agents
 * @param {object} request
 * @param {string|string[]|undefined} rpcRoute
 * @returns {Promise<Response>}
 */
async function handleRpcRoute(agents, { event }, rpcRoute) {
	const { pathname } = event.url

	if (!agents.guardian.rpc) {
		return new Response(JSON.stringify({ error: { message: MESSAGES.RPC_NOT_SUPPORTED } }), {
			status: 501,
			headers: { 'Content-Type': 'application/json' }
		})
	}

	const rpc = agents.guardian.rpc
	if (!rpc) {
		return new Response(JSON.stringify({ error: { message: MESSAGES.RPC_NOT_SUPPORTED } }), {
			status: 501,
			headers: { 'Content-Type': 'application/json' }
		})
	}

	try {
		const body = await event.request.json()
		const { procedure, payload } = body
		const result = await rpc(procedure, payload)

		const { data, error, status } = result

		if (error) {
			return new Response(JSON.stringify({ error: sanitizeError(error) }), {
				status: status || 500,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		return new Response(JSON.stringify({ data }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (err) {
		return new Response(JSON.stringify({ error: sanitizeError(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		})
	}
}

function getAgents(options) {
	const logger = options.logger ?? zeroLogger
	const guardianOptions = {
		...options,
		app: {
			...options.app,
			data: options.app?.data ?? options.dataRoute,
			rpc: options.app?.rpc ?? options.rpcRoute
		}
	}
	return {
		logger: logger.getContextLogger({
			package: '@kavach/svelte',
			module: 'kavach'
		}),
		guardian: createGuardian(guardianOptions),
		invalidateAll: options.invalidateAll ?? pass,
		dataFn: options.data
	}
}


/**
 * Create Kavach instance
 *
 * @param {import('kavach').AuthAdapter} adapter
 * @param {object} options
 * @returns {object} kavach
 */
export function createKavach(adapter, options = {}) {
	const { page } = options
	const agents = getAgents(options)
	//
	// const agents = {
	// 	logger: logger.getContextLogger({
	// 		package: '@kavach/svelte',
	// 		module: 'kavach'
	// 	}),
	// 	guardian: createGuardian(options),
	// 	invalidateAll: options.invalidateAll ?? pass
	// }

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
		actions: (schema) => options.data?.(schema),
		getCachedLogins: () => loginCache.get(),
		removeCachedLogin: (email) => loginCache.remove(email),
		clearCachedLogins: () => loginCache.clear()
	}
}
