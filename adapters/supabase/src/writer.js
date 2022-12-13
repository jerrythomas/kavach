import { createClient } from '@supabase/supabase-js'

/**
 * Creates a kavach adapter to work with supabase
 *
 * @param {import('./types').SupabaseConfig} config
 * @param {import('./types').SupabaseLogWriterOptions} options
 * @returns {import('@kavach/core').LogWriter}
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
