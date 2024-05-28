import { describe, expect, it } from 'vitest'
import {
	getRequestData,
	getRequestBody,
	splitAuthData,
	asURLWithParams
} from '../src/request'
import { createMockEvent } from './mock'

describe('Request functions', () => {
	const events = [
		{
			input: {
				form: { foo: 'bar' },
				params: { email: 'foo@bar.com' }
			},
			expected: { foo: 'bar', email: 'foo@bar.com' }
		},
		{
			input: {
				json: { foo: 'bar' },
				params: { email: 'foo@bar.com' }
			},
			expected: { foo: 'bar', email: 'foo@bar.com' }
		},
		{
			input: {
				form: { foo: 'bar' },
				json: { scooby: 'doo' },
				params: { email: 'foo@bar.com' }
			},
			expected: { foo: 'bar', email: 'foo@bar.com' }
		},
		{
			input: {
				form: { foo: 'bar', email: 'foo@bar.com' },
				json: { scooby: 'doo' },
				params: { email: 'a@b.com' }
			},
			expected: { foo: 'bar', email: 'foo@bar.com' }
		}
	]
	const params = [
		{
			input: {
				form: { email: 'foo@bar.com', mode: 'otp' }
				// origin: 'http://localhost:5173'
			},
			expected: {
				credentials: { email: 'foo@bar.com' },
				options: {},
				mode: 'otp'
			},
			msg: 'otp'
		},
		{
			input: {
				form: {
					provider: 'google',
					mode: 'oauth',
					scopes: ['foo'],
					params: ['bar']
				}
				// origin: 'http://localhost:5173'
			},
			expected: {
				credentials: { provider: 'google' },
				options: {
					scopes: ['foo'],
					params: ['bar']
				},
				mode: 'oauth'
			},
			msg: 'oauth'
		}
	]

	describe('getRequestBody', () => {
		it('should fetch form data from request', async () => {
			const data = {
				form: { foo: 'bar', bar: 'baz' }
			}
			const event = createMockEvent(data)
			const result = await getRequestBody(event.request)
			expect(result).toEqual(data.form)
		})
		it('should fetch json data from request', async () => {
			const data = {
				json: { foo: 'bar', bar: 'baz' }
			}
			const event = createMockEvent(data)
			const result = await getRequestBody(event.request)
			expect(result).toEqual(data.json)
		})
	})

	describe('getRequestData', () => {
		it('should fetch data from url params', async () => {
			const data = {
				params: { name: 'bar', email: 'foo@bar.com' }
			}
			const event = createMockEvent(data)
			const result = await getRequestData(event)
			expect(result).toEqual(data.params)
		})

		it.each(events)(
			'should combine data from request form/body and url params',
			async ({ input, expected }) => {
				const event = createMockEvent(input)
				const result = await getRequestData(event)
				expect(result).toEqual(expected)
			}
		)
	})
	describe('splitAuthData', () => {
		it.each(params)(
			'Should split auth params $msg',
			async ({ input, expected }) => {
				const event = createMockEvent(input)
				const result = await splitAuthData(event)
				expect(result).toEqual(expected)
			}
		)
	})
	describe('asURLWithParams', () => {
		it('should build url with params', () => {
			let url = asURLWithParams('https://example.com')
			expect(url).toEqual('https://example.com')
			url = asURLWithParams('https://example.com', '/home', null)
			expect(url).toEqual('https://example.com/home')
			url = asURLWithParams('https://example.com', '/home', '')
			expect(url).toEqual('https://example.com/home')
			url = asURLWithParams('https://example.com', '/home', [])
			expect(url).toEqual('https://example.com/home')
			url = asURLWithParams('https://example.com', '/home', {
				email: 'foo@bar.com'
			})
			expect(url).toEqual('https://example.com/home?email=foo@bar.com')
			url = asURLWithParams('https://example.com', '/home', {
				email: 'foo@bar.com',
				name: 'bar'
			})
			expect(url).toEqual('https://example.com/home?email=foo@bar.com&name=bar')
		})
	})
})
