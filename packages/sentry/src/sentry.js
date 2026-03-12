import { zeroLogger } from '@kavach/logger'
import {
	addRulesForAppRoutes,
	organizeRulesByRole,
	getAuthorizedRoutes,
	processAppRoutes,
	processRoutingRules,
	getRestrictedRoutes
} from './processor'
import { validateRoutingRules } from './validations'
import { findMatchingRoute, isEndpointRoute, getRedirects } from './utils'

/**
 * Validate rules, log errors and warnings, and configure the rules.
 *
 * @param {import('./types').SentryOptions} options
 * @param {import('./types').Logger}          logger
 * @returns {import('./types').RoutingConfig}
 */
export function configureRules(options, logger) {
	const logInfo = { module: 'sentry', method: 'configure' }
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
	if (role && path === app.login) return { status: 302, redirect: app.home }
	return null
}

/**
 * Get the status code for the given role and path
 *
 * @param {string} role
 * @param {import('./types').AppRoutes} app
 * @param {string} path
 * @param {string|number|undefined} fallback
 */
function getRedirectResponse(role, app, path, fallback) {
	const redirects = getRedirects(app)
	const status = role ? 403 : 401

	if (isEndpointRoute(app.endpoints, path)) return { status }

	if (fallback !== undefined) {
		if (typeof fallback === 'number') return { status: fallback }
		return { redirect: fallback, status }
	}

	return { redirect: redirects[status], status }
}

/**
 * Protect a route and provide a redirect/response if not allowed.
 *
 * @param {import('./types').AllowedRoutes} allowedRoutes
 * @param {string}                          path
 */
export function protectRoute(allowedRoutes, path) {
	const { app, routes, role } = allowedRoutes

	// Check if login redirect is needed
	const loginRedirect = checkLoginRedirect(role, path, app)
	if (loginRedirect) return loginRedirect

	const restrictedMatch = findMatchingRoute(routes.restricted, path)
	if (!restrictedMatch) {
		const allowedMatch = findMatchingRoute(routes.allowed, path)
		if (allowedMatch) return { status: 200 }
	}

	const fallback =
		restrictedMatch && typeof restrictedMatch === 'object' ? restrictedMatch.fallback : undefined

	// Get status code and return final result
	return getRedirectResponse(role, app, path, fallback)
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
		routes: {
			allowed: getAuthorizedRoutes(config, role).map((rule) => rule.path),
			restricted: getRestrictedRoutes(config, role).map((rule) =>
				rule.fallback !== undefined ? { path: rule.path, fallback: rule.fallback } : rule.path
			)
		},
		role
	}
}

/**
 * Create a sentry using provided options
 *
 * @param {import('./types').SentryOptions} options
 * @returns {import('./types').Sentry}
 */
export function createSentry(options = {}) {
	const logger = options.logger ?? zeroLogger
	const config = configureRules(options, logger)

	let sessionConfig = configureRoleRoutes(config, null)

	const setSession = (/** @type {import('./types').AuthSession} */ session) => {
		sessionConfig = configureRoleRoutes(config, session?.user?.role ?? null)
	}
	const protect = (path) => protectRoute(sessionConfig, path)

	return {
		app: config.app,
		setSession,
		protect,
		rpc: options.rpc
	}
}
