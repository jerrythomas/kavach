import { createClient } from '@supabase/supabase-js'
import { getTableAndSchema } from './utils'
import type { SupabaseConfig, SupabaseLogWriterOptions } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseSchemaClient(config: SupabaseConfig, schema: string | null): any {
	// If client is provided, use it directly
	if (config.client) {
		const client: any = config.client
		return schema ? client.schema(schema) : client
	}
	
	// Otherwise require url and anonKey
	if (!config.url || !config.anonKey) {
		throw new Error('Supabase config requires url and anonKey')
	}
	const client: any = createClient(config.url, config.anonKey)
	const schemaClient = schema ? client.schema(schema) : client

	return schemaClient
}

export function getLogWriter(
	config: SupabaseConfig,
	options: SupabaseLogWriterOptions = { table: 'logs' }
) {
	const tableInfo = getTableAndSchema(options?.table ?? 'logs')
	const schemaClient = getSupabaseSchemaClient(config, tableInfo.schema)

	const adapter = {
		async write(data: Record<string, unknown>) {
			await schemaClient.from(tableInfo.table).insert(data)
		}
	}

	return adapter
}
