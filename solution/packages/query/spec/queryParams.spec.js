import { describe, expect, it } from 'vitest'
import { parseQueryParams } from '../src/queryParams.js'

describe('parseQueryParams', () => {
	it('should return defaults for undefined input', () => {
		const result = parseQueryParams(undefined)
		expect(result).toEqual({
			columns: '*',
			filters: [],
			orders: [],
			limit: undefined,
			offset: undefined,
			count: undefined
		})
	})

	it('should return defaults for empty object', () => {
		const result = parseQueryParams({})
		expect(result).toEqual({
			columns: '*',
			filters: [],
			orders: [],
			limit: undefined,
			offset: undefined,
			count: undefined
		})
	})

	it('should pass through columns', () => {
		const result = parseQueryParams({ columns: 'id,name' })
		expect(result.columns).toBe('id,name')
	})

	it('should parse filters', () => {
		const result = parseQueryParams({ filter: { status: 'eq.active' } })
		expect(result.filters).toEqual([
			{ column: 'status', op: 'eq', value: 'active' }
		])
	})

	it('should parse order string', () => {
		const result = parseQueryParams({ order: 'created_at.desc' })
		expect(result.orders).toEqual([
			{ column: 'created_at', ascending: false }
		])
	})

	it('should pass through limit as number', () => {
		expect(parseQueryParams({ limit: 50 }).limit).toBe(50)
	})

	it('should coerce string limit to number', () => {
		expect(parseQueryParams({ limit: '50' }).limit).toBe(50)
	})

	it('should pass through offset as number', () => {
		expect(parseQueryParams({ offset: 100 }).offset).toBe(100)
	})

	it('should coerce string offset to number', () => {
		expect(parseQueryParams({ offset: '100' }).offset).toBe(100)
	})

	it('should pass through count', () => {
		expect(parseQueryParams({ count: 'exact' }).count).toBe('exact')
	})

	it('should parse all options together', () => {
		const result = parseQueryParams({
			columns: 'id,name',
			filter: { status: 'eq.active', cost: 'gt.0' },
			order: 'created_at.desc,status.asc',
			limit: 50,
			offset: 100,
			count: 'exact'
		})
		expect(result).toEqual({
			columns: 'id,name',
			filters: [
				{ column: 'status', op: 'eq', value: 'active' },
				{ column: 'cost', op: 'gt', value: '0' }
			],
			orders: [
				{ column: 'created_at', ascending: false },
				{ column: 'status', ascending: true }
			],
			limit: 50,
			offset: 100,
			count: 'exact'
		})
	})
})
