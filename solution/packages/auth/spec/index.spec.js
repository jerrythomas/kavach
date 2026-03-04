import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as utilities from '../src'

describe('utilities', () => {
	it('should contain all exported utilities', () => {
		const keys = Object.keys(utilities)
		expect(keys).toEqual(expect.arrayContaining([
			'createKavach',
			'authStatus',
			'gravatar',
			'deriveName',
			'urlHashToParams',
			'loginCache',
			'getRequestBody',
			'getRequestData',
			'splitAuthData',
			'asURLWithParams'
		]))
	})
})
