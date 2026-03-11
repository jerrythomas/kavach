/**
 * Adapter registry — maps adapter names to lazy-loaded factory modules.
 * Each module must export: create(config) => { adapter, data? }
 */
export const registry = {
	supabase: () => import('./supabase.js')
}

/**
 * Load and create an adapter instance.
 *
 * @param {string} name    - adapter name (key in registry)
 * @param {object} config  - full appConfig object
 * @returns {Promise<{ adapter: object, data?: function }>}
 */
export async function loadAdapter(name, config) {
	const factory = registry[name]
	if (!factory) {
		throw new Error(`Unknown adapter: "${name}". Available: ${Object.keys(registry).join(', ')}`)
	}

	const mod = await factory()
	const adapterConfig = config[name]
	if (!adapterConfig) {
		throw new Error(`No config found for adapter "${name}". Check your environment variables.`)
	}

	return mod.create(adapterConfig)
}

/**
 * Get list of adapter names that have config present.
 *
 * @param {object} config - full appConfig object
 * @returns {string[]}
 */
export function getAvailableAdapters(config) {
	return Object.keys(registry).filter((name) => config[name])
}
