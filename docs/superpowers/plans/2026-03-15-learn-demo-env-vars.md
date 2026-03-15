# Learn Site Demo Env Vars Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the learn site's demo platform URLs to environment variables and remove all embedded Supabase auth, making the learn site a pure landing/docs site.

**Architecture:** A `+layout.server.ts` in the `(demo)/demo/` segment reads `$env/dynamic/public` and exposes `demoUrls` to pages. `platforms.ts` gets a `getPlatformsWithUrls` helper that overlays those URLs. The `[platform]/+page.svelte` auth form is replaced with an external "Launch demo" link. All embedded auth routes, hooks, kavach config, and Supabase deps are deleted.

**Tech Stack:** SvelteKit `$env/dynamic/public`, Playwright e2e, bun workspaces

---

## Chunk 1: Env vars, platforms.ts, and platform page UI

### Task 1: Add env var files

**Files:**

- Modify: `sites/learn/.env` (gitignored — not committed)
- Create: `sites/learn/.env.example`

The learn site's current `.env` has `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` for the embedded demo. Replace local values and document the new vars. Note: `.env` is gitignored in this project — only `.env.example` gets committed.

- [ ] **Step 1: Update `sites/learn/.env` (local only, not committed)**

```bash
# Demo site URLs (local dev — each demo runs its own preview server)
PUBLIC_DEMO_SUPABASE_URL=http://localhost:4173
PUBLIC_DEMO_FIREBASE_URL=http://localhost:4174
PUBLIC_DEMO_CONVEX_URL=http://localhost:4175
```

- [ ] **Step 2: Create `sites/learn/.env.example`**

```bash
# Demo site URLs
# Local: run each demo site's preview server on the matching port
# Production: set to deployed demo site URLs in Vercel dashboard
PUBLIC_DEMO_SUPABASE_URL=http://localhost:4173
PUBLIC_DEMO_FIREBASE_URL=http://localhost:4174
PUBLIC_DEMO_CONVEX_URL=http://localhost:4175
```

- [ ] **Step 3: Commit (only `.env.example` — `.env` is gitignored)**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/.env.example
git commit -m "chore(learn): add .env.example with demo site URL vars"
```

---

### Task 2: Update `platforms.ts` and add layout server load

**Files:**

- Modify: `sites/learn/src/lib/demo/platforms.ts`
- Create: `sites/learn/src/routes/(demo)/demo/+layout.server.ts`

`$env/dynamic/public` can only be imported in SvelteKit server files (`.server.ts`) or `.svelte` components — not in plain `.ts` lib files. The cleanest approach: add a `+layout.server.ts` alongside the existing `+layout@.svelte` in `(demo)/demo/` that reads the env vars and passes them as `demoUrls`. The pages then receive this via `data.demoUrls`. Update `platforms.ts` to add helper functions that accept `demoUrls`.

**Important:** The file must be `(demo)/demo/+layout.server.ts` — NOT `(demo)/+layout.server.ts`. The `@` in `+layout@.svelte` resets the layout chain; a server layout at the group level would not be inherited.

- [ ] **Step 1: Create `sites/learn/src/routes/(demo)/demo/+layout.server.ts`**

```ts
import { env } from '$env/dynamic/public'

export function load() {
  return {
    demoUrls: {
      supabase: env.PUBLIC_DEMO_SUPABASE_URL ?? '',
      firebase: env.PUBLIC_DEMO_FIREBASE_URL ?? '',
      convex: env.PUBLIC_DEMO_CONVEX_URL ?? ''
    }
  }
}
```

- [ ] **Step 2: Update `sites/learn/src/lib/demo/platforms.ts`**

Remove hardcoded URLs from `PLATFORMS` entries (Supabase never had one; Firebase and Convex had hardcoded strings — remove those). Add two helper functions: `getPlatformsWithUrls` for the landing page and `getPlatformWithUrl` for the detail page.

Full file:

```ts
export interface Platform {
  id: string
  name: string
  description: string
  icon: string // UnoCSS class, e.g. 'i-auth-supabase'
  iconFallback: string // colour class for icon background
  live: boolean
  url?: string // external demo URL for live platforms
  modes: string[] // auth mode ids this platform supports
  capabilities: string[] // what the platform adapter provides
  adapterPackage: string
}

