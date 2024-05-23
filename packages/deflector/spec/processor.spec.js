import { describe, expect, it } from 'vitest'
import {
	addRulesForAppRoutes,
	getAuthorizedRoutes,
	matchRoute,
	organizeRulesByRole,
	processAppRoutes,
	processRoutingRules
} from '../src/processor'
import { validateRoutingRules } from '../src/validations'

describe('Route Processor', () => {
	describe('processRoutingRules', () => {
		it('should apply default values to routes lacking specific attributes', () => {
			const inputRoutes = validateRoutingRules([{ path: '/home' }])
			const processedRoutes = processRoutingRules(inputRoutes)
			expect(processedRoutes).toEqual([
				{
					path: '/home',
					public: false,
					roles: '*',
					depth: 1
				}
			])
		})

		it('should remove route configurations missing a path', () => {
			const inputRoutes = validateRoutingRules([{}])
			expect(processRoutingRules(inputRoutes)).toEqual([])
		})

		it('should prioritize deeper paths over less specific paths in organization', () => {
			const inputRoutes = validateRoutingRules([
				{ path: '/home' },
				{ path: '/about' }
			])
			const processedRoutes = processRoutingRules(inputRoutes)
			expect(processedRoutes).toEqual([
				{
					path: '/home',
					public: false,
					roles: '*',
					depth: 1
				},
				{
					path: '/about',
					public: false,
					roles: '*',
					depth: 1
				}
			])
		})

		it('should accurately enrich and validate routes with both public and protected settings', () => {
			const inputRoutes = validateRoutingRules([
				{ path: '/public', public: true },
				{ path: '/private', roles: ['admin', 'user'] }
			])
			const processedRoutes = processRoutingRules(inputRoutes)
			expect(processedRoutes).toEqual([
				{
					path: '/public',
					public: true,
					roles: '*',
					depth: 1
				},
				{
					path: '/private',
					public: false,
					roles: ['admin', 'user'],
					depth: 1
				}
			])
		})

		it('should encode special characters', () => {
			const inputRoutes = validateRoutingRules([{ path: '/home/:id' }])
			const processedRoutes = processRoutingRules(inputRoutes)
			expect(processedRoutes).toEqual([
				{
					path: '/home/%3Aid',
					public: false,
					roles: '*',
					depth: 2
				}
			])
		})
	})

	describe('organizeRulesByRole', () => {
		it('should organize routes by role', () => {
			const processedRoutes = processRoutingRules(
				validateRoutingRules([
					{ path: '/home', public: true },
					{ path: '/about', public: true },
					{ path: '/about/me', public: false },
					{ path: '/admin', roles: 'admin' },
					{ path: '/user', roles: 'user' },
					{ path: '/all', roles: ['admin', 'user'] },
					{ path: '/shared' }
				])
			)

			const routesByRole = organizeRulesByRole(processedRoutes)
			expect(routesByRole).toEqual({
				public: [
					{ path: '/home', public: true, roles: '*' },
					{ path: '/about', public: true, roles: '*' }
				],
				protected: {
					'*': [
						{ path: '/about/me', public: false, roles: '*' },
						{ path: '/shared', public: false, roles: '*' }
					],
					admin: [
						{ path: '/admin', public: false, roles: 'admin' },
						{ path: '/all', public: false, roles: ['admin', 'user'] }
					],
					user: [
						{ path: '/user', public: false, roles: 'user' },
						{ path: '/all', public: false, roles: ['admin', 'user'] }
					]
				}
			})
		})
	})

	describe('matchRoute', () => {
		const routesByRole = organizeRulesByRole(
			processRoutingRules(
				validateRoutingRules([
					{ path: '/home', public: true },
					{ path: '/admin', roles: 'admin' },
					{ path: '/user', roles: 'user' },
					{ path: '/all', roles: ['user', 'admin'] }
				])
			)
		)
		const roles = [null, 'user', 'admin', 'other']

		it.each(roles)('should allow public routes when role is [%s]', (role) => {
			const routePath = '/home'
			const authorizedRoutes = getAuthorizedRoutes(routesByRole, role)
			const outcome = matchRoute(authorizedRoutes, routePath, role)
			expect(outcome).toEqual({
				accessible: true,
				rule: { path: '/home', public: true, roles: '*' },
				statusCode: 200
			})
		})

		it('should allow protected routes for role', () => {
			const routePath = '/admin'
			const authorizedRoutes = getAuthorizedRoutes(routesByRole, 'admin')
			const outcome = matchRoute(authorizedRoutes, routePath, 'admin')
			expect(outcome).toEqual({
				accessible: true,
				rule: { path: '/admin', public: false, roles: 'admin' },
				statusCode: 200
			})
		})

		it('should not allow protected route for unauthorised role', () => {
			const routePath = '/admin'
			const authorizedRoutes = getAuthorizedRoutes(routesByRole, 'user')
			const outcome = matchRoute(authorizedRoutes, routePath, 'user')
			expect(outcome).toEqual({ accessible: false, statusCode: 403 })
		})

		it('should not allow protected route for unauthenticated user', () => {
			const routePath = '/admin'
			const authorizedRoutes = getAuthorizedRoutes(routesByRole, null)
			const outcome = matchRoute(authorizedRoutes, routePath, null)
			expect(outcome).toEqual({ accessible: false, statusCode: 401 })
		})

		it.each(roles)('should not allow unknown routes for role [%s]', (role) => {
			const routePath = '/dashboard'
			const authorizedRoutes = getAuthorizedRoutes(routesByRole, role)
			const outcome = matchRoute(authorizedRoutes, routePath, role)
			expect(outcome).toEqual({
				accessible: false,
				statusCode: role === null ? 401 : 403
			})
		})
	})

	describe('processAppRoutes', () => {
		it('should return default routes', () => {
			const routes = processAppRoutes()
			expect(routes).toEqual({
				home: '/',
				login: '/auth',
				logout: '/logout',
				session: '/auth/session',
				unauthorized: null,
				endpoints: ['/api', '/data', '/auth/session']
			})
		})

		it('should return custom routes', () => {
			const routes = processAppRoutes({
				home: '/home',
				login: '/login',
				logout: '/logout',
				session: '/session',
				unauthorized: '/'
			})
			expect(routes).toEqual({
				home: '/home',
				login: '/login',
				logout: '/logout',
				session: '/session',
				unauthorized: '/',
				endpoints: ['/api', '/data', '/session']
			})
		})

		it('should return include session route in endpoints', () => {
			const routes = processAppRoutes({ endpoints: '/api' })
			expect(routes).toEqual({
				home: '/',
				login: '/auth',
				logout: '/logout',
				session: '/auth/session',
				unauthorized: null,
				endpoints: ['/api', '/auth/session']
			})
		})
	})

	describe('getAuthorizedRoutes', () => {
		const routeConfig = organizeRulesByRole(
			processRoutingRules(
				validateRoutingRules([
					{ path: '/home', public: true },
					{ path: '/about', public: true },
					{ path: '/about/me', public: false },
					{ path: '/admin', roles: 'admin' },
					{ path: '/user', roles: 'user' },
					{ path: '/all', roles: ['admin', 'user'] },
					{ path: '/shared' }
				])
			)
		)

		it('should include public routes when user is not authenticated', () => {
			const routes = getAuthorizedRoutes(routeConfig, null)
			expect(routes).toEqual([
				// { path: '/about/me', public: false, roles: '*' },
				{ path: '/home', public: true, roles: '*' },
				{ path: '/about', public: true, roles: '*' }
			])
		})

		it('should include routes for role [user]', () => {
			const routes = getAuthorizedRoutes(routeConfig, 'user')
			expect(routes).toEqual([
				{ path: '/about/me', public: false, roles: '*' },
				{ path: '/home', public: true, roles: '*' },
				{ path: '/about', public: true, roles: '*' },
				{ path: '/user', public: false, roles: 'user' },
				{ path: '/all', public: false, roles: ['admin', 'user'] },
				{ path: '/shared', public: false, roles: '*' }
			])
		})

		it('should include routes for role [admin]', () => {
			const routes = getAuthorizedRoutes(routeConfig, 'admin')
			expect(routes).toEqual([
				{ path: '/about/me', public: false, roles: '*' },
				{ path: '/home', public: true, roles: '*' },
				{ path: '/about', public: true, roles: '*' },
				{ path: '/admin', public: false, roles: 'admin' },
				{ path: '/all', public: false, roles: ['admin', 'user'] },
				{ path: '/shared', public: false, roles: '*' }
			])
		})

		it('should include routes for role [unknown]', () => {
			const routes = getAuthorizedRoutes(routeConfig, 'unknown')
			expect(routes).toEqual([
				{ path: '/about/me', public: false, roles: '*' },
				{ path: '/home', public: true, roles: '*' },
				{ path: '/about', public: true, roles: '*' },
				{ path: '/shared', public: false, roles: '*' }
			])
		})
	})

	describe('addRulesForAppRoutes', () => {
		it('should add rules for app routes', () => {
			const appRoutes = processAppRoutes({
				login: '/login',
				session: '/session',
				home: '/home'
			})
			const rules = addRulesForAppRoutes([], appRoutes)
			expect(rules).toEqual([
				{ path: '/login', public: true },
				{ path: '/session', public: true },
				{ path: '/home', public: false },
				{ path: '/logout', public: false }
				// { path: '/', public: false }
			])
		})

		it('should add rules with custom config', () => {
			const appRoutes = processAppRoutes({
				login: '/login',
				session: '/session',
				unauthorized: '/unauthorized',
				endpoints: ['/api', '/data']
			})
			const config = {
				endpoints: { public: false }
			}
			const rules = addRulesForAppRoutes([], appRoutes, config)
			expect(rules).toEqual([
				{ path: '/api', public: false },
				{ path: '/data', public: false },
				{ path: '/login', public: true },
				{ path: '/session', public: true },
				{ path: '/', public: false },
				{ path: '/logout', public: false },
				{ path: '/unauthorized', public: false }
			])
		})
	})
})
