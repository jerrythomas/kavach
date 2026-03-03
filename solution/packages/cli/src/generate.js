function serialize(value, indent = 1) {
	const pad = '\t'.repeat(indent)
	const padInner = '\t'.repeat(indent + 1)

	if (value === null || value === undefined) return 'undefined'
	if (typeof value === 'string') return `'${value}'`
	if (typeof value === 'number' || typeof value === 'boolean') return String(value)

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]'
		const items = value.map((v) => `${padInner}${serialize(v, indent + 1)}`).join(',\n')
		return `[\n${items}\n${pad}]`
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value)
		if (entries.length === 0) return '{}'
		const props = entries
			.map(([k, v]) => `${padInner}${k}: ${serialize(v, indent + 1)}`)
			.join(',\n')
		return `{\n${props}\n${pad}}`
	}

	return String(value)
}

function generateConfig(config) {
	return `export const config = ${serialize({
		adapter: config.adapter,
		cachedLogins: config.cachedLogins,
		logging: config.logging,
		routes: config.routes
	})}\n`
}

function generateRoutes(config) {
	return `export const routes = ${serialize({
		paths: config.routes,
		rules: config.rules
	})}\n`
}

function generateProviders(config) {
	return `export const providers = ${serialize(config.providers)}\n`
}

function generateAuth(config) {
	const { env, logging, rules } = config

	if (config.adapter === 'supabase') {
		return `import { createKavach } from 'kavach'
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

const client = createClient(env.${env.url}, env.${env.anonKey})
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const writer = getLogWriter({ url: env.${env.url}, anonKey: env.${env.anonKey} }, { table: ${serialize(logging.table)} })
const logger = getLogger(writer, { level: ${serialize(logging.level)} })

export const kavach = createKavach(adapter, {
	data,
	logger,
	rules: ${serialize(rules)}
})
export { adapter, logger }
`
	}

	throw new Error(`No auth generator for adapter: ${config.adapter}`)
}

const GENERATORS = {
	config: generateConfig,
	routes: generateRoutes,
	providers: generateProviders,
	auth: generateAuth
}

export function generateModule(name, config) {
	const generator = GENERATORS[name]
	if (!generator) throw new Error(`Unknown virtual module: ${name}`)
	return generator(config)
}
