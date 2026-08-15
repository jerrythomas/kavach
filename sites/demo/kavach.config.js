import { ADAPTER_ENV, ADAPTER_PROVIDERS, ROUTES, RULES } from 'showcase-kavach/config'

// Deployment-specific per adapter — the demo's audit-log backends. Not shared
// copy, so it stays here rather than in the kit's demo-config.
const ADAPTER_LOGGING = {
	supabase: { level: 'error', table: 'audit.logs' },
	firebase: { level: 'error', collection: 'logs' },
	convex: { level: 'error', entity: 'logs' }
}

const adapter = process.env.KAVACH_ADAPTER ?? 'supabase'
if (!ADAPTER_ENV[adapter]) {
	throw new Error(
		`Unknown KAVACH_ADAPTER: "${adapter}". Valid options: ${Object.keys(ADAPTER_ENV).join(', ')}`
	)
}

// Derived from the shared kit config (sites/showcase demo-config.js) so the
// framework-facing config and the demo UI can never drift. Only `adapter`,
// `logging`, and `routes` (auth + home — data/logout are app pages, not
// intercepted by the runtime) are layered on top here.
export default {
	adapter,
	env: ADAPTER_ENV[adapter],
	providers: ADAPTER_PROVIDERS[adapter],
	logging: ADAPTER_LOGGING[adapter],
	routes: {
		auth: ROUTES.auth,
		home: ROUTES.home
	},
	rules: RULES
}
