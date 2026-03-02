import { describe, expect, it } from 'vitest'
import { parseOrder } from '../src/order.js'

describe('parseOrder', () => {
	it('should return empty array for undefined', () => {
		expect(parseOrder(undefined)).toEqual([])
	})

	it('should return empty array for empty string', () => {
		expect(parseOrder('')).toEqual([])
	})

	it('should parse single column ascending', () => {
		expect(parseOrder('name.asc')).toEqual([
			{ column: 'name', ascending: true }
		])
	})

	it('should parse single column descending', () => {
		expect(parseOrder('created_at.desc')).toEqual([
			{ column: 'created_at', ascending: false }
		])
	})

	it('should default to ascending when direction omitted', () => {
		expect(parseOrder('name')).toEqual([
			{ column: 'name', ascending: true }
		])
	})

	it('should parse multiple columns', () => {
		expect(parseOrder('status.asc,created_at.desc')).toEqual([
			{ column: 'status', ascending: true },
			{ column: 'created_at', ascending: false }
		])
	})

	it('should handle mixed explicit and default directions', () => {
		expect(parseOrder('name,created_at.desc')).toEqual([
			{ column: 'name', ascending: true },
			{ column: 'created_at', ascending: false }
		])
	})

	it('should throw on invalid direction', () => {
		expect(() => parseOrder('name.up')).toThrow('Invalid order direction')
	})

	it('should throw on invalid column name', () => {
		expect(() => parseOrder("col;DROP.asc")).toThrow('Invalid column name')
	})
})
