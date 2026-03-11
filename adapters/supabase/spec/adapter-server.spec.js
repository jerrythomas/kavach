import { describe, expect, it } from 'vitest'
import { defaultOrigin } from '../src/constants'

/**
 * @vitest-environment node
 */
describe('constants', () => {
	it('should set default origin to empty string', () => {
		expect(defaultOrigin).toEqual('')
	})
})
