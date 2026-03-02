const COLUMN_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_.]*$/

/**
 * Validate a column name to prevent injection.
 * Allows alphanumeric, underscore, and dot (for nested/joined columns).
 *
 * @param {string} column
 * @returns {boolean}
 */
export function isValidColumnName(column) {
	return typeof column === 'string' && column.length > 0 && COLUMN_NAME_RE.test(column)
}
