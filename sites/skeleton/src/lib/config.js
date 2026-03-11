import { env } from '$env/dynamic/public'
import { getLogLevel } from '@kavach/logger'

export const appConfig = {
	logging: {
		/** @type{import('@kavach/logger').LogLevel} */
		level: getLogLevel(env.PUBLIC_LOG_LEVEL),
		table: env.PUBLIC_LOG_TABLE
	},
	/** @type {import('@kavach/adapter-supabase').SupabaseConfig} */
	supabase: {
		url: env.PUBLIC_SUPABASE_URL,
		anonKey: env.PUBLIC_SUPABASE_ANON_KEY
	}
}
