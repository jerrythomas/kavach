/**
 * Core operators — all adapters must support these
 * Extended operators — adapter-specific support
 */
export const OPERATORS = {
	core: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'],
	extended: ['like', 'ilike', 'in', 'is']
}

export const ALL_OPERATORS = [...OPERATORS.core, ...OPERATORS.extended]

/**
 * @param {string} op
 * @returns {boolean}
 */
export function isValidOperator(op) {
	return ALL_OPERATORS.includes(op)
}
