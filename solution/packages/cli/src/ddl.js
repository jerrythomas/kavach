export function generateDDLInstructions(capabilities, config) {
	if (!capabilities?.ddl?.logging || !config?.logging?.enabled) {
		return null
	}

	const tableName = config.logging.table || capabilities.ddl.logging.table
	const schema = capabilities.ddl.logging.getSchema(tableName)

	return {
		title: 'DDL Required',
		message: `Run the following SQL in your ${capabilities.displayName} dashboard to enable logging:`,
		sql: schema,
		hint: `Table: ${tableName}`
	}
}

export function formatDDLOutput(ddl) {
	if (!ddl) return ''

	return `
┌─────────────────────────────────────────────────────────────┐
│  ${ddl.title.padEnd(52)}│
└─────────────────────────────────────────────────────────────┘

${ddl.message}

\`\`\`sql
${ddl.sql}
\`\`\`

${ddl.hint}
`
}

export function getUnsupportedFeaturesMessage(capabilities) {
	const unsupported = []

	if (!capabilities.supports.data) unsupported.push('Data endpoints')
	if (!capabilities.supports.rpc) unsupported.push('RPC')
	if (!capabilities.supports.logging) unsupported.push('Logging')

	if (unsupported.length === 0) return null

	return `[NOT SUPPORTED] ${unsupported.join(', ')} - Not supported by ${capabilities.displayName}`
}
