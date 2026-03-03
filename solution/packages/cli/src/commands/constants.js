export const PROVIDER_DEFAULTS = {
	google: { name: 'google', label: 'Continue with Google' },
	github: { name: 'github', label: 'Continue with GitHub' },
	azure: { name: 'azure', label: 'Continue with Azure', scopes: ['email', 'profile'] },
	magic: { mode: 'otp', name: 'magic', label: 'Email for Magic Link' },
	password: { mode: 'password', name: 'email', label: 'Sign in using' }
}

export const ADAPTER_ENV_DEFAULTS = {
	supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }
}

export const DEPENDENCIES = ['kavach', '@kavach/ui', '@kavach/query', '@kavach/logger']

export const ADAPTER_DEPS = {
	supabase: ['@kavach/adapter-supabase', '@supabase/supabase-js']
}

export const LOG_LEVELS = [
	{ value: 'error', label: 'error' },
	{ value: 'warn', label: 'warn' },
	{ value: 'info', label: 'info' },
	{ value: 'debug', label: 'debug' },
	{ value: 'trace', label: 'trace' }
]

export const PROMPT_CONFIG = [
	{ key: 'adapter', type: 'select', message: 'Which auth adapter?', options: [{ value: 'supabase', label: 'Supabase' }] },
	{ key: 'providers', type: 'multiselect', message: 'Which auth providers?', required: false, getOptions: () => Object.entries(PROVIDER_DEFAULTS).map(([k, v]) => ({ value: k, label: v.label })) },
	{ key: 'cachedLogins', type: 'confirm', message: 'Enable cached logins?', initialValue: false },
	{ key: 'logLevel', type: 'select', message: 'Log level?', options: LOG_LEVELS, initialValue: 'error' },
	{ key: 'logTable', type: 'text', message: 'Log table name?', placeholder: 'logs', defaultValue: 'logs' },
	{ key: 'authRoute', type: 'text', message: 'Auth route path?', placeholder: '(public)/auth', defaultValue: '(public)/auth' },
	{ key: 'dataRoute', type: 'text', message: 'Data route path?', placeholder: '(server)/data', defaultValue: '(server)/data' },
	{ key: 'logoutRoute', type: 'text', message: 'Logout route path?', placeholder: '/logout', defaultValue: '/logout' }
]
