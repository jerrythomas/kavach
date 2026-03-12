# Demo Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the embedded demo with a standalone interactive learning experience — platform selector landing, per-platform pre-auth tab page, and an authenticated demo shell with Sentry config panel, Hacker Mode, and floating identity badges.

**Architecture:** Two new SvelteKit route groups: `(demo)` for standalone pre-auth surfaces (layout reset, no site chrome) and the existing `(app)` group for the authenticated shell (also layout-reset). Platform and mode metadata live in `src/lib/demo/`. Sidebar components are broken into focused files. The demo shell uses `+layout@.svelte` to break out of the root Kavach site layout.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), UnoCSS + Rokkit tokens, `@rokkit/icons` (auth + app sets), `@rokkit/app` (ThemeSwitcherToggle), `@rokkit/states` (vibe), `@rokkit/actions` (themable), `@kavach/ui` (AuthProvider), Playwright (E2E)

**Prerequisite:** Complete `docs/superpowers/plans/2026-03-12-bug-fixes.md` first.

---

## Icon reference

Auth icons (via UnoCSS class `i-auth:<name>`): `supabase`, `firebase`, `email`, `password`, `magic`, `google`, `github`, `apple`, `twitter`, `azure`, `authy`, `phone`

App icons (via UnoCSS class `i-app:<name>`): `shield`, `login`, `logout`, `history`, `list`, `code-visible`, `code-hidden`

Platforms without a native auth icon: `auth0`, `amplify`, `convex` → use `i-app:shield`

---

## File Map

### New files

```
sites/learn/src/
  routes/
    (demo)/
      demo/
        +layout@.svelte               standalone shell (theme + watermark, no site chrome)
        +page.svelte                  platform selector landing  ← replaces (public)/ or new
        [platform]/
          +page.svelte                pre-auth platform page (tabs + live form)
    (app)/
      demo/
        +layout@.svelte               authenticated demo shell (replaces current +layout.svelte)
        +layout.server.ts             (keep existing, update if needed)
        [platform]/
          dashboard/
            +page.svelte              dashboard (content moved from [platform]/+page.svelte)
          logout/
            +page.svelte              (move from [platform]/logout/)
  lib/
    demo/
      platforms.ts                    platform metadata (id, name, icon, live, modes, features)
      modes.ts                        auth mode metadata (id, label, capabilities, explainer)
      hacker.svelte.ts                Svelte 5 rune state for hacker mode (shared across pages)
      DemoTopBar.svelte               top bar: app name, platform badge, theme, user avatar
      DemoSidebar.svelte              sidebar container (nav + role card + config + toggle)
      DemoNavItem.svelte              single nav item with lock icon + hacker mode behaviour
      RoleCard.svelte                 current role badge + access matrix
      SentryConfigPanel.svelte        collapsible Sentry rules panel
      HackerToggle.svelte             App Mode / Hacker Mode pill toggle
      FloatingBadge.svelte            bottom-right Kavach + platform floating badge
      AccessLog.svelte                last-N navigation events log
      SentryAnnotation.svelte         contextual callout box for pages
```

### Modified files

```
sites/learn/src/
  routes/
    (app)/
      demo/
        +layout.svelte                DELETE (replaced by +layout@.svelte)
        [platform]/
          +page.svelte                DELETE (content moves to dashboard/+page.svelte)
          data/+page.svelte           enhance with SentryAnnotation
          admin/+page.svelte          enhance with hacker mode feedback
          admin/+page.server.ts       keep as-is
    (server)/
      data/[...slug]/+server.ts       add /data/admin-stats endpoint
  kavach.config.js                    update rules for new route structure
  app.css                             add demo-specific CSS vars if needed
```

### Notes on route conflicts

`(demo)/demo/[platform]/+page.svelte` and the old `(app)/demo/[platform]/+page.svelte` both resolve to `/demo/[platform]`. The old file MUST be deleted before the new one is created, or SvelteKit will throw an ambiguous route error.

Similarly: old `(app)/demo/+layout.svelte` → rename/replace to `+layout@.svelte`.

---

## Chunk 1: Route Skeleton + Layout Reset

**Goal:** Get the new route structure in place with empty/placeholder pages. Verify no conflicts. No visual polish yet.

**Files:**

- Create: `sites/learn/src/routes/(demo)/demo/+layout@.svelte`
- Create: `sites/learn/src/routes/(demo)/demo/+page.svelte` (placeholder)
- Create: `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte` (placeholder)
- Delete: `sites/learn/src/routes/(app)/demo/[platform]/+page.svelte`
- Rename: `sites/learn/src/routes/(app)/demo/+layout.svelte` → `+layout@.svelte`
- Create: `sites/learn/src/routes/(app)/demo/[platform]/dashboard/+page.svelte` (placeholder)
- Move: `sites/learn/src/routes/(app)/demo/[platform]/logout/+page.svelte` content (keep path)
- Modify: `sites/learn/kavach.config.js` (update rules)

### Task 1: Update kavach.config.js routing rules

- [ ] **Replace the rules array in `sites/learn/kavach.config.js`**

  The old rule `{ path: '/demo', roles: '*' }` protected all of `/demo/*`. With the new structure, `/demo` and `/demo/[platform]` are public. Individual sub-routes get their own rules.

  ```js
  rules: [
    { path: '/', public: true },
    { path: '/docs', public: true },
    { path: '/auth', public: true },
    { path: '/demo', public: true },
    // Authenticated demo routes — one set per platform
    { path: '/demo/supabase/dashboard', roles: '*' },
    { path: '/demo/supabase/data', roles: '*' },
    { path: '/demo/supabase/admin', roles: ['admin'] },
    { path: '/demo/firebase/dashboard', roles: '*' },
    { path: '/demo/firebase/data', roles: '*' },
    { path: '/demo/firebase/admin', roles: ['admin'] },
    { path: '/demo/auth0/dashboard', roles: '*' },
    { path: '/demo/auth0/data', roles: '*' },
    { path: '/demo/auth0/admin', roles: ['admin'] },
    { path: '/demo/amplify/dashboard', roles: '*' },
    { path: '/demo/amplify/data', roles: '*' },
    { path: '/demo/amplify/admin', roles: ['admin'] },
    { path: '/demo/convex/dashboard', roles: '*' },
    { path: '/demo/convex/data', roles: '*' },
    { path: '/demo/convex/admin', roles: ['admin'] },
    // Data API routes
    { path: '/data/facts', roles: '*' },
    { path: '/data/admin-stats', roles: ['admin'] }
  ]
  ```

### Task 2: Create the standalone demo layout (layout reset)

- [ ] **Create `sites/learn/src/routes/(demo)/demo/+layout@.svelte`**

  The `@` in the filename tells SvelteKit to reset the layout chain — this layout does NOT inherit from the root `+layout.svelte`. It re-establishes UnoCSS, theme, and the Kavach watermark.

  ```svelte
  <script lang="ts">
    import 'uno.css'
    import '../../../app.css'
    import { vibe } from '@rokkit/states'
    import { themable } from '@rokkit/actions'
    import { ThemeSwitcherToggle } from '@rokkit/app'

    let { children } = $props()
  </script>

  <svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

  <div class="bg-surface-z0 text-surface-z9 relative min-h-screen">
    <!-- Kavach watermark -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      aria-hidden="true"
    >
      <span class="text-surface-z2 text-[20vw] font-black tracking-tight opacity-30">KAVACH</span>
    </div>

    <!-- Theme switcher -->
    <div class="absolute top-4 right-4 z-10">
      <ThemeSwitcherToggle />
    </div>

    <!-- Page content -->
    <div class="relative z-10">
      {@render children()}
    </div>

    <!-- Footer -->
    <footer class="border-surface-z2 text-surface-z5 border-t px-8 py-4 text-center text-sm">
      <a href="/" class="hover:text-primary transition-colors">← Back to Kavach</a>
    </footer>
  </div>
  ```

### Task 3: Delete the conflicting old route files

- [ ] **Delete `sites/learn/src/routes/(app)/demo/[platform]/+page.svelte`**

  This file will conflict with the new `(demo)/demo/[platform]/+page.svelte`. Copy its content to a temp location if you want to reference it for the dashboard page.

  ```bash
  # Save content for reference, then delete
  cp sites/learn/src/routes/\(app\)/demo/\[platform\]/+page.svelte /tmp/old-dashboard.svelte
  rm sites/learn/src/routes/\(app\)/demo/\[platform\]/+page.svelte
  ```

