import { describe, expect, it } from 'vitest'
import { RUNNING_ON } from '../src/constants'

/**
 * @vitest-environment node
 */
describe('Logger on browser', () => {
	it('should identify running_on as "server"', () => {
		expect(RUNNING_ON).toEqual('server')
	})
})
