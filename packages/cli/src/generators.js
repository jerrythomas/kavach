import { templates } from '@kavach/vite'
import { getAdapterCapabilities } from './adapters.js'

function serializeJS(value, indent = 1) {
	const pad = '\t'.repeat(indent)
	const padInner = '\t'.repeat(indent + 1)

	if (value === null || value === undefined) return 'undefined'
	if (typeof value === 'string') return `'${value}'`
	if (typeof value === 'number' || typeof value === 'boolean') return String(value)

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]'
		const items = value.map((v) => `${padInner}${serializeJS(v, indent + 1)}`).join(',\n')
		return `[\n${items}\n${pad}]`
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value)
		if (entries.length === 0) return '{}'
		const props = entries
			.map(([k, v]) => `${padInner}${k}: ${serializeJS(v, indent + 1)}`)
			.join(',\n')
		return `{\n${props}\n${pad}}`
	}

	return String(value)
}

export function generateConfigFile(config) {
	const capabilities = getAdapterCapabilities(config.adapter)
	const supportedFeatures = capabilities?.supports || {}

	// Filter config based on capabilities
	const filteredConfig = {
		adapter: config.adapter,
		providers: config.providers,
		cachedLogins: config.cachedLogins,
		env: config.env,
		routes: config.routes,
		rules: config.rules
	}

	// Only include if supported
	if (supportedFeatures.data && config.dataRoute) {
		filteredConfig.dataRoute = config.dataRoute
	}

	if (supportedFeatures.rpc && config.rpcRoute) {
		filteredConfig.rpcRoute = config.rpcRoute
	}

	if (supportedFeatures.logging && config.logging?.enabled) {
		filteredConfig.logging = {
			level: config.logging.level,
			table: config.logging.table
		}
	}

	return `export default ${serializeJS(filteredConfig, 0)}
`
}

export function generateAuthPage(config) {
	return config.cachedLogins ? templates.authPageCached : templates.authPage
}

export function generateDataRoute() {
	return templates.dataRoute
}

export function generateRpcRoute() {
	return templates.rpcRoute || `import { RPC } from 'kavach'

export const { GET, POST, PUT, PATCH, DELETE } = RPC
`
}
