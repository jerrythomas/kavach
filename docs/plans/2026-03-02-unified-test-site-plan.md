# Unified Test Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a single `sites/demo/` SvelteKit app with a switchable adapter registry, replacing the per-adapter test sites.

**Architecture:** Adapter registry pattern with lazy-loaded factory functions. Per-request kavach instance created in `hooks.server.js` based on URL param > cookie > env var precedence. Dev-mode runtime switcher in header. Playwright e2e tests against Supabase (Phase 1).

**Tech Stack:** SvelteKit 2, Svelte 5, UnoCSS, Playwright, kavach + @kavach/adapter-supabase + @kavach/ui + @kavach/logger

**Design:** `docs/plans/2026-03-02-unified-test-site-design.md`

---

### Task 1: Scaffold the Demo Site

Create the bare SvelteKit project with all config files, copying from the supabase site as a base.

**Files:**
- Create: `sites/demo/package.json`
- Create: `sites/demo/svelte.config.js`
- Create: `sites/demo/vite.config.js`
- Create: `sites/demo/uno.config.js`
- Create: `sites/demo/jsconfig.json`
- Create: `sites/demo/src/app.html`
- Create: `sites/demo/src/app.css`
- Copy:   `sites/supabase/static/` → `sites/demo/static/`

**Step 1: Create `sites/demo/package.json`**

```json
{
  "name": "kavach-demo",
  "version": "1.0.0-next.1",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./jsconfig.json",
    "test": "playwright test",
    "test:unit": "vitest",
    "format": "prettier --write .",
    "lint": "eslint --fix ."
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@sveltejs/adapter-auto": "^6.0.0",
    "@sveltejs/kit": "^2.20.8",
    "@sveltejs/vite-plugin-svelte": "^5.0.3",
    "@testing-library/svelte": "^5.2.7",
    "@unocss/core": "66.1.0",
    "@unocss/extractor-svelte": "66.1.0",
    "@unocss/preset-icons": "66.1.0",
    "@unocss/preset-typography": "66.1.0",
    "@unocss/preset-uno": "66.1.0",
    "@unocss/reset": "66.1.0",
    "@unocss/transformer-directives": "66.1.0",
    "eslint": "^9.26.0",
    "jsdom": "^26.1.0",
    "prettier": "^3.5.3",
    "prettier-plugin-svelte": "^3.3.3",
    "svelte": "^5.28.2",
    "svelte-check": "^4.1.7",
    "typescript": "^5.8.3",
    "unocss": "66.1.0",
    "vite": "^6.3.5",
    "vitest": "^3.1.3"
  },
  "type": "module",
  "dependencies": {
    "@fontsource/open-sans": "^5.2.5",
    "@fontsource/overpass": "^5.2.5",
    "@kavach/adapter-supabase": "workspace:*",
    "kavach": "workspace:*",
    "@kavach/logger": "workspace:*",
    "@kavach/ui": "workspace:*",
    "@rokkit/actions": "link:@rokkit/actions",
    "@rokkit/core": "link:@rokkit/core",
    "@rokkit/icons": "link:@rokkit/icons",
    "@rokkit/states": "link:@rokkit/states",
    "@rokkit/themes": "link:@rokkit/themes",
    "@supabase/supabase-js": "^2.49.4",
    "ramda": "^0.30.1"
  }
}
```

**Step 2: Create `sites/demo/svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
}

export default config
```

No mdsvex — this is a test/demo app, not a docs site.

**Step 3: Create `sites/demo/vite.config.js`**

```js
import { readFileSync } from 'fs'
import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [unocss(), sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
}

export default config
```

**Step 4: Create `sites/demo/uno.config.js`**

Copy from `sites/supabase/uno.config.js` verbatim — same UnoCSS + rokkit theme setup.

**Step 5: Create `sites/demo/jsconfig.json`**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true
  }
}
```

**Step 6: Create `sites/demo/src/app.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="thin-scroll rokkit">
    <app>%sveltekit.body%</app>
  </body>
