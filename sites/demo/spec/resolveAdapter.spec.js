import { describe, it, expect } from 'vitest'
import { resolveAdapterName } from '../src/lib/resolveAdapter.js'

describe('resolveAdapterName', () => {
	it('returns adapter from URL search param', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost?adapter=firebase'),
			cookies: { get: () => undefined },
			env: {},
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('firebase')
	})

	it('falls back to cookie when no URL param', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: (name) => (name === 'kavach-adapter' ? 'convex' : undefined) },
			env: {},
			available: ['supabase', 'convex']
		})
		expect(result).toBe('convex')
	})

	it('falls back to env var when no URL param or cookie', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: () => undefined },
			env: { PUBLIC_AUTH_ADAPTER: 'auth0' },
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('auth0')
	})

	it('defaults to supabase when nothing is set', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: () => undefined },
			env: {},
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('supabase')
	})

	it('ignores URL param when dev mode is off', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost?adapter=firebase'),
			cookies: { get: () => undefined },
			env: { PUBLIC_AUTH_ADAPTER: 'supabase' },
			devMode: false,
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('supabase')
	})

	it('ignores cookie when dev mode is off', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: (name) => (name === 'kavach-adapter' ? 'firebase' : undefined) },
			env: { PUBLIC_AUTH_ADAPTER: 'supabase' },
			devMode: false,
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('supabase')
	})

	it('rejects URL param adapter not in available list', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost?adapter=evil'),
			cookies: { get: () => undefined },
			env: {},
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('supabase')
	})

	it('rejects cookie adapter not in available list', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: (name) => (name === 'kavach-adapter' ? 'malicious' : undefined) },
			env: {},
			available: ['supabase']
		})
		expect(result).toBe('supabase')
	})

	it('accepts URL param adapter in available list', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost?adapter=firebase'),
			cookies: { get: () => undefined },
			env: {},
			available: ['supabase', 'firebase']
		})
		expect(result).toBe('firebase')
	})
})
