export const routes = {
	rules: [
		{ path: '/public', public: true },
		{ path: '/data', roles: '*' },
		{ path: '/admin', roles: ['admin'] }
	]
}
