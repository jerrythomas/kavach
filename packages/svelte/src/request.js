import { pick } from 'ramda'

/**
 * Get the request body from a request object
 *
 * @param {Request} request
 * @returns {Promise<Object>}
 */
export async function getRequestBody(request) {
	let body = null
	try {
		body = await request.formData()
		body = Object.fromEntries(body.entries())
	} catch (err) {
		body = await request.json()
	}

	return body
}

/**
 * Get the request data from a request object
 *
 * @param {Request} request
 * @param {URL} url
 * @returns {Promise<Object>}
 */
export async function getRequestData({ request, url }) {
	const body = await getRequestBody(request)
	const data = {
		...Object.fromEntries(url.searchParams.entries()),
		...body
	}
	return data
}

/**
 * Split the auth data from a request object
 *
 * @param {Request} event
 * @returns {Promise<Object>}
 */
export async function splitAuthData(event) {
	const data = await getRequestData(event)
	const { mode } = data

	const credentials = pick(['email', 'password', 'token', 'provider'], data)
	const options = {
		...pick(['scopes', 'params', 'redirect'], data)
	}

	return { mode, credentials, options }
}

/**
 * Convert an object to a URL with params
 *
 * @param {Request} request
 * @param {URL} url
 */
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
