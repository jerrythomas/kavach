export const routes = {
	roles: {
		public: { routes: ['/public'] },
		authenticated: { routes: ['/todos', '/api'] },
		associate: { routes: ['/todos', '/api'] }
	}
}
