import { describe, it, expect } from 'vitest'
import { generateModule } from '../src/generate.js'

const config = {
	adapter: 'supabase',
	providers: [
		{ name: 'google', label: 'Continue with Google' },
		{ mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
		{ mode: 'password', name: 'email', label: 'Sign in using' }
	],
	cachedLogins: true,
	logging: { level: 'info', table: 'audit.logs' },
	env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
	routes: { auth: '(public)/auth', data: '(server)/data', logout: '/logout' },
	rules: [
		{ path: '/public', public: true },
		{ path: '/data', roles: '*' }
	]
}

describe('generateModule', () => {
	it('should generate $kavach/config module', () => {
		const code = generateModule('config', config)
		expect(code).toContain('export const config')
		expect(code).toContain("adapter: 'supabase'")
		expect(code).toContain('cachedLogins: true')
	})

	it('should generate $kavach/routes module', () => {
		const code = generateModule('routes', config)
		expect(code).toContain('export const routes')
		expect(code).toContain("path: '/public'")
		expect(code).toContain('public: true')
		expect(code).toContain("logout: '/logout'")
	})

	it('should generate $kavach/providers module', () => {
		const code = generateModule('providers', config)
		expect(code).toContain('export const providers')
		expect(code).toContain("name: 'google'")
		expect(code).toContain("mode: 'otp'")
	})

	it('should generate $kavach/auth module for supabase', () => {
		const code = generateModule('auth', config)
		expect(code).toContain("from '@kavach/adapter-supabase'")
		expect(code).toContain("from '@supabase/supabase-js'")
		expect(code).toContain('createKavach')
		expect(code).toContain('export')
		expect(code).toContain('env.PUBLIC_SUPABASE_URL')
		expect(code).toContain('env.PUBLIC_SUPABASE_ANON_KEY')
		expect(code).toContain("level: 'info'")
		expect(code).toContain("table: 'audit.logs'")
	})

	it('should throw for unknown module', () => {
		expect(() => generateModule('unknown', config)).toThrow('Unknown virtual module')
	})
})
