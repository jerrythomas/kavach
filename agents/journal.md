# Project Journal

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

---

## YYYY-MM-DD

### Project Initialized

- Created repository structure
- Set up agent workflow files
- Ready for first design phase

---

## 2026-04-05

### Dynamic home URL resolution (GitHub #17)

**What was done:**

- `routes.home` in `kavach.config.js` now accepts an async function `(session) => string` as well as a static string.
- `processAppRoutes` (sentry) normalises `home` to always be a function. Static strings are wrapped in `() => staticHome` with a `._path` annotation so route rule generation is unaffected.
- `serialize()` (vite) handles functions via `.toString()` so function values survive virtual module generation.
- `handleUnauthorizedAccess` and `handleRouteProtection` (auth) are now async; home is always resolved via `await app.home(session)`. Resolver errors fall back to `'/'`.
- Updated sentry tests to use `expect.any(Function)` for home redirect assertions.
- Added tests: function serialization in vite, dynamic redirect / error fallback in auth middleware.

**Key decision:** home is always a function internally — `homeExclude` was dropped as the resolver function can express the same conditional logic itself.

---

## 2026-03-11

### Fused demo into learn site + deprecated demo/skeleton

**What was done:**

- Removed `sites/demo` and `sites/skeleton` entirely — `sites/learn` is now the single site for docs + demo
- Added kavach client-side context setup in root `+layout.svelte` (proxy pattern with `$state` + `onMount` dynamic import of `$kavach/auth`). Now `AuthProvider` and logout page can access `kavach.signIn/signOut`.
- Fixed auth page (`(public)/auth/+page.svelte`): added `onsuccess` callback → `goto('/demo/supabase')` after successful sign-in; replaced Azure with Google + magic link providers.
- Fixed logout page (`(app)/demo/[platform]/logout/+page.svelte`): calls `kavach.signOut()` then redirects to `/auth`.
- Fixed demo layout server: uses `locals.session?.user` (not `locals.user` which kavach doesn't set).
- Added server-side admin protection: new `+page.server.ts` for admin page redirects non-admin users to `/demo/[platform]`.
- Improved admin page: shows real session info (email, role, user ID).
- Updated data page: real fetch from `/data/[entity]` API with table display.
- Added data API server route (`(server)/data/[...slug]/+server.ts`): returns demo data with role-based filtering (admin-only records hidden from non-admins).
- Updated `kavach.config.js`: corrected route paths to match vite plugin convention.
- Updated homepage "Try Demo" button and nav "Demo" link: both now point to `/demo/supabase`.
- Updated all e2e tests to match new navigation structure and behaviors; rewrote docs tests to use direct URL navigation.
- **45/45 e2e tests pass.**

---

## 2026-03-12

### Story 012 — Per-route fallback config (guardian)

- `findMatchingRoute` in `utils.js` updated to handle `{path, fallback?}` objects alongside plain strings.
- `configureRoleRoutes` stores `{path, fallback}` objects in `restricted` when a fallback is configured.
- `protectRoute` extracts per-route fallback and passes to `getRedirectResponse`.
- `getRedirectResponse` accepts optional `fallback`: numeric → status-only response, string → redirect to that URL.
- 4 new unit tests added covering string fallback (wrong role), string fallback (unauthenticated), numeric fallback as status code, global default when no fallback.
- **561/561 unit tests pass.**

### Story 013 — Demo site enhancements

- **Platform cards**: replaced `<select>` in demo layout nav with a row of platform cards (name + "mock" badge for non-live adapters). Active platform highlighted.
- **Space facts**: replaced posts/users data with astronomy facts. General tier visible to all authenticated users; classified tier (tongue-in-cheek mission briefings) visible to admin only. Server exposes GET/POST/DELETE on `/data/facts`.
- **Role-based write controls**: data page shows "Add Fact" form and "Delete" buttons for admin users only. Non-admin write attempt returns 403 displayed inline.
- **Route protection visualiser**: dashboard replaced with protection card grid — each route shows badge (🔓 Public / 🔑 Authenticated / 👑 Admin only), allowed/denied status for the current user, and an access log feed populated as user navigates.
- **Cached login cards**: auth page reads `getCachedLogins()` via Svelte context on mount and shows recent-account cards above the login form; clicking a card pre-fills the email.
- Updated all e2e tests to match new page titles, nav labels, and removed `selectOption` in favour of clicking the platform card.
- **47/47 e2e tests pass.**

---

## 2026-03-15

### Learn site — demo env vars + remove embedded auth

**Goal:** Wire `sites/learn` so Supabase, Firebase, and Convex demo URLs come from env vars. Remove all embedded Supabase auth from the learn site, making it a pure landing/docs site.

**Design spec:** `docs/superpowers/specs/2026-03-15-learn-demo-env-vars-design.md`
**Plan:** `docs/superpowers/plans/2026-03-15-learn-demo-env-vars.md`

**What was done:**

- Added `sites/learn/.env.example` documenting `PUBLIC_DEMO_SUPABASE_URL`, `PUBLIC_DEMO_FIREBASE_URL`, `PUBLIC_DEMO_CONVEX_URL`
- Created `sites/learn/src/routes/(demo)/demo/+layout.server.ts` — reads env vars via `$env/dynamic/public`, passes as `demoUrls` page data
- Updated `sites/learn/src/lib/demo/platforms.ts` — removed hardcoded URLs, added `getPlatformsWithUrls()` and `getPlatformWithUrl()` helpers that merge env-backed URLs into platform config
- Updated `sites/learn/src/routes/(demo)/demo/+page.svelte` — uses `getPlatformsWithUrls(data.demoUrls)`
- Rewrote `sites/learn/src/routes/(demo)/demo/[platform]/+page.svelte` — removed `AuthProvider`, `goto`, `onSuccess`, `prefillTestCredentials`; right panel now shows external launch link for live platforms, "Demo URL not configured" if URL missing, "Coming soon" for inactive platforms
- Deleted `sites/learn/src/routes/(app)/` — embedded dashboard/admin/data/logout routes
- Deleted `sites/learn/src/routes/(server)/data/` — role-based data API (only `data/` subdir; `api/` preserved)
- Deleted `sites/learn/kavach.config.js` and `sites/learn/src/hooks.server.js`
- Removed lingering `$kavach/auth` imports from `+layout@.svelte` and `(public)/+layout.svelte`
- Updated `sites/learn/vite.config.js` — removed `kavach` plugin
- Removed `@kavach/adapter-supabase`, `@kavach/vite`, `@supabase/supabase-js` from `sites/learn/package.json`
- Replaced `sites/learn/e2e/demo.e2e.ts` with new tests: demo landing (5), live platform external links for supabase/firebase/convex (9), coming-soon badges for auth0/amplify (2)
- **626/626 unit tests pass. 46/46 learn e2e tests pass.**

**Commits:**

- `b0221b8` — docs: add learn site demo env vars design spec
- `ca78219` — docs: add learn demo env vars implementation plan
- `1cd35c1` — chore(learn): add .env.example with demo site URL vars
- `bde5e17` — feat(learn): read demo site URLs from env via layout server load
- `85ac2c3` — feat(learn): use env-backed platform URLs on demo landing page
- `d089436` — feat(learn): replace embedded auth form with external demo link on platform page
- `4540b0e` — feat(learn): remove embedded auth routes, hooks, and kavach vite plugin
- `316f4a6` — chore(learn): remove @kavach/adapter-supabase, @kavach/vite, and @supabase/supabase-js deps
- `6b0754e` — test(learn): replace embedded auth e2e tests with demo landing and external link tests
