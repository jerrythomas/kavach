import { describe, it, expect } from 'vitest'
import { isValidColumnName } from '../src/validation.js'

describe('isValidColumnName', () => {
	it('accepts simple column names', () => {
		expect(isValidColumnName('name')).toBe(true)
		expect(isValidColumnName('user_id')).toBe(true)
		expect(isValidColumnName('_private')).toBe(true)
	})

	it('accepts dotted column names', () => {
		expect(isValidColumnName('users.name')).toBe(true)
		expect(isValidColumnName('schema.table.col')).toBe(true)
	})

	it('rejects columns starting with numbers', () => {
		expect(isValidColumnName('1col')).toBe(false)
	})

	it('rejects columns with special characters', () => {
		expect(isValidColumnName('col;DROP')).toBe(false)
		expect(isValidColumnName('col--')).toBe(false)
		expect(isValidColumnName("col'")).toBe(false)
		expect(isValidColumnName('col"')).toBe(false)
		expect(isValidColumnName('col()')).toBe(false)
		expect(isValidColumnName('')).toBe(false)
	})

	it('rejects non-string inputs', () => {
		expect(isValidColumnName(null)).toBe(false)
		expect(isValidColumnName(undefined)).toBe(false)
		expect(isValidColumnName(123)).toBe(false)
	})
})
