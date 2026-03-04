const KNOWN_ADAPTERS = ['supabase']

const ADAPTER_ENV_DEFAULTS = {
	supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' }
}

const DEFAULTS = {
	providers: [],
	cachedLogins: false,
	logging: { level: 'error', table: 'logs' },
	routes: {
		auth: '(public)/auth',
		data: '(server)/data',
		logout: '/logout'
	},
	rules: []
}

export function validateConfig(config) {
	if (!config.adapter) throw new Error('adapter is required')
	if (!KNOWN_ADAPTERS.includes(config.adapter)) {
		throw new Error(
			`Unknown adapter: "${config.adapter}". Available: ${KNOWN_ADAPTERS.join(', ')}`
		)
	}
	if (config.providers) {
		for (const p of config.providers) {
			if (!p.name) throw new Error('Each provider must have a name — name is required')
		}
	}
}

export function parseConfig(raw) {
	validateConfig(raw)
	const envDefaults = ADAPTER_ENV_DEFAULTS[raw.adapter] ?? {}
	return {
		adapter: raw.adapter,
		providers: raw.providers ?? DEFAULTS.providers,
		cachedLogins: raw.cachedLogins ?? DEFAULTS.cachedLogins,
		logging: {
			level: raw.logging?.level ?? DEFAULTS.logging.level,
			table: raw.logging?.table ?? DEFAULTS.logging.table
		},
		env: { ...envDefaults, ...raw.env },
		routes: {
			auth: raw.routes?.auth ?? DEFAULTS.routes.auth,
			data: raw.routes?.data ?? DEFAULTS.routes.data,
			logout: raw.routes?.logout ?? DEFAULTS.routes.logout
		},
		rules: raw.rules ?? DEFAULTS.rules
	}
}
