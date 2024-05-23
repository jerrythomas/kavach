import { describe, expect, it } from 'vitest'
import {
	findMatchingRoute,
	fillMissingProps,
	isEndpointRoute,
	routeDepth
} from '../src/utils'

describe('utils', () => {
	describe('routeDepth', () => {
		it('should return the depth of the route', () => {
			expect(routeDepth('')).toBe(0)
			expect(routeDepth(1)).toBe(0)
			expect(routeDepth('/')).toBe(1)
			expect(routeDepth('/home')).toBe(1)
			expect(routeDepth('/home/about')).toBe(2)
			expect(routeDepth('/home/about/contact')).toBe(3)
		})
	})
	describe('fillMissingProps', () => {
		it('should fill missing props', () => {
			expect(fillMissingProps({ path: '/api' })).toEqual({
				path: '/api',
				public: false,
				roles: '*',
				depth: 1
			})
		})
		it('should retain public property if provided', () => {
			expect(fillMissingProps({ path: '/api', public: true })).toEqual({
				path: '/api',
				public: true,
				roles: '*',
				depth: 1
			})
		})
		it('should retain roles property if provided', () => {
			expect(
				fillMissingProps({ path: '/api', public: true, roles: 'admin' })
			).toEqual({ path: '/api', public: true, roles: 'admin', depth: 1 })
		})
		it('should override depth property if provided', () => {
			expect(
				fillMissingProps({
					path: '/api',
					public: true,
					roles: 'admin',
					depth: 2
				})
			).toEqual({ path: '/api', public: true, roles: 'admin', depth: 1 })
		})
	})
	describe('findMatchingRoute', () => {
		it('should find a matching route', () => {
			const routes = [
				{ path: '/home/about/contact' },
				{ path: '/home/about' },
				{ path: '/home' }
			]
			expect(findMatchingRoute(routes, '/home')).toEqual({ path: '/home' })
			expect(findMatchingRoute(routes, '/home/about')).toEqual({
				path: '/home/about'
			})
			expect(findMatchingRoute(routes, '/me')).toBeUndefined()
		})
	})

	describe('isEndpointRoute', () => {
		const endpoints = ['/api', '/data']
		it('should return true if the route is an endpoint route', () => {
			expect(isEndpointRoute(endpoints, '/api/sync')).toBe(true)
			expect(isEndpointRoute(endpoints, '/api/sync/abc')).toBe(true)
		})
		it('should return false if the route is not an endpoint route', () => {
			expect(isEndpointRoute(endpoints, '/home/about')).toBe(false)
		})
	})
})
