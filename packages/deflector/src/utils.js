/**
 * Get the depth of the route
 *
 * @param {string} route
 * @returns {number}
 */
export function routeDepth(route) {
	return typeof route === 'string' ? route.split('/').length - 1 : 0
}

/**
 * Fill in missing properties for a route
 *
 * @param {import('./types').Route} route
 * @returns {import('./types').Route}
 */
export function fillMissingProps(route) {
	return {
		public: false,
		roles: '*',
		...route,
		depth: routeDepth(route.path)
	}
}

/**
 * Find the route that matches the path
 *
 * @param {Array<string>} routes
 * @param {string}        path
 * @returns {string}
 */
export function findMatchingRoute(routes, path) {
	return routes.find((route) => path === route || path.startsWith(`${route}/`))
}

/**
 * Check if a route is an endpoint route
 *
 * @param {Array<string>} endpoints
 * @param {string}        route
 * @returns {boolean}
 */
export function isEndpointRoute(endpoints, route) {
	const match = findMatchingRoute(endpoints, route)
	return Boolean(match)
}

/**
 * Get redirect paths for various app routes
 *
 * @param {import('./types').AppRoute} app
 * @returns {import('./types').Redirects}
 */
export function getRedirects(app) {
	return {
		401: app.login,
		403: app.unauthorized ?? app.home,
		302: app.home
	}
}
