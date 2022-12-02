import { pick } from 'ramda'
import { getRequestData, asURLWithParams, splitAuthData } from './request'

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
		Response.redirect(url, 303)
	}

	return Response.redirect(url, 301)
}
