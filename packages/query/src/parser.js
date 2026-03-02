import { isValidOperator } from './operators.js'

/**
 * @typedef {Object} FilterDescriptor
 * @property {string} column
 * @property {string} op
 * @property {string|string[]|null} value
 */

/**
 * Parse a filter object with PostgREST-style operator strings into IR.
 *
 * @param {Record<string, string>} [filter]
 * @returns {FilterDescriptor[]}
 */
export function parseFilter(filter) {
	if (!filter) return []

	return Object.entries(filter).map(([column, raw]) => {
		const dotIndex = raw.indexOf('.')
		if (dotIndex === -1) {
			throw new Error(`Invalid filter value for "${column}": expected "op.value" format`)
		}

		const op = raw.slice(0, dotIndex)
		const rawValue = raw.slice(dotIndex + 1)

		if (!isValidOperator(op)) {
			throw new Error(`Unknown operator: ${op}`)
		}

		return { column, op, value: parseValue(op, rawValue) }
	})
}

/**
 * @param {string} op
 * @param {string} raw
 * @returns {string|string[]|null}
 */
function parseValue(op, raw) {
	if (op === 'in') {
		const inner = raw.replace(/^\(/, '').replace(/\)$/, '')
		return inner.split(',').map((s) => s.trim())
	}
	if (op === 'is') {
		return raw === 'null' ? null : raw
	}
	return raw
}