/** Features Kavach provides regardless of adapter — shown once on the landing page */
export const KAVACH_FEATURES = [
  'Role-based route protection',
  'Server-side session cookie',
  'Cached login history'
]

export const PLATFORMS: Platform[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Postgres-powered auth with row-level security',
    icon: 'i-auth-supabase',
    iconFallback: 'bg-emerald-500',
    live: true,
    modes: ['password', 'magic', 'cached', 'social'],
    capabilities: ['Email + password', 'Magic link (OTP)', 'Social OAuth', 'PostgREST RLS'],
    adapterPackage: '@kavach/adapter-supabase'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google cloud auth with Firestore security rules',
    icon: 'i-auth-firebase',
    iconFallback: 'bg-orange-500',
    live: true,
    modes: ['password', 'magic', 'social'],
    capabilities: [
      'Email + password',
      'Magic link (OTP)',
      'Google OAuth',
      'Firestore security rules',
      'Structured logging'
    ],
    adapterPackage: '@kavach/adapter-firebase'
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Auth-as-a-service with universal login',
    icon: 'i-app-shield',
    iconFallback: 'bg-orange-700',
    live: false,
    modes: ['password', 'social'],
    capabilities: ['Universal login page', 'Social providers', 'Token-based sessions'],
    adapterPackage: '@kavach/adapter-auth0'
  },
  {
    id: 'amplify',
    name: 'Amplify',
    description: 'AWS Cognito with Amplify SDK',
    icon: 'i-app-shield',
    iconFallback: 'bg-yellow-600',
    live: false,
    modes: ['password', 'social'],
    capabilities: ['Cognito user pools', 'Social identity providers', 'AWS IAM integration'],
    adapterPackage: '@kavach/adapter-amplify'
  },
  {
    id: 'convex',
    name: 'Convex',
    description: 'Reactive database with built-in auth',
    icon: 'i-app-shield',
    iconFallback: 'bg-purple-600',
    live: true,
    modes: ['social'],
    capabilities: [
      'Google OAuth',
      'Reactive data queries',
      'Server-side auth functions',
      'Structured logging'
    ],
    adapterPackage: '@kavach/adapter-convex'
  }
]

/** Returns all platforms with URLs injected from runtime env data.
 * env-backed urls are only set for live platforms (supabase, firebase, convex).
 * Auth0 and Amplify remain url-less (live: false). */
export function getPlatformsWithUrls(demoUrls: Record<string, string>): Platform[] {
  return PLATFORMS.map((p) => ({
    ...p,
    url: demoUrls[p.id] !== undefined ? demoUrls[p.id] : p.url
  }))
}

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id)
}

/** Returns a single platform with its URL injected from runtime env data. */
export function getPlatformWithUrl(
  id: string,
  demoUrls: Record<string, string>
): Platform | undefined {
  const p = getPlatform(id)
  if (!p) return undefined
  return { ...p, url: demoUrls[id] ?? p.url }
}
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bunx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `platforms.ts` or the layout server file

- [ ] **Step 4: Commit**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/src/routes/\(demo\)/demo/+layout.server.ts sites/learn/src/lib/demo/platforms.ts
git commit -m "feat(learn): read demo site URLs from env via layout server load"
```

---

### Task 3: Update demo landing page to use env URLs

**Files:**

- Modify: `sites/learn/src/routes/(demo)/demo/+page.svelte`

The landing page card links go to `/demo/{platform.id}` (internal route — unchanged). The footnote "All platforms authenticate via Supabase in this demo..." is wrong after this change and must be removed. The `PLATFORMS` import becomes `getPlatformsWithUrls` using `data.demoUrls`.

- [ ] **Step 1: Update `sites/learn/src/routes/(demo)/demo/+page.svelte`**

```svelte
<script lang="ts">
  import { getPlatformsWithUrls, KAVACH_FEATURES } from '$lib/demo/platforms'

  let { data } = $props()
  const platforms = $derived(getPlatformsWithUrls(data.demoUrls))
