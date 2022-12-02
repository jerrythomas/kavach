import { describe, expect, it } from 'vitest'
import { runningOn } from '../src/constants'

/**
 * @vitest-environment jsdom
 */
describe('Logger on browser', () => {
	it('should identify running_on as "browser"', () => {
		expect(runningOn).toEqual('browser')
	})
})
