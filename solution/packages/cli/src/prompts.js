export const PROVIDER_DEFAULTS = {
	google: { name: 'google', label: 'Continue with Google' },
	github: { name: 'github', label: 'Continue with GitHub' },
	azure: { name: 'azure', label: 'Continue with Azure', scopes: ['email', 'profile'] },
	magic: { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
	password: { mode: 'password', name: 'email', label: 'Sign in using' }
}

const ADAPTER_ENV_DEFAULTS = {
	supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }
}

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
