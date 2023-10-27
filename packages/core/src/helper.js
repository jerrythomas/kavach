import { defaultCookieOptions } from './constants'
import { serialize } from '@kavach/cookie'

/**
 * Checks if the url contains non empty 'access_token' in the url hash
 *
 * @param {String} url
 * @returns {boolean}
 */
export function hasAuthParams(url) {
	const params = urlHashToParams(url)
	// @ts-ignore
	return 'access_token' in params && params.access_token.length > 0
}

/**
 * Extracts key value pairs from the url hash.
 *
 * @param {String} url
 * @returns {Object} key value pair of all parameters in the hash
 */
export function urlHashToParams(url) {
	const [, hash] = url.split('#')
	if (hash && hash.length) {
		return hash
			.split('&')
			.map((kv) => kv.split('='))
			.reduce((acc, kv) => ({ ...acc, [kv[0]]: kv[1] }), {})
	}
	return {}
}

/**
 * Generates a redirect response using the provided inputs
 *
 * @param {301|303|404|500} status
 * @param {string} location
 * @param {Object} cookies
 * @param {import('./types').CookieOptions} options
 * @returns {Response} response
 */
export function redirect(status, location, cookies, options = {}) {
	const headers = {
		location,
		...setHeaderCookies(cookies, options)
	}
	return new Response(null, {
		status,
		headers
	})
}

/**
 * Generates a response object using provided inputs
 *
 * @param {200} status
 * @param {Object} body
 * @param {Object} cookies
 * @param {import('./types').CookieOptions} options
 * @returns {Response} response
 */
export function createResponse(status, body, cookies, options = {}) {
	return new Response(body, {
		status,
		headers: {
			'Content-Type': 'application/json',
			...setHeaderCookies(cookies, options)
		}
	})
}

/**
 * Returns a cookie header using provided object and options
 *
 * @param {object} cookies
 * @param {import('./types').CookieOptions} options
 * @returns {object} cookie header
 */
export function setHeaderCookies(cookies, options = {}) {
	const serializeOptions = { ...defaultCookieOptions, ...options }
	const serializedCookies = Object.entries(cookies).map(([key, value]) => {
		value = typeof value === 'string' ? value : JSON.stringify(value)
		return serialize(key, value, serializeOptions)
	})

	return { 'Set-Cookie': serializedCookies }
}
