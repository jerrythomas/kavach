import { createKavach } from '@kavach/svelte'
import { getAdapter } from '@kavach/adapter-supabase'
import { invalidate } from '$app/navigation'

export const config = {
	supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
}

const client = getAdapter(config)
export const kavach = createKavach(client, { invalidate })
