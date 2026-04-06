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

	if (typeof value === 'function') return value.toString()

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

function generateAuth(config, viteEnv = {}) {
	const { env, logging, rules, routes } = config
	const app = {}
	if (routes?.home) app.home = routes.home
	if (routes?.auth) app.login = routes.auth
	if (routes?.logout) app.logout = routes.logout
	if (routes?.data) app.data = routes.data
	if (routes?.rpc) app.rpc = routes.rpc

	if (config.adapter === 'supabase') {
		return templates.authSupabase
			.replaceAll('{{url}}', env.url)
			.replaceAll('{{anonKey}}', env.anonKey)
			.replaceAll('{{logTable}}', logging.table)
			.replaceAll('{{logLevel}}', logging.level)
			.replaceAll('{{app}}', serialize(app))
			.replaceAll('{{rules}}', serialize(rules))
	}

	if (config.adapter === 'firebase') {
		// Embed env var values as literals — avoids SvelteKit $env timing issues at module init.
		const apiKey = JSON.stringify(viteEnv[env.apiKey] ?? '')
		const projectId = JSON.stringify(viteEnv[env.projectId] ?? '')
		const appId = JSON.stringify(viteEnv[env.appId] ?? '')

		const hasEmulator = Boolean(env.authEmulatorHost)
		const emulatorImport = hasEmulator ? ', connectAuthEmulator' : ''
		const emulatorHostValue = hasEmulator ? (viteEnv[env.authEmulatorHost] ?? '') : ''
		const emulatorBlock = hasEmulator
			? `if (${JSON.stringify(emulatorHostValue)}) {\n\tconnectAuthEmulator(auth, ${JSON.stringify(emulatorHostValue)}, { disableWarnings: true })\n}`
			: ''

		return templates.authFirebase
			.replaceAll('{{apiKey}}', apiKey)
			.replaceAll('{{projectId}}', projectId)
			.replaceAll('{{appId}}', appId)
			.replaceAll('{{emulatorImport}}', emulatorImport)
			.replaceAll('{{emulatorBlock}}', emulatorBlock)
			.replaceAll('{{logCollection}}', logging.collection ?? 'logs')
			.replaceAll('{{logLevel}}', logging.level)
			.replaceAll('{{app}}', serialize(app))
			.replaceAll('{{rules}}', serialize(rules))
	}

	if (config.adapter === 'convex') {
		return templates.authConvex
			.replaceAll('{{url}}', env.url)
			.replaceAll('{{logLevel}}', logging.level)
			.replaceAll('{{app}}', serialize(app))
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

export function generateModule(name, config, viteEnv = {}) {
	const generator = GENERATORS[name]
	if (!generator) throw new Error(`Unknown virtual module: ${name}`)
	return generator(config, viteEnv)
}