</html>
```

**Step 7: Create `sites/demo/src/app.css`**

Copy from `sites/supabase/src/app.css` — same base styles. Remove font imports not in package.json (victor-mono, lemonada).

**Step 8: Copy static assets**

```bash
cp -r sites/supabase/static sites/demo/static
```

**Step 9: Install dependencies and verify**

```bash
cd solution && bun install
```

**Step 10: Commit**

```bash
git add sites/demo/
git commit -m "feat(demo): scaffold demo site with SvelteKit + UnoCSS config"
```

---

### Task 2: Adapter Resolution Logic

The resolver determines which adapter to use. This is pure logic and fully testable.

**Files:**
- Create: `sites/demo/src/lib/resolveAdapter.js`
- Create: `sites/demo/spec/resolveAdapter.spec.js`

**Step 1: Write the failing tests**

Create `sites/demo/spec/resolveAdapter.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { resolveAdapterName } from '../src/lib/resolveAdapter.js'

describe('resolveAdapterName', () => {
	it('returns adapter from URL search param', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost?adapter=firebase'),
			cookies: { get: () => undefined },
			env: {}
		})
		expect(result).toBe('firebase')
	})

	it('falls back to cookie when no URL param', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: (name) => (name === 'kavach-adapter' ? 'convex' : undefined) },
			env: {}
		})
		expect(result).toBe('convex')
	})

	it('falls back to env var when no URL param or cookie', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: () => undefined },
			env: { PUBLIC_AUTH_ADAPTER: 'auth0' }
		})
		expect(result).toBe('auth0')
	})

	it('defaults to supabase when nothing is set', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: () => undefined },
			env: {}
		})
		expect(result).toBe('supabase')
	})

	it('ignores URL param when dev mode is off', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost?adapter=firebase'),
			cookies: { get: () => undefined },
			env: { PUBLIC_AUTH_ADAPTER: 'supabase' },
			devMode: false
		})
		expect(result).toBe('supabase')
	})

	it('ignores cookie when dev mode is off', () => {
		const result = resolveAdapterName({
			url: new URL('http://localhost'),
			cookies: { get: (name) => (name === 'kavach-adapter' ? 'firebase' : undefined) },
			env: { PUBLIC_AUTH_ADAPTER: 'supabase' },
			devMode: false
		})
		expect(result).toBe('supabase')
	})
})
```

**Step 2: Run tests to verify they fail**

Run: `cd solution && bun vitest run sites/demo/spec/resolveAdapter.spec.js`
Expected: FAIL — module not found

**Step 3: Implement `resolveAdapterName`**

Create `sites/demo/src/lib/resolveAdapter.js`:

```js
/**
 * Resolve which adapter to use.
 * Precedence: URL param > cookie > env var > 'supabase'
 *
 * @param {object} options
 * @param {URL}    options.url
 * @param {object} options.cookies - SvelteKit cookies object
 * @param {object} options.env     - public env vars
 * @param {boolean} [options.devMode=true] - whether dev-mode switching is enabled
 * @returns {string} adapter name
 */
export function resolveAdapterName({ url, cookies, env, devMode = true }) {
	if (devMode) {
		const fromUrl = url.searchParams.get('adapter')
		if (fromUrl) return fromUrl

		const fromCookie = cookies.get('kavach-adapter')
		if (fromCookie) return fromCookie
	}

	return env.PUBLIC_AUTH_ADAPTER || 'supabase'
}
```

**Step 4: Run tests to verify they pass**

Run: `cd solution && bun vitest run sites/demo/spec/resolveAdapter.spec.js`
Expected: 6 tests PASS

**Step 5: Run full test suite**

Run: `cd solution && bun vitest run`
Expected: All tests pass (413 + 6 = 419)

**Step 6: Commit**

```bash
git add sites/demo/src/lib/resolveAdapter.js sites/demo/spec/resolveAdapter.spec.js
git commit -m "feat(demo): add adapter resolution with URL > cookie > env precedence"
```

---

### Task 3: Adapter Registry & Supabase Factory

The registry maps adapter names to lazy-loaded factory modules. Each factory returns `{ adapter, data }`.

**Files:**
- Create: `sites/demo/src/lib/adapters/index.js`
- Create: `sites/demo/src/lib/adapters/supabase.js`

**Step 1: Create `sites/demo/src/lib/adapters/index.js`**

```js
/**
 * Adapter registry — maps adapter names to lazy-loaded factory modules.
 * Each module must export: create(config) => { adapter, data? }
 */
