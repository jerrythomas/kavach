import { zeroLogger } from '@kavach/logger'
import {
	addRulesForAppRoutes,
	organizeRulesByRole,
	getAuthorizedRoutes,
	processAppRoutes,
	processRoutingRules
} from './processor'
import { validateRoutingRules } from './validations'
import { findMatchingRoute, isEndpointRoute, getRedirects } from './utils'

/**
 * Create a deflector using provided options
 *
 * @param {import('./types').DeflectorOptions} options
 * @returns {import('./types').Deflector}
 */
export function createDeflector(options = {}) {
	const logger = options.logger ?? zeroLogger
	const config = configureRules(options, logger)

	let routeConfig = configureRoleRoutes(config, null)

	const setSession = (/** @type {import('./types').AuthSession} */ session) => {
		routeConfig = configureRoleRoutes(config, session?.user?.role ?? null)
	}
	const redirect = (path) => {
		if (routeConfig.role && path === config.app.login) {
			return {
				redirect: config.app.home,
				statusCode: 302
			}
		}
		return protectRoute(routeConfig, path)
	}

	return {
		setSession,
		redirect
	}
}

/**
 * Validate rules, log errors and warnings, and configure the rules.
 *
 * @param {import('./types').DeflectorOptions} options
 * @param {import('./types').Logger}           logger
 * @returns {import('./types').RoutingConfig}
 */
export function configureRules(options, logger) {
	const logInfo = { module: 'deflector', method: 'configure' }
	let { rules = [] } = options
	const appRoutes = processAppRoutes(options.app)

	rules = addRulesForAppRoutes(rules, appRoutes)
	rules = validateRoutingRules(rules)

	const errors = rules.filter((rule) => Array.isArray(rule.errors))
	if (errors.length)
		logger.error({
			...logInfo,
			data: { errors },
			message: 'invalid rules detected'
		})

	const warnings = rules.filter((rule) => Array.isArray(rule.warnings))
	if (warnings.length)
		logger.warn({
			...logInfo,
			data: { warnings },
			message: 'identified redundant rules'
		})

	rules = processRoutingRules(rules)
	rules = organizeRulesByRole(rules, appRoutes)

	return { app: appRoutes, ...rules }
}

/**
 * Check if login redirect is needed
 *
 * @param {string} role
 * @param {string} path
 * @param {import('./types').AppRoutes} app
 */
function checkLoginRedirect(role, path, app) {
	if (role && path === app.login) return { statusCode: 302, redirect: app.home }
	return null
}

/**
 * Find a matching route for the given path
 *
 * @param {import('./types').RoutingRules} rules
 * @param {string}                         path
 */
function findMatch(rules, path) {
	const match = findMatchingRoute(rules, path)
	if (match) return { statusCode: 200 }

	return null
}

/**
 * Get the status code for the given role and path
 *
 * @param {string} role
 * @param {import('./types').AppRoutes} app
 * @param {string} path
 */
function getStatusCode(role, app, path) {
	const redirects = getRedirects(app)
	const statusCode = role ? 403 : 401

	if (isEndpointRoute(app.endpoints, path)) return { statusCode }

	return { redirect: redirects[statusCode], statusCode }
}

/**
 * Protect a route and provide a redirect/response if not allowed.
 *
 * @param {import('./types').AllowedRoutes} allowedRoutes
 * @param {string}                          path
 */
export function protectRoute(allowedRoutes, path) {
	const { app, rules, role } = allowedRoutes

	// Check if login redirect is needed
	const loginRedirect = checkLoginRedirect(role, path, app)
	if (loginRedirect) return loginRedirect

	// Check for route match
	const match = findMatch(rules, path)
	if (match) return match

	// Get status code and return final result
	return getStatusCode(role, app, path)
}

/**
 * Configure the routes for current role
 *
 * @param {import('./types').RoutingConfig} config
 * @param {string}                          role
 * @returns {import('./types').AllowedRoutes}
 */
export function configureRoleRoutes(config, role) {
	return {
		app: config.app,
		rules: getAuthorizedRoutes(config, role),
		role
	}
}
