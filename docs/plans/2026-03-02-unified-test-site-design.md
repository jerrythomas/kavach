# Unified Test Site Design

## Goal

Replace separate per-adapter example sites with a single `sites/demo/` SvelteKit app that can switch adapters at runtime (dev) or build-time (production), enabling e2e tests across all adapters from one codebase.

## Decisions

| Decision | Choice |
|----------|--------|
| Adapter priority | Supabase (Phase 1) → Convex + Firebase (Phase 2) → Auth0/Amplify (later) |
| Scope | Auth flows primary, full demo app is the goal |
| Switching mechanism | Build-time for production, runtime switcher in dev mode |
| Architecture | Adapter registry with lazy-loaded factory functions |
| Site location | `sites/demo/` |
| Existing sites | Keep `skeleton` as starter template, delete `supabase` after demo works |
| E2E location | `e2e/` directory |

---

## 1. Adapter Resolution

**Precedence:** URL param `?adapter=supabase` > cookie `kavach-adapter` > env var `PUBLIC_AUTH_ADAPTER` > default `supabase`

Server-side: `hooks.server.js` reads the adapter from the request URL or cookie, creates the kavach instance per-request, and sets/updates the cookie so subsequent page loads remember the choice.

Client-side: A `resolveAdapter()` helper reads from `$page.url.searchParams` or cookie. The dev-mode switcher UI writes to the cookie and reloads.

Production mode: Env var only — URL param and switcher UI are disabled when `PUBLIC_DEV_MODE` is not set.

**Key constraint:** The kavach instance must be created per-request on the server (not module-level) since different requests could use different adapters in dev mode.

---

## 2. Adapter Registry & Factory Pattern

**Registry** (`lib/adapters/index.js`):
```js
export const adapters = {
  supabase: () => import('./supabase.js'),
  firebase: () => import('./firebase.js'),
  convex:   () => import('./convex.js'),
}
```

Each adapter module exports a uniform shape:
```js
// lib/adapters/supabase.js
export function create(config) {
  const client = createClient(config.url, config.anonKey)
  return {
    adapter: getAdapter(client),
    data: (schema) => getActions(client, schema),
  }
}
```

**Config** (`lib/config.js`): Flat config keyed by adapter name, all from env vars:
```js
export const appConfig = {
  supabase: { url: env.PUBLIC_SUPABASE_URL, anonKey: env.PUBLIC_SUPABASE_ANON_KEY },
  firebase: { apiKey: env.PUBLIC_FIREBASE_API_KEY, projectId: env.PUBLIC_FIREBASE_PROJECT_ID },
  convex:   { url: env.PUBLIC_CONVEX_URL },
}
```

Adapters without data support omit `data` from the return. CRUD routes return `{ error: 'Data operations not supported for this adapter' }` with status 501.

---

## 3. Route Structure

**Server routes** (adapter-agnostic):
```
routes/
  (server)/data/[...slug]/+server.js   — CRUD (unsupported message if no data plugin)
  (server)/rpc/[...slug]/+server.js    — RPC (same handling)
```

**Public routes:**
```
routes/
  (public)/auth/+page.svelte           — Login page (@kavach/ui components)
  (public)/public/+page.svelte         — Public landing
```

**Protected routes:**
```
routes/
  (app)/+page.svelte                   — Dashboard / home
  (app)/logout/+page.svelte            — Logout
  (app)/data/+page.svelte              — CRUD demo (list/create/edit/delete)
```

**Layouts:**
- Root `+layout.svelte` — initializes kavach `onAuthChange`, provides auth context
- `(app)/+layout.svelte` — protected layout with header, nav, adapter indicator
- Dev-mode switcher in the header

---

## 4. Hooks & Per-Request Kavach

```js
// hooks.server.js
export async function handle({ event, resolve }) {
  const adapterName = resolveAdapterName(event)
  const { adapter, data } = await loadAdapter(adapterName, appConfig)

  event.locals.kavach = createKavach(adapter, { data, ...routes })
  event.locals.adapter = adapterName

  event.cookies.set('kavach-adapter', adapterName, { path: '/' })

  return event.locals.kavach.handle({ event, resolve })
}
```

Server routes access kavach via `event.locals.kavach` instead of a module-level import.

---

## 5. Dev-Mode Switcher

`AdapterSwitcher.svelte` — small dropdown in the header, only rendered when `PUBLIC_DEV_MODE=true`. Shows adapters that have config present (no point showing Firebase without Firebase env vars). Selecting an adapter sets the cookie and reloads.

---

## 6. Playwright E2E Testing

**Structure:**
```
e2e/
  auth.spec.js        — signIn, signUp, signOut, protected route redirect
  data.spec.js         — CRUD (skipped if adapter has no data support)
```

**Env files per adapter:**
```
.env.supabase          — PUBLIC_AUTH_ADAPTER=supabase + Supabase local config
.env.firebase          — PUBLIC_AUTH_ADAPTER=firebase + Firebase emulator config
.env.convex            — PUBLIC_AUTH_ADAPTER=convex + Convex config
```

**Playwright config:** One project per adapter, each loading its env file. Phase 1 only includes Supabase. Tests are adapter-agnostic — they test auth/CRUD through the UI.

Data tests use `test.skip` when the adapter doesn't support data.

---

## 7. Scope

### Phase 1 (this backlog item)
- `sites/demo/` with adapter registry (Supabase wired)
- Per-request kavach in hooks
- Auth pages (login, logout, protected redirect)
- CRUD server routes with "unsupported" fallback
- Basic CRUD demo page
- Dev-mode adapter switcher
- Playwright auth e2e for Supabase
- Delete `sites/supabase/`

### Phase 2 (future)
- Firebase adapter wiring
- Convex adapter + CRUD
- RPC demo page
- Additional e2e coverage

### Later
- Auth0/Amplify wiring
- Full demo app with rich CRUD UI
- Runtime switcher polish
