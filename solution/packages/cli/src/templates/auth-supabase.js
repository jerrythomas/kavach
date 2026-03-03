import { createKavach } from 'kavach'
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

const client = createClient(env.{{url}}, env.{{anonKey}})
const adapter = getAdapter(client)
const data = (schema) => getActions(client, schema)
const writer = getLogWriter({ url: env.{{url}}, anonKey: env.{{anonKey}} }, { table: '{{logTable}}' })
const logger = getLogger(writer, { level: '{{logLevel}}' })

export const kavach = createKavach(adapter, {
	data,
	logger,
	rules: {{rules}}
})
export { adapter, logger }
