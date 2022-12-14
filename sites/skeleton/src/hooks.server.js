import { sequence } from '@sveltejs/kit/hooks'
import { kavach } from '$lib/auth'
// import { redirect, setHeaderCookies } from '@kavach/core'
// import { getRequestData } from '@kavach/svelte'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = sequence(
	// handleSession,
	// handleLoginEndpoint,
	// handleLogoutEndpoint,
	// handleSessionSync
	kavach.handle
)
// export async function handle({ event, resolve }) {
// 	const response = await resolve(event)
// 	return response
// }

// async function handleLoginEndpoint({ event, resolve }) {
// 	if (event.url.pathname.startsWith(kavach.endpoint.login)) {
// 		const data = await getRequestData(event)
// 		return redirect(303, kavach.page.home, { session: data })
// 	}
// 	return resolve(event)
// }
// async function handleLogoutEndpoint({ event, resolve }) {
// 	if (event.url.pathname.startsWith(kavach.endpoint.logout)) {
// 		return redirect(303, kavach.page.home, { session: null })
// 	}
// 	return resolve(event)
// }

// async function handleSession({ event, resolve }) {
// 	event.locals['session'] = JSON.parse(event.cookies.get('session') ?? {})
// 	console.log(event.url.pathname)

// 	return resolve(event)
// }

// async function handleSessionSync({ event, resolve }) {
// 	return resolve(event)
// }