### Task 4: Replace the authenticated demo layout with a layout reset

- [ ] **Rename `+layout.svelte` to `+layout@.svelte`** in `sites/learn/src/routes/(app)/demo/`

  ```bash
  mv "sites/learn/src/routes/(app)/demo/+layout.svelte" \
     "sites/learn/src/routes/(app)/demo/+layout@.svelte"
  ```

- [ ] **Replace its content with a minimal placeholder** (full shell comes in Chunk 4)

  ```svelte
  <script lang="ts">
    import 'uno.css'
    import '../../../../app.css'
    import { vibe } from '@rokkit/states'
    import { themable } from '@rokkit/actions'

    let { children, data } = $props()
  </script>

  <svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

  <div class="bg-surface-z0 text-surface-z9 min-h-screen">
    {@render children()}
  </div>
  ```

  Note: relative path to `app.css` — `(app)/demo/+layout@.svelte` is 4 levels deep, so `../../../../app.css`.

### Task 5: Create placeholder pages

- [ ] **Create `sites/learn/src/routes/(demo)/demo/+page.svelte`** (platform selector placeholder)

  ```svelte
  <div class="flex min-h-screen items-center justify-center">
    <p class="text-surface-z6">Platform selector — coming soon</p>
  </div>
  ```

- [ ] **Create `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`** (pre-auth placeholder)

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    const platform = $derived($page.params.platform)
  </script>

  <div class="flex min-h-screen items-center justify-center">
    <p class="text-surface-z6">Pre-auth page for {platform} — coming soon</p>
  </div>
  ```

- [ ] **Create `sites/learn/src/routes/(app)/demo/[platform]/dashboard/+page.svelte`** (dashboard placeholder)

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    import type { PageData } from './$types'
    let { data }: { data: PageData } = $props()
    const platform = $derived($page.params.platform)
  </script>

  <div class="p-8">
    <h1>Dashboard — {platform}</h1>
    <p>Signed in as {(data as any).user?.email}</p>
  </div>
  ```

  Note: `PageData` for this route needs a `+page.server.ts` or relies on layout data. The `(app)/demo/+layout.server.ts` already loads session data — check its exported type.

### Task 6: Verify the dev server builds without route conflicts

- [ ] **Start dev server and check for errors**

  ```bash
  cd sites/learn && bun run dev
  ```

  Expected: no "ambiguous route" errors in console. Visit:
  - `localhost:5173/demo` → "Platform selector — coming soon"
  - `localhost:5173/demo/supabase` → "Pre-auth page for supabase — coming soon" (watermark visible, no site header)
  - `localhost:5173/demo/supabase/dashboard` → redirects to `/auth` (unauthenticated)
  - After signing in: `localhost:5173/demo/supabase/dashboard` → "Dashboard — supabase"

- [ ] **Commit**

  ```bash
  git add -p  # stage all new/modified/deleted files
  git commit -m "feat(demo): route skeleton — new (demo) group, layout reset, placeholder pages"
  ```

---

## Chunk 2: Platform & Mode Metadata

**Goal:** Define the data structures that drive the landing page, pre-auth page, and sidebar. No UI yet.

**Files:**

- Create: `sites/learn/src/lib/demo/platforms.ts`
- Create: `sites/learn/src/lib/demo/modes.ts`

### Task 7: Platform metadata

- [ ] **Create `sites/learn/src/lib/demo/platforms.ts`**

  ```typescript
  export interface Platform {
    id: string
    name: string
    description: string
    icon: string // UnoCSS class, e.g. 'i-auth:supabase'
    iconFallback: string // colour class for icon background
    live: boolean
    modes: string[] // auth mode ids this platform supports
    features: string[] // what the demo covers (for the landing card bullets)
    adapterPackage: string
  }

  export const PLATFORMS: Platform[] = [
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Postgres-powered auth with row-level security',
      icon: 'i-auth:supabase',
      iconFallback: 'bg-emerald-500',
      live: true,
      modes: ['password', 'magic', 'cached', 'social'],
      features: [
        'Email + password sign-in',
        'Magic link (OTP)',
        'Role-based route protection',
        'PostgREST row-level security',
        'Cached login history'
      ],
      adapterPackage: '@kavach/adapter-supabase'
    },
    {
      id: 'firebase',
      name: 'Firebase',
      description: 'Google cloud auth with Firestore security rules',
      icon: 'i-auth:firebase',
      iconFallback: 'bg-orange-500',
      live: false,
      modes: ['password', 'social'],
      features: [
        'Email + password sign-in',
        'Google OAuth',
        'Role-based route protection',
        'Firestore security rules'
      ],
      adapterPackage: '@kavach/adapter-firebase'
    },
    {
      id: 'auth0',
      name: 'Auth0',
      description: 'Auth-as-a-service with universal login',
      icon: 'i-app:shield',
      iconFallback: 'bg-orange-700',
      live: false,
      modes: ['password', 'social'],
      features: [
        'Universal login page',
        'Social providers',
        'Role-based route protection',
        'Token-based sessions'
      ],
      adapterPackage: '@kavach/adapter-auth0'
    },
    {
      id: 'amplify',
      name: 'Amplify',
      description: 'AWS Cognito with Amplify SDK',
      icon: 'i-app:shield',
      iconFallback: 'bg-yellow-600',
      live: false,
      modes: ['password', 'social'],
      features: [
        'Cognito user pools',
        'Social identity providers',
        'Role-based route protection',
        'AWS IAM integration'
      ],
      adapterPackage: '@kavach/adapter-amplify'
    },
    {
      id: 'convex',
      name: 'Convex',
      description: 'Reactive database with built-in auth',
      icon: 'i-app:shield',
      iconFallback: 'bg-purple-600',
      live: false,
      modes: ['password'],
      features: [
        'Email + password sign-in',
        'Role-based route protection',
        'Reactive data queries',
        'Server-side auth functions'
      ],
      adapterPackage: '@kavach/adapter-convex'
    }
  ]

  export function getPlatform(id: string): Platform | undefined {
    return PLATFORMS.find((p) => p.id === id)
  }
  ```

### Task 8: Auth mode metadata

- [ ] **Create `sites/learn/src/lib/demo/modes.ts`**

  ```typescript
  export interface Capability {
    label: string
    kavachHandles: boolean // true = Kavach handles it, false = adapter handles it
  }

  export interface AuthMode {
    id: string
    label: string
    description: string
    howItWorks: string[] // bullet points for explainer
    capabilities: Capability[]
  }

  export const AUTH_MODES: AuthMode[] = [
    {
      id: 'password',
      label: 'Password',
      description: 'Classic email + password authentication',
      howItWorks: [
        'User submits credentials to the adapter (Supabase, Firebase, etc.)',
        'Adapter verifies and returns an access + refresh token pair',
        'Kavach sets a server-side session cookie (HttpOnly, Secure)',
        'Sentry checks the cookie on every request and resolves the user role',
        'On token expiry, Kavach refreshes automatically using the refresh token'
      ],
      capabilities: [
        { label: 'Server-side session cookie', kavachHandles: true },
        { label: 'Role resolution from session', kavachHandles: true },
        { label: 'Automatic token refresh', kavachHandles: true },
        { label: 'Cached login history', kavachHandles: true },
        { label: 'Credential validation', kavachHandles: false },
        { label: 'Password hashing', kavachHandles: false }
      ]
    },
    {
      id: 'magic',
      label: 'Magic Link',
      description: 'Passwordless sign-in via one-time email link',
      howItWorks: [
        'User enters their email address',
        'Adapter sends a one-time link to the email',
        'User clicks the link — adapter validates the OTP token',
        'Kavach receives the session and sets a server-side cookie',
        'Sentry checks the cookie on every subsequent request'
      ],
      capabilities: [
        { label: 'Server-side session cookie', kavachHandles: true },
        { label: 'Role resolution from session', kavachHandles: true },
        { label: 'Automatic token refresh', kavachHandles: true },
        { label: 'OTP generation + email delivery', kavachHandles: false },
        { label: 'Link expiry enforcement', kavachHandles: false }
      ]
    },
    {
      id: 'cached',
      label: 'Cached',
      description: 'Remembers previous sign-ins for one-click return',
      howItWorks: [
        'After any successful sign-in, Kavach stores login metadata in localStorage',
        'On return visits, the cached logins panel shows previous accounts',
        'Clicking a cached account pre-fills the form (email + provider)',
        'Re-authentication still goes through the full adapter flow',
        'Users can remove individual cached logins or clear all'
      ],
      capabilities: [
        { label: 'Login cache storage (localStorage)', kavachHandles: true },
        { label: 'Cache management (clear, remove)', kavachHandles: true },
        { label: 'Avatar + name from user metadata', kavachHandles: true },
        { label: 'No credential storage (security-safe)', kavachHandles: true }
      ]
    },
    {
      id: 'social',
      label: 'Social',
      description: 'OAuth sign-in via third-party providers',
      howItWorks: [
        'User clicks a provider button (Google, GitHub, etc.)',
        'Adapter redirects to the provider OAuth flow',
        'Provider redirects back with an auth code',
        'Adapter exchanges the code for tokens',
        'Kavach sets the server-side session cookie from the token response'
      ],
      capabilities: [
        { label: 'Server-side session cookie', kavachHandles: true },
        { label: 'Role resolution from session', kavachHandles: true },
        { label: 'OAuth redirect handling', kavachHandles: false },
        { label: 'Provider credentials management', kavachHandles: false }
      ]
    }
  ]

  export const ALL_MODES_TAB = { id: 'all', label: 'All', description: 'All supported modes' }

  export function getMode(id: string): AuthMode | undefined {
    return AUTH_MODES.find((m) => m.id === id)
  }
  ```

