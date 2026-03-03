import { templates } from './templates.js'

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
	return `export default ${serializeJS(config, 0)}
`
}

export function generateAuthPage(config) {
	return config.cachedLogins ? templates.authPageCached : templates.authPage
}

export function generateDataRoute() {
	return templates.dataRoute
}
