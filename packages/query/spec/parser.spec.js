import { describe, expect, it } from 'vitest'
import { parseFilter } from '../src/parser.js'

describe('parseFilter', () => {
	it('should return empty array for empty filter', () => {
		expect(parseFilter({})).toEqual([])
	})

	it('should return empty array for undefined/null', () => {
		expect(parseFilter(undefined)).toEqual([])
		expect(parseFilter(null)).toEqual([])
	})

	it('should parse eq operator', () => {
		expect(parseFilter({ status: 'eq.success' })).toEqual([
			{ column: 'status', op: 'eq', value: 'success' }
		])
	})

	it('should parse neq operator', () => {
		expect(parseFilter({ status: 'neq.failed' })).toEqual([
			{ column: 'status', op: 'neq', value: 'failed' }
		])
	})

	it('should parse gt operator', () => {
		expect(parseFilter({ cost: 'gt.0.01' })).toEqual([
			{ column: 'cost', op: 'gt', value: '0.01' }
		])
	})

	it('should parse gte operator', () => {
		expect(parseFilter({ cost: 'gte.100' })).toEqual([
			{ column: 'cost', op: 'gte', value: '100' }
		])
	})

	it('should parse lt operator', () => {
		expect(parseFilter({ age: 'lt.18' })).toEqual([
			{ column: 'age', op: 'lt', value: '18' }
		])
	})

	it('should parse lte operator', () => {
		expect(parseFilter({ age: 'lte.65' })).toEqual([
			{ column: 'age', op: 'lte', value: '65' }
		])
	})

	it('should parse multiple filters', () => {
		expect(parseFilter({ status: 'eq.active', cost: 'gt.0' })).toEqual([
			{ column: 'status', op: 'eq', value: 'active' },
			{ column: 'cost', op: 'gt', value: '0' }
		])
	})

	it('should preserve dots in value after operator', () => {
		expect(parseFilter({ cost: 'gt.0.01' })).toEqual([
			{ column: 'cost', op: 'gt', value: '0.01' }
		])
	})

	it('should throw on unknown operator', () => {
		expect(() => parseFilter({ status: 'foo.bar' })).toThrow('Unknown operator: foo')
	})

	it('should parse like operator', () => {
		expect(parseFilter({ name: 'like.%deploy%' })).toEqual([
			{ column: 'name', op: 'like', value: '%deploy%' }
		])
	})

	it('should parse ilike operator', () => {
		expect(parseFilter({ name: 'ilike.%Deploy%' })).toEqual([
			{ column: 'name', op: 'ilike', value: '%Deploy%' }
		])
	})

	it('should parse in operator with list', () => {
		expect(parseFilter({ status: 'in.(success,pending)' })).toEqual([
			{ column: 'status', op: 'in', value: ['success', 'pending'] }
		])
	})

	it('should parse in operator with single value', () => {
		expect(parseFilter({ status: 'in.(active)' })).toEqual([
			{ column: 'status', op: 'in', value: ['active'] }
		])
	})

	it('should parse is.null', () => {
		expect(parseFilter({ deleted_at: 'is.null' })).toEqual([
			{ column: 'deleted_at', op: 'is', value: null }
		])
	})

	it('should parse is.true', () => {
		expect(parseFilter({ active: 'is.true' })).toEqual([
			{ column: 'active', op: 'is', value: true }
		])
	})

	it('should parse is.false', () => {
		expect(parseFilter({ active: 'is.false' })).toEqual([
			{ column: 'active', op: 'is', value: false }
		])
	})
})
