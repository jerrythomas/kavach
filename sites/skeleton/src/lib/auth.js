import { getLogger } from '@kavach/core'
import { getLogWriter } from '@kavach/adapter-supabase'
import { createKavach } from './kavach'
import { appConfig } from './config'
import { createClient } from '@supabase/supabase-js'

export const client = createClient(
	appConfig.supabase.url,
	appConfig.supabase.anonKey
)

const writer = getLogWriter(appConfig.supabase, appConfig.logging)
export const logger = getLogger(writer, appConfig.logging)
export const kavach = createKavach(client, { logger })
