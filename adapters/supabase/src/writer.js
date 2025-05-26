import { createClient } from '@supabase/supabase-js'
import { getTableAndSchema } from './utils'

/**
 * Gets a supabase client with the provided configuration and schema
 *
 * - uses client if provided, otherwise creates a new client
 * - if schema is provided, uses schema client, otherwise uses default client
 *
 * @param {import('./types').SupabaseConfig} config
 * @param {string|null} schema
 * @returns
 */
function getSupabaseSchemaClient(config, schema = null) {
	const client = config.client ?? createClient(config.url, config.anonKey)
	const schemaClient = schema ? client.schema(schema) : client

	return schemaClient
}

/**
 * Creates a kavach adapter to work with supabase
 *
 * @param {import('./types').SupabaseConfig} config
 * @param {import('./types').SupabaseLogWriterOptions} options
 * @returns {import('kavach').LogWriter}
 */
export function getLogWriter(config, options = {}) {
	const { schema, table } = getTableAndSchema(options?.table ?? 'logs')
	const schemaClient = getSupabaseSchemaClient(config, schema)

	/** @type {import('kavach').LogWriter} */
	const adapter = {
		write: async (data) => {
			await schemaClient.from(table).insert(data)
		}
	}

	return adapter
}
