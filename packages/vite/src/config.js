const KNOWN_ADAPTERS = ['supabase', 'firebase', 'convex']

const ADAPTER_ENV_DEFAULTS = {
	supabase: { url: 'PUBLIC_SUPABASE_URL', anonKey: 'PUBLIC_SUPABASE_ANON_KEY' },
	firebase: {
		apiKey: 'PUBLIC_FIREBASE_API_KEY',
		projectId: 'PUBLIC_FIREBASE_PROJECT_ID',
		appId: 'PUBLIC_FIREBASE_APP_ID'
	},
	convex: { url: 'PUBLIC_CONVEX_URL' }
}

const DEFAULTS = {
	providers: [],
	cachedLogins: false,
	logging: { level: 'error', table: 'logs' },
	routes: {
		auth: '/auth',
		data: '/data',
		rpc: '/rpc',
		logout: '/logout'
	},
	endpoints: {
		data: true,
		rpc: false
	},
	messages: {
		notAuthenticated: 'Not authenticated',
		notSupported: 'Data operations not supported',
		rpcNotSupported: 'RPC operations not supported'
	},
	rules: []
}

export function validateConfig(config) {
	if (!config.adapter) throw new Error('adapter is required')
	if (!KNOWN_ADAPTERS.includes(config.adapter)) {
		throw new Error(`Unknown adapter: "${config.adapter}". Available: ${KNOWN_ADAPTERS.join(', ')}`)
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
			table: raw.logging?.table ?? DEFAULTS.logging.table,
			collection: raw.logging?.collection,
			entity: raw.logging?.entity // reserved — consumed by Convex log writer once user wires up api
		},
		env: { ...envDefaults, ...raw.env },
		routes: {
			auth: raw.routes?.auth ?? DEFAULTS.routes.auth,
			data: raw.routes?.data ?? DEFAULTS.routes.data,
			rpc: raw.routes?.rpc ?? DEFAULTS.routes.rpc,
			logout: raw.routes?.logout ?? DEFAULTS.routes.logout,
			home: raw.routes?.home ?? null
		},
		endpoints: {
			data: raw.endpoints?.data ?? DEFAULTS.endpoints.data,
			rpc: raw.endpoints?.rpc ?? DEFAULTS.endpoints.rpc
		},
		messages: { ...DEFAULTS.messages, ...raw.messages },
		rules: raw.rules ?? DEFAULTS.rules
	}
}
