import { pick } from 'ramda'
import { getRequestData, asURLWithParams, splitAuthData } from './request'

export async function sessionEndpoint(event, adapter) {
	const data = await getRequestData(event)
	event.locals.session = await adapter.setSession(data.session)
	return Response(200)
}

export async function signInEndpoint(event, adapter, deflector) {
	const { mode, credentials, options } = await splitAuthData(event)
	const { data, error } = await adapter.signIn(mode, credentials, {
		...options,
		redirect: event.url.origin + deflector.page.login
	})
	const message = error ? { error } : { data }
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
