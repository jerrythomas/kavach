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

	it('should have app routes', () => {
		expect(res).toEqual({
			app: {
				home: '/',
				login: '/auth',
				logout: '/logout',
				session: '/auth/session',
				unauthorized: null,
				endpoints: ['/api', '/data', '/auth/session']
			},
			protect: expect.any(Function),
			setSession: expect.any(Function)
		})
	})
	it('should protect routes when user is not logged in', () => {
		expect(res.protect(page.home)).toEqual({
			status: 401,
			redirect: page.login
		})
		expect(res.protect(page.login)).toEqual({
			status: 200
		})
		expect(res.protect(page.logout)).toEqual({
			status: 401,
			redirect: page.login
		})
		expect(res.protect('/blog')).toEqual({
			status: 200
		})
		expect(res.protect('/user')).toEqual({
			status: 401,
			redirect: page.login
		})
	})
	it('should protect routes when role is "authenticated"', () => {
		res.setSession({ user: { role: 'authenticated' } })
		expect(res.protect(page.home)).toEqual({
			status: 200
		})
		expect(res.protect(page.login)).toEqual({
			status: 302,
			redirect: page.home
		})
		expect(res.protect(page.logout)).toEqual({ status: 200 })
		expect(res.protect('/blog')).toEqual({ status: 200 })
		expect(res.protect('/user')).toEqual({ status: 200 })
		expect(res.protect('/other')).toEqual({
			status: 403,
			redirect: page.home
		})
	})
	it('should protect routes when role is "other"', () => {
		res.setSession({ user: { role: 'other' } })
		expect(res.protect(page.home)).toEqual({ status: 200 })
		expect(res.protect(page.login)).toEqual({
			status: 302,
			redirect: page.home
		})
		expect(res.protect(page.logout)).toEqual({ status: 200 })
		expect(res.protect('/blog')).toEqual({ status: 200 })
		expect(res.protect('/user')).toEqual({
			status: 403,
			redirect: page.home
		})
		expect(res.protect('/other')).toEqual({ status: 200 })
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

	describe('configureRoleRoutes', () => {
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
		it('should configure user rules when not authenticated', () => {
			const rules = configureRoleRoutes(config, null)
			expect(rules).toEqual({
				app: config.app,
				role: null,
				routes: {
					allowed: ['/public', '/auth'],
					restricted: ['/admin', '/data']
				}
			})
		})
		it('should configure user rules when authenticated', () => {
			const rules = configureRoleRoutes(config, 'user')
			expect(rules).toEqual({
				app: config.app,
				role: 'user',
				routes: {
					allowed: ['/public', '/auth', '/api', '/shared', '/', '/logout'],
					restricted: ['/admin', '/data']
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
					{ path: '/shared', roles: '*' },
					{ path: '/shared/admin', roles: 'admin' }
				]
			},
			logger
		)

		const roles = [null, 'user', 'admin', 'other']

		it.each(roles)('should allow public routes when role is [%s]', (role) => {
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/public', role)
			expect(outcome).toEqual({ status: 200 })
		})
		it.each(roles.slice(1))(
			'should allow shared routes when role is [%s]',
			(role) => {
				const allowedRoutes = configureRoleRoutes(config, role)
				const outcome = protectRoute(allowedRoutes, '/shared', role)
				expect(outcome).toEqual({ status: 200 })
			}
		)
		it.each(roles.slice(1))(
			'should redirect login to home role is [%s]',
			(role) => {
				const allowedRoutes = configureRoleRoutes(config, role)
				const outcome = protectRoute(allowedRoutes, config.app.login, role)
				expect(outcome).toEqual({
					status: 302,
					redirect: '/'
				})
			}
		)

		it('should allow protected routes for role', () => {
			const role = 'admin'
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/admin', role)
			expect(outcome).toEqual({ status: 200 })
		})

		it('should not allow protected route for unauthorised role', () => {
			const role = 'user'
			const allowedRoutes = configureRoleRoutes(config, role)
			let outcome = protectRoute(allowedRoutes, '/admin', role)
			expect(outcome).toEqual({ status: 403, redirect: '/' })
			outcome = protectRoute(allowedRoutes, '/shared/admin', role)
			expect(outcome).toEqual({ status: 403, redirect: '/' })
		})

		it('should not allow protected route for unauthenticated user', () => {
			const role = null
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/admin', role)
			expect(outcome).toEqual({ status: 401, redirect: '/auth' })
		})

		it.each(roles)('should not allow unknown routes for role [%s]', (role) => {
			const allowedRoutes = configureRoleRoutes(config, role)
			const outcome = protectRoute(allowedRoutes, '/dashboard', role)
			expect(outcome).toEqual({
				redirect: role === null ? '/auth' : '/',
				status: role === null ? 401 : 403
			})
		})

		it.each([null, 'user'])(
			'should block endpoints without redirect ',
			(role) => {
				const allowedRoutes = configureRoleRoutes(config, role)

				const outcome = protectRoute(allowedRoutes, '/data', role)
				expect(outcome).toEqual({
					status: role === null ? 401 : 403
				})
			}
		)
	})
})
