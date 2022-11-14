import { createDeflector, ZERO_LOGGER } from '@kavach/core'
import { signInEndpoint, sessionEndpoint } from './endpoints'
import { APP_AUTH_CONTEXT, RUNNING_ON } from './constants'

export function createKavach(adapter, options = {}) {
	// const logger = options?.logger ?? ZERO_LOGGER
	const invalidate = options?.invalidate ?? (() => {})
	const deflector = createDeflector(options)
	const { endpoint, page } = deflector
	let session

	const onAuthChange = async () => {
		if (RUNNING_ON === 'browser') {
			adapter.onAuthChange(async (event, session) => {
				invalidate(APP_AUTH_CONTEXT)
				deflector.setSession(session)
				await fetch(endpoint.session, {
					method: 'POST',
					body: JSON.stringify({
						event,
						session
					})
				})
			})
		}
	}

	async function handleSignIn({ event, resolve }) {
		if (event.url.pathname.startsWith(endpoint.login)) {
			return signInEndpoint(event, adapter, deflector)
		}
		return resolve(event)
	}

	async function handleSignOut({ event, resolve }) {
		if (event.url.pathname.startsWith(endpoint.logout)) {
			await adapter.signOut()
			event.locals.session = null
			return Response.redirect(event.url.origin + page.login, 301)
		}
		return resolve(event)
	}

	async function handleSession({ event, resolve }) {
		if (event.url.pathname.startsWith(endpoint.session)) {
			return await sessionEndpoint(event, adapter)
		}
		return resolve(event)
	}

	async function handleUnauthorizedAccess({ event, resolve }) {
		const pathname = deflector.redirect(event.url.pathname)
		if (pathname !== event.url.pathname) {
			return Response.redirect(event.url.origin + pathname, 301)
		}
		return resolve(event)
	}

	const handlers = [
		handleSignIn,
		handleSignOut,
		handleSession,
		handleUnauthorizedAccess
	]

	return {
		session,
		handlers,
		onAuthChange
	}
}