export const registry = {
	supabase: () => import('./supabase.js')
}

/**
 * Load and create an adapter instance.
 *
 * @param {string} name    - adapter name (key in registry)
 * @param {object} config  - full appConfig object
 * @returns {Promise<{ adapter: object, data?: function }>}
 */
export async function loadAdapter(name, config) {
	const factory = registry[name]
	if (!factory) {
		throw new Error(`Unknown adapter: "${name}". Available: ${Object.keys(registry).join(', ')}`)
	}

	const mod = await factory()
	const adapterConfig = config[name]
	if (!adapterConfig) {
		throw new Error(`No config found for adapter "${name}". Check your environment variables.`)
	}

	return mod.create(adapterConfig)
}

/**
 * Get list of adapter names that have config present.
 *
 * @param {object} config - full appConfig object
 * @returns {string[]}
 */
export function getAvailableAdapters(config) {
	return Object.keys(registry).filter((name) => config[name])
}
```

**Step 2: Create `sites/demo/src/lib/adapters/supabase.js`**

```js
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
import { createClient } from '@supabase/supabase-js'

/**
 * Create Supabase adapter + data plugin.
 *
 * @param {object} config
 * @param {string} config.url     - Supabase project URL
 * @param {string} config.anonKey - Supabase anon key
 * @param {object} [config.logging] - logging config
 * @returns {{ adapter: object, data: function, logger: object }}
 */
export function create(config) {
	const client = createClient(config.url, config.anonKey)

	return {
		adapter: getAdapter(client),
		data: (schema) => getActions(client, schema),
		logger: config.logging
			? getLogger(getLogWriter(config, config.logging), config.logging)
			: undefined
	}
}
```

**Step 3: Commit**

```bash
git add sites/demo/src/lib/adapters/
git commit -m "feat(demo): add adapter registry with supabase factory"
```

---

### Task 4: Config & Shared Lib

App config, db helper, routes config — adapted from supabase site.

**Files:**
- Create: `sites/demo/src/lib/config.js`
- Create: `sites/demo/src/lib/db.js`
- Create: `sites/demo/src/lib/routes.js`
- Create: `sites/demo/src/lib/index.js`

**Step 1: Create `sites/demo/src/lib/config.js`**

```js
import { env } from '$env/dynamic/public'

export const appConfig = {
	devMode: env.PUBLIC_DEV_MODE === 'true',
	defaultAdapter: env.PUBLIC_AUTH_ADAPTER || 'supabase',
	logging: {
		level: env.PUBLIC_LOG_LEVEL || 'info',
		table: env.PUBLIC_LOG_TABLE || 'logs'
	},
	supabase: env.PUBLIC_SUPABASE_URL
		? {
				url: env.PUBLIC_SUPABASE_URL,
				anonKey: env.PUBLIC_SUPABASE_ANON_KEY,
				logging: {
					level: env.PUBLIC_LOG_LEVEL || 'info',
					table: env.PUBLIC_LOG_TABLE || 'logs'
				}
			}
		: undefined
}
```

Note: Each adapter config is only present when the required env vars exist. `getAvailableAdapters()` uses this to decide what to show in the switcher.

**Step 2: Create `sites/demo/src/lib/db.js`**

```js
/**
 * @typedef Entity
 * @property {string} [schema]
 * @property {string} entity
 */

/**
 * @param {string[]} slug
 * @returns {Entity}
 */
