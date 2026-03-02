export const options = [
	['set custom home page', { app: { home: '/home' } }],
	['set custom login page', { app: { login: '/login' } }],
	['set all custom page routes', { app: { home: '/home', login: '/login' } }],
	['exclude unused page route', { app: { invalid: '/invalid' } }],
	['set custom logout page', { app: { logout: '/api/logout' } }],
	['set custom session endpoint', { app: { session: '/api/session' } }],
	['exclude unused endpoint route', { app: { invalid: '/invalid' } }],
	[
		'set all custom endpoints and page routes',
		{
			app: {
				home: '/home',
				login: '/login',
				logout: '/api/logout',
				session: '/api/session'
			}
		}
	]
]
