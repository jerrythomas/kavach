import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	getAppRoutes,
	removeAppRoutes,
	cleanupRoles,
	getRoutesByRole,
	isRouteAllowed,
	createDeflector,
	configureRules,
	protectRoute,
	configureRoleRoutes
} from '../src/deflector'
import { options } from './fixtures/config'
import { pick } from 'ramda'
// import { getAuthorizedRoutes } from '../src/processor'

describe('Router functions', () => {
	const defaultRoutes = {
		app: {
			home: '/',
			login: '/auth',
			session: '/auth/session',
			logout: '/logout'
		}
	}

	it('should return default routes', () => {
		expect(getAppRoutes()).toEqual(defaultRoutes.app)
		const deflector = createDeflector()
		expect(deflector.page).toEqual(defaultRoutes.app)
	})

	it('should sort and exclude child routes', () => {
		expect(cleanupRoles(['/pub'], [])).toEqual(['/pub'])
		expect(cleanupRoles(['/pub', '/pub'], [])).toEqual(['/pub'])
		expect(cleanupRoles(['/pub', '/pub/a'], [])).toEqual(['/pub'])
		expect(cleanupRoles(['/pub', '/pub'], ['/'])).toEqual(['/', '/pub'])
		expect(cleanupRoles(['/pub', '/pub/a'], ['/'])).toEqual(['/', '/pub'])
		expect(cleanupRoles(['/pub', '/pub/a/b'], ['/'])).toEqual(['/', '/pub'])
	})

	it('should exclude app routes from a route list', () => {
		const routes = [
			...Object.values(defaultRoutes.app),
			...Object.values(defaultRoutes.app)
		]
		const result = removeAppRoutes(routes, defaultRoutes.app)
		expect(result.length).toEqual(0)
	})

	it.each(options)('should %s', (msg, input) => {
		const expectedPageRoutes = {
			...defaultRoutes.app,
			...pick(['home', 'login', 'logout', 'session'], input.app ?? {})
		}
		expect(getAppRoutes(input)).toEqual(expectedPageRoutes)
		const deflector = createDeflector(input)
		expect(deflector.page).toEqual(expectedPageRoutes)
	})

	it('should set routes by role', () => {
		const app = defaultRoutes.app
		let options = {}
		let routesByRole = getRoutesByRole(options, app)
		expect(routesByRole).toEqual({
			public: { home: '/', routes: [] },
			authenticated: { home: '/', routes: [app.home, app.logout] }
		})

		options = { roles: { public: { home: '/public', routes: ['/blog'] } } }
		routesByRole = getRoutesByRole(options, app)
		expect(routesByRole).toEqual({
			public: { home: '/public', routes: [...options.roles.public.routes] },
			authenticated: { home: '/', routes: [app.home, app.logout] }
		})

		options = {
			roles: { authenticated: { home: '/public', routes: ['/blog'] } }
		}
		routesByRole = getRoutesByRole(options, app)
		expect(routesByRole).toEqual({
			public: { home: '/', routes: [] },
			authenticated: {
				home: '/public',
				routes: [app.home, ...options.roles.authenticated.routes, app.logout]
			}
		})

		options = { roles: { other: { routes: ['/blog'] } } }
		routesByRole = getRoutesByRole(options, app)
		expect(routesByRole).toEqual({
			public: { home: '/', routes: [] },
			authenticated: { home: '/', routes: [app.home, app.logout] },
			other: {
				home: '/',
				routes: [app.home, ...options.roles.other.routes, app.logout]
			}
		})
	})

	it('should verify that route is allowed', () => {
		const allowed = ['/', '/blog', '/page', '/auth']
		expect(isRouteAllowed('/', allowed)).toBeTruthy()
		expect(isRouteAllowed('/page', allowed)).toBeTruthy()
		expect(isRouteAllowed('/blog', allowed)).toBeTruthy()
		expect(isRouteAllowed('/blog/1', allowed)).toBeTruthy()
		expect(isRouteAllowed('/auth', allowed)).toBeTruthy()
		expect(isRouteAllowed('/auth/session', allowed)).toBeTruthy()
		expect(isRouteAllowed('/bg', allowed)).toBeFalsy()
	})

	it('should protect routes based on role', () => {
		const { app: page, endpoint } = defaultRoutes
		const options = {
			roles: {
				public: { routes: ['/blog'] },
				authenticated: { routes: ['/user'] },
				other: { home: '/dash', routes: ['/other'] }
			}
		}
		const res = createDeflector(options)
		expect(res.page, page)
		expect(res.endpoint, endpoint)

		expect(res.redirect(page.home)).toEqual(page.login)
		expect(res.redirect(page.login)).toEqual(page.login)
		expect(res.redirect(page.logout)).toEqual(page.login)
		expect(res.redirect('/blog')).toEqual('/blog')
		expect(res.redirect('/user')).toEqual(page.login)

		res.setSession({ user: { role: 'authenticated' } })
		expect(res.redirect(page.home)).toEqual(page.home)
		expect(res.redirect(page.login)).toEqual(page.home)
		expect(res.redirect(page.logout)).toEqual(page.logout)
		expect(res.redirect('/blog')).toEqual('/blog')
		expect(res.redirect('/user')).toEqual('/user')
		expect(res.redirect('/other')).toEqual(page.home)

		res.setSession({ user: { role: 'other' } })
		expect(res.redirect(page.home)).toEqual(page.home)
		expect(res.redirect(page.login)).toEqual(options.roles.other.home)
		expect(res.redirect(page.logout)).toEqual(page.logout)
		expect(res.redirect('/blog')).toEqual('/blog')
		expect(res.redirect('/user')).toEqual(options.roles.other.home)
		expect(res.redirect('/other')).toEqual('/other')
	})

	describe('configureRules', () => {
		const logger = {
			warn: vi.fn(),
			error: vi.fn()
		}
		beforeEach(() => {
			logger.warn.mockClear()
			logger.error.mockClear()
		})
		it('should configure default rules', () => {
			const config = configureRules({}, logger)
			expect(logger.warn).not.toHaveBeenCalled()
			expect(logger.error).not.toHaveBeenCalled()
			expect(config).toEqual({
				app: {
					home: '/',
					login: '/auth',
					logout: '/logout',
					session: '/auth/session',
					unauthorized: null,
					endpoints: ['/api', '/data', '/auth/session']
				},
				public: [{ path: '/auth', public: true, roles: '*' }],
				protected: {
					'*': [
						{ path: '/', public: false, roles: '*' },
						{ path: '/logout', public: false, roles: '*' }
					]
				}
			})
		})

		it('should log and exclude rules with errors', () => {
			const config = configureRules(
				{
					app: { home: '/home', login: '/login', logout: '/logout' },
					rules: [{}, { path: '/auth' }, { path: '/public', public: true }]
				},
				logger
			)
			expect(logger.warn).not.toHaveBeenCalled()
			expect(logger.error).toHaveBeenCalledWith({
				module: 'deflector',
				method: 'configure',
				message: 'invalid rules detected',
				data: {
					errors: [
						{
							public: false,
							roles: '*',
							depth: 0,
							errors: ['Path must be a non-empty string']
						}
					]
				}
			})
			expect(config).toEqual({
				app: {
					home: '/home',
					login: '/login',
					logout: '/logout',
					session: '/auth/session',
					unauthorized: null,
					endpoints: ['/api', '/data', '/auth/session']
				},
				public: [
					{ path: '/auth/session', public: true, roles: '*' },
					{ path: '/public', public: true, roles: '*' },
					{ path: '/login', public: true, roles: '*' }
				],
				protected: {
					'*': [
						{ path: '/auth', public: false, roles: '*' },
						{ path: '/home', public: false, roles: '*' },
						{ path: '/logout', public: false, roles: '*' }
						// { path: '/', public: false, roles: '*' }
					]
				}
			})
		})

		it('should identify and log warnings', () => {
			const config = configureRules(
				{
					app: { home: '/home', login: '/login', logout: '/logout' },
					rules: [
						{ path: '/auth' },
						{ path: '/home/about' },
						{ path: '/public', public: true }
					]
				},
				logger
			)

			expect(logger.error).not.toHaveBeenCalled()
			expect(logger.warn).toHaveBeenCalledWith({
				module: 'deflector',
				method: 'configure',
				message: 'identified redundant rules',
				data: {
					warnings: [
						{
							path: '/home/about',
							public: false,
							roles: '*',
							depth: 2,
							redundant: true,
							warnings: ['Redundant rule: /home includes /home/about']
						}
					]
				}
			})
			expect(config).toEqual({
				app: {
					home: '/home',
					login: '/login',
					logout: '/logout',
					session: '/auth/session',
					unauthorized: null,
					endpoints: ['/api', '/data', '/auth/session']
				},
				public: [
					{ path: '/auth/session', public: true, roles: '*' },
					{ path: '/public', public: true, roles: '*' },
					{ path: '/login', public: true, roles: '*' }
				],
				protected: {
					'*': [
						{
							path: '/home/about',
							public: false,
							redundant: true,
							roles: '*',
							warnings: ['Redundant rule: /home includes /home/about']
						},
						{ path: '/auth', public: false, roles: '*' },
						{ path: '/home', public: false, roles: '*' },
						{ path: '/logout', public: false, roles: '*' }
						// { path: '/', public: false, roles: '*' }
					]
				}
			})
		})
	})

	describe('protectRoute', () => {
		const logger = {
			warn: vi.fn(),
			error: vi.fn()
		}
		const config = configureRules(
			{
				rules: [
					{ path: '/api' },
					{ path: '/admin', roles: 'admin' },
					{ path: '/data', roles: 'admin' },
					{ path: '/public', public: true }
				]
			},
			logger
		)

		it('should allow routes for role [admin]', () => {
			const userRole = 'admin'
			const allowedRoutes = configureRoleRoutes(config, userRole)
			const result = protectRoute(allowedRoutes, '/api', userRole)
			expect(result).toEqual({
				accessible: true,
				rule: { path: '/api', public: false, roles: '*' },
				statusCode: 200
			})
		})
		it('should allow public routes for unauthenticated', () => {
			const userRole = null
			const allowedRoutes = configureRoleRoutes(config, userRole)
			const result = protectRoute(allowedRoutes, '/public', userRole)
			expect(result).toEqual({
				accessible: true,
				rule: {
					path: '/public',
					public: true,
					roles: '*'
				},
				statusCode: 200
			})
		})

		it('should redirect page routes for unauthenticated', () => {
			const userRole = null
			const allowedRoutes = configureRoleRoutes(config, userRole)
			const result = protectRoute(allowedRoutes, '/', userRole)
			expect(result).toEqual({
				accessible: false,
				redirect: '/auth',
				statusCode: 401
			})
		})

		it('should redirect page routes for role user', () => {
			const userRole = 'user'
			const allowedRoutes = configureRoleRoutes(config, userRole)
			const result = protectRoute(allowedRoutes, '/admin', userRole)
			expect(result).toEqual({
				accessible: false,
				redirect: '/',
				statusCode: 403
			})
		})

		it('should block api routes for unauthenticated', () => {
			const userRole = null
			const allowedRoutes = configureRoleRoutes(config, userRole)
			const result = protectRoute(allowedRoutes, '/api', userRole)
			expect(result).toEqual({
				accessible: false,
				statusCode: 401
			})
		})

		it('should block api routes for role [user]', () => {
			const userRole = 'user'
			const allowedRoutes = configureRoleRoutes(config, userRole)
			const result = protectRoute(allowedRoutes, '/data', userRole)
			expect(result).toEqual({
				accessible: false,
				statusCode: 403
			})
		})
	})
})
