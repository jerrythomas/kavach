import { describe, expect, it } from 'vitest'
import { RUNNING_ON } from '../src/constants'

/**
 * @vitest-environment jsdom
 */
describe('Logger on browser', () => {
	it('should identify running_on as "browser"', () => {
		expect(RUNNING_ON).toEqual('browser')
	})
})
