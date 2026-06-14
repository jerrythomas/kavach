import adapterAuto from '@sveltejs/adapter-auto'
import adapterCloudflare from '@sveltejs/adapter-cloudflare'

// Adapter selection ("keep both" — Cloudflare + everything else):
//   - On Cloudflare Workers Builds (which auto-sets WORKERS_CI) use
//     @sveltejs/adapter-cloudflare explicitly. In that (Workers) mode it emits
//     .svelte-kit/cloudflare/ — a _worker.js plus an auto-generated
//     .assetsignore — which the committed wrangler.jsonc deploys via
//     `wrangler deploy`. Selecting it here (instead of letting adapter-auto
//     auto-install it at build time) avoids the frozen-lockfile auto-install
//     failure.
//   - Do NOT set CF_PAGES=1: it forces adapter-cloudflare into Pages-style
//     output (_routes.json, no .assetsignore) which breaks `wrangler deploy`.
//     CF_PAGES is left in the guard below only as a harmless fallback.
//   - Everywhere else (local, Vercel, CI) adapter-auto picks the right target.
const onCloudflare = Boolean(process.env.WORKERS_CI) || Boolean(process.env.CF_PAGES)
const adapter = onCloudflare ? adapterCloudflare() : adapterAuto()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter
	}
}

export default config
