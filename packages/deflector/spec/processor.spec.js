import { describe, expect, it } from 'vitest'
import {
	addRulesForAppRoutes,
	getAuthorizedRoutes,
	getRestrictedRoutes,
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
				unauthorized: '/',
				endpoints: ['/api', '/data', '/session']
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
	describe('getRestrictedRoutes', () => {
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

		it('should include all protected routes when not authenticated', () => {
			const routes = getRestrictedRoutes(routeConfig, 'unknown')
			expect(routes).toEqual([
				{
					path: '/admin',
					public: false,
					roles: 'admin'
				},
				{
					path: '/all',
					public: false,
					roles: ['admin', 'user']
				},
				{
					path: '/user',
					public: false,
					roles: 'user'
				}
			])
		})
		it('should include routes which exclude role = user', () => {
			const routes = getRestrictedRoutes(routeConfig, 'user')
			expect(routes).toEqual([
				{
					path: '/admin',
					public: false,
					roles: 'admin'
				}
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