- [ ] **Commit**

  ```bash
  git add sites/learn/src/lib/demo/
  git commit -m "feat(demo): add platform and auth mode metadata"
  ```

---

## Chunk 3: Demo Landing Page (`/demo`)

**Goal:** The platform selector landing — full-page standalone, watermark, platform cards with large icons, "what you'll explore" bullets, LIVE/MOCK badge.

**Files:**

- Modify: `sites/learn/src/routes/(demo)/demo/+page.svelte`

### Task 9: Build the platform selector landing

- [ ] **Replace the placeholder with the real landing page**

  ```svelte
  <script lang="ts">
    import { PLATFORMS } from '$lib/demo/platforms'
  </script>

  <div class="flex min-h-screen flex-col items-center justify-center px-8 py-16">
    <!-- Hero -->
    <div class="mb-12 text-center">
      <h1 class="text-surface-z9 mb-3 text-4xl font-black tracking-tight">Kavach Demo</h1>
      <p class="text-surface-z6 max-w-md text-lg">
        Learn authentication by doing. Pick a platform, sign in, explore, hit the walls. See Kavach
        work.
      </p>
    </div>

    <!-- Platform grid -->
    <div class="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each PLATFORMS as platform (platform.id)}
        <a
          href="/demo/{platform.id}"
          class="border-surface-z3 bg-surface-z1 hover:border-primary group flex flex-col gap-4 rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <!-- Icon + badge row -->
          <div class="flex items-start justify-between">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-xl {platform.iconFallback} bg-opacity-10"
            >
              <span class="{platform.icon} h-10 w-10 text-4xl" aria-hidden="true"></span>
            </div>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-semibold {platform.live
                ? 'bg-success-100 text-success-700'
                : 'bg-surface-z3 text-surface-z5'}"
            >
              {platform.live ? 'LIVE' : 'MOCK'}
            </span>
          </div>

          <!-- Name + description -->
          <div>
            <h2
              class="text-surface-z9 group-hover:text-primary text-lg font-bold transition-colors"
            >
              {platform.name}
            </h2>
            <p class="text-surface-z6 mt-0.5 text-sm">{platform.description}</p>
          </div>

          <!-- What you'll explore -->
          <ul class="text-surface-z7 flex flex-col gap-1 text-xs">
            {#each platform.features as feature}
              <li class="flex items-center gap-1.5">
                <span class="i-app:shield text-primary h-3 w-3 shrink-0"></span>
                {feature}
              </li>
            {/each}
          </ul>
        </a>
      {/each}
    </div>
  </div>
  ```

- [ ] **Start dev server and visually verify the landing**

  Visit `localhost:5173/demo`. Expected:
  - Kavach watermark visible behind cards
  - Theme switcher top-right
  - 5 platform cards in responsive grid
  - Supabase + Firebase have icon images, others show shield
  - LIVE badge on Supabase, MOCK on the rest
  - Hover: card lifts
  - Click → navigates to `/demo/[platform]`
  - Footer "← Back to Kavach" at bottom

- [ ] **Commit**

  ```bash
  git add sites/learn/src/routes/\(demo\)/demo/+page.svelte
  git commit -m "feat(demo): platform selector landing page"
  ```

---

## Chunk 4: Pre-Auth Platform Page (`/demo/[platform]`)

**Goal:** The per-platform sign-in page — platform header, auth mode tabs, two-column layout with mode explainer and live auth form.

**Files:**

- Modify: `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`

### Task 10: Build the pre-auth platform page

