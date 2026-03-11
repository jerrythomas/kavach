import { DEFAULT_COOKIE_OPTIONS, type CookieOptions } from './constants'
import { serialize } from '@kavach/cookie'

export function extractKeyValuePair(data: string, separator = '='): [string, string] {
	let values = data.split(separator)
	if (values.length === 1) {
		values.push('')
	} else if (values.length > 2) {
		values = [values[0], values.slice(1).join(separator)]
	} else {
		values[1] = decodeURIComponent(values[1])
		if (values[1].includes('%')) {
			values[1] = values[1].substring(0, values[1].indexOf('%'))
		}
		values[1] = values[1].replaceAll(/[_|+]/g, ' ')
	}
	return [values[0], values[1]]
}

export function urlHashToParams(url: string): Record<string, string> {
	const [, hash] = (url ?? '').split('#')
	if (hash?.length) {
		const result = hash
			.split('&')
			.map((kv) => extractKeyValuePair(kv))
			.reduce((acc, kv) => ({ ...acc, [kv[0]]: kv[1] }), {} as Record<string, string>)

		return result
	}
	return {}
}

export function hasAuthParams(url: string): boolean {
	const params = urlHashToParams(url)
	return 'access_token' in params && (params.access_token?.length ?? 0) > 0
}

export function setHeaderCookies(
	cookies: Record<string, unknown>,
	options: CookieOptions = {}
): { 'Set-Cookie': string[] } {
	const serializeOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options }
	const serializedCookies = Object.entries(cookies).map(([key, value]) => {
		const val = typeof value === 'string' ? value : JSON.stringify(value)
		return serialize(key, val, serializeOptions)
	})

	return { 'Set-Cookie': serializedCookies }
}

export function redirect(
	status: 301 | 303 | 404 | 500,
	location: string,
	cookies: Record<string, unknown>,
	options: CookieOptions = {}
): Response {
	const headers = {
		location,
		...setHeaderCookies(cookies, options)
	}
	return new Response(null, {
		status,
		headers
	})
}

export function createResponse(
	status: 200,
	body: unknown,
	cookies: Record<string, unknown>,
	options: CookieOptions = {}
): Response {
	// @ts-expect-error - body can be any BodyInit
	return new Response(body, {
		status,
		headers: {
			'Content-Type': 'application/json',
			...setHeaderCookies(cookies, options)
		}
	})
}
