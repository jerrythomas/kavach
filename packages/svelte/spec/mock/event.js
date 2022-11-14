/**
 * @typedef RequestOptions
 * @property {string} [method]
 * @property {object} [form]
 * @property {object} [json]
 * @property {object} [headers]
 */

/**
 * @typedef URLOptions
 * @property {string} [origin]
 * @property {object} [params]
 * @property {object} [url]
 */

/**
 * @typedef EventOptions
 * @property {string} [method]
 * @property {object} [form]
 * @property {object} [json]
 * @property {object} [headers]
 * @property {string} [origin]
 * @property {object} [params]
 */

/**
 * Mock the request object using the provided data
 *
 * @param {RequestOptions} options
 * @returns
 */
export function createRequest(options) {
	const method = options.method ?? 'GET'

	const formData = () => {
		if (options.form) {
			return { entries: () => Object.entries(options.form) }
		} else {
			throw new Error('No Form data')
		}
	}
	const json = () => {
		return options.json ?? {}
	}
	const headers = {
		get: (key) => options.headers[key]
	}

	return { formData, json, method, headers }
}

/**
 * Mock the url object using the provided data
 *
 * @param {URLOptions} options
 * @returns
 */
export function createURLParams(options) {
	const searchParams = { entries: () => Object.entries(options.params ?? {}) }
	return { searchParams, origin: options.origin, ...options.url }
}

/**
 * Mock the event object using the provided data
 *
 * @param {EventOptions} options
 * @returns
 */
export function createEvent(options) {
	const request = createRequest(options)
	const url = createURLParams(options)

	return { request, url, locals: options.locals ?? {} }
}
