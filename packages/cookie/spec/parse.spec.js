import { describe, expect, it } from 'vitest'
import cookie from '../src/index.js'

describe('Cookie Parser', () => {
	const identity = (v) => v

	it('argument validation', () => {
		expect(cookie.parse.bind()).toThrowError(/argument str must be a string/)
		expect(cookie.parse.bind(null, 42)).toThrowError(
			/argument str must be a string/
		)
	})

	it('basic', () => {
		expect(cookie.parse('foo=bar')).toEqual({ foo: 'bar' })
		expect(cookie.parse('foo=123')).toEqual({ foo: '123' })
	})

	it('ignore spaces', () => {
		expect(cookie.parse('FOO    = bar;   baz  =   raz')).toEqual({
			FOO: 'bar',
			baz: 'raz'
		})
	})

	it('escaping', () => {
		expect(cookie.parse('foo="bar=123456789&name=Magic+Mouse"')).toEqual({
			foo: 'bar=123456789&name=Magic+Mouse'
		})

		expect(cookie.parse('email=%20%22%2c%3b%2f')).toEqual({ email: ' ",;/' })
	})

	it('ignore escaping error and return original value', () => {
		expect(cookie.parse('foo=%1;bar=bar')).toEqual({ foo: '%1', bar: 'bar' })
	})

	it('ignore non values', () => {
		expect(cookie.parse('foo=%1;bar=bar;HttpOnly;Secure')).toEqual({
			foo: '%1',
			bar: 'bar'
		})
	})

	it('unencoded', () => {
		expect(
			cookie.parse('foo="bar=123456789&name=Magic+Mouse"', {
				decode: identity
			})
		).toEqual({ foo: 'bar=123456789&name=Magic+Mouse' })

		expect(
			cookie.parse('email=%20%22%2c%3b%2f', {
				decode: identity
			})
		).toEqual({ email: '%20%22%2c%3b%2f' })
	})

	it('dates', () => {
		expect(
			cookie.parse(
				'priority=true; expires=Wed, 29 Jan 2014 17:43:25 GMT; Path=/',
				{
					decode: identity
				}
			)
		).toEqual({
			priority: 'true',
			Path: '/',
			expires: 'Wed, 29 Jan 2014 17:43:25 GMT'
		})
	})

	it('missing value', () => {
		expect(
			cookie.parse('foo; bar=1; fizz= ; buzz=2', {
				decode: identity
			})
		).toEqual({ bar: '1', fizz: '', buzz: '2' })
	})

	it('assign only once', () => {
		expect(cookie.parse('foo=%1;bar=bar;foo=boo')).toEqual({
			foo: '%1',
			bar: 'bar'
		})
		expect(cookie.parse('foo=false;bar=bar;foo=true'), {
			foo: 'false',
			bar: 'bar'
		})
		expect(cookie.parse('foo=;bar=bar;foo=boo')).toEqual({
			foo: '',
			bar: 'bar'
		})
	})
})
