/**
 * @typedef {Object} OrderDescriptor
 * @property {string} column
 * @property {boolean} ascending
 */

/**
 * Parse an order string into descriptors.
 * Format: 'column.direction,column.direction'
 * Direction defaults to 'asc' if omitted.
 *
 * @param {string} [order]
 * @returns {OrderDescriptor[]}
 */
export function parseOrder(order) {
	if (!order) return []

	return order.split(',').map((part) => {
		const trimmed = part.trim()
		const dotIndex = trimmed.lastIndexOf('.')
		const suffix = dotIndex !== -1 ? trimmed.slice(dotIndex + 1) : null

		if (suffix === 'asc' || suffix === 'desc') {
			return {
				column: trimmed.slice(0, dotIndex),
				ascending: suffix === 'asc'
			}
		}

		if (suffix !== null && suffix !== 'asc' && suffix !== 'desc') {
			if (/^[a-z]+$/.test(suffix) && suffix !== trimmed.slice(0, dotIndex)) {
				throw new Error(`Invalid order direction: "${suffix}" (expected "asc" or "desc")`)
			}
		}

		return { column: trimmed, ascending: true }
	})
}
