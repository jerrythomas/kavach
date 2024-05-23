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
	return routes.find(
		(route) => path === route.path || path.startsWith(`${route.path}/`)
	)
}

/**
 * Check if a route is an endpoint route
 *
 * @param {Array<string>} endpoints
 * @param {string}        route
 * @returns {boolean}
 */
export function isEndpointRoute(endpoints, route) {
	const match = findMatchingRoute(
		endpoints.map((path) => ({ path })),
		route
	)
	return Boolean(match)
}
