import { describe, expect, it } from 'vitest'
import {
	getModeForProvider,
	getParamsForProvider,
	getUserInfo,
	getProviderConfigFromNames
} from '../src/provider'

describe('Provider functions', () => {
	it('should get the mode for a provider', () => {
		expect(getModeForProvider('Magic')).toEqual('otp')
		expect(getModeForProvider('email')).toEqual('password')
		expect(getModeForProvider('phone')).toEqual('password')
		expect(getModeForProvider('google')).toEqual('oauth')
		expect(getModeForProvider('?')).toEqual('oauth')
	})

	it('should get the params for a provider', () => {
		expect(getParamsForProvider('Magic')).toEqual([])
		expect(getParamsForProvider('Microsoft')).toEqual([
			{ prompt: 'consent', domain_hint: 'organizations' }
		])
	})

	it('should get the provider config for an array of provider names', () => {
		expect(getProviderConfigFromNames(['Magic', 'email', 'Google', 'Microsoft'])).toEqual([
			{
				name: 'magic',
				mode: 'otp',
				label: 'email for Magic Link',
				scopes: [],
				params: []
			},
			{
				name: 'email',
				mode: 'password',
				label: 'Sign in with email',
				scopes: [],
				params: []
			},
			{
				name: 'google',
				mode: 'oauth',
				label: 'Sign in with Google',
				scopes: [],
				params: []
			},
			{
				name: 'microsoft',
				mode: 'oauth',
				label: 'Sign in with Microsoft',
				scopes: [],
				params: [{ prompt: 'consent', domain_hint: 'organizations' }]
			}
		])
	})

	describe('getUserInfo', () => {
		it('should return user info', () => {
			const user = {
				id: 1,
				email: 'john.doe@example.com',
				role: 'user'
			}
			expect(getUserInfo(user)).toEqual({
				id: 1,
				role: 'user',
				email: 'john.doe@example.com',
				avatar_url: undefined,
				full_name: undefined,
				app_metadata: undefined
			})
		})

		it('should return user info including metadata', () => {
			const user = {
				id: 1,
				email: 'john.doe@example.com',
				role: 'user',
				app_metadata: { plan: 'pro' },
				user_metadata: {
					avatar_url: 'https://example.com/avatar.jpg',
					full_name: 'John Doe'
				}
			}
			expect(getUserInfo(user)).toEqual({
				id: 1,
				role: 'user',
				email: 'john.doe@example.com',
				avatar_url: 'https://example.com/avatar.jpg',
				full_name: 'John Doe',
				app_metadata: { plan: 'pro' }
			})
		})

		it('should prefer app_metadata.role over the provider JWT role', () => {
			// Supabase stamps every signed-in user with role: 'authenticated'.
			// App-level roles live in app_metadata, and the sentry routes on
			// session.user.role — so without this precedence, role-based rules
			// like { path: '/platform', roles: ['platform_admin'] } can never match.
			const user = {
				id: 1,
				email: 'admin@example.com',
				role: 'authenticated',
				app_metadata: { role: 'platform_admin' }
			}

			expect(getUserInfo(user).role).toEqual('platform_admin')
		})

		it('should fall back to the JWT role when app_metadata carries no role', () => {
			const user = {
				id: 1,
				email: 'user@example.com',
				role: 'authenticated',
				app_metadata: { plan: 'pro' }
			}

			expect(getUserInfo(user).role).toEqual('authenticated')
		})

		it('should read app_metadata from the top level, not from user_metadata', () => {
			// app_metadata is a top-level field on the Supabase user object.
			// Reading it out of user_metadata leaves it undefined on the session.
			const user = {
				id: 1,
				email: 'admin@example.com',
				role: 'authenticated',
				app_metadata: { role: 'platform_admin' },
				user_metadata: { full_name: 'Admin' }
			}

			expect(getUserInfo(user).app_metadata).toEqual({ role: 'platform_admin' })
		})
	})
})
