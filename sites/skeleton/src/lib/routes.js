export const routes = {
	roles: {
		public: { routes: [] },
		authenticated: { routes: ['/todos'] },
		associate: { routes: ['/todos'] }
	}
}
