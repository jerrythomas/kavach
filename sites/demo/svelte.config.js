import adapterAuto from '@sveltejs/adapter-auto'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'

// Adapter selection — mirrors sites/learn. On Cloudflare Workers Builds (which
// auto-sets WORKERS_CI) use @sveltejs/adapter-cloudflare explicitly: it emits
// .svelte-kit/cloudflare/ (_worker.js + .assetsignore) which the committed
// wrangler.<adapter>.jsonc files deploy via `wrangler deploy`. Do NOT set
// CF_PAGES=1 — it forces Pages-style output and breaks the Workers deploy.
// Everywhere else (local, CI) adapter-auto picks the right target.
const onCloudflare = Boolean(process.env.WORKERS_CI) || Boolean(process.env.CF_PAGES)
const adapter = onCloudflare ? adapterCloudflare() : adapterAuto()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter
	}
}

export default config
