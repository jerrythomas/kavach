import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as utilities from '../../src/ui'

describe('utilities', () => {
	it('should contain all exported utilities', () => {
		expect(Object.keys(utilities)).toEqual([
			'AuthButton',
			'AuthProvider',
			'AuthGroup',
			'AuthError',
			'AuthResponse',
			'AuthHandler'
		])
	})
})
