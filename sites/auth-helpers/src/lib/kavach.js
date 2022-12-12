import { zeroLogger, createDeflector } from '@kavach/core'
import { getSupabase, getServerSession } from '@supabase/auth-helpers-sveltekit'
// import { invalidateAll } from '$app/navigation'
// import { getLoadSupabaseClient } from './supabase-load.js';
// import { getRequestSupabaseClient } from './supabase-request.js';
export const runningOn = typeof window === 'undefined' ? 'server' : 'browser'

export function createKavach(adapter, options) {
	const logger = options.logger ?? zeroLogger
	const invalidate = options?.invalidate ?? (() => {})
	const deflector = createDeflector(options)
	const { endpoint, page } = deflector

	let session = null

	logger.debug({
		module: 'kavach',
		method: 'createKavach',
		message: 'Initializing kavach'
	})
	function handleAuthChange() {
		const {
			data: { subscription }
		} = adapter.auth.onAuthStateChange((authEvent, authSession) => {
			invalidate('supabase:auth')
			console.log(authEvent)
			session = authSession
		})

		return () => {
			subscription.unsubscribe()
		}
	}
	// async function getSession(event) {
	// 	// if (event.depends) {
	// 		const data = await getSupabase(event)
	// 		session = data.session
	// 		return session
	// 	// } else {
	// 	// 	return null
	// 	// }
	// }

	// async function setSession(clientSession) {
	// 	const { data, error } = await adapter.setSession(clientSession)
	// 	session = error ? null : data.session

	// 	return session
	// }
	// async function getSessionOnServer(event) {
	// 	return getServerSession(event)
	// }
	async function signOut(event) {
		const { supabaseClient } = await getSupabase(event)
		logger.debug({
			module: 'kavach',
			method: 'signOut',
			data: {
				client: supabaseClient,
				adapter
			}
		})
		await supabaseClient.auth.signOut()
		// invalidateAll()
		throw options.redirect(303, page.home)
	}

	async function handleSignOut({ event, resolve }) {
		if (event.url.pathname === endpoint.logout) {
			await logger.debug({
				module: 'kavach',
				method: 'handleSignOut',
				data: { session, path: event.url.pathname }
			})

			const { supabaseClient } = await getSupabase(event)
			await supabaseClient.auth.signOut()
			console.log('processing log out')
			return Response.redirect(event.url.origin + page.home, 303)
		}
		return resolve(event)
	}

	return {
		handleAuthChange,
		handlers: [handleSignOut],
		// getSession,
		// setSession,
		getSupabase,
		getServerSession,
		client: adapter,
		signOut,
		endpoint
		// getSessionOnServer
	}
}

// export async function getSupabase(event) {
// 	const requestOrServerLoadEvent = event;
// 	const loadEvent = event;
// 	let supabaseClient;
// 	if ( loadEvent.depends && typeof loadEvent.depends === 'function') {
// 			// depend on `supabase:auth` to allow reloading all data fetched with rls
// 			loadEvent.depends('supabase:auth');
// 	}
// 	// prefer request/server-load over load
// 	if (requestOrServerLoadEvent.locals) {
// 			supabaseClient = getRequestSupabaseClient(requestOrServerLoadEvent);
// 	}
// 	else if (typeof loadEvent.parent === 'function') {
// 			supabaseClient = getLoadSupabaseClient(loadEvent);
// 	}
// 	else {
// 			throw new Error('invalid event');
// 	}
// 	const { data: { session } } = await supabaseClient.auth.getSession();
// 	return {
// 			supabaseClient,
// 			session
// 	};
// }
