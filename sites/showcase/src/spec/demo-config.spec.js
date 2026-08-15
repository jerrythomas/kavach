import { describe, it, expect } from 'vitest'
import {
	ADAPTERS,
	ADAPTER_PROVIDERS,
	ROUTES,
	RULES,
	ROUTE_ACCESS,
	COPY,
	isLive
} from '../lib/config/demo-config.js'

describe('demo-config', () => {
	it('defines the three live adapters', () => {
		for (const id of ['supabase', 'firebase', 'convex']) {
			expect(ADAPTERS[id]).toBeDefined()
			expect(ADAPTERS[id].label).toBeTruthy()
			expect(ADAPTERS[id].pkg).toMatch(/^@kavach\//)
		}
	})

	it('flags auth0 and amplify as not live', () => {
		expect(isLive('auth0')).toBe(false)
		expect(isLive('amplify')).toBe(false)
		expect(isLive('supabase')).toBe(true)
	})

	it('defines the demo routes', () => {
		expect(ROUTES).toEqual({
			auth: '/auth',
			data: '/data',
			logout: '/logout',
			home: '/dashboard'
		})
	})

	it('rule set matches the feature spec', () => {
		expect(RULES).toContainEqual({ path: '/', public: true })
		expect(RULES).toContainEqual({ path: '/auth', public: true })
		expect(RULES).toContainEqual({ path: '/dashboard', roles: '*' })
		expect(RULES).toContainEqual({ path: '/admin', roles: ['admin'] })
		expect(RULES).toContainEqual({ path: '/data', roles: '*' })
		expect(RULES).toContainEqual({ path: '/data/facts', roles: '*' })
		expect(RULES).toContainEqual({ path: '/data/admin-stats', roles: ['admin'] })
	})

	it('every ROUTES entry and key protected path appears in RULES or ROUTE_ACCESS', () => {
		const rulePaths = new Set([...RULES.map((r) => r.path), ...ROUTE_ACCESS.map((r) => r.path)])
		for (const route of [ROUTES.auth, ROUTES.home, ROUTES.data, '/admin']) {
			expect(rulePaths.has(route)).toBe(true)
		}
	})

	it('route access marks admin-only route denied for non-admins', () => {
		const admin = ROUTE_ACCESS.find((r) => r.path === '/admin')
		expect(admin).toMatchObject({ roles: ['admin'], allowed: false })
	})

	it('defines providers for each live adapter', () => {
		expect(ADAPTER_PROVIDERS.supabase.length).toBeGreaterThan(0)
		expect(ADAPTER_PROVIDERS.firebase.length).toBeGreaterThan(0)
		expect(ADAPTER_PROVIDERS.convex.length).toBeGreaterThan(0)
	})

	it('centralises demo copy', () => {
		expect(COPY.signIn.title).toBe('Sign in')
		expect(COPY.demo.data.title).toBe('Space Facts')
	})
})
