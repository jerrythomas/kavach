import { describe, expect, it } from 'vitest'
import {
	getModeForProvider,
	getParamsForProvider,
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
})
