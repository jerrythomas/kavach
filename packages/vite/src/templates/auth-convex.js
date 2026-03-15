import { createKavach } from 'kavach'
import { getAdapter, getActions } from '@kavach/adapter-convex'
import { getLogger } from '@kavach/logger'
import { ConvexClient } from 'convex/browser'
import { env } from '$env/dynamic/public'

// Logging: Convex log writing requires the user's api object (api.logs.create).
// Since the api import is project-specific, wire it up manually after scaffolding.
// See @kavach/adapter-convex docs for how to add a writer using your api object.
// Until then, getLogger(null) returns a no-op zero logger — no crash, no writes.
const client = new ConvexClient(env.{{url}})
// adapter: pass your useConvexAuth() result here once set up in the Svelte layout.
// The null placeholder means signIn/signOut are no-ops until replaced. See adapter docs.
const adapter = getAdapter(null)
const data = (api) => getActions(client, api)
const logger = getLogger(null, { level: '{{logLevel}}' })

export const kavach = createKavach(adapter, {
	data,
	logger,
	app: {{app}},
	rules: {{rules}}
})
export { adapter, logger }
