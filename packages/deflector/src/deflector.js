import { zeroLogger } from '@kavach/logger'

/**
 * Create a deflector using provided options
 *
 * @param {import('./types').DeflectorOptions} options
 * @returns {import('./types').Deflector}
 */
// eslint-disable-next-line max-lines-per-function
export function createDeflector(options = {}) {
	const appRoutes = getAppRoutes(options)
	const routesByRole = getRoutesByRole(options, appRoutes)
	const logger = options.logger ?? zeroLogger

	let isAuthenticated = false
	let authorizedRoutes = []
	let role = 'public'

	const setSession = (/** @type {import('./types').AuthSession} */ session) => {
		role = session?.user?.role ?? 'public'

		isAuthenticated = role !== 'public'
		authorizedRoutes = [...routesByRole.public.routes]

		if (isAuthenticated && role in routesByRole) {
			authorizedRoutes = [...authorizedRoutes, ...routesByRole[role].routes]
		} else {
			authorizedRoutes = [...authorizedRoutes]
		}
	}

	const redirect = (route) => {
		let isAllowed = false

		isAllowed = isRouteAllowed(route, authorizedRoutes)
		const redirectedTo = isAllowed
			? route
			: isAuthenticated
				? routesByRole[role].home //appRoutes.home
				: appRoutes.login

		logger.debug({
			module: 'deflector',
			method: 'redirect',
			data: {
				role,
				route,
				isAuthenticated,
				isAllowed,
				authorizedRoutes,
				redirectedTo
			}
		})

		return redirectedTo
	}

	setSession()
	return {
		page: appRoutes,
		setSession,
		redirect,
		isAuthenticated,
		authorizedRoutes
	}
}

/**
 * Use provided routes or use defaults for pages
 *
 * @param {import('./types').DeflectorOptions} options
 * @returns {import('./types').AppRoute}
 */
export function getAppRoutes(options) {
	return {
		home: options?.app?.home ?? '/',
		login: options?.app?.login ?? '/auth',
		logout: options?.app?.logout ?? '/logout',
		session: options?.app?.session ?? '/auth/session'
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
	const roleRoutes = [...new Set([...routes, ...defaultRoutes])].sort()

	for (let i = 0; i < roleRoutes.length; i++) {
		const current = roleRoutes[i]

		for (let j = i + 1; j < roleRoutes.length; j++) {
			//eslint-disable-next-line max-depth
			while (j < roleRoutes.length && roleRoutes[j].startsWith(`${current}/`)) {
				roleRoutes.splice(j, 1)
			}
		}
	}
	return roleRoutes
}

/**
 * Configure routes by role
 *
 * @param {import('./types').DeflectorOptions} options
 * @param {import('./types').AppRoute} appRoutes
 * @returns {Record<string, import('./types').RoleRoute>}
 */
export function getRoutesByRole(options, appRoutes) {
	const routesByRole = {
		public: { home: appRoutes.home, routes: [] },
		authenticated: { home: appRoutes.home, routes: [] }
	}

	options.roles = { ...routesByRole, ...options.roles }

	Object.entries(options.roles).forEach(([role, roleRoutes]) => {
		const defaultRoutes =
			role === 'public' ? [] : [appRoutes.home, appRoutes.logout]

		routesByRole[role] = {
			home: roleRoutes.home ?? appRoutes.home,
			routes: cleanupRoles(
				removeAppRoutes(roleRoutes.routes, appRoutes),
				defaultRoutes
			)
		}
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
			route === allowedRoutes[i] || route.startsWith(`${allowedRoutes[i]}/`)
	}
	return isAllowed
}

/**
 * Remove duplicate routes from a dictionary of routes
 *
 * @param {Array<string>} routes
 * @param {import('./types').AppRoute} appRoutes
 * @returns
 */
export function removeAppRoutes(routes, appRoutes) {
	Object.values(appRoutes).forEach((route) => {
		let index = 0
		do {
			index = routes.findIndex((path) => path === route)
			if (index !== -1) routes.splice(index, 1)
		} while (index > -1)
	})
	return routes
}
