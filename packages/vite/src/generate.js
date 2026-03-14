import { templates } from './templates.js'

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
		routes: config.routes,
		endpoints: config.endpoints,
		messages: config.messages
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
		return templates.authSupabase
			.replaceAll('{{url}}', env.url)
			.replaceAll('{{anonKey}}', env.anonKey)
			.replaceAll('{{logTable}}', logging.table)
			.replaceAll('{{logLevel}}', logging.level)
			.replaceAll('{{rules}}', serialize(rules))
	}

	if (config.adapter === 'firebase') {
		const hasEmulator = Boolean(env.authEmulatorHost)
		const emulatorImport = hasEmulator ? ', connectAuthEmulator' : ''
		const emulatorBlock = hasEmulator
			? `if (env.${env.authEmulatorHost}) {\n\tconnectAuthEmulator(auth, env.${env.authEmulatorHost}, { disableWarnings: true })\n}`
			: ''

		return templates.authFirebase
			.replaceAll('{{apiKey}}', env.apiKey)
			.replaceAll('{{projectId}}', env.projectId)
			.replaceAll('{{appId}}', env.appId)
			.replaceAll('{{emulatorImport}}', emulatorImport)
			.replaceAll('{{emulatorBlock}}', emulatorBlock)
			.replaceAll('{{logCollection}}', logging.collection ?? 'logs')
			.replaceAll('{{logLevel}}', logging.level)
			.replaceAll('{{rules}}', serialize(rules))
	}

	if (config.adapter === 'convex') {
		return templates.authConvex
			.replaceAll('{{url}}', env.url)
			.replaceAll('{{logLevel}}', logging.level)
			.replaceAll('{{rules}}', serialize(rules))
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
