import { describe, expect, it } from 'vitest'
import { parse, serialize } from '../src/index.js'

describe('Cookie Serialize', () => {
	const identity = (v) => v

	it('basic', () => {
		expect(serialize('foo', 'bar')).toEqual('foo=bar')
		expect(serialize('foo', 'bar baz')).toEqual('foo=bar%20baz')
		expect(serialize('foo', '')).toEqual('foo=')
		expect(() => serialize('foo\n', 'bar')).toThrowError(
			/argument name is invalid/
		)
		expect(() => serialize('foo\n', 'bar')).toThrowError(
			/argument name is invalid/
		)
		expect(() => serialize('foo\u280a', 'bar')).toThrowError(
			/argument name is invalid/
		)
		expect(() => serialize('foo', 'bar', { encode: 42 })).toThrowError(
			/option encode is invalid/
		)
	})

	it('path', () => {
		expect(serialize('foo', 'bar', { path: '/' })).toEqual('foo=bar; Path=/')
		expect(() =>
			serialize('foo', 'bar', {
				path: '/\n'
			})
		).toThrowError(/option path is invalid/)
	})

	it('secure', () => {
		expect(serialize('foo', 'bar', { secure: true })).toEqual('foo=bar; Secure')
		expect(serialize('foo', 'bar', { secure: false })).toEqual('foo=bar')
	})

	it('domain', () => {
		expect(serialize('foo', 'bar', { domain: 'example.com' })).toEqual(
			'foo=bar; Domain=example.com'
		)
		expect(() =>
			serialize('foo', 'bar', {
				domain: 'example.com\n'
			})
		).toThrowError(/option domain is invalid/)
	})

	it('httpOnly', () => {
		expect(serialize('foo', 'bar', { httpOnly: true })).toEqual(
			'foo=bar; HttpOnly'
		)
	})

	it('maxAge', () => {
		expect(() =>
			serialize('foo', 'bar', {
				maxAge: 'buzz'
			})
		).toThrowError(/option maxAge is invalid/)

		expect(() =>
			serialize('foo', 'bar', {
				maxAge: Infinity
			})
		).toThrowError(/option maxAge is invalid/)

		expect(serialize('foo', 'bar', { maxAge: 1000 })).toEqual(
			'foo=bar; Max-Age=1000'
		)
		expect(serialize('foo', 'bar', { maxAge: '1000' })).toEqual(
			'foo=bar; Max-Age=1000'
		)
		expect(serialize('foo', 'bar', { maxAge: 0 })).toEqual('foo=bar; Max-Age=0')
		expect(serialize('foo', 'bar', { maxAge: '0' })).toEqual(
			'foo=bar; Max-Age=0'
		)
		expect(serialize('foo', 'bar', { maxAge: null })).toEqual('foo=bar')
		expect(serialize('foo', 'bar')).toEqual('foo=bar')
		expect(serialize('foo', 'bar', { maxAge: 3.14 })).toEqual(
			'foo=bar; Max-Age=3'
		)
	})

	it('expires', () => {
		expect(
			serialize('foo', 'bar', {
				expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900))
			})
		).toEqual('foo=bar; Expires=Sun, 24 Dec 2000 10:30:59 GMT')

		expect(() =>
			serialize('foo', 'bar', {
				expires: Date.now()
			})
		).toThrowError(/option expires is invalid/)
	})

	it('sameSite', () => {
		expect(serialize('foo', 'bar', { sameSite: true })).toEqual(
			'foo=bar; SameSite=Strict'
		)
		expect(serialize('foo', 'bar', { sameSite: 'Strict' })).toEqual(
			'foo=bar; SameSite=Strict'
		)
		expect(serialize('foo', 'bar', { sameSite: 'strict' })).toEqual(
			'foo=bar; SameSite=Strict'
		)
		expect(serialize('foo', 'bar', { sameSite: 'Lax' })).toEqual(
			'foo=bar; SameSite=Lax'
		)
		expect(serialize('foo', 'bar', { sameSite: 'lax' })).toEqual(
			'foo=bar; SameSite=Lax'
		)
		expect(serialize('foo', 'bar', { sameSite: 'None' })).toEqual(
			'foo=bar; SameSite=None'
		)
		expect(serialize('foo', 'bar', { sameSite: 'none' })).toEqual(
			'foo=bar; SameSite=None'
		)
		expect(serialize('foo', 'bar', { sameSite: false })).toEqual('foo=bar')

		expect(() =>
			serialize('foo', 'bar', {
				sameSite: 'foo'
			})
		).toThrowError(/option sameSite is invalid/)
	})

	it('escaping', () => {
		expect(serialize('cat', '+ ')).toEqual('cat=%2B%20')
	})

	it('parse->serialize', () => {
		expect(parse(serialize('cat', 'foo=123&name=baz five'))).toEqual({
			cat: 'foo=123&name=baz five'
		})

		expect(parse(serialize('cat', ' ";/'))).toEqual({
			cat: ' ";/'
		})
	})

	it('unencoded', () => {
		expect(
			serialize('cat', '+ ', {
				encode: identity
			})
		).toEqual('cat=+ ')

		expect(() =>
			serialize('cat', '+ \n', {
				encode: identity
			})
		).toThrowError(/argument val is invalid/)
	})
})
