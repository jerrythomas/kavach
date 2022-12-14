import { describe, expect, it } from 'vitest'
import {
	getAppRoutes,
	removeAppRoutes,
	cleanupRoles,
	getRoutesByRole,
	isRouteAllowed,
	createDeflector
} from '../src/deflector'
import { options } from './fixtures/config'
import { pick } from 'ramda'

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
		let routes = [
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
		let routesByRole

		routesByRole = getRoutesByRole(options, app)
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
})
