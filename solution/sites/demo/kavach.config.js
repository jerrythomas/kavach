export default {
	adapter: 'supabase',
	providers: [
		{ name: 'azure', label: 'Continue With Azure', scopes: ['email', 'profile'] }
	],
	cachedLogins: false,
	logging: {
		level: 'info',
		table: 'audit.logs'
	},
	env: {
		url: 'PUBLIC_SUPABASE_URL',
		anonKey: 'PUBLIC_SUPABASE_ANON_KEY'
	},
	routes: {
		auth: '(public)/auth',
		data: '(server)/data',
		logout: '/logout'
	},
	rules: [
		{ path: '/public', public: true },
		{ path: '/data', roles: '*' },
		{ path: '/admin', roles: ['admin'] }
	]
}
