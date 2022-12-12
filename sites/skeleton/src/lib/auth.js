import { getLogger } from '@kavach/core'
import { getLogWriter, getAdapter } from '@kavach/adapter-supabase'
// import { createAdapter } from './adapter'
// import { createKavach } from './adapter'
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
