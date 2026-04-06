import { createKavach } from 'kavach'
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

const client = createClient(env.{{url}}, env.{{anonKey}})
const adapter = getAdapter(client)
const data = (schema, session) => {
	const authedClient = session?.access_token
		? createClient(env.{{url}}, env.{{anonKey}}, {
				global: { headers: { Authorization: `Bearer ${session.access_token}` } },
				auth: { persistSession: false }
		  })
		: client
	return getActions(authedClient, schema)
}
const writer = getLogWriter({ client }, { table: '{{logTable}}' })
const logger = getLogger(writer, { level: '{{logLevel}}' })

export const kavach = createKavach(adapter, {
	data,
	logger,
	app: {{app}},
	rules: {{rules}}
})
export { adapter, logger }
