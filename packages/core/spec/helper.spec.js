import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
	hasAuthParams,
	urlHashToParams,
	redirect,
	createResponse
} from '../src/helper.js'

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
		params = urlHashToParams('https://localhost?#foo=&token=baz')
		expect(params).toEqual({ foo: '', token: 'baz' })
		params = urlHashToParams('https://localhost?#foo==&token=baz')
		expect(params).toEqual({ foo: '=', token: 'baz' })
		params = urlHashToParams(
			'https://kavach.vercel.app/auth#error=server_error&error_code=500&error_description=Unable+to+exchange+external+code%253A+0.ARIA32EImwmt30e01JoAgoq58HuyW2kf3VpEpwXcKlrNwQrWAAA.AgABAAIAAAAmoFfGtYxvRrNriQdPKIZ-AgDs_wUA9P_H4zoxyzaAya3YcrENNUg-9epulTlB3BHZMxNpyiPttjTwudfhwDVQP95G4ELGgnII_zNli49Lf7Jyi2T_pSr6DgED5FzuVoeDiFS26qn1VUu6zJuZaZv5tL89KP_nre3d16tmkGv5MVaJdmCeqzyPVW5igokRrjJ9phbO6QDGZSlbgdLHTDou2sbx9KliTPN4Zg9ZrApj42IvShpdpBIOQDc-N-YDjXei5JD4Jg5D3JVLIMwG9uoF_QvEWFM8rHxZGsIr0F_3vvPsGqwD6NK6E8OWeLHCXie5nBywfWmIW-7js3feSfa8TnkKASyNKT6hF90A2olr2vAh5KJby1TSED8qUqbizMXYJw8iq65u1JkDT43PEibMKlkgiqVWsRE02GItCrSZ3GKF8mgYAnvU8-fbFXHQlroWn66gT_cSW-glSqAYxgSptJdRm8akMF5eOEatrcOAN3mogWbpN8xTHn9tIplAR7RE3srCY36xCgOTiGZK7oomVsjg27GhpSUk7Omh73JLTEN5-jGNEeKhbY0TxX7nY88J67tko-c4Ek2Ktp33UI1XEr0mVOZJ9N2_4vl22xumxFwLKAc-RmZO9OKNHmDAR-MOOS_6KLAgYQWaykvNZqniFeow4sUs2ZPcETZ3E3OQ7u_W84lzRGq73v6WqGzWY8qW_7RDIQlqbNFIhBL-opYQrOtImI6men3LVFhMgxi7p0g'
		)
		expect(params).toEqual({
			error: 'server_error',
			error_code: '500',
			error_description: 'Unable to exchange external code'
		})
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
		expect(body).toBeFalsy()
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
	it('Should create response with cookies', () => {
		const [body, headers] = createResponse(
			200,
			{},
			{
				data: { something: 'bar' },
				foo: 'bar'
			}
		)
		expect(body).toEqual({})
		expect(headers).toEqual({
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': [
					'data=%7B%22something%22%3A%22bar%22%7D; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict',
					'foo=bar; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict'
				]
			}
		})
	})
})
