import { PROVIDER_DEFAULTS, ADAPTER_ENV_DEFAULTS } from './commands/constants.js'

export function buildConfig(answers) {
	const providers = (answers.providers ?? []).map(
		(key) => PROVIDER_DEFAULTS[key] ?? { name: key, label: `Continue with ${key}` }
	)

	return {
		adapter: answers.adapter,
		providers,
		cachedLogins: answers.cachedLogins ?? false,
		logging: {
			level: answers.logLevel ?? 'error',
			table: answers.logTable ?? 'logs'
		},
		env: ADAPTER_ENV_DEFAULTS[answers.adapter] ?? {},
		routes: {
			auth: answers.authRoute ?? '(public)/auth',
			data: answers.dataRoute ?? '(server)/data',
			logout: answers.logoutRoute ?? '/logout'
		},
		rules: answers.rules ?? []
	}
}