</script>

<div class="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 sm:px-8">
  <!-- Hero -->
  <div class="mb-10 text-center">
    <h1 class="text-surface-z9 mb-3 text-4xl font-black tracking-tight sm:text-5xl">Kavach Demo</h1>
    <p class="text-surface-z6 mx-auto max-w-md text-base sm:text-lg">
      Learn authentication by doing. Pick a platform, sign in, explore, hit the walls.
    </p>
  </div>

  <!-- Kavach features — shown once, apply to every platform -->
  <div class="border-primary/20 bg-primary/5 mb-10 w-full rounded-2xl border px-6 py-5">
    <p class="text-primary mb-3 text-xs font-semibold tracking-wider uppercase">
      What Kavach provides with any platform
    </p>
    <div class="flex flex-wrap gap-4">
      {#each KAVACH_FEATURES as feature}
        <div class="flex items-center gap-2 text-sm">
          <span class="i-app-shield text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
          <span class="text-surface-z8">{feature}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Platform grid — cards link to internal /demo/{id} detail page -->
  <div class="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each platforms as platform (platform.id)}
      <a
        href="/demo/{platform.id}"
        class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        <!-- Icon + badge row -->
        <div class="flex items-start justify-between">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl {platform.iconFallback} bg-opacity-10"
          >
            <span class="{platform.icon} h-9 w-9 text-3xl" aria-hidden="true"></span>
          </div>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-semibold {platform.live
              ? 'bg-success-100 text-success-700'
              : 'bg-surface-z3 text-surface-z5'}"
          >
            {platform.live ? 'LIVE' : 'SIMULATED'}
          </span>
        </div>

        <!-- Name + description -->
        <div>
          <h2
            class="text-surface-z9 group-hover:text-primary mb-0.5 text-lg font-bold transition-colors"
          >
            {platform.name}
          </h2>
          <p class="text-surface-z6 text-sm">{platform.description}</p>
        </div>

        <!-- Platform capabilities -->
        <ul class="flex flex-col gap-1">
          {#each platform.capabilities as cap}
            <li class="flex items-center gap-2 text-xs">
              <span class="text-surface-z4 shrink-0">·</span>
              <span class="text-surface-z6">{cap}</span>
            </li>
          {/each}
        </ul>
      </a>
    {/each}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/src/routes/\(demo\)/demo/+page.svelte
git commit -m "feat(learn): use env-backed platform URLs on demo landing page"
```

---

### Task 4: Simplify `[platform]/+page.svelte` — remove embedded auth form

**Files:**

- Modify: `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`

Remove `AuthProvider`, `goto`, `onSuccess`, and `prefillTestCredentials`. Replace the right panel:

- Live platforms with a URL: show "Launch {name} demo →" external link
- Live platforms without URL: show "Demo URL not configured"
- Non-live platforms (auth0, amplify): show "Coming soon" message

- [ ] **Step 1: Rewrite `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/stores'
  import { getPlatformWithUrl } from '$lib/demo/platforms'
  import { AUTH_MODES, ALL_MODES_TAB, getMode } from '$lib/demo/modes'

  let { data } = $props()

  const platformId = $derived($page.params.platform)
  const platform = $derived(getPlatformWithUrl(platformId, data.demoUrls))

  let activeTab = $state('all')

  const tabs = $derived([
    ALL_MODES_TAB,
    ...AUTH_MODES.filter((m) => platform?.modes.includes(m.id) ?? false)
  ])

  const disabledTabs = $derived(
    AUTH_MODES.filter((m) => !(platform?.modes.includes(m.id) ?? false))
  )

  const activeMode = $derived(activeTab === 'all' ? null : getMode(activeTab))
</script>

<div class="mx-auto max-w-5xl px-6 py-12 sm:px-8">
  <!-- Platform header -->
  <div class="mb-10 flex items-center gap-4">
    <a
      href="/demo"
      class="text-surface-z5 hover:text-primary flex items-center gap-1 transition-colors"
      title="All platforms"
    >
      <span class="i-app-list h-5 w-5" aria-hidden="true"></span>
      <span class="text-sm">All</span>
    </a>
    <span class="text-surface-z3">/</span>
    {#if platform}
      <div class="bg-surface-z2 flex h-12 w-12 items-center justify-center rounded-xl">
        <span class="{platform.icon} h-8 w-8 text-3xl" aria-hidden="true"></span>
      </div>
      <div>
        <h1 class="text-surface-z9 text-2xl font-black sm:text-3xl">{platform.name}</h1>
        <p class="text-surface-z6 text-sm">{platform.description}</p>
      </div>
    {:else}
      <h1 class="text-surface-z9 text-2xl font-black">Unknown platform</h1>
    {/if}
  </div>

  <!-- Tab bar -->
  <div class="border-surface-z3 mb-8 flex flex-wrap gap-1 border-b pb-1">
    {#each tabs as tab (tab.id)}
      <button
        onclick={() => (activeTab = tab.id)}
        class="rounded-t-lg px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.id
          ? 'bg-primary text-white'
          : 'text-surface-z6 hover:text-primary'}"
      >
        {tab.label}
      </button>
    {/each}
    {#each disabledTabs as tab (tab.id)}
      <button
        disabled
        title="Not supported by this adapter"
        class="cursor-not-allowed rounded-t-lg px-4 py-2 text-sm font-medium opacity-35"
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Two-column content — stacked on mobile, side-by-side on lg -->
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
    <!-- Left: mode explainer -->
    <div class="flex flex-col gap-6">
      {#if activeMode}
        <div>
          <h2 class="text-surface-z9 mb-2 text-xl font-bold">{activeMode.label} Auth</h2>
          <p class="text-surface-z6 text-sm">{activeMode.description}</p>
        </div>

        <div>
          <h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-wider uppercase">
            How Kavach wires it
          </h3>
          <ol class="flex flex-col gap-2">
            {#each activeMode.howItWorks as step, i}
              <li class="flex gap-3 text-sm">
                <span
                  class="bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <span class="text-surface-z7">{step}</span>
              </li>
            {/each}
          </ol>
        </div>

        <div>
          <h3 class="text-surface-z5 mb-3 text-xs font-semibold tracking-wider uppercase">
            Capabilities
          </h3>
          <ul class="flex flex-col gap-2">
            {#each activeMode.capabilities as cap}
              <li class="flex items-center gap-3 text-sm">
                <span
                  class="h-4 w-4 shrink-0 {cap.kavachHandles
                    ? 'i-app-shield text-success-600'
                    : 'i-app-shield text-surface-z4'}"
                  aria-hidden="true"
                ></span>
                <span
                  class={cap.kavachHandles ? 'text-surface-z8' : 'text-surface-z5 line-through'}
                >
                  {cap.label}
                </span>
                <span class="text-surface-z4 ml-auto shrink-0 text-xs">
                  {cap.kavachHandles ? 'Kavach ✓' : 'Adapter'}
                </span>
              </li>
            {/each}
          </ul>
        </div>
      {:else}
        <!-- All tab -->
        <div>
          <h2 class="text-surface-z9 mb-2 text-xl font-bold">
            What {platform?.name ?? platformId} supports
          </h2>
          <p class="text-surface-z6 mb-6 text-sm">
            Select a tab to explore each auth mode individually, or use All to try all available
            providers at once.
          </p>
          <ul class="flex flex-col gap-3">
            {#each tabs.filter((t) => t.id !== 'all') as tab}
              <li
                class="border-surface-z2 bg-surface-z1 flex items-center gap-3 rounded-xl border p-3 text-sm"
              >
                <span class="i-app-shield text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
                <div>
                  <span class="text-surface-z8 font-semibold">{tab.label}</span>
                  {#if 'description' in tab}
                    <p class="text-surface-z5 text-xs">{tab.description}</p>
                  {/if}
                </div>
                <button
                  onclick={() => (activeTab = tab.id)}
                  class="text-primary ml-auto text-xs hover:underline"
                >
                  Explore →
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <!-- Right: try it panel -->
    <div class="bg-surface-z1 border-surface-z3 flex flex-col gap-4 rounded-2xl border p-6">
      <div class="flex items-center justify-between">
        <h3 class="text-surface-z8 font-semibold">Try it live</h3>
        {#if platform?.live}
          <span
            class="bg-success-100 text-success-700 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >LIVE</span
          >
        {:else}
          <span
            class="bg-surface-z3 text-surface-z5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >COMING SOON</span
          >
        {/if}
      </div>

      {#if platform?.live && platform?.url}
        <p class="text-surface-z6 text-sm">
          The {platform.name} demo runs as a standalone SvelteKit app. Click below to open it.
        </p>
        <a
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          class="bg-primary mt-2 inline-block rounded-lg px-4 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Launch {platform.name} demo →
        </a>
      {:else if platform?.live}
        <p class="text-surface-z5 text-sm">Demo URL not configured.</p>
      {:else}
        <p class="text-surface-z6 text-sm">
          This adapter demo is coming soon. The mode explainer on the left shows how Kavach would
          wire it up.
        </p>
      {/if}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bunx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/src/routes/\(demo\)/demo/\[platform\]/+page.svelte
git commit -m "feat(learn): replace embedded auth form with external demo link on platform page"
```

---

## Chunk 2: Remove dead code, deps, and update tests

### Task 5: Delete embedded auth routes, server files, and vite plugin

**Files:**

- Delete: `sites/learn/src/routes/(app)/` (entire directory — embedded dashboard/admin/data/logout)
- Delete: `sites/learn/src/routes/(server)/data/` (only the `data/` subdirectory — leave `api/` if present)
- Delete: `sites/learn/kavach.config.js`
- Delete: `sites/learn/src/hooks.server.js`
- Modify: `sites/learn/vite.config.js`
- Modify: `sites/learn/package.json` (remove `@kavach/vite` devDep — also orphaned)

- [ ] **Step 1: Delete the embedded route directories**

```bash
rm -rf /Users/Jerry/Developer/kavach/sites/learn/src/routes/\(app\)/
rm -rf /Users/Jerry/Developer/kavach/sites/learn/src/routes/\(server\)/data/
```

- [ ] **Step 2: Delete kavach config and hooks**

```bash
rm /Users/Jerry/Developer/kavach/sites/learn/kavach.config.js
rm /Users/Jerry/Developer/kavach/sites/learn/src/hooks.server.js
```

- [ ] **Step 3: Update `sites/learn/vite.config.js`** — remove kavach plugin import and usage

```js
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import unocss from '@unocss/vite'

export default defineConfig({
  plugins: [unocss(), sveltekit()],
  optimizeDeps: {
    exclude: ['@rokkit/app', '@rokkit/ui', '@rokkit/states', '@rokkit/actions']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/svelte/') || id.includes('.bun/svelte')) {
            return 'vendor-svelte'
          }
        }
      }
    }
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
})
```

- [ ] **Step 4: Verify build succeeds**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | tail -20
```

Expected: build completes with no errors about missing imports or routes

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/vite.config.js
git rm -r sites/learn/src/routes/\(app\)/
git rm -r sites/learn/src/routes/\(server\)/data/
git rm sites/learn/kavach.config.js sites/learn/src/hooks.server.js
git commit -m "feat(learn): remove embedded auth routes, hooks, and kavach vite plugin"
```

---

### Task 6: Remove Supabase and kavach adapter dependencies from `package.json`

**Files:**

- Modify: `sites/learn/package.json`

Remove three entries: `@kavach/adapter-supabase`, `@kavach/vite`, and `@supabase/supabase-js`.

- [ ] **Step 1: Remove the deps from `sites/learn/package.json`**

Remove:

- `"@kavach/adapter-supabase": "workspace:*"` (dependencies)
- `"@kavach/vite": "workspace:*"` (devDependencies — no longer used in vite.config.js)
- `"@supabase/supabase-js": "^2.99.1"` (dependencies)

- [ ] **Step 2: Reinstall from repo root**

```bash
cd /Users/Jerry/Developer/kavach && bun install
```

Expected: lockfile updated, no peer-dep errors

- [ ] **Step 3: Verify build still passes**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | tail -10
```

Expected: clean build

- [ ] **Step 4: Commit from repo root**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/package.json bun.lock
git commit -m "chore(learn): remove @kavach/adapter-supabase, @kavach/vite, and @supabase/supabase-js deps"
```

---

### Task 7: Replace e2e tests with landing-only tests

**Files:**

- Modify: `sites/learn/e2e/demo.e2e.ts`

The existing file tests embedded Supabase routes (`/demo/supabase/dashboard` etc.) — all deleted. Auth flow coverage (redirects, login, data, admin) already lives in `sites/demo/e2e/demo.e2e.ts` and does not need to be moved. Replace with tests for the landing page and per-platform detail pages, including assertions on external link `href` values.

- [ ] **Step 1: Write the new `sites/learn/e2e/demo.e2e.ts`**

```ts
import { expect, test } from '@playwright/test'

test.describe('Demo landing page', () => {
  test('loads with hero heading', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('h1')).toContainText('Kavach Demo')
  })

  test('shows all five platform cards', async ({ page }) => {
    await page.goto('/demo')
    const cards = page.locator('a[href^="/demo/"]')
    await expect(cards).toHaveCount(5) // supabase, firebase, auth0, amplify, convex
  })

  test('supabase card links to /demo/supabase', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('a[href="/demo/supabase"]')).toBeVisible()
  })

  test('firebase card links to /demo/firebase', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('a[href="/demo/firebase"]')).toBeVisible()
  })

  test('convex card links to /demo/convex', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('a[href="/demo/convex"]')).toBeVisible()
  })
})