- [ ] **Replace the placeholder**

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    import { onMount, setContext } from 'svelte'
    import { AuthProvider } from '@kavach/ui'
    import { PLATFORMS, getPlatform } from '$lib/demo/platforms'
    import { AUTH_MODES, ALL_MODES_TAB, getMode } from '$lib/demo/modes'

    const platformId = $derived($page.params.platform)
    const platform = $derived(getPlatform(platformId))

    let activeTab = $state('all')
    let kavachInstance = $state<any>(null)

    // Set up kavach context so AuthProvider can call signIn
    setContext('kavach', {
      get signIn() {
        return kavachInstance?.signIn
      },
      get signUp() {
        return kavachInstance?.signUp
      },
      get onAuthChange() {
        return kavachInstance?.onAuthChange
      },
      get getCachedLogins() {
        return kavachInstance?.getCachedLogins
      },
      get removeCachedLogin() {
        return kavachInstance?.removeCachedLogin
      },
      get clearCachedLogins() {
        return kavachInstance?.clearCachedLogins
      }
    })

    onMount(async () => {
      const { createKavach } = await import('kavach')
      const { adapter, logger } = await import('$kavach/auth')
      const { goto } = await import('$app/navigation')
      const { invalidateAll } = await import('$app/navigation')

      const instance = createKavach(adapter, {
        logger,
        invalidateAll,
        onSuccess: () => goto(`/demo/${platformId}/dashboard`)
      })
      kavachInstance = instance
      instance.onAuthChange($page.url)
    })

    const tabs = $derived([
      ALL_MODES_TAB,
      ...AUTH_MODES.filter((m) => platform?.modes.includes(m.id) ?? false)
    ])

    const disabledTabs = $derived(
      AUTH_MODES.filter((m) => !(platform?.modes.includes(m.id) ?? false))
    )

    const activeMode = $derived(activeTab === 'all' ? null : getMode(activeTab))
  </script>

  <div class="mx-auto max-w-5xl px-8 py-12">
    <!-- Platform header -->
    <div class="mb-10 flex items-center gap-5">
      <a
        href="/demo"
        class="text-surface-z5 hover:text-primary mr-2 transition-colors"
        title="All platforms"
      >
        <span class="i-app:list h-5 w-5"></span>
      </a>
      {#if platform}
        <div class="bg-surface-z2 flex h-16 w-16 items-center justify-center rounded-xl">
          <span class="{platform.icon} h-10 w-10 text-4xl" aria-hidden="true"></span>
        </div>
        <div>
          <h1 class="text-surface-z9 text-3xl font-black">{platform.name}</h1>
          <p class="text-surface-z6 text-sm">{platform.description}</p>
        </div>
      {/if}
    </div>

    <!-- Tab bar -->
    <div class="border-surface-z3 mb-8 flex gap-1 border-b pb-1">
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

    <!-- Two-column content -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Left: mode explainer -->
      <div class="flex flex-col gap-6">
        {#if activeMode}
          <div>
            <h2 class="text-surface-z9 mb-2 text-xl font-bold">{activeMode.label} Auth</h2>
            <p class="text-surface-z6 text-sm">{activeMode.description}</p>
          </div>

          <div>
            <h3 class="text-surface-z7 mb-3 text-xs font-semibold tracking-wider uppercase">
              How Kavach wires it
            </h3>
            <ol class="flex flex-col gap-2">
              {#each activeMode.howItWorks as step, i}
                <li class="flex gap-3 text-sm">
                  <span
                    class="bg-primary text-primary-contrast mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  >
                    {i + 1}
                  </span>
                  <span class="text-surface-z7">{step}</span>
                </li>
              {/each}
            </ol>
          </div>

          <div>
            <h3 class="text-surface-z7 mb-3 text-xs font-semibold tracking-wider uppercase">
              Capabilities
            </h3>
            <ul class="flex flex-col gap-1.5">
              {#each activeMode.capabilities as cap}
                <li class="flex items-center gap-2 text-sm">
                  <span
                    class="h-4 w-4 shrink-0 {cap.kavachHandles
                      ? 'i-app:shield text-success-600'
                      : 'i-app:shield text-surface-z4'}"
                    aria-hidden="true"
                  ></span>
                  <span class={cap.kavachHandles ? 'text-surface-z8' : 'text-surface-z5'}>
                    {cap.label}
                  </span>
                  <span class="text-surface-z4 ml-auto text-xs">
                    {cap.kavachHandles ? 'Kavach' : 'Adapter'}
                  </span>
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <!-- All tab: capability overview -->
          <div>
            <h2 class="text-surface-z9 mb-2 text-xl font-bold">What {platform?.name} supports</h2>
            <p class="text-surface-z6 mb-4 text-sm">
              Select a tab to explore each auth mode individually, or use All to try all available
              providers at once.
            </p>
            <ul class="flex flex-col gap-2">
              {#each tabs.filter((t) => t.id !== 'all') as tab}
                <li class="text-surface-z7 flex items-center gap-2 text-sm">
                  <span class="i-app:shield text-primary h-4 w-4"></span>
                  {tab.label}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Right: live auth form -->
      <div class="bg-surface-z1 border-surface-z3 flex flex-col gap-4 rounded-2xl border p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-surface-z8 font-semibold">Sign in to try it</h3>
          {#if platform?.live}
            <span
              class="bg-success-100 text-success-700 rounded-full px-2 py-0.5 text-xs font-semibold"
              >LIVE</span
            >
          {:else}
            <span
              class="bg-surface-z3 text-surface-z5 rounded-full px-2 py-0.5 text-xs font-semibold"
              >MOCK</span
            >
          {/if}
        </div>

        <!-- AuthProvider renders the actual sign-in form -->
        <AuthProvider onsuccess={() => {}} />

        <p class="text-surface-z5 text-center text-xs">
          No account?
          <button
            class="text-primary hover:underline"
            onclick={() => {
              // Pre-fill test credentials via custom event or direct DOM manipulation
              // The AuthProvider form fields need to be pre-populated
              document
                .querySelector<HTMLInputElement>('input[type="email"]')
                ?.dispatchEvent(new InputEvent('input', { bubbles: true }))
            }}
          >
            use test credentials
          </button>
          <span class="text-surface-z4">(test@test.com / password123)</span>
        </p>
      </div>
    </div>
  </div>
  ```

  **Note on AuthProvider:** The `AuthProvider` component from `@kavach/ui` uses `getContext('kavach')` to get `signIn` etc. Since we're using `+layout@.svelte` (reset), we must set up the context in THIS page (done via `setContext` in the script). Check `@kavach/ui`'s `AuthProvider` props — it may accept an `onsuccess` callback or rely on the kavach context to do the redirect. Adjust as needed.

  **Note on redirect after sign-in:** The current flow redirects via kavach's `onAuthChange`. The success redirect to `/demo/[platform]/dashboard` needs to be configured. Check if `createKavach` accepts an `onSuccess` option — if not, wire the redirect in the `onAuthChange` callback.

- [ ] **Visually verify**

  Visit `localhost:5173/demo/supabase`. Expected:
  - Supabase icon + name in header
  - Tab bar: All, Password, Magic Link, Cached, Social (all active)
  - Click "Password" tab: shows explainer on left, email/password form on right
  - Click "Magic Link" tab: shows OTP explainer + magic link form
  - Signing in with test credentials → navigates to `/demo/supabase/dashboard`

  Visit `localhost:5173/demo/firebase`. Expected:
  - Firebase icon + name
  - Tabs: All, Password, Social (active) + Magic Link, Cached (disabled/greyed)

- [ ] **Commit**

  ```bash
  git add sites/learn/src/routes/\(demo\)/demo/\[platform\]/+page.svelte
  git commit -m "feat(demo): pre-auth platform page with auth mode tabs"
  ```

---

## Chunk 5: Authenticated Demo Shell

**Goal:** The full demo app chrome — layout reset with top bar, sidebar (nav + role card + Sentry config + Hacker toggle), floating badge.

**Files:**

- Create: `sites/learn/src/lib/demo/hacker.svelte.ts`
- Create: `sites/learn/src/lib/demo/FloatingBadge.svelte`
- Create: `sites/learn/src/lib/demo/DemoSidebar.svelte`
- Create: `sites/learn/src/lib/demo/DemoNavItem.svelte`
- Create: `sites/learn/src/lib/demo/RoleCard.svelte`
- Create: `sites/learn/src/lib/demo/SentryConfigPanel.svelte`
- Create: `sites/learn/src/lib/demo/HackerToggle.svelte`
- Modify: `sites/learn/src/routes/(app)/demo/+layout@.svelte`

### Task 11: Hacker mode shared state

- [ ] **Create `sites/learn/src/lib/demo/hacker.svelte.ts`**

  ```typescript
  // Svelte 5 rune: shared state across all demo pages
  // Import this wherever hacker mode behaviour is needed

  let _hackerMode = $state(false)

  export const hackerMode = {
    get value() {
      return _hackerMode
    },
    toggle() {
      _hackerMode = !_hackerMode
    },
    set(val: boolean) {
      _hackerMode = val
    }
  }
  ```

### Task 12: Floating badge component

- [ ] **Create `sites/learn/src/lib/demo/FloatingBadge.svelte`**

  ```svelte
  <script lang="ts">
    import { hackerMode } from './hacker.svelte'
    import { getPlatform } from './platforms'

    let { platform }: { platform: string } = $props()
    const p = $derived(getPlatform(platform))
    let showTooltip = $state(false)
  </script>

  <div
    class="fixed right-4 bottom-4 z-50 flex cursor-default flex-col items-center gap-1"
    onmouseenter={() => (showTooltip = true)}
    onmouseleave={() => (showTooltip = false)}
    role="status"
    aria-label="Powered by Kavach"
  >
    {#if showTooltip}
      <div
        class="bg-surface-z8 text-surface-z1 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-lg"
      >
        Powered by Kavach · {p?.name ?? platform} adapter
      </div>
    {/if}

    <div
      class="bg-surface-z1 border-surface-z3 flex flex-col items-center gap-1 rounded-xl border p-2 shadow-md transition-all
        {hackerMode.value ? 'border-warning-400 shadow-warning-200 animate-pulse' : ''}"
    >
      <!-- Kavach logo -->
      <div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
        <img src="/brand/kavach.svg" alt="Kavach" class="h-5 w-5 invert" />
      </div>
      <!-- Platform icon -->
      {#if p}
        <div class="bg-surface-z2 flex h-8 w-8 items-center justify-center rounded-lg">
          <span class="{p.icon} h-5 w-5" aria-hidden="true"></span>
        </div>
      {/if}
    </div>
  </div>
  ```

### Task 13: HackerToggle component

- [ ] **Create `sites/learn/src/lib/demo/HackerToggle.svelte`**

  ```svelte
  <script lang="ts">
    import { hackerMode } from './hacker.svelte'
  </script>

  <div class="flex flex-col gap-2">
    <span class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Mode</span>
    <button
      onclick={hackerMode.toggle}
      class="relative flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-all
        {hackerMode.value
        ? 'border-warning-400 bg-warning-50 text-warning-800'
        : 'border-surface-z3 bg-surface-z0 text-surface-z7 hover:border-primary'}"
      title={hackerMode.value
        ? 'Hacker Mode: security enforcement is visible. Click to return to App Mode.'
        : 'App Mode: normal UX. Click to enter Hacker Mode and see security in action.'}
    >
      <span>{hackerMode.value ? '💀 Hacker Mode' : '✅ App Mode'}</span>
      <span class="text-surface-z4 text-xs">{hackerMode.value ? 'on' : 'off'}</span>
    </button>
    {#if hackerMode.value}
      <p class="text-warning-700 text-xs leading-relaxed">
        UI shows all routes. Kavach enforcement is surfaced visually when you trigger a protected
        action.
      </p>
    {/if}
  </div>
  ```

### Task 14: RoleCard component

- [ ] **Create `sites/learn/src/lib/demo/RoleCard.svelte`**

  ```svelte
  <script lang="ts">
    interface RouteAccess {
      path: string
      roles: string | string[]
      allowed: boolean
    }

    let {
      role,
      routes
    }: {
      role: string | null
      routes: RouteAccess[]
    } = $props()
  </script>

  <div class="flex flex-col gap-3">
    <span class="text-surface-z5 text-xs font-semibold tracking-wider uppercase">Your Role</span>

    <div class="bg-surface-z2 rounded-lg px-3 py-2">
      <span
        class="font-mono text-sm font-bold
          {role === 'admin' ? 'text-warning-600' : 'text-primary'}"
      >
        {role ?? 'unauthenticated'}
      </span>
    </div>

    <div class="flex flex-col gap-1">
      {#each routes as route}
        <div class="flex items-center gap-2 text-xs">
          <span
            class="h-3 w-3 shrink-0 {route.allowed
              ? 'i-app:shield text-success-600'
              : 'i-app:shield text-error-400'}"
            aria-hidden="true"
          ></span>
          <span
            class="font-mono text-xs {route.allowed
              ? 'text-surface-z7'
              : 'text-surface-z4 line-through'}"
          >
            {route.path}
          </span>
        </div>
      {/each}
    </div>
  </div>
  ```

### Task 15: SentryConfigPanel component

- [ ] **Create `sites/learn/src/lib/demo/SentryConfigPanel.svelte`**

  ```svelte
  <script lang="ts">
    interface Rule {
      path: string
      roles: string | string[]
      allowed: boolean // based on current user's role
    }

    let { rules }: { rules: Rule[] } = $props()
    let open = $state(false)
  </script>

  <div class="flex flex-col gap-2">
    <button
      onclick={() => (open = !open)}
      class="text-surface-z5 hover:text-surface-z8 flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition-colors"
    >
      <span>Sentry Config</span>
      <span class="i-app:list h-3 w-3 transition-transform {open ? 'rotate-180' : ''}"></span>
    </button>

    {#if open}
      <div class="border-surface-z2 flex flex-col gap-1 rounded-lg border p-2">
        {#each rules as rule}
          <div class="flex items-center gap-2 py-0.5">
            <span
              class="h-2 w-2 shrink-0 rounded-full {rule.allowed
                ? 'bg-success-500'
                : 'bg-error-400'}"
            ></span>
            <span class="text-surface-z6 flex-1 truncate font-mono text-xs">{rule.path}</span>
            <span class="text-surface-z4 shrink-0 font-mono text-xs">
              {Array.isArray(rule.roles) ? rule.roles.join(',') : rule.roles}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  ```

### Task 16: DemoNavItem component

- [ ] **Create `sites/learn/src/lib/demo/DemoNavItem.svelte`**

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    import { hackerMode } from './hacker.svelte'
    import { goto } from '$app/navigation'

    let {
      href,
      label,
      locked = false, // true when current user can't access this route
      lockedRedirect = '' // where to redirect if locked + App Mode
    }: {
      href: string
      label: string
      locked?: boolean
      lockedRedirect?: string
    } = $props()

    const isActive = $derived(
      $page.url.pathname === href || $page.url.pathname.startsWith(href + '/')
    )

    async function handleClick(e: MouseEvent) {
      if (locked && !hackerMode.value) {
        // App Mode: silently redirect to safe route
        e.preventDefault()
        await goto(lockedRedirect || '.')
      }
      // Hacker Mode: let the click through — Kavach will show the error
    }
  </script>

  <a
    {href}
    onclick={handleClick}
    class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
      {isActive
      ? 'bg-primary text-white'
      : locked && !hackerMode.value
        ? 'text-surface-z4 cursor-default'
        : 'text-surface-z7 hover:bg-surface-z2 hover:text-surface-z9'}"
    title={locked && !hackerMode.value ? 'Access restricted to admin role' : undefined}
  >
    <span class="flex-1">{label}</span>
    {#if locked}
      <span
        class="text-xs {hackerMode.value ? 'text-warning-500' : 'text-surface-z3'}"
        title={hackerMode.value
          ? 'Hacker Mode: clicking will trigger Kavach enforcement'
          : 'Restricted'}
      >
        {hackerMode.value ? '⚠' : '🔒'}
      </span>
    {/if}
  </a>
  ```

### Task 17: DemoSidebar component

- [ ] **Create `sites/learn/src/lib/demo/DemoSidebar.svelte`**

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    import DemoNavItem from './DemoNavItem.svelte'
    import RoleCard from './RoleCard.svelte'
    import SentryConfigPanel from './SentryConfigPanel.svelte'
    import HackerToggle from './HackerToggle.svelte'

    let {
      platform,
      user
    }: {
      platform: string
      user: { email: string; role: string | null } | null
    } = $props()

    const role = $derived(user?.role ?? null)
    const isAdmin = $derived(role === 'admin')

    const navRoutes = $derived([
      {
        href: `/demo/${platform}/dashboard`,
        label: 'Dashboard',
        locked: false,
        lockedRedirect: ''
      },
      { href: `/demo/${platform}/data`, label: 'Space Facts', locked: false, lockedRedirect: '' },
      {
        href: `/demo/${platform}/admin`,
        label: 'Admin',
        locked: !isAdmin,
        lockedRedirect: `/demo/${platform}/dashboard`
      }
    ])

    const roleRoutes = $derived([
      { path: 'dashboard', roles: '*', allowed: true },
      { path: 'data', roles: '*', allowed: true },
      { path: 'admin', roles: 'admin', allowed: isAdmin },
      { path: '/data/facts', roles: '*', allowed: true },
      { path: '/data/admin-stats', roles: 'admin', allowed: isAdmin }
    ])

    const sentryRules = $derived([
      { path: `/demo/${platform}/dashboard`, roles: '*', allowed: true },
      { path: `/demo/${platform}/data`, roles: '*', allowed: true },
      { path: `/demo/${platform}/admin`, roles: 'admin', allowed: isAdmin },
      { path: '/data/facts', roles: '*', allowed: true },
      { path: '/data/admin-stats', roles: 'admin', allowed: isAdmin }
    ])
  </script>

  <aside
    class="border-surface-z3 bg-surface-z1 flex w-56 shrink-0 flex-col gap-6 overflow-y-auto border-r px-4 py-6"
  >
    <!-- Navigation -->
    <nav class="flex flex-col gap-1">
      {#each navRoutes as route (route.href)}
        <DemoNavItem
          href={route.href}
          label={route.label}
          locked={route.locked}
          lockedRedirect={route.lockedRedirect}
        />
      {/each}
      <div class="border-surface-z2 my-1 border-t"></div>
      <a
        href="/demo/{platform}/logout"
        class="text-surface-z6 hover:text-error-600 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
      >
        <span class="i-app:logout h-4 w-4"></span>
        Sign Out
      </a>
    </nav>

    <!-- Role card -->
    <RoleCard {role} routes={roleRoutes} />

    <!-- Sentry config -->
    <SentryConfigPanel rules={sentryRules} />

    <!-- Hacker toggle -->
    <HackerToggle />

    <!-- Back to Kavach -->
    <div class="mt-auto">
      <a href="/" class="text-surface-z4 hover:text-primary text-xs transition-colors">
        ← Back to Kavach
      </a>
    </div>
  </aside>
  ```

### Task 18: Wire up the authenticated demo shell layout

- [ ] **Replace `sites/learn/src/routes/(app)/demo/+layout@.svelte`** with the full shell:

  ```svelte
  <script lang="ts">
    import 'uno.css'
    import '../../../../app.css'
    import { vibe } from '@rokkit/states'
    import { themable } from '@rokkit/actions'
    import { ThemeSwitcherToggle } from '@rokkit/app'
    import { page } from '$app/stores'
    import { onMount, setContext } from 'svelte'
    import type { LayoutData } from './$types'
    import DemoSidebar from '$lib/demo/DemoSidebar.svelte'
    import FloatingBadge from '$lib/demo/FloatingBadge.svelte'

    let { children, data }: { children: any; data: LayoutData } = $props()

    const platform = $derived($page.params.platform ?? 'supabase')
    const user = $derived((data as any).user ?? null)

    let kavachInstance = $state<any>(null)

    setContext('kavach', {
      get signOut() {
        return kavachInstance?.signOut
      },
      get signIn() {
        return kavachInstance?.signIn
      },
      get signUp() {
        return kavachInstance?.signUp
      },
      get onAuthChange() {
        return kavachInstance?.onAuthChange
      },
      get getCachedLogins() {
        return kavachInstance?.getCachedLogins
      },
      get removeCachedLogin() {
        return kavachInstance?.removeCachedLogin
      },
      get clearCachedLogins() {
        return kavachInstance?.clearCachedLogins
      }
    })

    onMount(async () => {
      const { createKavach } = await import('kavach')
      const { adapter, logger } = await import('$kavach/auth')
      const { invalidateAll } = await import('$app/navigation')
      const instance = createKavach(adapter, { logger, invalidateAll })
      kavachInstance = instance
      instance.onAuthChange($page.url)
    })
  </script>

  <svelte:body use:themable={{ theme: vibe, storageKey: 'kavach-theme' }} />

  <div class="bg-surface-z0 text-surface-z9 flex h-screen flex-col">
    <!-- Top bar -->
    <header
      class="border-surface-z2 bg-surface-z1 flex h-12 shrink-0 items-center justify-between border-b px-4"
    >
      <div class="flex items-center gap-3">
        <span class="text-surface-z9 font-bold">DemoApp</span>
        {#if platform}
          <span
            class="border-surface-z3 text-surface-z5 flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
          >
            <span class="i-auth:{platform} h-3.5 w-3.5" aria-hidden="true"></span>
            {platform}
          </span>
        {/if}
      </div>
      <div class="flex items-center gap-3">
        <ThemeSwitcherToggle />
        {#if user}
          <div class="flex items-center gap-2">
            <div
              class="bg-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            >
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div class="flex flex-col leading-none">
              <span class="text-surface-z8 text-xs font-medium">{user.email}</span>
              <span class="text-surface-z5 text-xs">{user.role ?? 'authenticated'}</span>
            </div>
          </div>
        {/if}
      </div>
    </header>

    <!-- Body: sidebar + content -->
    <div class="flex min-h-0 flex-1">
      <DemoSidebar {platform} {user} />
      <main class="min-w-0 flex-1 overflow-y-auto">
        {@render children()}
      </main>
    </div>
  </div>

  <!-- Floating identity badge -->
  <FloatingBadge {platform} />
  ```

  **Note on `data.user`:** Check `(app)/demo/+layout.server.ts` to confirm what it exports. It likely exposes `locals.session?.user`. The field is `(data as any).user` — adjust the cast once you see the actual type.

- [ ] **Visually verify the shell**

  Sign in, visit `localhost:5173/demo/supabase/dashboard`. Expected:
  - Top bar: "DemoApp", Supabase badge, theme switcher, user email + role
  - Sidebar: Dashboard, Space Facts, Admin (with lock for non-admin), Sign Out, role card, Sentry config (collapsed), App/Hacker toggle, "← Back to Kavach"
  - Floating badge: bottom-right, two stacked icons
  - No Kavach site header (no Home/Docs/Demo nav)

- [ ] **Commit**

  ```bash
  git add sites/learn/src/lib/demo/ sites/learn/src/routes/\(app\)/demo/+layout@.svelte
  git commit -m "feat(demo): authenticated demo shell — top bar, sidebar, floating badge"
  ```

---

## Chunk 6: Content Pages

**Goal:** Dashboard, Space Facts, Admin — reskinned with Sentry learning augmentation.

**Files:**

- Create: `sites/learn/src/lib/demo/SentryAnnotation.svelte`
- Create: `sites/learn/src/lib/demo/AccessLog.svelte`
- Modify: `sites/learn/src/routes/(app)/demo/[platform]/dashboard/+page.svelte`
- Modify: `sites/learn/src/routes/(app)/demo/[platform]/data/+page.svelte`
- Modify: `sites/learn/src/routes/(app)/demo/[platform]/admin/+page.svelte`

### Task 19: SentryAnnotation component

- [ ] **Create `sites/learn/src/lib/demo/SentryAnnotation.svelte`**

  ```svelte
  <script lang="ts">
    let {
      title,
      message,
      variant = 'info'
    }: {
      title: string
      message: string
      variant?: 'info' | 'warning' | 'success' | 'error'
    } = $props()

    const variantClasses = {
      info: 'border-primary bg-primary/5 text-primary',
      warning: 'border-warning-400 bg-warning-50 text-warning-800',
      success: 'border-success-400 bg-success-50 text-success-800',
      error: 'border-error-400 bg-error-50 text-error-800'
    }
  </script>

  <div class="flex items-start gap-3 rounded-lg border p-3 text-sm {variantClasses[variant]}">
    <span class="i-app:shield mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"></span>
    <div>
      <span class="font-semibold">Sentry: </span>
      <span class="font-medium">{title}</span>
      {#if message}
        <p class="mt-1 opacity-80">{message}</p>
      {/if}
    </div>
  </div>
  ```

### Task 20: AccessLog component

- [ ] **Create `sites/learn/src/lib/demo/AccessLog.svelte`**

  ```svelte
  <script lang="ts">
    export interface LogEntry {
      path: string
      timestamp: Date
      result: 'allowed' | 'blocked' | 'redirected'
      role: string | null
    }

    let { entries }: { entries: LogEntry[] } = $props()
  </script>

  {#if entries.length > 0}
    <div class="flex flex-col gap-1">
      {#each entries.slice(-5).reverse() as entry}
        <div class="text-surface-z6 flex items-center gap-2 text-xs">
          <span
            class="h-2 w-2 shrink-0 rounded-full
              {entry.result === 'allowed'
              ? 'bg-success-500'
              : entry.result === 'redirected'
                ? 'bg-warning-500'
                : 'bg-error-500'}"
          ></span>
          <span class="font-mono">{entry.path}</span>
          <span class="text-surface-z4 ml-auto">{entry.result}</span>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-surface-z4 text-xs">No navigation recorded yet.</p>
  {/if}
  ```

### Task 21: Dashboard page

- [ ] **Replace `sites/learn/src/routes/(app)/demo/[platform]/dashboard/+page.svelte`** with the full dashboard:

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    import type { PageData } from './$types'
    import SentryAnnotation from '$lib/demo/SentryAnnotation.svelte'

    let { data }: { data: PageData } = $props()
    const user = $derived((data as any).user)
    const platform = $derived($page.params.platform)
  </script>

  <div class="flex flex-col gap-8 p-8">
    <!-- Welcome -->
    <div>
      <h1 class="text-2xl font-bold">Kavach Demo Dashboard</h1>
      <p class="text-surface-z6 mt-1 text-sm">
        You're signed in. Navigate the app to see Kavach in action.
      </p>
    </div>

    <!-- Sentry annotation -->
    <SentryAnnotation
      title="This route requires roles: *"
      message="Any authenticated user can access this page. Sentry verified your session cookie on this request."
      variant="success"
    />

    <!-- User card -->
    {#if user}
      <div class="border-surface-z3 bg-surface-z1 rounded-xl border p-6">
        <h2 class="text-surface-z6 mb-4 text-sm font-semibold tracking-wider uppercase">
          Your Session
        </h2>
        <dl class="grid grid-cols-2 gap-4">
          <div>
            <dt class="text-surface-z5 text-xs">Email</dt>
            <dd class="text-surface-z8 font-mono text-sm">{user.email}</dd>
          </div>
          <div>
            <dt class="text-surface-z5 text-xs">Role</dt>
            <dd
              class="font-mono text-sm {user.role === 'admin'
                ? 'text-warning-600 font-bold'
                : 'text-primary'}"
            >
              {user.role ?? 'authenticated'}
            </dd>
          </div>
          <div>
            <dt class="text-surface-z5 text-xs">User ID</dt>
            <dd class="text-surface-z6 truncate font-mono text-xs">{user.id ?? '—'}</dd>
          </div>
          <div>
            <dt class="text-surface-z5 text-xs">Platform</dt>
            <dd class="text-surface-z8 text-sm">{platform}</dd>
          </div>
        </dl>
      </div>
    {/if}

    <!-- Quick access cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <a
        href="/demo/{platform}/data"
        class="border-surface-z3 bg-surface-z1 hover:border-primary rounded-xl border p-4 transition-all hover:-translate-y-0.5"
      >
        <h3 class="font-semibold">Space Facts</h3>
        <p class="text-surface-z5 mt-1 text-xs">Role-gated data — general vs classified</p>
        <span class="text-success-600 mt-2 block text-xs font-medium">✓ Accessible</span>
      </a>
      <a
        href="/demo/{platform}/admin"
        class="border-surface-z3 bg-surface-z1 hover:border-primary rounded-xl border p-4 transition-all hover:-translate-y-0.5"
      >
        <h3 class="font-semibold">Admin Panel</h3>
        <p class="text-surface-z5 mt-1 text-xs">Requires admin role — see what happens</p>
        <span
          class="mt-2 block text-xs font-medium {(data as any).user?.role === 'admin'
            ? 'text-success-600'
            : 'text-error-500'}"
        >
          {(data as any).user?.role === 'admin' ? '✓ Accessible' : '✗ Restricted'}
        </span>
      </a>
      <a
        href="/demo/{platform}/data"
        class="border-surface-z3 bg-surface-z1 hover:border-primary rounded-xl border p-4 transition-all hover:-translate-y-0.5"
      >
        <h3 class="font-semibold">API Routes</h3>
        <p class="text-surface-z5 mt-1 text-xs">Sentry protects /data/* server routes too</p>
        <span class="text-success-600 mt-2 block text-xs font-medium">✓ Try Load Facts</span>
      </a>
    </div>
  </div>
  ```

### Task 22: Space Facts page — add Sentry annotation + Hacker Mode endpoint test

- [ ] **Modify `sites/learn/src/routes/(app)/demo/[platform]/data/+page.svelte`**

  Add to the top of the existing content (after the `<div class="flex flex-col gap-6 p-8">`):

  ```svelte
  <SentryAnnotation
    title="This data is server-filtered by your role"
    message="Admin users see 8 facts (including 3 classified). You see {isAdmin
      ? 8
      : 5}. PostgREST RLS and Kavach role checks both enforce this."
    variant={isAdmin ? 'warning' : 'info'}
  />
  ```

  Add below the Load Facts button (in Hacker Mode only):

  ```svelte
  {#if hackerMode.value}
    <div class="border-warning-300 bg-warning-50 rounded-lg border p-4">
      <h3 class="text-warning-800 mb-2 text-sm font-semibold">
        Hacker Mode: Try a restricted API route
      </h3>
      <p class="text-warning-700 mb-3 text-xs">
        <code class="font-mono">/data/admin-stats</code> requires admin role. Click to fire the request
        and see Sentry's response.
      </p>
      <button
        onclick={tryAdminStats}
        class="border-warning-400 text-warning-800 hover:bg-warning-100 rounded border px-3 py-1.5 text-xs font-medium transition-colors"
      >
        Try /data/admin-stats →
      </button>
      {#if adminStatsResult}
        <pre
          class="bg-surface-z8 text-surface-z1 mt-3 overflow-x-auto rounded p-3 text-xs">{adminStatsResult}</pre>
      {/if}
    </div>
  {/if}
  ```

  Add to the script section:

  ```svelte
  import SentryAnnotation from '$lib/demo/SentryAnnotation.svelte'
  import { hackerMode } from '$lib/demo/hacker.svelte'

  let adminStatsResult = $state<string | null>(null)

  async function tryAdminStats() {
    adminStatsResult = 'Fetching...'
    try {
      const res = await fetch('/data/admin-stats')
      const text = await res.text()
      adminStatsResult = `HTTP ${res.status}\n${text}`
    } catch (e: any) {
      adminStatsResult = `Error: ${e.message}`
    }
  }
  ```

### Task 23: Admin page — App Mode redirect + Hacker Mode forbidden display

- [ ] **Modify `sites/learn/src/routes/(app)/demo/[platform]/admin/+page.svelte`**

  Existing content handles redirect server-side. Add client-side visual feedback for Hacker Mode. At the top of the page content (the non-admin path currently redirects server-side — check `+page.server.ts`):

  ```svelte
  <script lang="ts">
    import { page } from '$app/stores'
    import type { PageData } from './$types'
    import SentryAnnotation from '$lib/demo/SentryAnnotation.svelte'
    import { hackerMode } from '$lib/demo/hacker.svelte'

    let { data }: { data: PageData } = $props()
    const user = $derived((data as any).user)
    const isAdmin = $derived(user?.role === 'admin')
    const platform = $derived($page.params.platform)
  </script>

  {#if isAdmin}
    <!-- Admin content as before, plus annotation -->
    <div class="flex flex-col gap-6 p-8">
      <SentryAnnotation
        title="Access granted — roles: ['admin']"
        message="Your role is 'admin'. This route is configured with roles: ['admin'] in kavach.config.js."
        variant="success"
      />
      <!-- ... existing admin content ... -->
    </div>
  {:else}
    <!-- This branch only renders in Hacker Mode (App Mode would have redirected via DemoNavItem) -->
    <div class="flex flex-col gap-6 p-8">
      <SentryAnnotation
        title="403 Forbidden — roles: ['admin'] required"
        message="Your role is '{user?.role ??
          'authenticated'}'. Sentry blocked this request. In App Mode, you would have been redirected before reaching this page."
        variant="error"
      />
      <div class="border-error-200 bg-error-50 rounded-xl border p-6">
        <h1 class="text-error-800 mb-2 text-xl font-bold">403 Forbidden</h1>
        <p class="text-error-700 text-sm">
          The Sentry rule <code class="font-mono">/demo/{platform}/admin → roles: ['admin']</code>
          blocked your access. Your current role is
          <code class="font-mono">{user?.role ?? 'authenticated'}</code>.
        </p>
        <a
          href="/demo/{platform}/dashboard"
          class="text-primary mt-4 block text-sm hover:underline"
        >
          ← Back to dashboard
        </a>
      </div>
    </div>
  {/if}
  ```

  **Note:** The server-side redirect in `+page.server.ts` redirects non-admin users. In Hacker Mode, the nav item allows clicking through — but the server will still redirect. To show the forbidden page in Hacker Mode, you may need to change `+page.server.ts` to return a 403 status instead of redirecting when the request has a specific query param (e.g. `?hacker=1`). Alternatively, add a client-side-only forbidden view that renders when `DemoNavItem` navigates and the page load fails. Discuss with the team the preferred approach — for now implement the server redirect as-is and add a TODO comment.

- [ ] **Commit**

  ```bash
  git add sites/learn/src/lib/demo/ \
          "sites/learn/src/routes/(app)/demo/[platform]/dashboard/" \
          "sites/learn/src/routes/(app)/demo/[platform]/data/" \
          "sites/learn/src/routes/(app)/demo/[platform]/admin/"
  git commit -m "feat(demo): content pages — dashboard, space facts, admin with Sentry annotations"
  ```

---

## Chunk 7: Admin-Stats Endpoint + Mock Sessions

**Goal:** Add the `/data/admin-stats` server route. Wire up mock session for non-Supabase platforms.

**Files:**

- Modify: `sites/learn/src/routes/(server)/data/[...slug]/+server.ts`
- Modify: `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte` (mock sign-in for non-live platforms)

### Task 24: Add `/data/admin-stats` endpoint

- [ ] **Open `sites/learn/src/routes/(server)/data/[...slug]/+server.ts`**

  In the `GET` handler, after the `if (entity === 'facts')` block, add:

  ```typescript
  if (entity === 'admin-stats') {
    if (locals.session?.user?.role !== 'admin') {
      return json({ error: 'Forbidden — admin only' }, { status: 403 })
    }
    return json({
      users: { total: 2, active: 1 },
      facts: {
        total: SEED_FACTS.length + customFacts.length,
        classified: SEED_FACTS.filter((f) => f.tier === 'classified').length
      },
      platform: 'supabase'
    })
  }
  ```

### Task 25: Mock sign-in for non-live platforms

- [ ] **In `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte`**

  Detect non-live platforms and show a simplified mock sign-in that fabricates a session:

  ```svelte
  {#if !platform?.live}
    <!-- Mock sign-in for non-live platforms -->
    <div class="bg-surface-z1 border-surface-z3 rounded-2xl border p-6">
      <div
        class="bg-warning-50 border-warning-200 text-warning-700 mb-4 rounded-lg border px-3 py-2 text-xs"
      >
        This platform uses mocked adapter responses. Sign-in always succeeds.
      </div>
      <button
        onclick={mockSignIn}
        class="bg-primary w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        Sign in as test user →
      </button>
      <button
        onclick={mockSignInAdmin}
        class="bg-surface-z2 text-surface-z8 hover:bg-surface-z3 mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium"
      >
        Sign in as admin →
      </button>
    </div>
  {:else}
    <!-- Live AuthProvider form -->
    <AuthProvider onsuccess={() => {}} />
  {/if}
  ```

  The `mockSignIn` / `mockSignInAdmin` functions POST to `/auth/session` directly with a fabricated session cookie, then navigate to the dashboard. Implementation:

  ```typescript
  async function mockSignIn(role = 'authenticated') {
    const session = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: {
        id: 'mock-user-id',
        role,
        email: role === 'admin' ? 'admin@test.com' : 'test@test.com'
      }
    }
    await fetch('/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session })
    })
    const { goto, invalidateAll } = await import('$app/navigation')
    await invalidateAll()
    await goto(`/demo/${platformId}/dashboard`)
  }

  async function mockSignInAdmin() {
    await mockSignIn('admin')
  }
  ```

  **Note:** This requires the `/auth/session` endpoint (`handleSessionSync`) to accept a pre-fabricated session. It currently calls `adapter.synchronize(session)` which will fail for mock platforms. For mock platforms, you may need to bypass synchronize — or add a `mock: true` flag to the session that `handleSessionSync` detects and stores as-is. Add a TODO for this and test with Supabase only for now.

- [ ] **Commit**

  ```bash
  git add "sites/learn/src/routes/(server)/data/[...slug]/+server.ts" \
          "sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte"
  git commit -m "feat(demo): add /data/admin-stats endpoint, mock sign-in for non-live platforms"
  ```

---

## Chunk 8: E2E Tests

**Goal:** Update Playwright tests for the new route structure. Add tests for the landing page, pre-auth page, and demo shell.

**Files:**

- Modify: `sites/learn/e2e/demo.e2e.ts`
- Create: `sites/learn/e2e/demo-landing.e2e.ts`
- Modify: `sites/learn/e2e/home.e2e.ts`
- Modify: `sites/learn/playwright.config.js` (`reuseExistingServer: true` already added)

### Task 26: Update existing demo E2E tests

- [ ] **Open `sites/learn/e2e/demo.e2e.ts`**

  The `loginAsUser` helper and most tests reference `/demo/supabase` as the post-auth landing. Update all references:
  - `/demo/supabase` (old dashboard) → `/demo/supabase/dashboard`
  - Wait for URL pattern: `toHaveURL(/\/demo\/supabase\/dashboard/)`
  - Nav link for Dashboard: update selector

  Update `loginAsUser` redirect:

  ```typescript
  await page.goto('/demo/supabase/dashboard')
  await page.waitForURL(/\/demo\/supabase\/dashboard/, { timeout: 10000 })
  ```

  Update the `'demo index page loads'` test:

  ```typescript
  test('demo index page loads', async ({ page }) => {
    await expect(page.getByRole('main').locator('h1')).toContainText('Kavach Demo Dashboard')
  })
  ```

  Update navigation test — the nav links are now in the sidebar, not a top nav:

  ```typescript
  test('can navigate between demo pages', async ({ page }) => {
    await page.locator('aside a[href="/demo/supabase/data"]').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/demo\/supabase\/data/)

    await page.locator('aside a[href="/demo/supabase/dashboard"]').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/demo\/supabase\/dashboard/)
  })
  ```

  Remove the platform switcher test (no more platform switching within demo):

  ```typescript
  // DELETE: test('platform switcher changes platform', ...)
  ```

  Update unauthenticated redirect tests — `/demo/supabase` is now public:

  ```typescript
  test('demo dashboard redirects unauthenticated user to auth', async ({ page }) => {
    await page.goto('/demo/supabase/dashboard')
    await expect(page).toHaveURL(/\/auth/)
  })
  ```

### Task 27: Add landing page E2E tests

- [ ] **Create `sites/learn/e2e/demo-landing.e2e.ts`**

  ```typescript
  import { expect, test } from '@playwright/test'

  test.describe('Demo Landing (/demo)', () => {
    test('demo landing loads without Kavach site header', async ({ page }) => {
      await page.goto('/demo')
      // Should NOT have the Kavach site nav (Home/Docs/Demo)
      await expect(page.locator('nav >> text=Docs')).not.toBeVisible()
      // Should have platform cards
      await expect(page.locator('a[href="/demo/supabase"]')).toBeVisible()
    })

    test('shows all 5 platform cards', async ({ page }) => {
      await page.goto('/demo')
      const platforms = ['supabase', 'firebase', 'auth0', 'amplify', 'convex']
      for (const p of platforms) {
        await expect(page.locator(`a[href="/demo/${p}"]`)).toBeVisible()
      }
    })

    test('has LIVE badge on Supabase, MOCK on others', async ({ page }) => {
      await page.goto('/demo')
      await expect(page.locator('a[href="/demo/supabase"]')).toContainText('LIVE')
      await expect(page.locator('a[href="/demo/firebase"]')).toContainText('MOCK')
    })

    test('has Back to Kavach footer link', async ({ page }) => {
      await page.goto('/demo')
      await expect(page.locator('footer >> a[href="/"]')).toBeVisible()
    })

    test('clicking platform card navigates to platform page', async ({ page }) => {
      await page.goto('/demo')
      await page.click('a[href="/demo/supabase"]')
      await expect(page).toHaveURL(/\/demo\/supabase/)
    })
  })

  test.describe('Pre-Auth Platform Page (/demo/[platform])', () => {
    test('loads without Kavach site header', async ({ page }) => {
      await page.goto('/demo/supabase')
      await expect(page.locator('nav >> text=Docs')).not.toBeVisible()
    })

    test('shows auth mode tabs', async ({ page }) => {
      await page.goto('/demo/supabase')
      await expect(page.locator('button:has-text("Password")')).toBeVisible()
      await expect(page.locator('button:has-text("Magic Link")')).toBeVisible()
    })

    test('has email and password fields', async ({ page }) => {
      await page.goto('/demo/supabase')
      await page.click('button:has-text("Password")')
      await expect(page.locator('input[type="email"]').first()).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test('signing in navigates to dashboard', async ({ page }) => {
      await page.goto('/demo/supabase')
      await page.click('button:has-text("Password")')
      await page.fill('input[type="email"]', 'test@test.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL(/\/demo\/supabase\/dashboard/, { timeout: 10000 })
    })
  })
  ```

### Task 28: Update home.e2e.ts for new Demo link target

- [ ] **In `sites/learn/e2e/home.e2e.ts`**, update the demo link assertion:

  The "Demo" nav link and "Try Demo" button still point to `/demo/supabase` (which is now the pre-auth page, not the dashboard — this is correct, no change needed). Verify tests still pass as-is.

### Task 29: Run full E2E suite and fix failures

- [ ] **Run Playwright tests**

  ```bash
  cd sites/learn && bun run test:integration
  ```

  Fix any failures from route changes. Common issues:
  - URL pattern mismatches (dashboard vs root)
  - Sidebar selector changes (nav links now in `aside`, not `nav`)
  - Platform switcher test removed

- [ ] **Commit**

  ```bash
  git add sites/learn/e2e/
  git commit -m "test(demo): update E2E tests for new route structure and demo shell"
  ```

---

## Chunk 9: Final Wiring + Journal

### Task 30: Update journal and mark story complete

- [ ] **Add to `agents/journal.md`**:

  ```markdown
  ## 2026-03-12

  ### Demo Redesign — Interactive Learning Experience

  - New (demo) route group: standalone platform selector landing + pre-auth platform page
  - Layout reset (+layout@.svelte) for both demo surfaces — no Kavach site chrome
  - Authenticated demo shell: top bar, sidebar (nav, role card, Sentry config, Hacker toggle), floating badge
  - Three-layer security demo: UI redirect, UI forbidden (Hacker Mode), PostgREST RLS
  - Platform + mode metadata in src/lib/demo/
  - /data/admin-stats admin-only endpoint added
  - E2E tests updated for new route structure
  - [list commit hashes]
  ```

- [ ] **Update `docs/stories/README.md`**: mark demo redesign story as Done

- [ ] **Archive plan**: `docs/plans/<datetime>-demo-redesign.md`

- [ ] **Final test run**:

  ```bash
  # Unit tests
  NODE_NO_WARNINGS=1 vitest run --config config/vitest.config.js

  # E2E tests
  cd sites/learn && bun run test:integration
  ```

  Expected: 561+ unit tests pass, E2E tests pass.
