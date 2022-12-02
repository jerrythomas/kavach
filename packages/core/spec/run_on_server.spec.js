import { describe, expect, it } from 'vitest'
import { runningOn } from '../src/constants'

/**
 * @vitest-environment node
 */
describe('Logger on browser', () => {
	it('should identify running_on as "server"', () => {
		expect(runningOn).toEqual('server')
	})
})
