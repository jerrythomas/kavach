import { describe, expect, it, vi } from 'vitest'
import { hasAuthParams, urlHashToParams, redirect } from '../src/helper.js'

describe('Helper functions', () => {
	beforeEach(() => {
		global.Response = vi.fn().mockImplementation((...args) => args)
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})
	it('should extract params from url hash', () => {
		let params = urlHashToParams('https://localhost?#')
		expect(params).toEqual({})
		params = urlHashToParams('https://localhost?foo=bar')
		expect(params).toEqual({})
		params = urlHashToParams('https://localhost?#foo=bar&token=baz')
		expect(params).toEqual({ foo: 'bar', token: 'baz' })
	})
	it('Should identify url with auth params', () => {
		expect(hasAuthParams('/auth#access_token=abcd')).toBeTruthy()

		expect(hasAuthParams('/auth#foo=')).toBeFalsy()
		expect(hasAuthParams('/auth#access_token=')).toBeFalsy()
		expect(hasAuthParams('/auth?access_token=abcd')).toBeFalsy()
	})

	it('Should redirect with cookies', () => {
		const [body, headers] = redirect(303, '/auth', {
			data: { something: 'bar' },
			foo: 'bar'
		})
		expect(body).toEqual({})
		expect(headers).toEqual({
			status: 303,
			headers: {
				location: '/auth',
				'Set-Cookie': [
					'data=%7B%22something%22%3A%22bar%22%7D; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict',
					'foo=bar; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'
				]
			}
		})
	})
})
