import { describe, expect, it } from 'vitest'
import { hasAuthParams, urlHashToParams } from '../src/helper.js'

describe('Helper functions', () => {
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
})
