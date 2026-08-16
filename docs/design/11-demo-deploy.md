# Demo Deployments — Per-Adapter Sites on Cloudflare Workers

**Status:** Scaffold ready, deploys pending (needs Cloudflare account + DNS).
**Feature:** `docs/features/demo.md` (F3 per-adapter demo sites, F5 discovery)

## 1. Goal

One deployed demo site **per adapter** (Supabase, Firebase, Convex), each a
separate Cloudflare Workers project on its own custom domain
(`<adapter>.kavach.sensei-hq.com`), all built from the shared kit + config in
`sites/showcase`. No runtime adapter switching — each site is standalone,
pinned by `KAVACH_ADAPTER` at build time.

## 2. How a demo site is deployed

The demo (`sites/demo`) is a normal SvelteKit app whose adapter selection
mirrors `sites/learn`:

- `sites/demo/svelte.config.js` selects `@sveltejs/adapter-cloudflare` when
  `WORKERS_CI` (or `CF_PAGES`) is set, else `@sveltejs/adapter-auto`. The
  Cloudflare build emits `.svelte-kit/cloudflare/` (`_worker.js` +
  `.assetsignore`).
- Each adapter has a committed `wrangler.<adapter>.jsonc` (Workers Static
  Assets, `nodejs_compat`) pointing at that output, with the Worker name
  `kavach-<adapter>` and runtime `PUBLIC_KAVACH_ADAPTER` var.
- The deploy script `sites/showcase/deploy-demo.sh <adapter>` loads
  `sites/demo/.env.<adapter>` (build-time `KAVACH_ADAPTER` + `PUBLIC_*`), builds,
  then `wrangler deploy -c wrangler.<adapter>.jsonc` and binds the custom domain.

### Site matrix

| Adapter  | Worker name       | Domain                          |
| -------- | ----------------- | ------------------------------- |
| Supabase | `kavach-supabase` | `supabase.kavach.sensei-hq.com` |
| Firebase | `kavach-firebase` | `firebase.kavach.sensei-hq.com` |
| Convex   | `kavach-convex`   | `convex.kavach.sensei-hq.com`   |

## 3. One-time provisioning (run once, by a maintainer)

1. `bunx wrangler login` (or set `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`).
2. Create the Worker projects + env files:
   ```bash
   cp sites/demo/.env.example sites/demo/.env.supabase
   # fill in PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY (prod values)
   # repeat for .env.firebase, .env.convex
   ```
3. Deploy each adapter:
   ```bash
   ./sites/showcase/deploy-demo.sh supabase
   ./sites/showcase/deploy-demo.sh firebase
   ./sites/showcase/deploy-demo.sh convex
   ```
   The script binds the custom domain via `wrangler domains add` (the account
   must own the `sensei-hq.com` zone). Before DNS, each site is also reachable
   at `kavach-<adapter>.<subdomain>.workers.dev` (`workers_dev: true`).

## 4. CI deploys

`.github/workflows/deploy-demos.yml` — `workflow_dispatch` with an adapter
choice. Requires repo secrets:

- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `DEMO_ENV_SUPABASE`, `DEMO_ENV_FIREBASE`, `DEMO_ENV_CONVEX` — each the adapter's
  env-file contents (`KAVACH_ADAPTER` + `PUBLIC_*`). Written to
  `sites/demo/.env.<adapter>` before the script runs.

The workflow is manual-only so nothing deploys until a maintainer supplies
secrets and hits "Run workflow".

## 5. Not-yet-live adapters (Auth0 / Amplify)

Auth0 and Amplify have **no demo deploy yet**. Two blockers:

1. The Vite plugin's auth generator (`packages/vite/src/generate.js`) only
   emits `$kavach/auth` modules for supabase/firebase/convex — building the demo
   for auth0/amplify throws "No auth generator for adapter".
2. No live credentials.

Until (1) lands, the marketing site handles them: `ADAPTERS.auth0` /
`ADAPTERS.amplify` are `live: false`, so the learn-site platform cards render
them as "coming soon" (no link), and the demo's "Other demos" sidebar shows
them as coming soon. Once the plugin supports an adapter, add a
`wrangler.<adapter>.jsonc` + an env file and the rest of the pipeline works
unchanged.

## 6. Sibling discovery (F5)

- The learn marketing site derives its platform cards from the shared
  `ADAPTERS` + `isLive()` (`sites/learn/src/lib/demo/platforms.ts`) — live
  adapters link to their demo URL, non-live ones are labelled coming soon.
- Each demo's app sidebar lists the sibling adapters ("Other demos"): live
  ones link out, Auth0/Amplify show "Coming soon".

## 7. Verify

```bash
bunx eslint .                      # 0 errors
cd sites/demo && bun run check     # 0 errors
SKIP_DEPLOY=1 ./sites/showcase/deploy-demo.sh supabase   # build-only smoke
```

Per-adapter E2E is the `sites/showcase/e2e` Playwright suite (F7), run against
each deployed demo.
