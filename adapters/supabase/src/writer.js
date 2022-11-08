import { createClient } from '@supabase/supabase-js'
import { LOG_ATTRIBUTES } from './constants'
/**
 * @typedef SupabaseConfig
 * @property {string} supabaseUrl
 * @property {string} supabaseAnonKey
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
	const client = createClient(config.supabaseUrl, config.supabaseAnonKey)

	/** @type {import('@kavach/core').LogWriter} */
	const adapter = {
		write: async (data) => {
			let flat = {
				...pick(LOG_ATTRIBUTES, data),
				...pick(LOG_ATTRIBUTES, data.details ?? {}),
				details: omit(LOG_ATTRIBUTES, data.details ?? {})
			}
			await client.from(options.table).insert(flat)
		}
	}

	return adapter
}
