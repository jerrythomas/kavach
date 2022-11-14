import { pick } from 'ramda'

export async function getRequestBody(request) {
	let body
	try {
		body = await request.formData()
		body = Object.fromEntries(body.entries())
	} catch (err) {
		body = await request.json()
	}

	return body
}

export async function getRequestData({ request, url }) {
	const body = await getRequestBody(request)
	const data = {
		...Object.fromEntries(url.searchParams.entries()),
		...body
	}

	return data
}

export async function splitAuthData(event) {
	const data = await getRequestData(event)
	const { mode } = data
	const credentials = pick(['email', 'password', 'token', 'provider'], data)
	const options = {
		...pick(['scopes', 'params', 'redirect'], data),
		redirect: event.url.origin
	}
	// console.log(data, mode, credentials, options)

	return { mode, credentials, options }
}

export function asURLWithParams(host, path = '', data = {}) {
	let params = ''
	if (data && typeof data === 'object') {
		params = Object.entries(data)
			.map(([key, value]) => `${key}=${value}`)
			.join('&')
		params = params.length ? '?' + params : params
	}
	return host + path + params
}
