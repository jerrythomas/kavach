import { describe, expect, it } from 'vitest'
import { OPERATORS, ALL_OPERATORS, isValidOperator } from '../src/operators.js'

describe('operators', () => {
	it('should define core operators', () => {
		expect(OPERATORS.core).toEqual(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])
	})

	it('should define extended operators', () => {
		expect(OPERATORS.extended).toEqual(['like', 'ilike', 'in', 'is'])
	})

	it('should export all operators as flat array', () => {
		expect(ALL_OPERATORS).toEqual(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is'])
	})

	it('should validate known operators', () => {
		expect(isValidOperator('eq')).toBe(true)
		expect(isValidOperator('gt')).toBe(true)
		expect(isValidOperator('in')).toBe(true)
		expect(isValidOperator('is')).toBe(true)
	})

	it('should reject unknown operators', () => {
		expect(isValidOperator('foo')).toBe(false)
		expect(isValidOperator('match')).toBe(false)
		expect(isValidOperator('')).toBe(false)
	})
})
