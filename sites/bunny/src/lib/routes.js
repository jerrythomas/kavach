export const routes = {
	roles: {
		public: { routes: [] },
		authenticated: { routes: ['/todos', '/api'] },
		associate: { routes: ['/todos', '/api'] }
	}
}
