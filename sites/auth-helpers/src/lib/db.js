import { createClient } from '@supabase/auth-helpers-sveltekit'
import { appConfig } from './config'

export const supabaseClient = createClient(
	appConfig.supabase.url,
	appConfig.supabase.anonKey
)
