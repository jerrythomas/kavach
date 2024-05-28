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
		expect(
			getProviderConfigFromNames(['Magic', 'email', 'Google', 'Microsoft'])
		).toEqual([
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
				user_metadata: {
					avatar_url: 'https://example.com/avatar.jpg',
					full_name: 'John Doe',
					app_metadata: { plan: 'pro' }
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
	})
})
