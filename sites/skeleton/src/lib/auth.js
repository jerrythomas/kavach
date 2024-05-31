// import { createClient } from '@supabase/supabase-js'
import { createKavach } from '@kavach/svelte'
import { getLogger } from '@kavach/logger'
import { getLogWriter, getAdapter } from '@kavach/adapter-supabase'
import { appConfig } from './config'
import { routes } from './routes'
import { goto, invalidateAll, invalidate } from '$app/navigation'
import { page } from '$app/stores'

// export const client = createClient(appConfig.supabase.url, appConfig.supabase.anonKey)

const adapter = getAdapter(appConfig.supabase)
const writer = getLogWriter({ client: adapter.client }, appConfig.logging)
export const logger = getLogger(writer, appConfig.logging)
export const kavach = createKavach(adapter, {
	logger,
	...routes,
	goto,
	invalidate,
	invalidateAll,
	page
})
