/**
 * Create a deflector using provided options
 *
 * @param {import('./types').DeflectorOptions} options
 * @returns
 */
export function createDeflector(options = {}) {
	const page = getPageRoutes(options)
	// const endpoint = getEndpointRoutes(options)
	const routesByRole = getRoutesByRole(options, page) //, endpoint)

	let isAuthenticated = false
	let authorizedRoutes = []
	let role = 'public'

	const setSession = (session) => {
		role = session?.user?.role ?? 'public'

		isAuthenticated = role !== 'public'
		authorizedRoutes = [...routesByRole['public']]

		if (isAuthenticated && role in routesByRole) {
			authorizedRoutes = [...authorizedRoutes, ...routesByRole[role]]
		} else {
			authorizedRoutes = [...authorizedRoutes]
		}
		// console.log('set deflector role', role, isAuthenticated, authorizedRoutes)
	}

	const redirect = (route) => {
		let isAllowed = false
		// if (!route !== page || isAuthenticated) {
		isAllowed = isRouteAllowed(route, authorizedRoutes)
		console.log(
			'role:',
			role,
			'route:',
			route,
			isAuthenticated,
			isAllowed,
			authorizedRoutes
		)

		// }
		return isAllowed ? route : isAuthenticated ? page.home : page.login
	}

	setSession()
	return {
		page,
		// endpoint,
		setSession,
		redirect,
		isAuthenticated,
		authorizedRoutes
	}
}

// /**
//  * Use provided routes or use defaults for endpoints
//  *
//  * @param {import('./types').DeflectorOptions} options
//  * @returns {import('./types').EndpointRoutes}
//  */
// export function getEndpointRoutes(options) {
// 	return {
// 		login: options?.endpoint?.login ?? '/auth/signin',
// 		logout: options?.endpoint?.logout ?? '/auth/signout',
// 		session: options?.endpoint?.session ?? '/auth/session'
// 	}
// }

/**
 * Use provided routes or use defaults for pages
 *
 * @param {import('./types').DeflectorOptions} options
 * @returns {import('./types').PageRoutes}
 */
export function getPageRoutes(options) {
	return {
		home: options?.page?.home ?? '/',
		login: options?.page?.login ?? '/auth',
		logout: options?.page?.logout ?? '/logout',
		session: options?.page?.session ?? '/auth/session'
	}
}

/**
 * Using input array of routes combine with defaultRoutes and
 * remove duplicates and child routes if parent is already in the list
 *
 * @param {Array<string>} routes
 * @param {Array<string>} defaultRoutes
 * @returns {Array<string>}
 */
export function cleanupRoles(routes, defaultRoutes) {
	let roleRoutes = [...new Set([...routes, ...defaultRoutes])].sort()

	for (let i = 0; i < roleRoutes.length; i++) {
		const current = roleRoutes[i]

		for (let j = i + 1; j < roleRoutes.length; j++) {
			while (j < roleRoutes.length && roleRoutes[j].startsWith(current + '/')) {
				roleRoutes.splice(j, 1)
			}
		}
	}
	return roleRoutes
}

/**
 * Configure routes by role
 *
 * @param {object<string, Array<string>>} options
 * @param {import('./types').PageRoutes} page
 * @returns {object<string, Array<string>>}
 */
export function getRoutesByRole(options, page) {
	let routesByRole = {
		public: [],
		authenticated: []
	}

	options.routes = { ...routesByRole, ...options.routes }

	Object.entries(options.routes).map(([role, routes]) => {
		const defaultRoutes = role === 'public' ? [] : [page.home, page.logout]
		// remove routes for login, home, logout and session from rutes by role
		routesByRole[role] = cleanupRoles(routes, defaultRoutes)
	})

	return routesByRole
}

/**
 * Identifies if a route matches one of the allowed routes
 *
 * @param {string} route
 * @param {Array<string>} allowedRoutes
 * @returns {boolean}
 */
export function isRouteAllowed(route, allowedRoutes) {
	let isAllowed = false

	for (let i = 0; i < allowedRoutes.length && !isAllowed; i++) {
		isAllowed =
			route === allowedRoutes[i] || route.startsWith(allowedRoutes[i] + '/')
	}
	return isAllowed
}
