import { createClient } from '@supabase/supabase-js'
/**
 * @typedef SupabaseConfig
 * @property {string} url
 * @property {string} anonKey
 */

/**
 * @typedef SupabaseLogWriterOptions
 * @property {string} [schema]
 * @property {string} table
 */

/**
 * Creates a kavach adapter to work with supabase
 *
 * @param {SupabaseConfig} config
 * @param {SupabaseLogWriterOptions} options
 * @returns @type {import('@kavach/core').LogWriter}
 */
export function getLogWriter(config, options) {
	const client = createClient(config.url, config.anonKey)

	/** @type {import('@kavach/core').LogWriter} */
	const adapter = {
		write: async (data) => {
			await client.from(options.table).insert(data)
		}
	}

	return adapter
}
