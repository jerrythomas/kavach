import { describe, it, expect } from 'vitest'
import { PROVIDER_DEFAULTS } from '../src/commands/constants.js'
import { buildConfig } from '../src/prompts.js'

describe('buildConfig', () => {
	it('should build config from prompt answers', () => {
		const answers = {
			adapter: 'supabase',
			providers: ['google', 'github', 'magic', 'password'],
			cachedLogins: true,
			logLevel: 'info',
			logTable: 'audit.logs',
			authRoute: '(public)/auth',
			dataRoute: '(server)/data',
			logoutRoute: '/logout'
		}
		const config = buildConfig(answers)
		expect(config.adapter).toBe('supabase')
		expect(config.providers).toHaveLength(4)
		expect(config.providers[0]).toEqual({ name: 'google', label: 'Continue with Google' })
		expect(config.providers[2]).toEqual({ mode: 'otp', name: 'magic', label: 'Email for Magic Link' })
		expect(config.providers[3]).toEqual({
			mode: 'password',
			name: 'email',
			label: 'Sign in using'
		})
		expect(config.logging.level).toBe('info')
		expect(config.logging.table).toBe('audit.logs')
		expect(config.env.url).toBe('PUBLIC_SUPABASE_URL')
		expect(config.env.anonKey).toBe('PUBLIC_SUPABASE_ANON_KEY')
		expect(config.routes.auth).toBe('(public)/auth')
	})

	it('should generate default labels for providers', () => {
		const config = buildConfig({ adapter: 'supabase', providers: ['azure'] })
		expect(config.providers[0]).toEqual({
			name: 'azure',
			label: 'Continue with Azure',
			scopes: ['email', 'profile']
		})
	})

	it('should use default routes when not specified', () => {
		const config = buildConfig({ adapter: 'supabase', providers: [] })
		expect(config.routes.auth).toBe('(public)/auth')
		expect(config.routes.data).toBe('(server)/data')
		expect(config.routes.logout).toBe('/logout')
	})

	it('should use default logging when not specified', () => {
		const config = buildConfig({ adapter: 'supabase', providers: [] })
		expect(config.logging).toEqual({ enabled: false })
	})
})

describe('PROVIDER_DEFAULTS', () => {
	it('should have entries for known providers', () => {
		expect(PROVIDER_DEFAULTS.google).toBeDefined()
		expect(PROVIDER_DEFAULTS.github).toBeDefined()
		expect(PROVIDER_DEFAULTS.azure).toBeDefined()
		expect(PROVIDER_DEFAULTS.magic).toBeDefined()
		expect(PROVIDER_DEFAULTS.password).toBeDefined()
	})

	it('should set mode for otp and password providers', () => {
		expect(PROVIDER_DEFAULTS.magic.mode).toBe('otp')
		expect(PROVIDER_DEFAULTS.password.mode).toBe('password')
	})
})
