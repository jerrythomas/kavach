import * as p from '@clack/prompts'
import { getAdapterList, getAdapterCapabilities, getSupportedProviders } from './adapters.js'
import { validateConfig, formatValidationOutput } from './validation.js'
import { generateDDLInstructions, formatDDLOutput } from './ddl.js'

const ADAPTER_ENV_DEFAULTS = {
	supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }
}

export function buildConfig(answers) {
	const providers = (answers.providers || []).map((key) => {
		const defaults = {
			google: { name: 'google', label: 'Continue with Google' },
			github: { name: 'github', label: 'Continue with GitHub' },
			azure: { name: 'azure', label: 'Continue with Azure', scopes: ['email', 'profile'] },
			magic: { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
			password: { mode: 'password', name: 'email', label: 'Sign in using' }
		}
		return defaults[key] || { name: key, label: key }
	})

	let logging = answers.logging
	if (!logging && (answers.logLevel || answers.logTable)) {
		logging = { level: answers.logLevel, table: answers.logTable }
	}
	if (!logging) {
		logging = { enabled: false }
	}

	return {
		adapter: answers.adapter,
		providers,
		cachedLogins: answers.cachedLogins ?? false,
		logging,
		env: ADAPTER_ENV_DEFAULTS[answers.adapter] || {},
		routes: {
			auth: answers.authRoute || '(public)/auth',
			data: answers.dataRoute || '(server)/data',
			logout: answers.logoutRoute || '/logout'
		},
		rpcRoute: answers.rpcRoute,
		dataRoute: answers.dataRoute,
		rules: answers.rules || []
	}
}

export async function promptAdapterSelection() {
	const adapters = getAdapterList()

	const adapter = await p.select({
		message: 'Which auth adapter?',
		options: adapters
	})

	return adapter
}

export async function promptProviderSelection(adapterName) {
	const capabilities = getAdapterCapabilities(adapterName)
	const supportedProviders = getSupportedProviders(capabilities)

	const options = supportedProviders.map((provider) => ({
		value: provider.name,
		label: provider.label,
		hint: provider.scopes ? `Scopes: ${provider.scopes.join(', ')}` : undefined
	}))

	const providers = await p.multiselect({
		message: 'Which auth providers?',
		options,
		required: false
	})

	return providers
}

export async function promptDataRoute(adapterName) {
	const capabilities = getAdapterCapabilities(adapterName)

	if (!capabilities.supports.data) {
		p.log.warn(`Data endpoints not supported by ${capabilities.displayName}`)
		return { enabled: false, path: null }
	}

	const path = await p.text({
		message: 'Data route path?',
		placeholder: '(server)/data',
		defaultValue: '(server)/data'
	})

	return { enabled: true, path }
}

export async function promptRpcRoute(adapterName) {
	const capabilities = getAdapterCapabilities(adapterName)

	if (!capabilities.supports.rpc) {
		p.log.warn(`RPC not supported by ${capabilities.displayName}`)
		return { enabled: false, path: null }
	}

	const path = await p.text({
		message: 'RPC route path?',
		placeholder: '(server)/rpc',
		defaultValue: '(server)/rpc'
	})

	return { enabled: true, path }
}

export async function promptLoggingConfig(adapterName) {
	const capabilities = getAdapterCapabilities(adapterName)

	if (!capabilities.supports.logging) {
		p.log.warn(`Logging not supported by ${capabilities.displayName}`)
		return { enabled: false, table: null, level: null }
	}

	const enabled = await p.confirm({
		message: 'Enable audit logging?',
		initialValue: true
	})

	if (!enabled) {
		return { enabled: false, table: null, level: null }
	}

	const table = await p.text({
		message: 'Log table name?',
		placeholder: capabilities.ddl?.logging?.table || 'audit_logs',
		defaultValue: capabilities.ddl?.logging?.table || 'audit_logs'
	})

	const level = await p.select({
		message: 'Log level?',
		options: [
			{ value: 'error', label: 'error' },
			{ value: 'warn', label: 'warn' },
			{ value: 'info', label: 'info' },
			{ value: 'debug', label: 'debug' },
			{ value: 'trace', label: 'trace' }
		],
		initialValue: 'info'
	})

	return { enabled: true, table, level }
}

export async function promptAuthRoute() {
	return await p.text({
		message: 'Auth route path?',
		placeholder: '(public)/auth',
		defaultValue: '(public)/auth'
	})
}

export async function promptLogoutRoute() {
	return await p.text({
		message: 'Logout route path?',
		placeholder: '/logout',
		defaultValue: '/logout'
	})
}

export async function promptCachedLogins() {
	return await p.confirm({
		message: 'Enable cached logins?',
		initialValue: false
	})
}

export async function promptRules() {
	const isPublic = await p.confirm({
		message: 'Make /public route public?',
		initialValue: true
	})

	const rules = []

	if (isPublic) {
		rules.push({ path: '/public', public: true })
	}

	return rules
}

export async function showValidationWarnings(config, adapterName) {
	const capabilities = getAdapterCapabilities(adapterName)
	const validation = validateConfig(config, capabilities)

	if (validation.warnings.length > 0 || validation.errors.length > 0) {
		p.log.warn(formatValidationOutput(validation))
	}
}

export async function showDDLInstructions(config, adapterName) {
	const capabilities = getAdapterCapabilities(adapterName)
	const ddl = generateDDLInstructions(capabilities, config)

	if (ddl) {
		p.log.info(formatDDLOutput(ddl))
	}
}