export function getEntity(slug) {
	if (slug.length === 1) return { entity: slug[0] }
	else return { schema: slug[0], entity: slug[1] }
}
```

**Step 3: Create `sites/demo/src/lib/routes.js`**

```js
export const routes = {
	rules: [{ path: '/public', public: true }]
}
```

**Step 4: Create `sites/demo/src/lib/index.js`**

```js
import { watchMedia } from '@rokkit/states'

export const media = watchMedia()
```

Note: Unlike the supabase site, `kavach` is NOT exported from `lib/index.js` — it's per-request on the server and initialized via layout on the client.

**Step 5: Commit**

```bash
git add sites/demo/src/lib/config.js sites/demo/src/lib/db.js sites/demo/src/lib/routes.js sites/demo/src/lib/index.js
git commit -m "feat(demo): add config, db helper, routes, and lib index"
```

---

### Task 5: Server Hooks — Per-Request Kavach

The core architectural change: kavach is created per-request based on the resolved adapter.

**Files:**
- Create: `sites/demo/src/hooks.server.js`
- Create: `sites/demo/src/routes/+layout.server.js`

**Step 1: Create `sites/demo/src/hooks.server.js`**

```js
import { createKavach } from 'kavach'
import { appConfig } from '$lib/config'
import { routes } from '$lib/routes'
import { resolveAdapterName } from '$lib/resolveAdapter'
import { loadAdapter, getAvailableAdapters } from '$lib/adapters'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const adapterName = resolveAdapterName({
		url: event.url,
		cookies: event.cookies,
		env: { PUBLIC_AUTH_ADAPTER: appConfig.defaultAdapter },
		devMode: appConfig.devMode
	})

	const { adapter, data, logger } = await loadAdapter(adapterName, appConfig)

	const kavach = createKavach(adapter, {
		data,
		logger,
		...routes
	})

	event.locals.kavach = kavach
	event.locals.adapter = adapterName
	event.locals.adapters = getAvailableAdapters(appConfig)
	event.locals.devMode = appConfig.devMode

	// Persist adapter choice in cookie (dev mode only)
	if (appConfig.devMode) {
		event.cookies.set('kavach-adapter', adapterName, {
			path: '/',
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		})
	}

	return kavach.handle({ event, resolve })
}
```

**Step 2: Create `sites/demo/src/routes/+layout.server.js`**

```js
/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	return {
		// @ts-ignore
		version: __APP_VERSION__,
		title: 'Kavach Demo',
		adapter: locals.adapter,
		adapters: locals.adapters,
		devMode: locals.devMode,
		...locals
	}
}
```

**Step 3: Commit**

```bash
git add sites/demo/src/hooks.server.js sites/demo/src/routes/+layout.server.js
git commit -m "feat(demo): add per-request kavach hooks and layout server load"
```

---

### Task 6: Root Layout & Auth Initialization

Root layout that initializes auth state on the client and renders header + slot.

**Files:**
- Create: `sites/demo/src/routes/+layout.svelte`
- Create: `sites/demo/src/routes/Header.svelte`

**Step 1: Create `sites/demo/src/routes/+layout.svelte`**

```svelte
<script>
	import 'uno.css'
	import '../app.css'

	import Header from './Header.svelte'
	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { page } from '$app/states'
	import { media } from '$lib'

	const site = writable({
		sidebar: $media.large
	})
	export let data

	setContext('site', site)
	setContext('media', media)

	onMount(async () => {
		// Dynamically import and initialize kavach on the client
		const adapterName = data.adapter
		const { loadAdapter } = await import('$lib/adapters')
		const { appConfig } = await import('$lib/config')
		const { createKavach } = await import('kavach')
		const { routes } = await import('$lib/routes')
		const { goto, invalidateAll, invalidate } = await import('$app/navigation')

		const { adapter, data: dataPlugin, logger } = await loadAdapter(adapterName, appConfig)
		const kavach = createKavach(adapter, {
			data: dataPlugin,
			logger,
			...routes,
			goto,
			invalidate,
			invalidateAll
		})

		setContext('kavach', kavach)
		kavach.onAuthChange($page.url)
	})
</script>

<Header
	user={data.session?.user}
	title={data.title}
	adapter={data.adapter}
	adapters={data.adapters}
	devMode={data.devMode}
