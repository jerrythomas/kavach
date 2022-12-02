import { appConfig } from './config'
import { getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/core'

const writer = getLogWriter(appConfig.supabase, {
	table: appConfig.logTable ?? 'svelte_logs'
})

export const logger = getLogger(writer, { level: appConfig.logLevel ?? 'info' })
