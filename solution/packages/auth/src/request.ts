import { pick } from 'ramda'

export interface RequestLike {
	headers: {
		get: (key: string) => string | null
	}
	formData: () => Promise<FormData>
	json: () => Promise<unknown>
}

export interface UrlLike {
	searchParams: {
		entries: () => IterableIterator<[string, string]>
	}
}

export interface EventLike {
	request: RequestLike
	url: UrlLike
}

export async function getRequestBody(request: RequestLike): Promise<object> {
	const contentType = request.headers.get('content-type') || ''

	if (contentType.includes('form')) {
		const body = await request.formData()
		return Object.fromEntries(body.entries())
	}

	return (await request.json()) as object
}

export async function getRequestData(event: EventLike): Promise<Record<string, unknown>> {
	const body = await getRequestBody(event.request)
	const data = {
		...Object.fromEntries(event.url.searchParams.entries()),
		...body
	}
	return data
}

export async function splitAuthData(event: EventLike) {
	const data = await getRequestData(event)
	const { mode } = data as { mode?: string }

	const credentials = pick(['email', 'password', 'token', 'provider'], data)
	const options = pick(['scopes', 'params', 'redirect'], data)

	return { mode, credentials, options }
}

export function asURLWithParams(host: string, path = '', data: Record<string, unknown> = {}): string {
	let params = ''
	if (data && typeof data === 'object') {
		params = Object.entries(data)
			.map(([key, value]) => `${key}=${value}`)
			.join('&')
		params = params.length ? `?${params}` : params
	}
	return host + path + params
}
