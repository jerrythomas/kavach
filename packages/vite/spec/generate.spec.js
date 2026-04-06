import { describe, it, expect } from 'vitest'
import { generateModule } from '../src/generate.js'

const firebaseConfig = {
	adapter: 'firebase',
	providers: [],
	cachedLogins: false,
	logging: { level: 'info', collection: 'audit', table: 'logs', entity: undefined },
	env: {
		apiKey: 'PUBLIC_FIREBASE_API_KEY',
		projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
		appId: 'PUBLIC_FIREBASE_APP_ID'
	},
	routes: { auth: '/auth', data: '/data', rpc: '/rpc', logout: '/logout', home: null },
	rules: []
}

const convexConfig = {
	adapter: 'convex',
	providers: [],
	cachedLogins: false,
	logging: { level: 'warn', table: 'logs', collection: undefined, entity: 'events' },
	env: { url: 'PUBLIC_CONVEX_URL' },
	routes: { auth: '/auth', data: '/data', rpc: '/rpc', logout: '/logout', home: null },
	rules: []
}

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
	routes: { auth: '(public)/auth', data: '(server)/data', logout: '/logout', home: null },
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

	it('should generate $kavach/auth module for firebase', () => {
		const viteEnv = {
			PUBLIC_FIREBASE_API_KEY: 'test-key',
			PUBLIC_FIREBASE_PROJECT_ID: 'test-proj',
			PUBLIC_FIREBASE_APP_ID: 'test-app'
		}
		const code = generateModule('auth', firebaseConfig, viteEnv)
		expect(code).toContain("from '@kavach/adapter-firebase'")
		expect(code).toContain('initializeApp')
		expect(code).toContain('"test-key"') // literal value embedded at build time
		expect(code).toContain("collection: 'audit'")
		expect(code).toContain("level: 'info'")
	})

	it('should generate $kavach/auth module for convex', () => {
		const code = generateModule('auth', convexConfig)
		expect(code).toContain("from '@kavach/adapter-convex'")
		expect(code).toContain('ConvexClient')
		expect(code).toContain('env.PUBLIC_CONVEX_URL')
		expect(code).toContain("level: 'warn'")
		// Convex template intentionally omits getLogWriter (requires user's api import)
		// and uses null writer — getLogger(null) returns a safe no-op zero logger
		expect(code).not.toContain('getLogWriter')
		expect(code).toContain('getLogger(null')
	})

	it('forwards routes to app config — auth maps to login', () => {
		const code = generateModule('auth', config)
		// routes.auth: '(public)/auth' should appear as login in the app object
		expect(code).toContain("login: '(public)/auth'")
		expect(code).toContain("logout: '/logout'")
		expect(code).toContain("data: '(server)/data'")
	})

	it('should throw for unknown module', () => {
		expect(() => generateModule('unknown', config)).toThrow('Unknown virtual module')
	})

	it('serializes a function home into the generated auth module', () => {
		const fn = (session) => `/${session.user.user_metadata.slug}`
		const configWithFnHome = {
			...config,
			routes: { ...config.routes, home: fn }
		}
		const code = generateModule('auth', configWithFnHome)
		expect(code).toContain('home:')
		expect(code).toContain('session.user.user_metadata.slug')
	})

	it('includes session in app when routes.session is configured', () => {
		const configWithSession = {
			...config,
			routes: { ...config.routes, session: '/api/session' }
		}
		const code = generateModule('auth', configWithSession)
		expect(code).toContain("session: '/api/session'")
	})
})

describe('generateAuth - firebase emulator', () => {
	it('includes connectAuthEmulator call when authEmulatorHost is configured', () => {
		const config = {
			adapter: 'firebase',
			env: {
				apiKey: 'PUBLIC_FIREBASE_API_KEY',
				projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
				appId: 'PUBLIC_FIREBASE_APP_ID',
				authEmulatorHost: 'PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'
			},
			logging: { level: 'error', collection: 'logs' },
			routes: { home: null },
			rules: []
		}
		const viteEnv = { PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: 'http://127.0.0.1:9099' }
		const output = generateModule('auth', config, viteEnv)
		expect(output).toContain('connectAuthEmulator')
		expect(output).toContain('"http://127.0.0.1:9099"') // emulator host embedded as literal
	})

	it('omits connectAuthEmulator when authEmulatorHost is not configured', () => {
		const config = {
			adapter: 'firebase',
			env: {
				apiKey: 'PUBLIC_FIREBASE_API_KEY',
				projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
				appId: 'PUBLIC_FIREBASE_APP_ID'
			},
			logging: { level: 'error', collection: 'logs' },
			routes: { home: null },
			rules: []
		}
		const output = generateModule('auth', config)
		expect(output).not.toContain('connectAuthEmulator')
	})
})
