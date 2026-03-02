import { parseFilter } from './parser.js'
import { parseOrder } from './order.js'

/**
 * @typedef {Object} QueryParams
 * @property {string} columns
 * @property {import('./parser.js').FilterDescriptor[]} filters
 * @property {import('./order.js').OrderDescriptor[]} orders
 * @property {number} [limit]
 * @property {number} [offset]
 * @property {string} [count]
 */

/**
 * Parse a flat query options object into structured params.
 *
 * @param {Object} [data]
 * @returns {QueryParams}
 */
export function parseQueryParams(data) {
	const { columns = '*', filter, order, limit, offset, count } = data ?? {}

	return {
		columns,
		filters: parseFilter(filter),
		orders: parseOrder(order),
		limit: limit !== undefined ? Number(limit) : undefined,
		offset: offset !== undefined ? Number(offset) : undefined,
		count: count || undefined
	}
}
