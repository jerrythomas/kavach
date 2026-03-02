import { createKavach } from 'kavach'
import { getLogger } from '@kavach/logger'
import { getLogWriter, getAdapter, getActions } from '@kavach/adapter-supabase'
import { createClient } from '@supabase/supabase-js'
import { appConfig } from './config'
import { routes } from './routes'
import { goto, invalidateAll, invalidate } from '$app/navigation'

const client = createClient(appConfig.supabase.url, appConfig.supabase.anonKey)
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const writer = getLogWriter(appConfig.supabase, appConfig.logging)
export const logger = getLogger(writer, appConfig.logging)
export const kavach = createKavach(adapter, {
	data,
	logger,
	...routes,
	goto,
	invalidate,
	invalidateAll
})
