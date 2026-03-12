export default {
	adapter: 'supabase',
	providers: [
		{
			mode: 'otp',
			name: 'magic',
			label: 'Email for Magic Link'
		},
		{
			mode: 'password',
			name: 'email',
			label: 'Sign in using'
		}
	],
	cachedLogins: true,
	logging: {
		level: 'error',
		table: 'audit.logs'
	},
	env: {
		url: 'PUBLIC_SUPABASE_URL',
		anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
	},
	routes: {
		auth: '/auth',
		data: '/data',
		rpc: '/rpc',
		logout: '/logout'
	},
	rules: [
		{ path: '/', public: true },
		{ path: '/docs', public: true },
		{ path: '/auth', public: true },
		{ path: '/demo', public: true },
		// Authenticated demo routes — one set per platform
		{ path: '/demo/supabase/dashboard', roles: '*' },
		{ path: '/demo/supabase/data', roles: '*' },
		{ path: '/demo/supabase/admin', roles: ['admin'] },
		{ path: '/demo/firebase/dashboard', roles: '*' },
		{ path: '/demo/firebase/data', roles: '*' },
		{ path: '/demo/firebase/admin', roles: ['admin'] },
		{ path: '/demo/auth0/dashboard', roles: '*' },
		{ path: '/demo/auth0/data', roles: '*' },
		{ path: '/demo/auth0/admin', roles: ['admin'] },
		{ path: '/demo/amplify/dashboard', roles: '*' },
		{ path: '/demo/amplify/data', roles: '*' },
		{ path: '/demo/amplify/admin', roles: ['admin'] },
		{ path: '/demo/convex/dashboard', roles: '*' },
		{ path: '/demo/convex/data', roles: '*' },
		{ path: '/demo/convex/admin', roles: ['admin'] },
		// Data API routes
		{ path: '/data/facts', roles: '*' },
		{ path: '/data/admin-stats', roles: ['admin'] }
	]
}
