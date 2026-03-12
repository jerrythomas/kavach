import { describe, it, expect } from 'vitest'
import { parseConfig, validateConfig } from '../src/config.js'

describe('parseConfig', () => {
	const validConfig = {
		adapter: 'supabase',
		providers: [
			{ name: 'google', label: 'Continue with Google' },
			{ mode: 'password', name: 'email', label: 'Sign in using' }
		],
		cachedLogins: true,
		logging: { level: 'info', table: 'audit.logs' },
		env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
		routes: {
			auth: '/auth',
			data: '/data',
			logout: '/logout'
		},
		rules: [{ path: '/public', public: true }]
	}

	it('should accept a valid config', () => {
		const result = parseConfig(validConfig)
		expect(result.adapter).toBe('supabase')
		expect(result.providers).toHaveLength(2)
		expect(result.cachedLogins).toBe(true)
		expect(result.logging.level).toBe('info')
		expect(result.logging.table).toBe('audit.logs')
		expect(result.env.url).toBe('PUBLIC_SUPABASE_URL')
	})

	it('should apply defaults for missing optional fields', () => {
		const result = parseConfig({ adapter: 'supabase' })
		expect(result.providers).toEqual([])
		expect(result.cachedLogins).toBe(false)
		expect(result.logging.level).toBe('error')
		expect(result.logging.table).toBe('logs')
		expect(result.env.url).toBe('PUBLIC_SUPABASE_URL')
		expect(result.env.anonKey).toBe('PUBLIC_SUPABASE_ANON_KEY')
		expect(result.routes.auth).toBe('/auth')
		expect(result.routes.data).toBe('/data')
		expect(result.routes.logout).toBe('/logout')
		expect(result.rules).toEqual([])
	})
})

describe('validateConfig', () => {
	it('should reject config without adapter', () => {
		expect(() => validateConfig({})).toThrow('adapter is required')
	})

	it('should reject unknown adapter', () => {
		expect(() => validateConfig({ adapter: 'unknown' })).toThrow('Unknown adapter')
	})

	it('should reject invalid provider shape', () => {
		expect(() =>
			validateConfig({
				adapter: 'supabase',
				providers: [{ label: 'no name' }]
			})
		).toThrow('name is required')
	})

	it('should accept valid config', () => {
		expect(() => validateConfig({ adapter: 'supabase' })).not.toThrow()
	})
})
