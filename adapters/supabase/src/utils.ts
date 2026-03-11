export interface TableInfo {
	schema: string | null
	table: string
}

export function getTableAndSchema(table: string): TableInfo {
	const parts = table.split('.')
	return {
		schema: parts.length > 1 ? parts[0] : null,
		table: parts.length > 1 ? parts[1] : parts[0]
	}
}
