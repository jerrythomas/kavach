import { env } from '$env/dynamic/public'

export const appConfig = {
	devMode: env.PUBLIC_DEV_MODE === 'true',
	defaultAdapter: env.PUBLIC_AUTH_ADAPTER || 'supabase',
	logging: {
		level: env.PUBLIC_LOG_LEVEL || 'info',
		table: env.PUBLIC_LOG_TABLE || 'logs'
	},
	supabase: env.PUBLIC_SUPABASE_URL
		? {
				url: env.PUBLIC_SUPABASE_URL,
				anonKey: env.PUBLIC_SUPABASE_ANON_KEY,
				logging: {
					level: env.PUBLIC_LOG_LEVEL || 'info',
					table: env.PUBLIC_LOG_TABLE || 'logs'
				}
			}
		: undefined
}
