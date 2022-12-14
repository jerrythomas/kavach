import { getLogger } from '@kavach/logger'
// import { zeroLogger } from '@kavach/logger'
import { getLogWriter, getAdapter } from '@kavach/adapter-supabase'
import { createKavach } from '@kavach/svelte'
import { appConfig } from './config'
import { createClient } from '@supabase/supabase-js'
import { routes } from './routes'
import { goto, invalidateAll, invalidate } from '$app/navigation'

export const client = createClient(
	appConfig.supabase.url,
	appConfig.supabase.anonKey
)

const writer = getLogWriter(appConfig.supabase, appConfig.logging)
const adapter = getAdapter(appConfig.supabase)
export const logger = getLogger(writer, appConfig.logging)
export const kavach = createKavach(adapter, {
	logger,
	...routes,
	goto,
	invalidate,
	invalidateAll
})
