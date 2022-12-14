import { vi } from 'vitest'
import { createMockHeaders } from './headers'
import { createMockCookies } from './cookies'

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
export function createMockRequest(options) {
	const method = options.method ?? 'GET'

	const formData = () => {
		if (options.form) {
			return {
				entries: vi.fn().mockImplementation(() => Object.entries(options.form))
			}
		} else {
			throw new Error('No Form data')
		}
	}
	const json = vi.fn().mockImplementation(() => {
		return options.json ?? {}
	})
	const headers = createMockHeaders(options.headers)

	return { formData, json, method, headers }
}

/**
 * Mock the url object using the provided data
 *
 * @param {URLOptions} options
 * @returns
 */
export function createMockUrl(options) {
	const searchParams = { entries: () => Object.entries(options.params ?? {}) }
	return { searchParams, origin: options.origin, ...options.url }
}

/**
 * Mock the event object using the provided data
 *
 * @param {EventOptions} options
 * @returns
 */
export function createMockEvent(options) {
	const request = createMockRequest(options)
	const url = createMockUrl(options)
	const cookies = createMockCookies(options.cookies)

	return { request, url, locals: options.locals ?? {}, cookies }
}
