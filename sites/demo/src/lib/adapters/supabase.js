import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
import { createClient } from '@supabase/supabase-js'

/**
 * Create Supabase adapter + data plugin.
 *
 * @param {object} config
 * @param {string} config.url     - Supabase project URL
 * @param {string} config.anonKey - Supabase anon key
 * @param {object} [config.logging] - logging config
 * @returns {{ adapter: object, data: function, logger: object }}
 */
export function create(config) {
	const client = createClient(config.url, config.anonKey)

	return {
		adapter: getAdapter(client),
		data: (schema) => getActions(client, schema),
		logger: config.logging
			? getLogger(getLogWriter(config, config.logging), config.logging)
			: undefined
	}
}
