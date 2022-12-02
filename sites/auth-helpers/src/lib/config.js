import { env } from '$env/dynamic/public'

export const supabaseConfig = {
	url: env.PUBLIC_SUPABASE_URL,
	anonKey: env.PUBLIC_SUPABASE_ANON_KEY
}

export const appConfig = {
	logLevel: env.PUBLIC_LOG_LEVEL,
	logTable: env.PUBLIC_LOG_TABLE,
	supabase: {
		url: env.PUBLIC_SUPABASE_URL,
		anonKey: env.PUBLIC_SUPABASE_ANON_KEY
	}
}
