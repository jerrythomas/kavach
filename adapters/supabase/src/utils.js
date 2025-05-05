/**
 * Splits a table name into schema and table name
 *
 * @param {string} table
 * @returns {object} An object with schema and table properties
 */
export function getTableAndSchema(table) {
	const parts = table.split('.')
	return {
		schema: parts.length > 1 ? parts[0] : null,
		table: parts.length > 1 ? parts[1] : parts[0]
	}
}
