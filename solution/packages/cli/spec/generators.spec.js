import { describe, it, expect } from 'vitest'
import { generateConfigFile, generateAuthPage, generateDataRoute } from '../src/generators.js'

const config = {
	adapter: 'supabase',
	providers: [
		{ name: 'google', label: 'Continue with Google' },
		{ mode: 'otp', name: 'magic', label: 'Email for Magic Link' }
	],
	cachedLogins: true,
	logging: { enabled: true, level: 'info', table: 'audit.logs' },
	env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
	routes: { auth: '(public)/auth', data: '(server)/data', logout: '/logout' },
	rules: [{ path: '/public', public: true }]
}

describe('generateConfigFile', () => {
	it('should generate valid kavach.config.js content', () => {
		const content = generateConfigFile(config)
		expect(content).toContain('export default')
		expect(content).toContain("adapter: 'supabase'")
		expect(content).toContain("name: 'google'")
		expect(content).toContain('cachedLogins: true')
		expect(content).toContain("level: 'info'")
		expect(content).toContain("table: 'audit.logs'")
		expect(content).toContain("url: 'PUBLIC_SUPABASE_URL'")
	})
})

describe('generateAuthPage', () => {
	it('should generate auth page with AuthPage when cached logins enabled', () => {
		const content = generateAuthPage(config)
		expect(content).toContain('AuthPage')
		expect(content).toContain("from '@kavach/ui'")
		expect(content).toContain("from '$kavach/providers'")
	})

	it('should generate auth page with AuthProvider when cached logins disabled', () => {
		const content = generateAuthPage({ ...config, cachedLogins: false })
		expect(content).toContain('AuthProvider')
		expect(content).not.toContain('AuthPage')
	})
})

describe('generateDataRoute', () => {
	it('should generate data CRUD server endpoint', () => {
		const content = generateDataRoute()
		expect(content).toContain('export { GET, POST, PUT, PATCH, DELETE } from')
		expect(content).toContain('kavach')
	})
})
