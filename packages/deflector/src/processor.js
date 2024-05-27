import { clone, omit, pick } from 'ramda'
import { routeDepth } from './utils'

const appRouteKeys = [
	'home',
	'login',
	'logout',
	'session',
	'endpoints',
	'unauthorized'
]

/** @type {import('./types').AppRoute} */
const defaultAppRoutes = {
	home: '/',
	login: '/auth',
	logout: '/logout',
	session: '/auth/session',
	unauthorized: null,
	endpoints: ['/api', '/data']
}

const defaultRouteRules = {
	login: { public: true },
	session: { public: true },
	home: { public: false },
	logout: { public: false },
	unauthorized: { public: false }
}

/**
 * Processes an array of route definitions by enriching with default values
 * and organizing them for efficient matching.
 *
 * @param {import('./types').RoutingRules}  rules - the routes, with errors excluded and enriched
 * @return {import('./types').RoutingRules} The enriched and structured route definitions.
 */
export function processRoutingRules(rules) {
	const enrichedRoutes = rules
		.filter((route) => !route.errors)
		.map((route) => ({
			...route,
			path: encodeURIComponent(route.path).replace(/%2F/g, '/')
		}))
		.sort((a, b) => b.depth - a.depth)

	return enrichedRoutes
}

/**
 * Organize routes by role, separating public routes for optimized access checks.
 *
 * @param {import('./types').RoutingRules} processedRoutes - Processed route definitions.
 * @return {import('./types').RoutingConfig} Organized routes, including a distinct entry for public routes.
 */
export function organizeRulesByRole(processedRoutes) {
	const routesByRole = { public: [], protected: {} }

	processedRoutes.forEach((route) => {
		if (route.public) {
			routesByRole.public.push(omit(['depth'], route))
		} else {
			const roles = Array.isArray(route.roles) ? route.roles : [route.roles]
			roles.forEach((role) => {
				if (!routesByRole.protected[role]) routesByRole.protected[role] = []
				routesByRole.protected[role].push(omit(['depth'], route))
			})
		}
	})
	return routesByRole
}

/**
 * Get authorized routes for a role. This will simplify the route matching process.
 *
 * @param {import('./types').RoutingConfig} config - Routes organized by public and protected roles.
 * @param {String}                          userRole     - User's role or null if unauthenticated.
 * @return {import('./types').RoutingRules} Authorized routes for the user's role.
 */
export function getAuthorizedRoutes(config, userRole) {
	let routes = [...config.public]

	if (userRole) {
		routes = [
			...routes,
			...(config.protected[userRole] || []),
			...config.protected['*']
		].sort((a, b) => routeDepth(b.path) - routeDepth(a.path))
	}

	return routes
}

/**
 * Get restricted routes for a role. This will allow us to have .
 *
 * @param {import('./types').RoutingConfig} config - Routes organized by public and protected roles.
 * @param {String}                          userRole     - User's role or null if unauthenticated.
 */
export function getRestrictedRoutes(config, userRole) {
	const restricted = []
	Object.keys(config.protected)
		.filter((role) => role !== '*' && role !== userRole)
		.forEach((role) => {
			config.protected[role].forEach((route) => {
				if (!Array.isArray(route.roles) || !route.roles.includes(role)) {
					if (!restricted.find((x) => x.path === route.path))
						restricted.push(route)
				}
			})
		})

	return restricted.sort((a, b) => routeDepth(b.path) - routeDepth(a.path))
}
/**
 * Use provided routes or use defaults for pages
 *
 * @param {import('./types').DeflectorOptions} appRoutes
 * @returns {import('./types').AppRoute}
 */
export function processAppRoutes(appRoutes) {
	const routes = pick(appRouteKeys, {
		...clone(defaultAppRoutes),
		...appRoutes
	})

	if (!Array.isArray(routes.endpoints)) {
		routes.endpoints = [routes.endpoints]
	}

	if (!routes.endpoints.includes(routes.session)) {
		routes.endpoints.push(routes.session)
	}

	return routes
}

/**
 * Add rules for the default app routes
 *
 * @param {import('./types').RoutingRules} rules
 * @param {import('./types').AppRoute}     appRoutes
 * @returns {import('./types').RoutingRules}
 */
export function addRulesForAppRoutes(rules, appRoutes, options = {}) {
	options = { ...options, ...defaultRouteRules }

	Object.entries(options).forEach(([route, config]) => {
		const paths = Array.isArray(appRoutes[route])
			? appRoutes[route]
			: [appRoutes[route]]

		paths
			.filter((path) => path)
			.forEach((path) => {
				rules = rules.filter((rule) => rule.path !== path)
				const matchChild = rules.find(
					(rule) =>
						path.startsWith(`${rule.path}/`) && rule.public === config.public
				)
				if (!matchChild) rules.push({ path, ...config })
			})
	})

	return rules
}