test.describe('Demo platform detail pages — live platforms', () => {
  for (const id of ['supabase', 'firebase', 'convex']) {
    test(`${id} platform page loads`, async ({ page }) => {
      await page.goto(`/demo/${id}`)
      await expect(page.locator('h1')).not.toBeEmpty()
    })

    test(`${id} platform page shows Launch demo link with non-empty href`, async ({ page }) => {
      await page.goto(`/demo/${id}`)
      const link = page.locator('a:has-text("Launch")')
      await expect(link).toBeVisible()
      // href must be a non-empty URL (set from env var)
      const href = await link.getAttribute('href')
      expect(href).toBeTruthy()
      expect(href).toMatch(/^https?:\/\//)
    })

    test(`${id} platform page has back link to /demo`, async ({ page }) => {
      await page.goto(`/demo/${id}`)
      await expect(page.locator('a[href="/demo"]')).toBeVisible()
    })
  }
})

test.describe('Demo platform detail pages — coming soon', () => {
  for (const id of ['auth0', 'amplify']) {
    test(`${id} platform page shows COMING SOON badge`, async ({ page }) => {
      await page.goto(`/demo/${id}`)
      await expect(page.locator('text=COMING SOON')).toBeVisible()
    })
  }
})
```

- [ ] **Step 2: Run the e2e tests**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bunx playwright test e2e/demo.e2e.ts 2>&1 | tail -20
```

Expected: all tests pass

- [ ] **Step 3: Run the full learn e2e suite**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bunx playwright test 2>&1 | tail -20
```

Expected: all tests pass (`home.e2e.ts` and `docs.e2e.ts` unaffected)

- [ ] **Step 4: Commit**

```bash
cd /Users/Jerry/Developer/kavach
git add sites/learn/e2e/demo.e2e.ts
git commit -m "test(learn): replace embedded auth e2e tests with demo landing and external link tests"
```

---

## Final verification

Run from repo root (`/Users/Jerry/Developer/kavach`):

- [ ] **Run full unit test suite**

```bash
cd /Users/Jerry/Developer/kavach && bunx vitest run --config config/vitest.config.js 2>&1 | tail -10
```

Expected: 626 tests pass, 0 failures

- [ ] **Run learn e2e**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bunx playwright test 2>&1 | tail -10
```

Expected: all tests pass

- [ ] **Confirm build is clean**

```bash
cd /Users/Jerry/Developer/kavach/sites/learn && bun run build 2>&1 | grep -E "error|Error|built" | tail -5
```

Expected: success message, no errors
