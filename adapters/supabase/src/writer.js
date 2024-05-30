import { createClient } from '@supabase/supabase-js'
import { pick } from 'ramda'

/**
 * Creates a kavach adapter to work with supabase
 *
 * @param {import('./types').SupabaseConfig} config
 * @param {import('./types').SupabaseLogWriterOptions} options
 * @returns {import('@kavach/core').LogWriter}
 */
export function getLogWriter(config, options) {
	const client =
		config.client ??
		createClient(config.url, config.anonKey, { db: pick(['schema'], config) })
	const { table = 'logs' } = options ?? {}

	/** @type {import('@kavach/core').LogWriter} */
	const adapter = {
		write: async (data) => {
			await client.from(table).insert(data)
		}
	}

	return adapter
}
