import { pick } from 'ramda'
import { asURLWithParams, splitAuthData } from './request'
import { redirect } from '@kavach/core'
// export async function sessionEndpoint(event, adapter) {
// 	const data = await getRequestData(event)
// 	event.locals.session = await adapter.setSession(data.session)
// 	return event.locals.session
// }

export async function signInEndpoint(event, adapter, deflector) {
	const redirectTo = event.url.origin + deflector.page.login
	let { mode, credentials, options } = await splitAuthData(event)

	const result = await adapter.signIn(mode, credentials, {
		...options,
		redirectTo
	})
	const { session } = result.data
	// console.log('result from signIn', result)
	const message = result.error ? { error: result.error } : {}
	const params = {
		mode,
		...pick(['email', 'provider'], credentials),
		...message
	}
	const url = asURLWithParams(event.url.origin, deflector.page.login, params)

	if (
		mode === 'otp' &&
		event.request.method !== 'GET' &&
		event.request.headers.get('accept') !== 'application/json'
	) {
		return redirect(303, url, { session })
		// Response.redirect(url, 303)
	}

	return redirect(303, url, { session }) //Response.redirect(url, 301)
}