/>
<slot />
```

**Step 2: Create `sites/demo/src/routes/Header.svelte`**

```svelte
<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation'

	export let title
	export let user
	export let adapter = 'supabase'
	export let adapters = []
	export let devMode = false

	let loading = false

	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))
</script>

<header
	class="flex min-h-14 w-full bg-neutral-base items-center justify-between relative border-b border-neutral-inset"
>
	{#if loading}
		<div class="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
	{/if}
	<div class="flex items-center gap-2 px-4">
		<a href="/" class="flex items-center">
			<img src="favicon.png" alt="logo" class="aspect-square h-8" />
		</a>
		<p>{title}</p>
	</div>

	<div class="flex items-center gap-4 pr-4">
		{#if devMode && adapters.length > 1}
			<div class="flex items-center gap-2 text-sm">
				<span class="text-neutral-500">Adapter:</span>
				<select
					class="bg-neutral-base border border-neutral-300 rounded px-2 py-1 text-sm"
					value={adapter}
					onchange={(e) => {
						document.cookie = `kavach-adapter=${e.target.value};path=/;max-age=2592000`
						window.location.reload()
					}}
				>
					{#each adapters as name}
						<option value={name} selected={name === adapter}>{name}</option>
					{/each}
				</select>
			</div>
		{:else}
			<span class="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">{adapter}</span>
		{/if}

		{#if user}
			<a href="/logout" class="text-sm text-neutral-600 hover:text-neutral-800">Logout</a>
		{/if}
	</div>
</header>
```

The adapter switcher is inline in the header — a dropdown when devMode + multiple adapters, or a static badge otherwise.

**Step 3: Commit**

```bash
git add sites/demo/src/routes/+layout.svelte sites/demo/src/routes/Header.svelte
git commit -m "feat(demo): add root layout with client-side kavach init and header with adapter switcher"
```

---

### Task 7: Public Routes — Auth & Public Pages

**Files:**
- Create: `sites/demo/src/routes/(public)/auth/+layout.svelte`
- Create: `sites/demo/src/routes/(public)/auth/+page.svelte`
- Create: `sites/demo/src/routes/(public)/public/+page.svelte`

**Step 1: Create `sites/demo/src/routes/(public)/auth/+layout.svelte`**

```svelte
<div
	class="flex flex-row w-full border border-neutral-200 md:rounded-md md:shadow-lg md:max-w-100 md:mx-auto mt-10"
>
	<slot />
</div>
```

**Step 2: Create `sites/demo/src/routes/(public)/auth/+page.svelte`**

```svelte
<script>
	import { AuthProvider } from '@kavach/ui'
</script>

<nav class="flex flex-col flex-grow items-center p-8 gap-2">
	<section class="flex flex-col w-full gap-2 py-2">
		<AuthProvider name="azure" label="Continue With Azure" scopes={['email', 'profile']} />
	</section>
</nav>
```

**Step 3: Create `sites/demo/src/routes/(public)/public/+page.svelte`**

```svelte
<div class="flex flex-col p-8 gap-4">
	<p>This is a public page</p>
	<a href="/" class="p-2 bg-primary-600 text-white rounded text-center">Home</a>
</div>
```

**Step 4: Commit**

```bash
git add sites/demo/src/routes/\(public\)/
git commit -m "feat(demo): add public auth and landing pages"
```

---

### Task 8: Protected Routes — Dashboard, Logout, Data

**Files:**
- Create: `sites/demo/src/routes/(app)/+page.svelte`
- Create: `sites/demo/src/routes/(app)/logout/+page.svelte`
- Create: `sites/demo/src/routes/(app)/data/+page.svelte`

**Step 1: Create `sites/demo/src/routes/(app)/+page.svelte`**

```svelte
<script>
	export let data
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-xl">Welcome!</h1>
	<p class="text-neutral-500">Adapter: <strong>{data.adapter}</strong></p>
	<nav class="flex gap-4">
		<a href="/data" class="p-2 bg-primary-600 text-white rounded text-center">CRUD Demo</a>
		<a href="/public" class="p-2 bg-neutral-200 rounded text-center">Public Page</a>
	</nav>
</div>
```

**Step 2: Create `sites/demo/src/routes/(app)/logout/+page.svelte`**

```svelte
<script>
	import { getContext, onMount } from 'svelte'

	onMount(async () => {
		const kavach = getContext('kavach')
		if (kavach) await kavach.signOut()
	})
</script>

<p class="m-auto text-lg">Logging out...</p>
```

Note: Gets kavach from context instead of module import — key difference from supabase site.

**Step 3: Create `sites/demo/src/routes/(app)/data/+page.svelte`**

A basic CRUD demo page — fetches data from the server route and displays it. Phase 1 is minimal.

```svelte
<script>
	let entity = 'todos'
	let rows = []
	let error = null
	let loading = false

	async function fetchData() {
		loading = true
		error = null
		try {
			const res = await fetch(`/data/${entity}`)
			if (!res.ok) {
				const body = await res.json()
				error = body.error || `HTTP ${res.status}`
			} else {
				rows = await res.json()
			}
		} catch (e) {
			error = e.message
		}
		loading = false
	}
</script>

<div class="flex flex-col p-8 gap-4">
	<h1 class="text-xl">CRUD Demo</h1>

	<div class="flex gap-2 items-center">
		<input
			type="text"
			bind:value={entity}
			placeholder="Entity name (e.g. todos)"
			class="border border-neutral-300 rounded px-3 py-2"
		/>
		<button
			onclick={fetchData}
			class="px-4 py-2 bg-primary-600 text-white rounded"
		>
			Fetch
		</button>
	</div>

	{#if loading}
		<p class="text-neutral-500">Loading...</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if rows.length > 0}
		<pre class="bg-neutral-100 p-4 rounded overflow-auto text-sm">{JSON.stringify(rows, null, 2)}</pre>
	{:else}
		<p class="text-neutral-400">No data. Enter an entity name and click Fetch.</p>
	{/if}
</div>
```

**Step 4: Commit**

```bash
git add sites/demo/src/routes/\(app\)/
git commit -m "feat(demo): add protected dashboard, logout, and CRUD demo pages"
```

---

### Task 9: CRUD Server Routes

Data and RPC server routes, accessing kavach from `event.locals`. Returns "unsupported" if the adapter has no data plugin.

**Files:**
- Create: `sites/demo/src/routes/(server)/data/[...slug]/+server.js`
- Create: `sites/demo/src/routes/(server)/rpc/[...slug]/+server.js`

**Step 1: Create `sites/demo/src/routes/(server)/data/[...slug]/+server.js`**

```js
import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'
import { omit } from 'ramda'

const RESERVED = [':select', ':order', ':limit', ':offset', ':count']

function getActions(locals, schema) {
	const actions = locals.kavach.actions(schema)
	if (!actions) return null
	return actions
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ params, url, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = Object.fromEntries(url.searchParams.entries())
	const { data, error, count, status } = await actions.get(entity, {
		columns: body[':select'],
		order: body[':order'],
		limit: body[':limit'] ? Number(body[':limit']) : undefined,
		offset: body[':offset'] ? Number(body[':offset']) : undefined,
		count: body[':count'],
		filter: omit(RESERVED, body)
	})

	if (error) return json({ error }, { status })
	return json(count !== undefined ? { data, count } : data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.post(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.put(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PATCH({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.patch(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = getActions(locals, schema)
	if (!actions) return json({ error: 'Data operations not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
```

**Step 2: Create `sites/demo/src/routes/(server)/rpc/[...slug]/+server.js`**

```js
import { json } from '@sveltejs/kit'
import { getEntity } from '$lib/db'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ params, request, locals }) {
	const { schema, entity } = getEntity(params.slug)
	const actions = locals.kavach.actions(schema)
	if (!actions) return json({ error: 'RPC not supported for this adapter' }, { status: 501 })

	const body = await request.json()
	const { data, error, status } = await actions.call(entity, body)

	if (error) return json({ error }, { status })
	return json(data)
}
```

**Step 3: Commit**

```bash
git add sites/demo/src/routes/\(server\)/
git commit -m "feat(demo): add CRUD and RPC server routes with unsupported adapter handling"
```

---

### Task 10: Env Files & Dev Server Smoke Test

Create adapter-specific env files and verify the dev server starts.

**Files:**
- Create: `sites/demo/.env.supabase`
- Create: `sites/demo/.env`

**Step 1: Create `sites/demo/.env.supabase`**

```
PUBLIC_AUTH_ADAPTER=supabase
PUBLIC_DEV_MODE=true
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
PUBLIC_LOG_LEVEL=info
PUBLIC_LOG_TABLE=audit.logs
```

**Step 2: Create `sites/demo/.env`**

Symlink or copy from `.env.supabase` as the default:

```
PUBLIC_AUTH_ADAPTER=supabase
PUBLIC_DEV_MODE=true
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
PUBLIC_LOG_LEVEL=info
PUBLIC_LOG_TABLE=audit.logs
```

**Step 3: Start dev server and verify it loads**

```bash
cd solution/sites/demo && bun run dev
```

Open `http://localhost:5173` — should see the header with "Kavach Demo" and redirect to `/auth` (since not logged in).

**Step 4: Commit**

```bash
git add sites/demo/.env.supabase sites/demo/.env
git commit -m "feat(demo): add env files for supabase adapter"
```

---

### Task 11: Playwright E2E Setup

Configure Playwright with per-adapter projects. Write initial auth smoke test.

**Files:**
- Create: `sites/demo/playwright.config.js`
- Create: `sites/demo/e2e/auth.spec.js`

**Step 1: Create `sites/demo/playwright.config.js`**

```js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'supabase',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'bun run build && bun run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
})
```

**Step 2: Create `sites/demo/e2e/auth.spec.js`**

```js
import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
	test('redirects unauthenticated user to /auth', async ({ page }) => {
		await page.goto('/')
		await expect(page).toHaveURL(/\/auth/)
	})

	test('public page is accessible without auth', async ({ page }) => {
		await page.goto('/public')
		await expect(page.locator('text=This is a public page')).toBeVisible()
	})

	test('auth page renders login form', async ({ page }) => {
		await page.goto('/auth')
		await expect(page.locator('text=Continue With Azure')).toBeVisible()
	})
})
```

**Step 3: Commit**

```bash
git add sites/demo/playwright.config.js sites/demo/e2e/
git commit -m "feat(demo): add Playwright config and auth e2e smoke tests"
```

---

### Task 12: Update Workspace & Cleanup

Add demo site to workspace config, verify everything works, then remove the supabase site.

**Files:**
- Modify: `solution/package.json` (add demo to workspaces if needed)
- Delete: `sites/supabase/` (entire directory)

**Step 1: Check workspace config**

Read `solution/package.json` to see if `sites/*` is already a workspace glob. If so, `sites/demo` is automatically included. If not, add it.

**Step 2: Install dependencies**

```bash
cd solution && bun install
```

**Step 3: Run unit tests to verify nothing is broken**

```bash
cd solution && bun vitest run
```

Expected: All tests pass (419+)

**Step 4: Delete `sites/supabase/`**

```bash
rm -rf solution/sites/supabase
```

**Step 5: Run tests again to confirm clean removal**

```bash
cd solution && bun vitest run
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(demo): remove sites/supabase in favor of unified demo site"
```

---

## Verification Checklist

After all tasks:

1. `cd solution && bun vitest run` — all unit tests pass (419+)
2. `cd solution/sites/demo && bun run dev` — dev server starts, shows header, redirects to `/auth`
3. `?adapter=supabase` URL param works (when `PUBLIC_DEV_MODE=true`)
4. Adapter badge shows in header
5. CRUD route returns data for Supabase, "unsupported" for unknown adapters
6. `sites/supabase/` is deleted
7. `sites/skeleton/` still exists (kept as starter template)
