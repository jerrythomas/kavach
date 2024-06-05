// import { createClient } from '@supabase/supabase-js'
import { createKavach } from '@kavach/svelte'
import { getLogger } from '@kavach/logger'
import { getLogWriter, getAdapter } from '@kavach/adapter-supabase'
import { appConfig } from './config'
import { routes } from './routes'
import { goto, invalidateAll, invalidate } from '$app/navigation'

const adapter = getAdapter(appConfig.supabase)
// @ts-ignore
const writer = getLogWriter(appConfig.supabase, appConfig.logging)
// @ts-ignore
export const logger = getLogger(writer, appConfig.logging)
export const kavach = createKavach(adapter, {
	logger,
	...routes,
	goto,
	invalidate,
	invalidateAll
})
