export const routes = {
	rules: [
		{ path: '/public', public: true },
		{ path: '/todos', roles: '*' },
		{ path: '/api', roles: '*' }
	]
	// roles: {
	// 	public: { routes: ['/public'] },
	// 	authenticated: { routes: ['/todos', '/api'] },
	// 	associate: { routes: ['/todos', '/api'] }
	// }
}
