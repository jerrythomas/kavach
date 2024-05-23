import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	createDeflector,
	configureRules,
	protectRoute,
	configureRoleRoutes
} from '../src/deflector'

describe('Router functions', () => {
	const defaultRoutes = {
		app: {
			home: '/',
			login: '/auth',
			session: '/auth/session',
			logout: '/logout'
		}
	}

	const { app: page } = defaultRoutes
	const options = {
		rules: [
			{ path: '/blog', public: true },
			{ path: '/user', roles: ['authenticated'] },
			{ path: '/other', roles: 'other' }
		]
	}
	const res = createDeflector(options)

	afterEach(() => {
		res.setSession()
	})
	it('should protect routes when user is not logged in', () => {
		expect(res.redirect(page.home)).toEqual({
			statusCode: 401,
			redirect: page.login
		})
		expect(res.redirect(page.login)).toEqual({
			statusCode: 200
		})
		expect(res.redirect(page.logout)).toEqual({
			statusCode: 401,
			redirect: page.login
		})
		expect(res.redirect('/blog')).toEqual({
			statusCode: 200
		})
		expect(res.redirect('/user')).toEqual({
			statusCode: 401,
			redirect: page.login
		})
	})
	it('should protect routes when role is "authenticated"', () => {
		res.setSession({ user: { role: 'authenticated' } })
		expect(res.redirect(page.home)).toEqual({
			statusCode: 200
		})
		expect(res.redirect(page.login)).toEqual({
			statusCode: 302,
			redirect: page.home
		})
		expect(res.redirect(page.logout)).toEqual({ statusCode: 200 })
		expect(res.redirect('/blog')).toEqual({ statusCode: 200 })
		expect(res.redirect('/user')).toEqual({ statusCode: 200 })
		expect(res.redirect('/other')).toEqual({
			statusCode: 403,
			redirect: page.home
		})
	})
	it('should protect routes when role is "other"', () => {
		res.setSession({ user: { role: 'other' } })
		expect(res.redirect(page.home)).toEqual({ statusCode: 200 })
		expect(res.redirect(page.login)).toEqual({
			statusCode: 302,
			redirect: page.home
		})
		expect(res.redirect(page.logout)).toEqual({ statusCode: 200 })
		expect(res.redirect('/blog')).toEqual({ statusCode: 200 })
		expect(res.redirect('/user')).toEqual({
			statusCode: 403,
			redirect: page.home
		})
		expect(res.redirect('/other')).toEqual({ statusCode: 200 })
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
					{ path: '/public', public: true },
					{ path: '/shared', roles: '*' }
				]
			},
			logger
		)

		// it('should allow routes for role [admin]', () => {
		// 	const userRole = 'admin'
		// 	const allowedRoutes = configureRoleRoutes(config, userRole)
		// 	const result = protectRoute(allowedRoutes, '/api', userRole)
		// 	expect(result).toEqual({
		// 		statusCode: 200
		// 	})
		// })

		// it('should allow public routes for unauthenticated', () => {
		// 	const userRole = null
		// 	const allowedRoutes = configureRoleRoutes(config, userRole)
		// 	const result = protectRoute(allowedRoutes, '/public', userRole)
		// 	expect(result).toEqual({
		// 		statusCode: 200
		// 	})
		// })

		// it('should redirect page routes for unauthenticated', () => {
		// 	const userRole = null
		// 	const allowedRoutes = configureRoleRoutes(config, userRole)
		// 	const result = protectRoute(allowedRoutes, '/', userRole)
		// 	expect(result).toEqual({
		// 		redirect: '/auth',
		// 		statusCode: 401
		// 	})
		// })

		// it('should redirect page routes for role user', () => {
		// 	const userRole = 'user'
		// 	const allowedRoutes = configureRoleRoutes(config, userRole)
		// 	const result = protectRoute(allowedRoutes, '/admin', userRole)
		// 	expect(result).toEqual({
		// 		redirect: '/',
		// 		statusCode: 403
		// 	})
		// })

		// it('should block api routes for unauthenticated', () => {
		// 	const userRole = null
		// 	const allowedRoutes = configureRoleRoutes(config, userRole)
		// 	const result = protectRoute(allowedRoutes, '/api', userRole)
		// 	expect(result).toEqual({
		// 		statusCode: 401
		// 	})
		// })

		// it('should block api routes for role [user]', () => {
		// 	const userRole = 'user'
		// 	const allowedRoutes = configureRoleRoutes(config, userRole)
		// 	const result = protectRoute(allowedRoutes, '/data', userRole)
		// 	expect(result).toEqual({
		// 		statusCode: 403
		// 	})
		// })

		// 	const routesByRole = organizeRulesByRole(
		// 		processRoutingRules(
		// 			validateRoutingRules([
		// 				{ path: '/home', public: true },
		// 				{ path: '/admin', roles: 'admin' },
		// 				{ path: '/user', roles: 'user' },
		// 				{ path: '/all', roles: ['user', 'admin'] }
		// 			])
		// 		)
		// 	)
		const roles = [null, 'user', 'admin', 'other']

		it.each(roles)('should allow public routes when role is [%s]', (role) => {
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/public', role)
			expect(outcome).toEqual({
				// rule: { path: '/home', public: true, roles: '*' },
				statusCode: 200
			})
		})
		it.each(roles.slice(1))(
			'should allow shared routes when role is [%s]',
			(role) => {
				const allowedRoutes = configureRoleRoutes(config, role)
				const outcome = protectRoute(allowedRoutes, '/shared', role)
				expect(outcome).toEqual({
					// rule: { path: '/home', public: true, roles: '*' },
					statusCode: 200
				})
			}
		)
		it.each(roles.slice(1))(
			'should redirect login to home role is [%s]',
			(role) => {
				const allowedRoutes = configureRoleRoutes(config, role)
				const outcome = protectRoute(allowedRoutes, config.app.login, role)
				expect(outcome).toEqual({
					// rule: { path: '/home', public: true, roles: '*' },
					statusCode: 302,
					redirect: '/'
				})
			}
		)

		it('should allow protected routes for role', () => {
			const role = 'admin'
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/admin', role)
			expect(outcome).toEqual({
				// rule: { path: '/admin', public: false, roles: 'admin' },
				statusCode: 200
			})
		})

		it('should not allow protected route for unauthorised role', () => {
			const role = 'user'
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/admin', role)
			expect(outcome).toEqual({ statusCode: 403, redirect: '/' })
		})

		it('should not allow protected route for unauthenticated user', () => {
			const role = null
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/admin', role)
			expect(outcome).toEqual({ statusCode: 401, redirect: '/auth' })
		})

		it.each(roles)('should not allow unknown routes for role [%s]', (role) => {
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/dashboard', role)
			expect(outcome).toEqual({
				redirect: role === null ? '/auth' : '/',
				statusCode: role === null ? 401 : 403
			})
		})

		it.each([null, 'user'])(
			'should block endpoints without redirect ',
			(role) => {
				const allowedRoutes = configureRoleRoutes(config, role)
				const outcome = protectRoute(allowedRoutes, '/data', role)
				expect(outcome).toEqual({
					statusCode: role === null ? 401 : 403
				})
			}
		)
	})
})
