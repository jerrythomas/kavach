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
		home: '/',
		auth: '/auth',
		data: '/data',
		logout: '/logout'
	},
	rules: [
		{ path: '/', public: true },
		{ path: '/demo', roles: '*' },
		{ path: '/data', roles: '*' },
		{ path: '/admin', roles: ['admin'] }
	]
}
