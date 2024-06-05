import { env } from '$env/dynamic/public'

export const supabaseConfig = {
	url: env.PUBLIC_SUPABASE_URL,
	anonKey: env.PUBLIC_SUPABASE_ANON_KEY
}

export const appConfig = {
	logging: {
		level: env.PUBLIC_LOG_LEVEL,
		table: env.PUBLIC_LOG_TABLE
	},
	supabase: {
		url: env.PUBLIC_SUPABASE_URL,
		anonKey: env.PUBLIC_SUPABASE_ANON_KEY
	}
}
