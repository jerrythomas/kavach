const ADAPTER_CONFIGS = {
	supabase: {
		env: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
		providers: [
			{ name: 'google', label: 'Continue with Google' },
			{ mode: 'otp', name: 'magic', label: 'Email Magic Link' }
		],
		logging: { level: 'error', table: 'audit.logs' }
	},
	firebase: {
		env: {
			apiKey: 'PUBLIC_FIREBASE_API_KEY',
			projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
			appId: 'PUBLIC_FIREBASE_APP_ID',
			authEmulatorHost: 'PUBLIC_FIREBASE_AUTH_EMULATOR_HOST'
		},
		providers: [
			{ name: 'google', label: 'Continue with Google' },
			{ mode: 'otp', name: 'magic', label: 'Email Magic Link' }
		],
		logging: { level: 'error', collection: 'logs' }
	},
	convex: {
		env: { url: 'PUBLIC_CONVEX_URL' },
		providers: [{ name: 'google', label: 'Continue with Google' }],
		logging: { level: 'error', entity: 'logs' }
	}
}

const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'
if (!ADAPTER_CONFIGS[adapter]) {
	throw new Error(
		`Unknown KAVACH_ADAPTER: "${adapter}". Valid options: ${Object.keys(ADAPTER_CONFIGS).join(', ')}`
	)
}

export default {
	adapter,
	...ADAPTER_CONFIGS[adapter],
	routes: {
		auth: '/auth',
		data: '/data',
		logout: '/logout'
	},
	rules: [
		{ path: '/', public: true },
		{ path: '/auth', public: true },
		{ path: '/dashboard', roles: '*' },
		{ path: '/admin', roles: ['admin'] },
		{ path: '/data', roles: '*' },
		{ path: '/data/facts', roles: '*' },
		{ path: '/data/admin-stats', roles: ['admin'] }
	]
}
